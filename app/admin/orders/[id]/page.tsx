'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { ordersService } from '@/services/orders'
import { formatCurrency } from '@/components/storefront-ui'
import { PageLoader, Toast } from '@/components/ui/states'
import type { Order } from '@/types/database'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const
const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700', returned: 'bg-purple-100 text-purple-700',
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Order['status']>('pending')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    ordersService.getById(Number(id)).then(o => {
      setOrder(o); if (o) setStatus(o.status)
    }).finally(() => setLoading(false))
  }, [id])

  async function updateStatus() {
    setSaving(true)
    try {
      await ordersService.updateStatus(Number(id), status)
      setToast({ msg: 'Order status updated', type: 'success' })
      setOrder(o => o ? { ...o, status } : o)
    } catch { setToast({ msg: 'Failed to update', type: 'error' }) }
    finally { setSaving(false) }
  }

  if (loading) return <><AdminNav /><div className="lg:pl-72"><AdminTopbar onMenuClick={() => {}} /><PageLoader /></div></>
  if (!order) return <div className="section-shell py-20 text-center text-blue-400">Order not found.</div>

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/orders" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <Link href="/admin/orders" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All orders</Link>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
              <h1 className="mt-1 text-3xl font-black text-blue-950">Order #{order.id}</h1>
              <p className="mt-1 text-sm text-blue-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={status} onChange={e => setStatus(e.target.value as Order['status'])} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 focus:border-orange-400">
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button onClick={updateStatus} disabled={saving || status === order.status} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">
                {saving ? 'Saving...' : 'Update status'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5"><h2 className="font-black text-blue-950">Items ordered</h2></div>
              <div className="divide-y">
                {order.order_items?.map(item => {
                  const img = item.product?.product_images?.find(i => i.is_primary) || item.product?.product_images?.[0]
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-5">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                        {img ? <img src={img.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl font-black text-blue-200">AG</div>}
                      </div>
                      <div className="flex-1">
                        <Link href={`/products/${item.product?.slug}`} target="_blank" className="font-black text-blue-950 hover:text-orange-500">{item.product?.name}</Link>
                        <p className="mt-0.5 text-sm text-blue-400">
                          Size: {item.product_size?.size?.name}
                          {item.product_color?.color?.name ? ` · ${item.product_color.color.name}` : ''}
                          {' '}· Qty: {item.quantity}
                        </p>
                        <p className="text-xs text-blue-300">Unit price: {formatCurrency(item.unit_price)}</p>
                      </div>
                      <p className="font-black text-blue-900">{formatCurrency(item.total_price)}</p>
                    </div>
                  )
                })}
              </div>
              <div className="border-t bg-blue-50 p-5 space-y-2 text-sm">
                <div className="flex justify-between text-blue-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(order.discount_amount)}</span></div>}
                <div className="flex justify-between text-blue-600"><span>Delivery</span><span>{order.delivery_charge === 0 ? 'Free' : formatCurrency(order.delivery_charge)}</span></div>
                <div className="flex justify-between font-black text-blue-950 text-base pt-1 border-t"><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              {/* Customer */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-3">Customer</h3>
                <p className="font-bold text-blue-900">{order.user?.full_name || '—'}</p>
                <p className="text-sm text-blue-500">{order.user?.email}</p>
                {order.user?.phone && <p className="text-sm text-blue-400">{order.user.phone}</p>}
                {order.user?.id && (
                  <Link href={`/admin/customers/${order.user.id}`} className="mt-3 block text-sm font-bold text-orange-500 hover:text-orange-600">View customer profile →</Link>
                )}
              </div>

              {/* Address */}
              {order.address && (
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3"><MapPin size={18} className="text-orange-500" /><h3 className="font-black text-blue-950">Delivery address</h3></div>
                  <p className="text-sm font-bold text-blue-900">{order.address.full_name}</p>
                  <p className="text-sm text-blue-500">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                  <p className="text-sm text-blue-500">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                  <p className="text-sm text-blue-400 mt-1">{order.address.phone}</p>
                </div>
              )}

              {/* Payment */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3"><CreditCard size={18} className="text-orange-500" /><h3 className="font-black text-blue-950">Payment</h3></div>
                <div className="space-y-1 text-sm text-blue-600">
                  <p>Method: <span className="font-bold capitalize">{order.payment_method || '—'}</span></p>
                  <p>Status: <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment_status}</span></p>
                  {order.payment_id && <p className="font-mono text-xs text-blue-400">ID: {order.payment_id}</p>}
                  {order.coupon && <p>Coupon: <span className="font-bold text-orange-500">{order.coupon.code}</span></p>}
                </div>
              </div>

              {/* Current status */}
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-black text-blue-950 mb-2">Current status</h3>
                <span className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
