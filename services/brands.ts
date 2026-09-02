import { supabase, uploadFile, deleteFile, pathFromUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { Brand } from '@/types/database'

export const brandsService = {
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async getActive(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
  },

  async create(
    brand: Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'logo'>,
    logoFile?: File
  ): Promise<Brand> {
    let logo: string | null = null
    if (logoFile) {
      const path = `${Date.now()}-${logoFile.name.replace(/\s+/g, '-')}`
      logo = await uploadFile(STORAGE_BUCKETS.BRANDS, path, logoFile)
    }
    const { data, error } = await supabase
      .from('brands')
      .insert({ ...brand, logo })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(
    id: number,
    brand: Partial<Brand>,
    logoFile?: File
  ): Promise<Brand> {
    let updates: Partial<Brand> = { ...brand, updated_at: new Date().toISOString() }

    if (logoFile) {
      // Delete old logo if exists
      if (brand.logo) {
        try {
          await deleteFile(STORAGE_BUCKETS.BRANDS, pathFromUrl(brand.logo, STORAGE_BUCKETS.BRANDS))
        } catch {}
      }
      const path = `${id}-${Date.now()}-${logoFile.name.replace(/\s+/g, '-')}`
      updates.logo = await uploadFile(STORAGE_BUCKETS.BRANDS, path, logoFile)
    }

    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async removeLogo(id: number, logoUrl: string): Promise<void> {
    try {
      await deleteFile(STORAGE_BUCKETS.BRANDS, pathFromUrl(logoUrl, STORAGE_BUCKETS.BRANDS))
    } catch {}
    const { error } = await supabase
      .from('brands')
      .update({ logo: null, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) throw error
  },
}
