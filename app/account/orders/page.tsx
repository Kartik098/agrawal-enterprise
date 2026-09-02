'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ordersService } from '@/services/orders'
import { Navbar } from '@/components/storefront/navbar'
import { Footer, formatCurrency } from '@/components/storefront-ui'
import { PageLoader, EmptyState } from '@/components/ui/states'
import type { Order } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700', returned: 'bg-purple-100 text-purple-700',
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (user) ordersService.getByUser(user.id).then(o => { setOrders(o); setOrdersLoading(false) })
    else if (!loading) setOrdersLoading(false)
  }, [user, loading])

  if (loading || ordersLoading) return <><Navbar /><PageLoader label="Loading orders..." /></>

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        <Link href="/account" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> My Account</Link>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Account</p>
        <h1 className="mt-2 text-4xl font-black text-blue-950">My orders</h1>
        <p className="mt-1 text-sm text-blue-400">{orders.length} orders total</p>

        {orders.length > 0 ? (
          <div className="mt-8 space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                <article className="flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"><Package size={21} /></span>
                  <div className="min-w-[160px] flex-1">
                    <p className="font-black text-blue-700">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-blue-500">{order.order_items?.length ?? 0} items · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                    {order.order_items?.slice(0, 2).map(item => (
                      <p key={item.id} className="mt-0.5 text-xs text-blue-400">{item.product?.name}</p>
                    ))}
                  </div>
                  <p className="font-black text-blue-900">{formatCurrency(order.total_amount)}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="📦" title="No orders yet" description="Start shopping to see your orders here." action={<Link href="/products" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Shop now</Link>} />
        )}
      </div>
      <Footer />
    </main>
  )
}
