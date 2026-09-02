'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { ordersService } from '@/services/orders'
import { formatCurrency } from '@/components/storefront-ui'
import { TableRowSkeleton, EmptyState } from '@/components/ui/states'
import type { Order } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700', returned: 'bg-purple-100 text-purple-700',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const load = () => {
    setLoading(true)
    ordersService.getAll(page, PAGE_SIZE).then(({ data, count }) => {
      setOrders(data); setTotal(count)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const filtered = orders.filter(o => {
    const matchSearch = !search || `#${o.id}`.includes(search) || (o.user?.full_name || '').toLowerCase().includes(search.toLowerCase()) || (o.user?.email || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/orders" />
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Orders</h1>
            <p className="mt-2 text-sm text-blue-500">{total} total orders</p>
          </div>

          {/* Stats strip */}
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {[['All', ''], ['Pending', 'pending'], ['Processing', 'processing'], ['Shipped', 'shipped'], ['Delivered', 'delivered']].map(([label, val]) => (
              <button key={val} onClick={() => setStatusFilter(val)} className={`rounded-2xl border p-4 text-center transition ${statusFilter === val ? 'border-orange-500 bg-orange-50' : 'border-blue-100 bg-white hover:border-orange-300'}`}>
                <p className={`text-xl font-black ${statusFilter === val ? 'text-orange-600' : 'text-blue-950'}`}>
                  {val ? orders.filter(o => o.status === val).length : orders.length}
                </p>
                <p className="mt-1 text-xs font-bold text-blue-400">{label}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border bg-white px-4 py-2.5">
              <Search size={17} className="text-blue-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order ID or customer..." className="w-full bg-transparent text-sm outline-none placeholder:text-blue-300" />
              {search && <button onClick={() => setSearch('')}><X size={14} className="text-blue-300" /></button>}
            </div>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-blue-50 text-xs uppercase tracking-wider text-blue-400">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />) :
                    filtered.length > 0 ? filtered.map(order => (
                      <tr key={order.id} className="border-t hover:bg-blue-50/60">
                        <td className="px-5 py-4 font-bold text-blue-700">#{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{order.user?.full_name || '—'}</p>
                          <p className="text-xs text-blue-400">{order.user?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-blue-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4 text-blue-500">{order.order_items?.length ?? 0}</td>
                        <td className="px-5 py-4 font-bold">{formatCurrency(order.total_amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-orange-500 hover:text-orange-600">View →</Link>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={8} className="px-5 py-20 text-center text-sm text-blue-300">No orders match your filter.</td></tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40">← Prev</button>
              <span className="flex items-center px-4 text-sm font-semibold text-blue-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
