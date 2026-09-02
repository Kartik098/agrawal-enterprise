'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MapPin, Heart, Settings, ChevronRight, User, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ordersService } from '@/services/orders'
import { Navbar } from '@/components/storefront/navbar'
import { Footer, formatCurrency } from '@/components/storefront-ui'
import { PageLoader } from '@/components/ui/states'
import type { Order } from '@/types/database'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
  returned: 'bg-purple-100 text-purple-700',
}

export default function AccountPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      ordersService.getByUser(user.id).then(o => { setOrders(o); setOrdersLoading(false) })
    }
  }, [user])

  if (loading || !user) return <PageLoader label="Loading your account..." />

  const menuItems = [
    { icon: Package, label: 'My Orders', desc: 'Track and manage your orders', href: '/account/orders', count: orders.length },
    { icon: Bell, label: 'Notifications', desc: 'View updates and alerts', href: '/account/notifications', count: null },
    { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', href: '/account/addresses', count: null },
    { icon: Heart, label: 'Wishlist', desc: 'Products you have saved', href: '/account/wishlist', count: null },
    { icon: Settings, label: 'Settings', desc: 'Profile and preferences', href: '/account/settings', count: null },
  ]

  const displayName = profile?.full_name || user.email || 'Customer'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        {/* Profile card */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex flex-wrap items-center gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-orange-500 text-3xl font-black">{initials}</div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-300">Welcome back</p>
              <h1 className="mt-1 text-3xl font-black">{displayName}</h1>
              <p className="mt-1 text-blue-200">{user.email}{profile?.phone ? ` · ${profile.phone}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Total orders', orders.length],
            ['Delivered', orders.filter(o => o.status === 'delivered').length],
            ['Total spent', formatCurrency(orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0))],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-sm text-center">
              <p className="text-2xl font-black text-blue-950">{value}</p>
              <p className="mt-1 text-sm font-semibold text-blue-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Menu grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {menuItems.map(({ icon: Icon, label, desc, href, count }) => (
            <Link key={href} href={href} className="flex items-center gap-5 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-orange-600"><Icon size={22} /></span>
              <div className="flex-1">
                <p className="font-black text-blue-950">{label}</p>
                <p className="mt-0.5 text-sm text-blue-400">{desc}</p>
              </div>
              {count !== null && count > 0 && <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{count}</span>}
              <ChevronRight size={18} className="text-blue-300" />
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        {!ordersLoading && orders.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-blue-950">Recent orders</h2>
              <Link href="/account/orders" className="text-sm font-bold text-orange-500 hover:text-orange-600">View all</Link>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 3).map(order => (
                      <tr key={order.id} className="border-t hover:bg-blue-50/60">
                        <td className="px-5 py-4">
                          <Link href={`/account/orders/${order.id}`} className="font-bold text-blue-700 hover:text-orange-500">#{order.id}</Link>
                        </td>
                        <td className="px-5 py-4 text-blue-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4 text-blue-500">{order.order_items?.length ?? 0} items</td>
                        <td className="px-5 py-4 font-bold">{formatCurrency(order.total_amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
