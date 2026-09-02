'use client'
import { useState, useEffect } from 'react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { analyticsService } from '@/services/analytics'
import { formatCurrency } from '@/components/storefront-ui'
import { Skeleton } from '@/components/ui/states'

export default function AdminAnalyticsPage() {
  const [monthly, setMonthly] = useState<{ month: string; revenue: number; orders: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ product_id: number; name: string; revenue: number; total_sold: number }[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<{ status: string; count: number }[]>([])
  const [categoryRevenue, setCategoryRevenue] = useState<{ category: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getMonthlyRevenue(),
      analyticsService.getTopProducts(8),
      analyticsService.getOrderStatusBreakdown(),
      analyticsService.getCategoryRevenue(),
    ]).then(([mr, tp, sb, cr]) => {
      setMonthly(mr); setTopProducts(tp); setStatusBreakdown(sb); setCategoryRevenue(cr)
    }).finally(() => setLoading(false))
  }, [])

  const maxRevenue = monthly.length ? Math.max(...monthly.map(m => m.revenue), 1) : 1
  const totalOrders = statusBreakdown.reduce((s, b) => s + b.count, 0)
  const totalCategoryRevenue = categoryRevenue.reduce((s, c) => s + c.revenue, 0) || 1

  const STATUS_COLORS: Record<string, string> = {
    delivered: 'bg-green-500', cancelled: 'bg-red-500',
    shipped: 'bg-blue-500', processing: 'bg-orange-500',
    pending: 'bg-yellow-500', returned: 'bg-purple-500',
  }

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/analytics" />
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Analytics</h1>
            <p className="mt-2 text-sm text-blue-500">Live data from Supabase</p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* Revenue chart */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950">Monthly revenue</h2>
              <p className="mt-1 text-sm text-blue-400">Last 12 months</p>
              <div className="mt-6 flex h-56 items-end gap-2 border-b border-blue-100">
                {loading ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${(i + 1) * 7}%` }} />) :
                  monthly.length > 0 ? monthly.map((m, i) => (
                    <div key={m.month} className="group relative flex flex-1 flex-col items-center gap-2">
                      <div className={`w-full rounded-t-md transition-opacity hover:opacity-80 ${i === monthly.length - 1 ? 'bg-orange-500' : 'bg-blue-300'}`} style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 100)}%` }} />
                      <span className="text-[10px] text-blue-400 whitespace-nowrap">{m.month}</span>
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-lg bg-blue-900 px-2 py-1 text-[10px] text-white whitespace-nowrap z-10">
                        {formatCurrency(m.revenue)}<br />{m.orders} orders
                      </div>
                    </div>
                  )) : <p className="flex-1 flex items-center justify-center text-sm text-blue-300">No data yet</p>
                }
              </div>
            </section>

            {/* Order status */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950">Order status breakdown</h2>
              <p className="mt-1 mb-6 text-sm text-blue-400">{totalOrders} total orders</p>
              {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="mb-4 h-8 w-full rounded-xl" />) :
                statusBreakdown.map(({ status, count }) => (
                  <div key={status} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold capitalize text-blue-900">{status}</span>
                      <span className="text-blue-500">{count} ({Math.round(count / totalOrders * 100)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
                      <div className={`h-full rounded-full ${STATUS_COLORS[status] || 'bg-blue-400'}`} style={{ width: `${(count / totalOrders * 100).toFixed(1)}%` }} />
                    </div>
                  </div>
                ))
              }
              {!loading && !statusBreakdown.length && <p className="text-sm text-blue-300">No order data yet.</p>}
            </section>

            {/* Top products */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950">Top products by revenue</h2>
              <div className="mt-4 space-y-1">
                {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />) :
                  topProducts.length > 0 ? topProducts.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-blue-50">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-100 text-sm font-black text-orange-600">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-blue-900">{p.name}</p>
                        <p className="text-xs text-blue-400">{p.total_sold} units sold</p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-blue-900">{formatCurrency(p.revenue)}</p>
                    </div>
                  )) : <p className="py-6 text-center text-sm text-blue-300">No sales data yet.</p>
                }
              </div>
            </section>

            {/* Category revenue */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-black text-blue-950">Revenue by category</h2>
              <div className="mt-6 space-y-4">
                {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-xl" />) :
                  categoryRevenue.length > 0 ? categoryRevenue.map((c, i) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-bold text-blue-900">{c.category}</span>
                        <span className="text-blue-500">{formatCurrency(c.revenue)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
                        <div className={`h-full rounded-full ${i % 2 === 0 ? 'bg-orange-400' : 'bg-blue-400'}`} style={{ width: `${(c.revenue / totalCategoryRevenue * 100).toFixed(1)}%` }} />
                      </div>
                    </div>
                  )) : <p className="text-sm text-blue-300">No revenue data yet.</p>
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
