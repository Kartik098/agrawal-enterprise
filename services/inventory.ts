import { supabase } from '@/lib/supabase'
import type { Inventory } from '@/types/database'

export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(id, name, sku, slug),
        product_size:product_sizes(*, size:sizes(*)),
        product_color:product_colors(*, color:colors(*))
      `)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getLowStock(threshold = 10): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(id, name, sku, slug),
        product_size:product_sizes(*, size:sizes(*))
      `)
      .lt('quantity', threshold)
      .order('quantity')
    if (error) throw error
    return data || []
  },

  async getByProduct(productId: number): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product_size:product_sizes(*, size:sizes(*)),
        product_color:product_colors(*, color:colors(*))
      `)
      .eq('product_id', productId)
    if (error) throw error
    return data || []
  },

  async insert(inv: Omit<Inventory, 'id' | 'created_at' | 'updated_at' | 'product' | 'product_size' | 'product_color'>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inv)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async upsert(inv: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .upsert(
        { ...inv, updated_at: new Date().toISOString() },
        { onConflict: 'product_size_id' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<Inventory>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async adjustStock(id: number, delta: number): Promise<Inventory> {
    const { data: current, error: fetchErr } = await supabase
      .from('inventory').select('quantity').eq('id', id).single()
    if (fetchErr) throw fetchErr
    return this.update(id, { quantity: Math.max(0, current.quantity + delta) })
  },
}
