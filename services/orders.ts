import { supabase } from '@/lib/supabase'
import type { Order, OrderItem, Address, Cart, Coupon } from '@/types/database'

const ORDER_SELECT = `
  *,
  user:users(id, full_name, email, phone),
  address:addresses(*),
  coupon:coupons(*),
  order_items(
    *,
    product:products(id, name, slug, sku, product_images(*)),
    product_size:product_sizes(*, size:sizes(*)),
    product_color:product_colors(*, color:colors(*))
  )
`

export interface PlaceOrderInput {
  userId: string
  addressId: number
  couponId?: number
  cartItems: Cart[]
  subtotal: number
  discountAmount: number
  deliveryCharge: number
  totalAmount: number
  paymentMethod: string
  notes?: string
}

export const ordersService = {
  async getAll(page = 1, pageSize = 20): Promise<{ data: Order[]; count: number }> {
    const from = (page - 1) * pageSize
    const { data, error, count } = await supabase
      .from('orders')
      .select(ORDER_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)
    if (error) throw error
    return { data: data || [], count: count || 0 }
  },

  async getByUser(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getById(id: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async place(input: PlaceOrderInput): Promise<Order> {
    // 1. Create the order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: input.userId,
        address_id: input.addressId,
        coupon_id: input.couponId || null,
        status: 'pending',
        payment_status: 'pending',
        payment_method: input.paymentMethod,
        subtotal: input.subtotal,
        discount_amount: input.discountAmount,
        delivery_charge: input.deliveryCharge,
        total_amount: input.totalAmount,
        notes: input.notes || null,
      })
      .select()
      .single()
    if (orderErr) throw orderErr

    // 2. Insert order items
    const items = input.cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_size_id: item.product_size_id,
      product_color_id: item.product_color_id,
      quantity: item.quantity,
      unit_price: item.product_size?.price || 0,
      total_price: (item.product_size?.price || 0) * item.quantity,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(items)
    if (itemsErr) throw itemsErr

    // 3. Decrement inventory for each item
    for (const item of input.cartItems) {
      await supabase.rpc('decrement_inventory', {
        p_product_size_id: item.product_size_id,
        p_quantity: item.quantity,
      }).maybeSingle()
    }

    // 4. Increment coupon used_count
    if (input.couponId) {
      await supabase.rpc('increment_coupon_usage', { p_coupon_id: input.couponId }).maybeSingle()
    }

    return order
  },

  async updateStatus(id: number, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updatePaymentStatus(id: number, paymentStatus: Order['payment_status'], paymentId?: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, payment_id: paymentId || null, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async getRecentOrders(limit = 10): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, user:users(full_name, email), order_items(id)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },
}

export const couponsService = {
  async validate(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) return { valid: false, error: 'Invalid coupon code' }

    const coupon = data as Coupon
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: 'Coupon has expired' }
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' }
    }
    if (subtotal < coupon.min_order_amount) {
      return { valid: false, error: `Minimum order amount is ₹${coupon.min_order_amount}` }
    }

    return { valid: true, coupon }
  },

  calculateDiscount(coupon: Coupon, subtotal: number): number {
    let discount = 0
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100
    } else {
      discount = coupon.discount_value
    }
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
    return Math.round(discount * 100) / 100
  },

  async getAll(): Promise<Coupon[]> {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
}
