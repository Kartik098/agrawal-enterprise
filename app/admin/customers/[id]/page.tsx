'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { usersService } from '@/services/users'
import { ordersService } from '@/services/orders'
import { formatCurrency } from '@/components/storefront-ui'
import { PageLoader } from '@/components/ui/states'
import type { User, Order } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([usersService.getProfile(id), ordersService.getByUser(id)]).then(([c, o]) => {
      setCustomer(c); setOrders(o)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <><AdminNav /><div className="lg:pl-72"><AdminTopbar onMenuClick={() => {}} /><PageLoader /></div></>
  if (!customer) return <div className="section-shell py-20 text-center text-blue-400">Customer not found.</div>

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0)

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/customers" />
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <Link href="/admin/customers" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All customers</Link>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-100 text-2xl font-black text-orange-600">
              {(customer.full_name || customer.email).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-blue-950">{customer.full_name || customer.email}</h1>
              <p className="text-sm text-blue-400">Customer since {new Date(customer.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[['Total orders', orders.length], ['Delivered', orders.filter(o => o.status === 'delivered').length], ['Total spent', formatCurrency(totalSpent)]].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-2xl font-black text-blue-950">{value}</p>
                <p className="mt-1 text-sm text-blue-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5"><h2 className="font-black text-blue-950">Order history</h2></div>
              {orders.length > 0 ? (
                <div className="divide-y">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-blue-700 hover:text-orange-500">#{order.id}</Link>
                        <p className="text-sm text-blue-400">{new Date(order.created_at).toLocaleDateString('en-IN')} · {order.order_items?.length ?? 0} items</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-blue-900">{formatCurrency(order.total_amount)}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-10 text-center text-sm text-blue-300">No orders yet.</p>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm h-fit">
              <h3 className="font-black text-blue-950 mb-4">Contact details</h3>
              <div className="space-y-3 text-sm">
                <div><p className="font-bold text-blue-500 text-xs uppercase tracking-wider mb-1">Email</p><p className="text-blue-900">{customer.email}</p></div>
                <div><p className="font-bold text-blue-500 text-xs uppercase tracking-wider mb-1">Phone</p><p className="text-blue-900">{customer.phone || '—'}</p></div>
                <div><p className="font-bold text-blue-500 text-xs uppercase tracking-wider mb-1">Status</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
