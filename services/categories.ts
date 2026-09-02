import { deleteFile, pathFromUrl, STORAGE_BUCKETS, supabase, uploadFile } from '@/lib/supabase'
import type { Category, Subcategory } from '@/types/database'

export type CategoryInput = Pick<Category, 'name' | 'slug' | 'description' | 'image' | 'is_active'>

export interface CategoryWithCounts extends Category {
  subcategory_count: number
  product_count: number
}

export interface CategoryFilters {
  search?: string
  page?: number
  pageSize?: number
}

async function getReferenceCounts(categoryIds: number[]) {
  const empty = new Map<number, { subcategory_count: number; product_count: number }>()
  categoryIds.forEach(id => empty.set(id, { subcategory_count: 0, product_count: 0 }))
  if (!categoryIds.length) return empty

  const [{ data: subcategories, error: subError }, { data: products, error: productError }] = await Promise.all([
    supabase.from('subcategories').select('category_id').in('category_id', categoryIds),
    supabase.from('products').select('category_id').in('category_id', categoryIds),
  ])

  if (subError) throw subError
  if (productError) throw productError

  subcategories?.forEach(row => {
    const counts = empty.get(row.category_id)
    if (counts) counts.subcategory_count += 1
  })

  products?.forEach(row => {
    const counts = empty.get(row.category_id)
    if (counts) counts.product_count += 1
  })

  return empty
}

export const categoriesService = {
  async getCategories(filters: CategoryFilters = {}): Promise<{ data: CategoryWithCounts[]; count: number }> {
    const { search, page = 1, pageSize = 20 } = filters
    const from = (page - 1) * pageSize

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (search?.trim()) {
      const term = search.trim()
      query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`)
    }

    const { data, error, count } = await query
    if (error) throw error

    const categories = data || []
    const counts = await getReferenceCounts(categories.map(category => category.id))

    return {
      data: categories.map(category => ({
        ...category,
        subcategory_count: counts.get(category.id)?.subcategory_count || 0,
        product_count: counts.get(category.id)?.product_count || 0,
      })),
      count: count || 0,
    }
  },

  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async getActive(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
  },

  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (excludeId) query = query.neq('id', excludeId)

    const { data, error } = await query
    if (error) throw error
    return Boolean(data?.length)
  },

  async createCategory(cat: CategoryInput, imageFile?: File): Promise<Category> {
    let image = cat.image
    let uploadedPath: string | null = null
    if (imageFile) {
      uploadedPath = `categories/${Date.now()}-${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      image = await uploadFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath, imageFile)
    }

    const { data, error } = await supabase.from('categories').insert({ ...cat, image }).select().single()
    if (error) {
      if (uploadedPath) await deleteFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath).catch(() => {})
      throw error
    }
    return data
  },

  async updateCategory(id: number, cat: Partial<CategoryInput>, imageFile?: File): Promise<Category> {
    const { data: current, error: currentError } = await supabase.from('categories').select('image').eq('id', id).single()
    if (currentError) throw currentError
    const oldImage = current.image as string | null
    let image = cat.image === undefined ? oldImage : cat.image
    let uploadedPath: string | null = null
    if (imageFile) {
      uploadedPath = `categories/${Date.now()}-${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      image = await uploadFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath, imageFile)
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ ...cat, image, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      if (uploadedPath) await deleteFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath).catch(() => {})
      throw error
    }
    if (oldImage && oldImage !== image) {
      await deleteFile(STORAGE_BUCKETS.PRODUCTS, pathFromUrl(oldImage, STORAGE_BUCKETS.PRODUCTS)).catch(() => {})
    }
    return data
  },

  async toggleCategoryStatus(id: number, isActive: boolean): Promise<Category> {
    return this.updateCategory(id, { is_active: isActive })
  },

  async getCategoryReferenceCounts(id: number): Promise<{ subcategory_count: number; product_count: number }> {
    const counts = await getReferenceCounts([id])
    return counts.get(id) || { subcategory_count: 0, product_count: 0 }
  },

  async deleteCategory(id: number): Promise<void> {
    const counts = await this.getCategoryReferenceCounts(id)
    if (counts.subcategory_count > 0 || counts.product_count > 0) {
      throw new Error('This category has products or subcategories. Deactivate it instead.')
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  create(cat: CategoryInput, imageFile?: File): Promise<Category> {
    return this.createCategory(cat, imageFile)
  },

  update(id: number, cat: Partial<CategoryInput>, imageFile?: File): Promise<Category> {
    return this.updateCategory(id, cat, imageFile)
  },

  delete(id: number): Promise<void> {
    return this.deleteCategory(id)
  },
}

export const subcategoriesService = {
  async getAll(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*, category:categories(*)')
      .order('name')
    if (error) throw error
    return data
  },

  async getByCategory(categoryId: number): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  async create(sub: Omit<Subcategory, 'id' | 'created_at' | 'updated_at' | 'category'>, imageFile?: File): Promise<Subcategory> {
    let image = sub.image
    let uploadedPath: string | null = null
    if (imageFile) {
      uploadedPath = `subcategories/${Date.now()}-${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      image = await uploadFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath, imageFile)
    }

    const { data, error } = await supabase
      .from('subcategories')
      .insert({ ...sub, image })
      .select('*, category:categories(*)')
      .single()
    if (error) {
      if (uploadedPath) await deleteFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath).catch(() => {})
      throw error
    }
    return data
  },

  async update(id: number, sub: Partial<Subcategory>, imageFile?: File): Promise<Subcategory> {
    const { data: current, error: currentError } = await supabase.from('subcategories').select('image').eq('id', id).single()
    if (currentError) throw currentError
    const oldImage = current.image as string | null
    let image = sub.image === undefined ? oldImage : sub.image
    let uploadedPath: string | null = null
    if (imageFile) {
      uploadedPath = `subcategories/${Date.now()}-${crypto.randomUUID()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
      image = await uploadFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath, imageFile)
    }

    const { data, error } = await supabase
      .from('subcategories')
      .update({ ...sub, image, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()
    if (error) {
      if (uploadedPath) await deleteFile(STORAGE_BUCKETS.PRODUCTS, uploadedPath).catch(() => {})
      throw error
    }
    if (oldImage && oldImage !== image) {
      await deleteFile(STORAGE_BUCKETS.PRODUCTS, pathFromUrl(oldImage, STORAGE_BUCKETS.PRODUCTS)).catch(() => {})
    }
    return data
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('subcategories').delete().eq('id', id)
    if (error) throw error
  },
}
