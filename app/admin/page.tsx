'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Bell, Boxes, CircleDollarSign, ClipboardList, FolderTree, LayoutDashboard, Menu, Package, Search, Settings, ShoppingBag, Tag, Users, X, TrendingUp, TrendingDown, ArrowRight, Film, Images } from 'lucide-react'
import { analyticsService } from '@/services/analytics'
import { ordersService } from '@/services/orders'
import { formatCurrency } from '@/components/storefront-ui'
import { PageLoader, Skeleton, TableRowSkeleton } from '@/components/ui/states'
import type { DashboardStats, Order } from '@/types/database'

import { NotificationBell } from '@/components/notifications/notification-bell'

const NAV_ITEMS = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { label: 'Inventory', icon: Boxes, href: '/admin/inventory' },
  { label: 'Brands', icon: Tag, href: '/admin/brands' },
  { label: 'Categories', icon: FolderTree, href: '/admin/categories' },
  { label: 'Subcategories', icon: FolderTree, href: '/admin/subcategories' },
  { label: 'Videos', icon: Film, href: '/admin/videos' },
  { label: 'Carousel', icon: Images, href: '/admin/carousels' },
  { label: 'Customers', icon: Users, href: '/admin/customers' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
]

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export function AdminNav({ active = '/admin' }: { active?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-blue-600 p-6 text-white transition-transform lg:translate-x-0`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black">Agrawal <span className="text-orange-400">Enterprise</span></Link>
          <button onClick={() => setOpen(false)} className="lg:hidden rounded-full p-1 hover:bg-blue-500"><X size={20} /></button>
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-[.2em] text-blue-300">Admin console</p>
        <nav className="mt-10 flex-1 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
            <Link key={href} href={href} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active === href ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-blue-500 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 rounded-2xl bg-blue-800 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 font-black text-white">AE</div>
            <div><p className="text-sm font-bold">Admin</p><p className="text-xs text-blue-300">Administrator</p></div>
          </div>
          <Link href="/" className="mt-3 block text-center text-xs font-bold text-blue-300 hover:text-white">← View storefront</Link>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  )
}

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-4 sm:px-8">
      <button onClick={onMenuClick} className="rounded-full p-2 text-blue-600 hover:bg-blue-50 lg:hidden"><Menu size={22} /></button>
     
      <div className="ml-auto flex items-center gap-5">
        <NotificationBell isAdmin={true} />
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 font-black text-white">AE</span>
          <div className="hidden sm:block"><p className="text-sm font-bold">Admin</p><p className="text-xs text-blue-400">Administrator</p></div>
        </div>
      </div>
    </header>
  )
}

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ product_id: number; name: string; revenue: number; total_sold: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getDashboardStats(),
      ordersService.getRecentOrders(5),
      analyticsService.getMonthlyRevenue(),
      analyticsService.getTopProducts(5),
    ]).then(([s, o, mr, tp]) => {
      setStats(s); setRecentOrders(o); setMonthlyRevenue(mr); setTopProducts(tp)
    }).finally(() => setLoading(false))
  }, [])

  const maxRevenue = monthlyRevenue.length ? Math.max(...monthlyRevenue.map(m => m.revenue)) : 1

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin" />
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => setMenuOpen(true)} />
        <div className="section-shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Dashboard</p>
              <h1 className="mt-2 text-3xl font-black text-blue-950">Overview</h1>
              <p className="mt-2 text-sm text-blue-500">Live data from Supabase.</p>
            </div>
            <Link href="/admin/products/new" className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-orange-600">
              <Package size={17} /> Add product
            </Link>
          </div>

          {/* KPI cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />) : [
              { label: 'Total revenue', value: formatCurrency(stats?.total_revenue || 0), growth: stats?.revenue_growth || 0, icon: CircleDollarSign, colorClass: 'bg-orange-100 text-orange-600' },
              { label: 'Total orders', value: String(stats?.total_orders || 0), growth: stats?.orders_growth || 0, icon: ClipboardList, colorClass: 'bg-blue-100 text-blue-600' },
              { label: 'Customers', value: String(stats?.total_customers || 0), growth: 0, icon: Users, colorClass: 'bg-orange-100 text-orange-600' },
              { label: 'Active products', value: String(stats?.total_products || 0), growth: 0, icon: Package, colorClass: 'bg-blue-100 text-blue-600' },
            ].map(({ label, value, growth, icon: Icon, colorClass }) => (
              <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-400">{label}</p>
                    <p className="mt-2 text-2xl font-black text-blue-950">{value}</p>
                  </div>
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${colorClass}`}><Icon size={20} /></span>
                </div>
                {growth !== 0 && (
                  <p className={`mt-4 flex items-center gap-1 text-xs font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(growth)}% vs last month
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Revenue chart */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-black text-blue-950">Revenue overview</h2>
              <p className="mt-1 text-sm text-blue-400">Monthly revenue from Supabase orders</p>
              <div className="mt-6 flex h-56 items-end gap-2 border-b border-blue-100 px-1">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.random() * 80 + 20}%` }} />)
                ) : monthlyRevenue.length > 0 ? (
                  monthlyRevenue.map((m, i) => (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                      <div className={`w-full rounded-t-md transition hover:opacity-80 ${i === monthlyRevenue.length - 1 ? 'bg-orange-500' : 'bg-blue-200'}`} style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 100)}%` }} />
                      <span className="text-[10px] text-blue-400">{m.month}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-blue-300">No order data yet</div>
                )}
              </div>
            </section>

            {/* Top products */}
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-blue-950">Top products</h2>
                <Link href="/admin/products" className="text-sm font-bold text-orange-500">View all</Link>
              </div>
              <div className="mt-4 space-y-1">
                {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />) :
                  topProducts.length > 0 ? topProducts.map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-blue-50">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-100 text-sm font-black text-orange-700">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-blue-900">{p.name}</p>
                        <p className="text-xs text-blue-400">{p.total_sold} sold</p>
                      </div>
                      <p className="text-sm font-black text-blue-900">{formatCurrency(p.revenue)}</p>
                    </div>
                  )) : (
                    <p className="py-8 text-center text-sm text-blue-300">No sales data yet</p>
                  )
                }
              </div>
            </section>
          </div>

          {/* Recent orders */}
          <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="font-black text-blue-950">Recent orders</h2>
                <p className="mt-1 text-sm text-blue-400">Latest activity from Supabase</p>
              </div>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600">All orders <ArrowRight size={16} /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />) :
                    recentOrders.length > 0 ? recentOrders.map(o => (
                      <tr key={o.id} className="border-t hover:bg-blue-50/60">
                        <td className="px-5 py-4"><Link href={`/admin/orders/${o.id}`} className="font-bold text-blue-700 hover:text-orange-500">#{o.id}</Link></td>
                        <td className="px-5 py-4 font-semibold">{o.user?.full_name || o.user?.email || '—'}</td>
                        <td className="px-5 py-4 text-blue-500">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4 font-bold">{formatCurrency(o.total_amount)}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[o.status] || 'bg-blue-100 text-blue-600'}`}>{o.status}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-blue-300">No orders yet. Orders placed on the storefront will appear here.</td></tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
