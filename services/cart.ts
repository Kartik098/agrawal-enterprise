import { supabase } from '@/lib/supabase'
import type { Cart, Wishlist } from '@/types/database'

const CART_SELECT = `
  *,
  product:products(id, name, slug, product_images(*)),
  product_size:product_sizes(*, size:sizes(*)),
  product_color:product_colors(*, color:colors(*))
`

export const cartService = {
  async get(userId: string): Promise<Cart[]> {
    const { data, error } = await supabase
      .from('cart')
      .select(CART_SELECT)
      .eq('user_id', userId)
      .order('created_at')
    if (error) throw error
    return data || []
  },

  async add(userId: string, productId: number, productSizeId: number, productColorId: number | null, qty = 1): Promise<Cart> {
    // Check if item already in cart — if so, increment qty
    const { data: existing } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('product_size_id', productSizeId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id)
        .select(CART_SELECT)
        .single()
      if (error) throw error
      return data
    }

    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id: userId, product_id: productId, product_size_id: productSizeId, product_color_id: productColorId, quantity: qty })
      .select(CART_SELECT)
      .single()
    if (error) throw error
    return data
  },

  async updateQty(id: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.remove(id)
      return
    }
    const { error } = await supabase.from('cart').update({ quantity }).eq('id', id)
    if (error) throw error
  },

  async remove(id: number): Promise<void> {
    const { error } = await supabase.from('cart').delete().eq('id', id)
    if (error) throw error
  },

  async clear(userId: string): Promise<void> {
    const { error } = await supabase.from('cart').delete().eq('user_id', userId)
    if (error) throw error
  },

  getTotal(items: Cart[]): number {
    return items.reduce((sum, item) => sum + (item.product_size?.price || 0) * item.quantity, 0)
  },
}

export const wishlistService = {
  async get(userId: string): Promise<Wishlist[]> {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, product:products(*, product_images(*), product_sizes(*, size:sizes(*)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async add(userId: string, productId: number): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .upsert({ user_id: userId, product_id: productId })
    if (error) throw error
  },

  async remove(userId: string, productId: number): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
    if (error) throw error
  },

  async isWishlisted(userId: string, productId: number): Promise<boolean> {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()
    return !!data
  },
}
