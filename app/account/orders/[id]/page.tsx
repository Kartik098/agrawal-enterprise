'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, MapPin, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ordersService } from '@/services/orders'
import { Navbar } from '@/components/storefront/navbar'
import { Footer, formatCurrency } from '@/components/storefront-ui'
import { PageLoader, EmptyState } from '@/components/ui/states'
import type { Order } from '@/types/database'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']
const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
  shipped: 'bg-blue-100 text-blue-700', processing: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)

  useEffect(() => {
    if (user) ordersService.getById(Number(id)).then(setOrder)
  }, [user, id])

  if (loading || order === undefined) return <><Navbar /><PageLoader /></>
  if (!order) return <><Navbar /><EmptyState icon="😕" title="Order not found" action={<Link href="/account/orders" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">All orders</Link>} /></>

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <main className="min-h-screen bg-blue-50/40">
      <Navbar />
      <div className="section-shell py-12">
        <Link href="/account/orders" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-6"><ArrowLeft size={17} /> All orders</Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Order</p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">#{order.id}</h1>
            <p className="mt-1 text-sm text-blue-400">Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${STATUS_COLORS[order.status] || 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
        </div>

        {/* Tracking */}
        {!isCancelled && (
          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-black text-blue-950 mb-6">Order tracking</h2>
            <div className="flex items-start">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className={`h-1 flex-1 ${i <= currentStep ? 'bg-orange-400' : 'bg-blue-100'}`} />}
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${i < currentStep ? 'bg-green-500 text-white' : i === currentStep ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-blue-100 text-blue-400'}`}>
                      {i < currentStep ? <Check size={16} /> : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className={`h-1 flex-1 ${i < currentStep ? 'bg-orange-400' : 'bg-blue-100'}`} />}
                  </div>
                  <p className={`mt-2 text-xs font-bold capitalize ${i <= currentStep ? 'text-blue-900' : 'text-blue-300'}`}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5"><h2 className="font-black text-blue-950">Items ordered</h2></div>
            <div className="divide-y">
              {order.order_items?.map(item => {
                const img = item.product?.product_images?.find(i => i.is_primary) || item.product?.product_images?.[0]
                return (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                      {img ? <img src={img.image_url} alt={item.product?.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl font-black text-blue-200">AG</div>}
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product?.slug}`} className="font-black text-blue-950 hover:text-orange-500">{item.product?.name}</Link>
                      <p className="mt-0.5 text-sm text-blue-400">
                        Size: {item.product_size?.size?.name}
                        {item.product_color?.color?.name ? ` · ${item.product_color.color.name}` : ''}
                        {' '}· Qty: {item.quantity}
                      </p>
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

          {/* Info */}
          <div className="space-y-4">
            {order.address && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3"><MapPin size={18} className="text-orange-500" /><h3 className="font-black text-blue-950">Delivery address</h3></div>
                <p className="text-sm font-bold text-blue-900">{order.address.full_name}</p>
                <p className="text-sm text-blue-500">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p className="text-sm text-blue-500">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p className="text-sm text-blue-400 mt-1">{order.address.phone}</p>
              </div>
            )}
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3"><CreditCard size={18} className="text-orange-500" /><h3 className="font-black text-blue-950">Payment</h3></div>
              <p className="mt-2 text-sm text-blue-500 capitalize">{order.payment_method || 'Online'} · <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment_status}</span></p>
            </div>
            {!isCancelled && order.status !== 'delivered' && (
              <button className="w-full rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500 hover:bg-red-50">Cancel order</button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
