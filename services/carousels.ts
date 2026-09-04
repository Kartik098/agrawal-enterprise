import { supabase, uploadFile, deleteFile, pathFromUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { CarouselItem } from '@/types/database'

const CAROUSEL_SELECT = `
  *,
  brand:brands(*)
`

export const carouselsService = {
  // Get all carousel slides (admin)
  async getAll(): Promise<CarouselItem[]> {
    const { data, error } = await supabase
      .from('carousels')
      .select(CAROUSEL_SELECT)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get only active carousel slides (storefront)
  async getActive(): Promise<CarouselItem[]> {
    const { data, error } = await supabase
      .from('carousels')
      .select(CAROUSEL_SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get single carousel item by ID
  async getById(id: number): Promise<CarouselItem | null> {
    const { data, error } = await supabase
      .from('carousels')
      .select(CAROUSEL_SELECT)
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },

  // Create a new carousel item
  async create(
    input: {
      title?: string | null
      imageUrl?: string
      brandId?: number | null
      sortOrder?: number
      isActive?: boolean
    },
    imageFile?: File
  ): Promise<CarouselItem> {
    let finalImageUrl = input.imageUrl || ''

    if (imageFile) {
      const path = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`
      try {
        finalImageUrl = await uploadFile(STORAGE_BUCKETS.CAROUSEL, path, imageFile)
      } catch (err) {
        // Fallback to PRODUCTS bucket if CAROUSEL bucket is not created in Supabase Dashboard yet
        finalImageUrl = await uploadFile(STORAGE_BUCKETS.PRODUCTS, path, imageFile)
      }
    }

    if (!finalImageUrl) {
      throw new Error('Please provide an image file or image URL')
    }

    const { data, error } = await supabase
      .from('carousels')
      .insert({
        title: input.title || null,
        image_url: finalImageUrl,
        brand_id: input.brandId || null,
        sort_order: input.sortOrder ?? 0,
        is_active: input.isActive ?? true,
      })
      .select(CAROUSEL_SELECT)
      .single()

    if (error) throw error
    return data
  },

  // Update an existing carousel item
  async update(
    id: number,
    input: {
      title?: string | null
      imageUrl?: string
      brandId?: number | null
      sortOrder?: number
      isActive?: boolean
    },
    imageFile?: File
  ): Promise<CarouselItem> {
    let finalImageUrl = input.imageUrl

    if (imageFile) {
      const path = `${id}-${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`
      try {
        finalImageUrl = await uploadFile(STORAGE_BUCKETS.CAROUSEL, path, imageFile)
      } catch (err) {
        finalImageUrl = await uploadFile(STORAGE_BUCKETS.PRODUCTS, path, imageFile)
      }
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.title !== undefined) updates.title = input.title || null
    if (finalImageUrl !== undefined) updates.image_url = finalImageUrl
    if (input.brandId !== undefined) updates.brand_id = input.brandId || null
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder
    if (input.isActive !== undefined) updates.is_active = input.isActive

    const { data, error } = await supabase
      .from('carousels')
      .update(updates)
      .eq('id', id)
      .select(CAROUSEL_SELECT)
      .single()

    if (error) throw error
    return data
  },

  // Delete a carousel item
  async delete(id: number): Promise<void> {
    const item = await this.getById(id)
    if (!item) return

    // Clean up uploaded file if from storage bucket
    if (item.image_url.includes('/storage/v1/object/public/')) {
      try {
        const bucket = item.image_url.includes(STORAGE_BUCKETS.CAROUSEL)
          ? STORAGE_BUCKETS.CAROUSEL
          : STORAGE_BUCKETS.PRODUCTS
        await deleteFile(bucket, pathFromUrl(item.image_url, bucket))
      } catch (err) {
        // ignore file deletion errors
      }
    }

    const { error } = await supabase.from('carousels').delete().eq('id', id)
    if (error) throw error
  },

  // Reorder carousel slides
  async reorder(items: { id: number; sort_order: number }[]): Promise<void> {
    await Promise.all(
      items.map(({ id, sort_order }) =>
        supabase.from('carousels').update({ sort_order }).eq('id', id)
      )
    )
  },
}
