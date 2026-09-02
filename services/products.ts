import { supabase, uploadFile, deleteFile, pathFromUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { Product, ProductImage, ProductSize, ProductColor } from '@/types/database'

// Full product select with all relations
const PRODUCT_FULL = `
  *,
  category:categories(*),
  subcategory:subcategories(*),
  brand:brands(*),
  product_images(*),
  product_sizes(*, size:sizes(*)),
  product_colors(*, color:colors(*)),
  inventory(*, product_size:product_sizes(*, size:sizes(*)), product_color:product_colors(*, color:colors(*)))
`

export interface ProductFilters {
  search?: string
  categoryId?: number
  subcategoryId?: number
  brandId?: number
  gender?: string
  isActive?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'created_at' | 'stock'
  page?: number
  pageSize?: number
}

export const productsService = {
  async getAll(filters: ProductFilters = {}): Promise<{ data: Product[]; count: number }> {
    const {
      search, categoryId, subcategoryId, brandId, gender,
      isActive, sortBy = 'created_at', page = 1, pageSize = 20
    } = filters

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        subcategory:subcategories(*),
        brand:brands(*),
        product_images!inner(*),
        product_sizes(*, size:sizes(*)),
        product_colors(*, color:colors(*))
      `, { count: 'exact' })

    // Make product_images not inner join for products without images
    let query2 = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        subcategory:subcategories(*),
        brand:brands(*),
        product_images(*),
        product_sizes(*, size:sizes(*)),
        inventory(*)
      `, { count: 'exact' })

    if (search) {
      query2 = query2.or(`name.ilike.%${search}%,sku.ilike.%${search}%,model_no.ilike.%${search}%`)
    }
    if (categoryId) query2 = query2.eq('category_id', categoryId)
    if (subcategoryId) query2 = query2.eq('subcategory_id', subcategoryId)
    if (brandId) query2 = query2.eq('brand_id', brandId)
    if (gender) query2 = query2.eq('gender', gender)
    if (isActive !== undefined) query2 = query2.eq('is_active', isActive)

    // Sort
    if (sortBy === 'name') query2 = query2.order('name')
    else if (sortBy === 'created_at') query2 = query2.order('created_at', { ascending: false })
    else query2 = query2.order('created_at', { ascending: false })

    // Pagination
    const from = (page - 1) * pageSize
    query2 = query2.range(from, from + pageSize - 1)

    const { data, error, count } = await query2
    if (error) throw error
    return { data: data || [], count: count || 0 }
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) return null
    return data
  },

  async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL)
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async getByCategory(categoryId: number, limit = 12): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), brand:brands(*), product_images(*), product_sizes(*), inventory(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), brand:brands(*), product_images(*), product_sizes(*), inventory(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'subcategory' | 'brand' | 'product_images' | 'product_sizes' | 'product_colors' | 'inventory'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    // Remove relation fields before update
    const { category, subcategory, brand, product_images, product_sizes, product_colors, inventory, ...updates } = product as any
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  // ─── Product Sizes ────────────────────────────────────────────────────────

  async upsertSizes(
  productId: number,
  sizes: Omit<ProductSize, 'id' | 'size'>[]
): Promise<ProductSize[]> {

  if (!sizes.length) return []

  const results: ProductSize[] = []

  for (const size of sizes) {
    // Check if this product already has this size
    const { data: existing, error: findError } = await supabase
      .from('product_sizes')
      .select('*, size:sizes(*)')
      .eq('product_id', productId)
      .eq('size_id', Number(size.size_id))
      .maybeSingle()

    if (findError) throw findError

    if (existing) {
      // UPDATE existing product size
      const { data, error } = await supabase
        .from('product_sizes')
        .update({
          price: size.price,
          mrp: size.mrp,
          sku: size.sku || null,
          is_active: size.is_active,
        })
        .eq('id', existing.id)
        .select('*, size:sizes(*)')
        .single()

      if (error) throw error

      results.push(data)
    } else {
      // INSERT only new product size
      const { data, error } = await supabase
        .from('product_sizes')
        .insert({
          product_id: productId,
          size_id: Number(size.size_id),
          price: size.price,
          mrp: size.mrp,
          sku: size.sku || null,
          is_active: size.is_active,
        })
        .select('*, size:sizes(*)')
        .single()

      if (error) throw error

      results.push(data)
    }
  }

  return results
},

  // ─── Product Colors ───────────────────────────────────────────────────────

  async upsertColors(
  productId: number,
  colorIds: number[]
): Promise<ProductColor[]> {
  if (!colorIds.length) return []

  const results: ProductColor[] = []

  for (const colorId of colorIds) {
    const { data: existing, error: findError } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', productId)
      .eq('color_id', Number(colorId))
      .maybeSingle()

    if (findError) throw findError

    if (existing) {
      // Already exists — don't insert again
      results.push(existing)
      continue
    }

    const { data, error } = await supabase
      .from('product_colors')
      .insert({
        product_id: productId,
        color_id: Number(colorId),
      })
      .select('*')
      .single()

    if (error) throw error

    results.push(data)
  }

  return results
},

  // ─── Product Images ───────────────────────────────────────────────────────

  async uploadImage(productId: number, file: File, options: { colorId?: number; isPrimary?: boolean; sortOrder?: number } = {}): Promise<ProductImage> {
    const path = `${productId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const imageUrl = await uploadFile(STORAGE_BUCKETS.PRODUCTS, path, file)

    // If setting as primary, clear others first
    if (options.isPrimary) {
      await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        color_id: options.colorId || null,
        image_url: imageUrl,
        is_primary: options.isPrimary || false,
        sort_order: options.sortOrder || 0,
        is_active: true,
      })
      .select()
      .single()
    if (error) { await deleteFile(STORAGE_BUCKETS.PRODUCTS, path); throw error }
    return data
  },

  async setPrimaryImage(productId: number, imageId: number): Promise<void> {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId)
  },

  async deleteImage(image: ProductImage): Promise<void> {
    try {
      const path = pathFromUrl(image.image_url, STORAGE_BUCKETS.PRODUCTS)
      await deleteFile(STORAGE_BUCKETS.PRODUCTS, path)
    } catch {}
    const { error } = await supabase.from('product_images').delete().eq('id', image.id)
    if (error) throw error
  },

  async reorderImages(images: { id: number; sort_order: number }[]): Promise<void> {
    await Promise.all(
      images.map(({ id, sort_order }) =>
        supabase.from('product_images').update({ sort_order }).eq('id', id)
      )
    )
  },

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getPrimaryImage(product: Product): ProductImage | null {
    if (!product.product_images?.length) return null
    return product.product_images.find(i => i.is_primary) || product.product_images[0]
  },

  getMinPrice(product: Product): number {
    if (!product.product_sizes?.length) return 0
    return Math.min(...product.product_sizes.map(s => s.price))
  },

  getMinMrp(product: Product): number {
    if (!product.product_sizes?.length) return 0
    return Math.min(...product.product_sizes.map(s => s.mrp))
  },

  getTotalStock(product: Product): number {
    if (!product.inventory?.length) return 0
    return product.inventory.reduce((sum, inv) => sum + Math.max(0, inv.quantity - inv.reserved_quantity), 0)
  },
}
