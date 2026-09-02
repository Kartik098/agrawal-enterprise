import { supabase } from '@/lib/supabase'
import type { DashboardStats } from '@/types/database'

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [ordersRes, customersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('total_amount, created_at, status'),
      supabase.from('users').select('id, created_at').eq('is_admin', false),
      supabase.from('products').select('id').eq('is_active', true),
    ])

    const orders = ordersRes.data || []
    const paidOrders = orders.filter(o => o.status !== 'cancelled')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    // Compare this month vs last month
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthOrders = paidOrders.filter(o => new Date(o.created_at) >= thisMonthStart)
    const lastMonthOrders = paidOrders.filter(o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) < thisMonthStart)

    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total_amount, 0)
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total_amount, 0)
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    const ordersGrowth = lastMonthOrders.length > 0 ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0

    return {
      total_revenue: totalRevenue,
      total_orders: paidOrders.length,
      total_customers: customersRes.data?.length || 0,
      total_products: productsRes.data?.length || 0,
      revenue_growth: Math.round(revenueGrowth * 10) / 10,
      orders_growth: Math.round(ordersGrowth * 10) / 10,
    }
  },

  async getMonthlyRevenue(): Promise<{ month: string; revenue: number; orders: number }[]> {
    const { data } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .neq('status', 'cancelled')
      .order('created_at')

    if (!data) return []

    const byMonth: Record<string, { revenue: number; orders: number }> = {}
    data.forEach(o => {
      const month = o.created_at.slice(0, 7) // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0 }
      byMonth[month].revenue += o.total_amount
      byMonth[month].orders += 1
    })

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, v]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        ...v,
      }))
  },

  async getTopProducts(limit = 5): Promise<{ product_id: number; name: string; total_sold: number; revenue: number }[]> {
    const { data } = await supabase
      .from('order_items')
      .select('product_id, quantity, total_price, product:products(name)')
      .limit(500)

    if (!data) return []

    const byProduct: Record<number, { name: string; total_sold: number; revenue: number }> = {}
    data.forEach((item: any) => {
      if (!byProduct[item.product_id]) byProduct[item.product_id] = { name: item.product?.name || '', total_sold: 0, revenue: 0 }
      byProduct[item.product_id].total_sold += item.quantity
      byProduct[item.product_id].revenue += item.total_price
    })

    return Object.entries(byProduct)
      .map(([id, v]) => ({ product_id: Number(id), ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  },

  async getOrderStatusBreakdown(): Promise<{ status: string; count: number }[]> {
    const { data } = await supabase.from('orders').select('status')
    if (!data) return []
    const counts: Record<string, number> = {}
    data.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  },

  async getCategoryRevenue(): Promise<{ category: string; revenue: number }[]> {
    const { data } = await supabase
      .from('order_items')
      .select('total_price, product:products(category:categories(name))')
      .limit(500)

    if (!data) return []
    const byCategory: Record<string, number> = {}
    data.forEach((item: any) => {
      const cat = item.product?.category?.name || 'Uncategorised'
      byCategory[cat] = (byCategory[cat] || 0) + item.total_price
    })
    return Object.entries(byCategory)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  },
}
