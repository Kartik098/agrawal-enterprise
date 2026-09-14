import { supabase } from '@/lib/supabase'

import type { Inventory } from '@/types/database'

export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        product_id,
        product_size_id,
        product_color_id,
        quantity,
        reserved_quantity,
        reorder_level,
        warehouse_location,
        updated_at,
        product:products(id, name, sku, slug),
        product_size:product_sizes(id, size:sizes(id, name)),
        product_color:product_colors(id, color:colors(id, name))
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data as unknown as Inventory[]) || []
  },

  async getLowStock(
    threshold = 10
  ): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        product_id,
        product_size_id,
        product_color_id,
        quantity,
        reserved_quantity,
        reorder_level,
        product:products(id, name, sku, slug),
        product_size:product_sizes(id, size:sizes(id, name))
      `)
      .lt('quantity', threshold)
      .order('quantity')

    if (error) throw error

    return (data as unknown as Inventory[]) || []
  },

  async getByProduct(
    productId: string
  ): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        id,
        product_id,
        product_size_id,
        product_color_id,
        quantity,
        reserved_quantity,
        reorder_level,
        warehouse_location,
        created_at,
        updated_at,
        product_size:product_sizes(
          id,
          product_id,
          size_id,
          price,
          mrp,
          sku,
          is_active,
          size:sizes(id, name, sort_order)
        ),
        product_color:product_colors(
          id,
          product_id,
          color_id,
          color:colors(id, name, hex_code)
        )
      `)
      .eq('product_id', productId)

    if (error) throw error

    return (data as unknown as Inventory[]) || []
  },

  /**
   * Synchronize inventory with the product's current variants.
   *
   * productSizeIds are product_sizes.id values.
   * productColorIds are product_colors.id values.
   *
   * Existing inventory is never updated by this method.
   * Only missing rows are inserted.
   *
   * Inventory rows that no longer belong to the selected
   * size/color combinations are deleted only when both
   * quantity and reserved_quantity are zero.
   */
  async syncInventoryVariants(
    productId: string,
    productSizeIds: string[],
    productColorIds: string[]
  ): Promise<void> {
    // UUIDs are strings.
    // Remove empty values and duplicates.
    const sizeIds = [
      ...new Set(
        productSizeIds.filter(
          (id) => id.trim().length > 0
        )
      ),
    ]

    const colorIds = [
      ...new Set(
        productColorIds.filter(
          (id) => id.trim().length > 0
        )
      ),
    ]

    const {
      data: existingInventory,
      error: fetchError,
    } = await supabase
      .from('inventory')
      .select(`
        id,
        product_size_id,
        product_color_id,
        quantity,
        reserved_quantity
      `)
      .eq('product_id', productId)

    if (fetchError) throw fetchError

    const existingRows = existingInventory ?? []

    /*
     * Build the exact combinations that should exist.
     *
     * With colors:
     *   size UUID + color UUID
     *
     * Without colors:
     *   size UUID + null
     */
    const desiredKeys = new Set<string>()

    const missingRows: Array<{
      product_id: string
      product_size_id: string
      product_color_id: string | null
      quantity: number
      reserved_quantity: number
      reorder_level: number
    }> = []

    if (colorIds.length > 0) {
      for (const productSizeId of sizeIds) {
        for (const productColorId of colorIds) {
          desiredKeys.add(
            `${productSizeId}:${productColorId}`
          )
        }
      }
    } else {
      // No colors means one inventory row per size.
      for (const productSizeId of sizeIds) {
        desiredKeys.add(
          `${productSizeId}:null`
        )
      }
    }

    /*
     * Build keys for existing inventory rows.
     */
    const existingKeys = new Set(
      existingRows.map(
        (row) =>
          `${row.product_size_id}:${
            row.product_color_id ?? 'null'
          }`
      )
    )

    /*
     * Insert only combinations that do not already exist.
     */
    for (const key of desiredKeys) {
      if (existingKeys.has(key)) {
        continue
      }

      const separatorIndex = key.indexOf(':')

      const productSizeId = key.slice(
        0,
        separatorIndex
      )

      const colorIdString = key.slice(
        separatorIndex + 1
      )

      const productColorId =
        colorIdString === 'null'
          ? null
          : colorIdString

      missingRows.push({
        product_id: productId,
        product_size_id: productSizeId,
        product_color_id: productColorId,
        quantity: 0,
        reserved_quantity: 0,
        reorder_level: 10,
      })
    }

    if (missingRows.length > 0) {
      const { error: insertError } =
        await supabase
          .from('inventory')
          .insert(missingRows)

      if (insertError) throw insertError
    }

    /*
     * Find inventory combinations that no longer belong
     * to the product's current selected variants.
     */
    const obsoleteRows = existingRows.filter(
      (row) => {
        const key = `${row.product_size_id}:${
          row.product_color_id ?? 'null'
        }`

        return !desiredKeys.has(key)
      }
    )

    /*
     * Delete only empty inventory rows.
     *
     * Stock/reserved stock is never silently destroyed.
     */
    const deletableIds = obsoleteRows
      .filter(
        (row) =>
          row.quantity === 0 &&
          row.reserved_quantity === 0
      )
      .map((row) => row.id)

    if (deletableIds.length > 0) {
      const { error: deleteError } =
        await supabase
          .from('inventory')
          .delete()
          .in('id', deletableIds)

      if (deleteError) throw deleteError
    }
  },

  async insert(
    inv: Omit<
      Inventory,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'product'
      | 'product_size'
      | 'product_color'
    >
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inv)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async upsert(
    inv: Omit<
      Inventory,
      | 'id'
      | 'created_at'
      | 'updated_at'
    >
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .upsert(
        {
          ...inv,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict:
            'product_size_id,product_color_id',
        }
      )
      .select()
      .single()

    if (error) throw error

    return data
  },

  async update(
    id: string,
    updates: Partial<Inventory>
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async adjustStock(
    id: string,
    delta: number
  ): Promise<Inventory> {
    const {
      data: current,
      error: fetchErr,
    } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .single()

    if (fetchErr) throw fetchErr

    return this.update(id, {
      quantity: Math.max(
        0,
        current.quantity + delta
      ),
    })
  },
}