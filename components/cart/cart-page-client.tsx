'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { cartService } from '@/services/cart'
import { productsService } from '@/services/products'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useData'
import { PageLoader, EmptyState } from '@/components/ui/states'
import { formatCurrency } from '@/components/storefront-ui'

export function CartPageClient() {
  const { user, loading: authLoading } = useAuth()
  const { cart, loading, refetch } = useCart(user?.id || null)
  const [updating, setUpdating] = useState<number | null>(null)

  if (authLoading || loading) return <PageLoader label="Loading your bag..." />
  if (!user) return (
    <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center py-20">
      <ShoppingBag size={64} className="text-blue-200" />
      <div><h2 className="text-2xl font-black text-blue-950">Log in to see your bag</h2><p className="mt-2 text-blue-500">Your cart is saved to your account.</p></div>
      <Link href="/login" className="rounded-full bg-orange-500 px-8 py-3 font-bold text-white">Log in</Link>
    </div>
  )

  if (!cart.length) return (
    <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center py-20">
      <ShoppingBag size={64} className="text-blue-200" />
      <div><h2 className="text-2xl font-black text-blue-950">Your bag is empty</h2><p className="mt-2 text-blue-500">Add something wonderful.</p></div>
      <Link href="/products" className="rounded-full bg-orange-500 px-8 py-3 font-bold text-white">Start shopping</Link>
    </div>
  )

  async function updateQty(id: number, delta: number, current: number) {
    setUpdating(id)
    await cartService.updateQty(id, current + delta)
    await refetch()
    setUpdating(null)
  }
  async function removeItem(id: number) {
    setUpdating(id)
    await cartService.remove(id)
    await refetch()
    setUpdating(null)
  }

  const subtotal = cart.reduce((s, i) => s + (i.product_size?.price || 0) * i.quantity, 0)
  const delivery = subtotal >= 999 ? 0 : 99
  const total = subtotal + delivery

  return (
    <div className="section-shell py-12">
      <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Your bag</p>
      <h1 className="mt-2 text-4xl font-black text-blue-950">Shopping cart</h1>
      <p className="mt-1 text-sm text-blue-400">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.map(item => {
            const img = item.product?.product_images?.find(i => i.is_primary) || item.product?.product_images?.[0]
            return (
              <article key={item.id} className={`flex gap-5 rounded-2xl border bg-white p-5 shadow-sm transition ${updating === item.id ? 'opacity-50' : ''}`}>
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                  {img ? <img src={img.image_url} alt={item.product?.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black text-blue-200">AG</div>}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/products/${item.product?.slug}`} className="font-black text-blue-950 hover:text-orange-500">{item.product?.name}</Link>
                      <p className="mt-1 text-sm text-blue-400">Size: {item.product_size?.size?.name}{item.product_color?.color?.name ? ` · ${item.product_color.color.name}` : ''}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-blue-300 hover:text-red-500"><Trash2 size={17} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0 rounded-xl border border-blue-200 overflow-hidden">
                      <button onClick={() => updateQty(item.id, -1, item.quantity)} disabled={item.quantity <= 1} className="px-3 py-2 text-blue-700 hover:bg-blue-50 disabled:opacity-40"><Minus size={14} /></button>
                      <span className="min-w-[2rem] text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1, item.quantity)} className="px-3 py-2 text-blue-700 hover:bg-blue-50"><Plus size={14} /></button>
                    </div>
                    <p className="font-black text-blue-950">{formatCurrency((item.product_size?.price || 0) * item.quantity)}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-black text-blue-950">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-blue-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-blue-600"><span>Delivery</span><span>{delivery === 0 ? <span className="font-bold text-green-600">Free</span> : formatCurrency(delivery)}</span></div>
            {delivery > 0 && <p className="text-xs text-blue-400">Add {formatCurrency(999 - subtotal)} more for free delivery</p>}
            <div className="border-t pt-3 flex justify-between font-black text-blue-950 text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600">
            Proceed to checkout <ArrowRight size={18} />
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm font-bold text-blue-500 hover:text-orange-500">Continue shopping</Link>
        </div>
      </div>
    </div>
  )
}
