import {
  supabase,
  uploadFile,
  deleteFile,
  pathFromUrl,
  STORAGE_BUCKETS,
} from '@/lib/supabase'

import type {
  Product,
  ProductImage,
  ProductSize,
  ProductColor,
} from '@/types/database'

// ─────────────────────────────────────────────────────────────────────────────
// Full product select with all relations
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_FULL = `
  id,
  category_id,
  subcategory_id,
  brand_id,
  name,
  gender,
  slug,
  model_no,
  description,
  sku,
  is_active,
  created_at,
  updated_at,
  category:categories(id, name, slug),
  subcategory:subcategories(id, name, slug),
  brand:brands(id, name, slug, logo),
  product_images(
    id,
    product_id,
    color_id,
    image_url,
    is_primary,
    sort_order,
    is_active
  ),
  product_sizes(
    id,
    product_id,
    size_id,
    price,
    mrp,
    sku,
    is_active,
    size:sizes(id, name, sort_order)
  ),
  product_colors(
    id,
    product_id,
    color_id,
    is_active,
    color:colors(id, name, hex_code)
  ),
  inventory(
    id,
    product_id,
    product_size_id,
    product_color_id,
    quantity,
    reserved_quantity,
    reorder_level,
    warehouse_location,
    created_at,
    updated_at
  )
`

export interface ProductFilters {
  search?: string
  categoryId?: string
  subcategoryId?: string
  brandId?: string
  gender?: string
  isActive?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?:
    | 'name'
    | 'price_asc'
    | 'price_desc'
    | 'created_at'
    | 'stock'
  page?: number
  pageSize?: number
}

export const productsService = {
  // ───────────────────────────────────────────────────────────────────────────
  // Products
  // ───────────────────────────────────────────────────────────────────────────

  async getAll(
    filters: ProductFilters = {}
  ): Promise<{ data: Product[]; count: number }> {
    const {
      search,
      categoryId,
      subcategoryId,
      brandId,
      gender,
      isActive,
      sortBy = 'created_at',
      page = 1,
      pageSize = 20,
    } = filters

    let query = supabase
      .from('products')
      .select(
        `
          id,
          category_id,
          subcategory_id,
          brand_id,
          name,
          gender,
          slug,
          model_no,
          sku,
          is_active,
          created_at,
          category:categories(id, name, slug),
          subcategory:subcategories(id, name, slug),
          brand:brands(id, name, slug),
          product_images(
            id,
            image_url,
            color_id,
            is_primary,
            sort_order,
            is_active
          ),
          product_sizes(
            id,
            product_id,
            size_id,
            price,
            mrp,
            sku,
            is_active,
            size:sizes(id, name, sort_order)
          ),
          product_colors(
            id,
            product_id,
            color_id,
            is_active,
            color:colors(id, name, hex_code)
          ),
          inventory(
            id,
            product_size_id,
            product_color_id,
            quantity,
            reserved_quantity
          )
        `,
        { count: 'exact' }
      )

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,model_no.ilike.%${search}%`
      )
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId)
    }

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    if (gender) {
      query = query.eq('gender', gender)
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive)
    }

    if (sortBy === 'name') {
      query = query.order('name', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const from = Math.max(0, (page - 1) * pageSize)
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      data: (data as unknown as Product[]) || [],
      count: count || 0,
    }
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL)
      .eq('slug', slug)
      .eq('is_active', true)
      // Only active product colors should reach storefront.
      .eq('product_colors.is_active', true)
      .eq('product_sizes.is_active', true)
      .single()

    if (error) {
      return null
    }

    return data as unknown as Product
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_FULL)
      .eq('id', id)
      // Keep inactive product_color rows in the database for history,
      // but do not return them as current product options.
      .eq('product_colors.is_active', true)
      .single()

    if (error) {
      return null
    }

    return data as unknown as Product
  },

  async getByCategory(
    categoryId: string,
    limit = 12
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
          id,
          category_id,
          subcategory_id,
          brand_id,
          name,
          gender,
          slug,
          is_active,
          created_at,
          category:categories(id, name, slug),
          brand:brands(id, name, slug),
          product_images(
            id,
            image_url,
            color_id,
            is_primary,
            sort_order,
            is_active
          ),
          product_sizes(
            id,
            product_id,
            size_id,
            price,
            mrp,
            is_active
          ),
          product_colors(
            id,
            product_id,
            color_id,
            is_active,
            color:colors(id, name, hex_code)
          ),
          inventory(
            id,
            product_size_id,
            product_color_id,
            quantity,
            reserved_quantity
          )
        `
      )
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .eq('product_colors.is_active', true)
      .eq('product_sizes.is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data as unknown as Product[]) || []
  },

  async getFeatured(limit = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
          id,
          category_id,
          subcategory_id,
          brand_id,
          name,
          gender,
          slug,
          is_active,
          created_at,
          category:categories(id, name, slug),
          brand:brands(id, name, slug),
          product_images(
            id,
            product_id,
            image_url,
            color_id,
            is_primary,
            sort_order,
            is_active
          ),
          product_sizes(
            id,
            product_id,
            size_id,
            price,
            mrp,
            is_active
          ),
          product_colors(
            id,
            product_id,
            color_id,
            is_active,
            color:colors(id, name, hex_code)
          ),
          inventory(
            id,
            product_size_id,
            product_color_id,
            quantity,
            reserved_quantity
          )
        `
      )
      .eq('is_active', true)
      .eq('product_colors.is_active', true)
      .eq('product_sizes.is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (data as unknown as Product[]) || []
  },

  async create(
    product: Omit<
      Product,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'category'
      | 'subcategory'
      | 'brand'
      | 'product_images'
      | 'product_sizes'
      | 'product_colors'
      | 'inventory'
    >
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as unknown as Product
  },

  async update(
    id: string,
    product: Partial<Product>
  ): Promise<Product> {
    // Never send relationship fields to the products table.
    const {
      category,
      subcategory,
      brand,
      product_images,
      product_sizes,
      product_colors,
      inventory,
      ...updates
    } = product as any

    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as unknown as Product
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Product Sizes
  //
  // IMPORTANT:
  // Existing product_sizes are NEVER deleted.
  //
  // Selected size:
  //   -> update/reactivate
  //
  // New size:
  //   -> insert
  //
  // Removed size:
  //   -> deactivate
  //
  // Inventory is handled separately by inventoryService.
  // ───────────────────────────────────────────────────────────────────────────

  async upsertSizes(
  productId: string,
  sizes: Omit<ProductSize, 'id' | 'size'>[]
): Promise<ProductSize[]> {
  // UUIDs are strings. Remove empty/invalid IDs and duplicates.
  const uniqueSizes = Array.from(
    new Map(
      sizes
        .filter((size) => typeof size.size_id === 'string' && size.size_id.trim())
        .map((size) => [size.size_id, size])
    ).values()
  )

  // Get all existing product sizes, including inactive ones.
  const { data: existingSizes, error: existingError } = await supabase
    .from('product_sizes')
    .select(`
      id,
      product_id,
      size_id,
      price,
      mrp,
      sku,
      is_active,
      size:sizes(id, name, sort_order)
    `)
    .eq('product_id', productId)

  if (existingError) {
    throw existingError
  }

  const existingRows =
    (existingSizes as unknown as ProductSize[]) || []

  const selectedSizeIds = new Set(
    uniqueSizes.map((size) => size.size_id)
  )

  // Deactivate sizes removed from the Edit Product form.
  const removedSizeIds = existingRows
    .filter(
      (existing) =>
        existing.is_active &&
        !selectedSizeIds.has(existing.size_id)
    )
    .map((existing) => existing.id)

  if (removedSizeIds.length > 0) {
    const { error } = await supabase
      .from('product_sizes')
      .update({ is_active: false })
      .in('id', removedSizeIds)

    if (error) {
      throw error
    }
  }

  const results: ProductSize[] = []

  for (const size of uniqueSizes) {
    const sizeId = size.size_id

    const existing = existingRows.find(
      (row) => row.size_id === sizeId
    )

    if (existing) {
      // Existing size: update and reactivate.
      const { data, error } = await supabase
        .from('product_sizes')
        .update({
          price: size.price,
          mrp: size.mrp,
          sku: size.sku || null,
          is_active: true,
        })
        .eq('id', existing.id)
        .select(`
          id,
          product_id,
          size_id,
          price,
          mrp,
          sku,
          is_active,
          size:sizes(id, name, sort_order)
        `)
        .single()

      if (error) {
        throw error
      }

      results.push(data as unknown as ProductSize)
    } else {
      // New product size.
      const { data, error } = await supabase
        .from('product_sizes')
        .insert({
          product_id: productId,
          size_id: sizeId,
          price: size.price,
          mrp: size.mrp,
          sku: size.sku || null,
          is_active: true,
        })
        .select(`
          id,
          product_id,
          size_id,
          price,
          mrp,
          sku,
          is_active,
          size:sizes(id, name, sort_order)
        `)
        .single()

      if (error) {
        throw error
      }

      results.push(data as unknown as ProductSize)
    }
  }

  return results
},

  // Get all product sizes, including inactive ones.
  //
  // This is useful for admin/inventory/history operations.
  async getProductSizes(
    productId: string
  ): Promise<ProductSize[]> {
    const { data, error } = await supabase
      .from('product_sizes')
      .select(
        `
          id,
          product_id,
          size_id,
          price,
          mrp,
          sku,
          is_active,
          size:sizes(id, name, sort_order)
        `
      )
      .eq('product_id', productId)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return (data as unknown as ProductSize[]) || []
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Product Colors
  //
  // IMPORTANT:
  //
  // product_colors.id = product-specific color ID
  // colors.id         = master/global color ID
  //
  // Inventory uses:
  //     inventory.product_color_id -> product_colors.id
  //
  // Images use:
  //     product_images.color_id -> colors.id
  //
  // Removed colors are NOT deleted.
  // They are marked is_active = false.
  //
  // This preserves historical references from order_items.
  // ───────────────────────────────────────────────────────────────────────────

  async upsertColors(
  productId: string,
  colorIds: string[]
): Promise<ProductColor[]> {
  // UUIDs are strings.
  const uniqueColorIds = Array.from(
    new Set(
      colorIds.filter(
        (id) => typeof id === 'string' && id.trim()
      )
    )
  )

  const { data: existingColors, error: existingError } =
    await supabase
      .from('product_colors')
      .select(`
        id,
        product_id,
        color_id,
        is_active,
        color:colors(id, name, hex_code)
      `)
      .eq('product_id', productId)

  if (existingError) {
    throw existingError
  }

  const existingRows =
    (existingColors as unknown as ProductColor[]) || []

  const selectedColorIds = new Set(uniqueColorIds)

  // Deactivate removed colors.
  const removedColorIds = existingRows
    .filter(
      (existing) =>
        existing.is_active &&
        !selectedColorIds.has(existing.color_id)
    )
    .map((existing) => existing.id)

  if (removedColorIds.length > 0) {
    const { error } = await supabase
      .from('product_colors')
      .update({ is_active: false })
      .in('id', removedColorIds)

    if (error) {
      throw error
    }
  }

  const results: ProductColor[] = []

  for (const colorId of uniqueColorIds) {
    const existing = existingRows.find(
      (row) => row.color_id === colorId
    )

    if (existing) {
      if (!existing.is_active) {
        const { data, error } = await supabase
          .from('product_colors')
          .update({ is_active: true })
          .eq('id', existing.id)
          .select(`
            id,
            product_id,
            color_id,
            is_active,
            color:colors(id, name, hex_code)
          `)
          .single()

        if (error) {
          throw error
        }

        results.push(data as unknown as ProductColor)
      } else {
        results.push(existing)
      }

      continue
    }

    const { data, error } = await supabase
      .from('product_colors')
      .insert({
        product_id: productId,
        color_id: colorId,
        is_active: true,
      })
      .select(`
        id,
        product_id,
        color_id,
        is_active,
        color:colors(id, name, hex_code)
      `)
      .single()

    if (error) {
      throw error
    }

    results.push(data as unknown as ProductColor)
  }

  return results
},

  // Get only ACTIVE product colors.
  //
  // This is what Edit Product/storefront should normally use
  // when displaying the current color options.
  async getProductColors(
    productId: string
  ): Promise<ProductColor[]> {
    const { data, error } = await supabase
      .from('product_colors')
      .select(
        `
          id,
          product_id,
          color_id,
          is_active,
          color:colors(id, name, hex_code)
        `
      )
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return (data as unknown as ProductColor[]) || []
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Product Images
  //
  // IMPORTANT:
  //
  // product_images.color_id references colors.id.
  //
  // Therefore DO NOT convert the color ID to product_colors.id here.
  //
  // If image belongs to Red:
  //
  //     image.colorId = colors.id
  //
  // NOT:
  //
  //     product_colors.id
  // ───────────────────────────────────────────────────────────────────────────

  async uploadImage(
    productId: string,
    file: File,
    options: {
      colorId?: string | null
      isPrimary?: boolean
      sortOrder?: number
    } = {}
  ): Promise<ProductImage> {
    if (!file) {
      throw new Error('Image file is required')
    }

    const safeFileName = file.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')

    const fileName =
      safeFileName || `image-${Date.now()}`

    const path = `${productId}/${Date.now()}-${fileName}`

    const imageUrl = await uploadFile(
      STORAGE_BUCKETS.PRODUCTS,
      path,
      file
    )

    try {
      // If this image becomes the primary image,
      // clear the previous primary image first.
      if (options.isPrimary === true) {
        const { error: clearPrimaryError } = await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', productId)

        if (clearPrimaryError) {
          throw clearPrimaryError
        }
      }

      const { data, error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,

          // IMPORTANT:
          // This must be colors.id, NOT product_colors.id.
          color_id:
            options.colorId !== undefined &&
            options.colorId !== null
              ? options.colorId
              : null,

          image_url: imageUrl,
          is_primary: options.isPrimary === true,
          sort_order:
            options.sortOrder !== undefined
              ? options.sortOrder
              : 0,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as ProductImage
    } catch (error) {
      // Database insert failed, so remove the uploaded
      // storage file to avoid orphaned files.
      try {
        await deleteFile(
          STORAGE_BUCKETS.PRODUCTS,
          path
        )
      } catch {
        // Ignore cleanup error.
      }

      throw error
    }
  },

  async setPrimaryImage(
    productId: string,
    imageId: string
  ): Promise<void> {
    // Clear existing primary image.
    const { error: clearError } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    if (clearError) {
      throw clearError
    }

    // Set selected image as primary.
    const { error: setError } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('product_id', productId)

    if (setError) {
      throw setError
    }
  },

  async deleteImage(
    image: ProductImage
  ): Promise<void> {
    try {
      const path = pathFromUrl(
        image.image_url,
        STORAGE_BUCKETS.PRODUCTS
      )

      await deleteFile(
        STORAGE_BUCKETS.PRODUCTS,
        path
      )
    } catch {
      // Storage deletion failure should not prevent
      // deleting the database record.
    }

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', image.id)

    if (error) {
      throw error
    }
  },

  async reorderImages(
    images: {
      id: string
      sort_order: number
    }[]
  ): Promise<void> {
    if (!images.length) {
      return
    }

    const results = await Promise.all(
      images.map(({ id, sort_order }) =>
        supabase
          .from('product_images')
          .update({ sort_order })
          .eq('id', id)
      )
    )

    const failed = results.find(
      (result) => result.error
    )

    if (failed?.error) {
      throw failed.error
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────────────────────

  getPrimaryImage(
    product: Product
  ): ProductImage | null {
    if (!product.product_images?.length) {
      return null
    }

    return (
      product.product_images.find(
        (image) => image.is_primary
      ) ||
      product.product_images[0]
    )
  },

  getMinPrice(product: Product): number {
    if (!product.product_sizes?.length) {
      return 0
    }

    return Math.min(
      ...product.product_sizes
        .filter((size) => size.is_active !== false)
        .map(
          (size) => Number(size.price) || 0
        )
    )
  },

  getMinMrp(product: Product): number {
    if (!product.product_sizes?.length) {
      return 0
    }

    return Math.min(
      ...product.product_sizes
        .filter((size) => size.is_active !== false)
        .map(
          (size) => Number(size.mrp) || 0
        )
    )
  },

  getTotalStock(product: Product): number {
    if (!product.inventory?.length) {
      return 0
    }

    return product.inventory.reduce(
      (sum, inventory) =>
        sum +
        Math.max(
          0,
          Number(inventory.quantity || 0) -
            Number(inventory.reserved_quantity || 0)
        ),
      0
    )
  },
}

