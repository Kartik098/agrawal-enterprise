'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, MapPin, CreditCard, Plus, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useData'
import { addressesService } from '@/services/users'
import { cartService, } from '@/services/cart'
import { couponsService, ordersService } from '@/services/orders'
import { formatCurrency } from '@/components/storefront-ui'
import { PageLoader, Toast } from '@/components/ui/states'
import { RAZORPAY_KEY_ID, createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from '@/lib/razorpay'
import type { Address, Coupon } from '@/types/database'

const steps = ['Address', 'Payment', 'Review']

export function CheckoutClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { cart, loading: cartLoading, refetch } = useCart(user?.id || null)
  const [step, setStep] = useState(0)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddr, setSelectedAddr] = useState<number | null>(null)
  const [addingAddr, setAddingAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [payMethod, setPayMethod] = useState('razorpay')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) addressesService.getAll(user.id).then(addrs => {
      setAddresses(addrs)
      const def = addrs.find(a => a.is_default)
      if (def) setSelectedAddr(def.id)
    })
  }, [user])

  const subtotal = cart.reduce((s, i) => s + (i.product_size?.price || 0) * i.quantity, 0)
  const discount = coupon ? couponsService.calculateDiscount(coupon, subtotal) : 0
  const delivery = (subtotal - discount) >= 999 ? 0 : 99
  const total = subtotal - discount + delivery

  async function applyCoupon() {
    setCouponError('')
    const result = await couponsService.validate(couponCode, subtotal)
    if (result.valid && result.coupon) setCoupon(result.coupon)
    else { setCouponError(result.error || 'Invalid coupon'); setCoupon(null) }
  }

  async function saveAddress() {
    if (!user) return
    const addr = await addressesService.create(user.id, { ...newAddr, is_default: addresses.length === 0 })
    setAddresses(a => [addr, ...a])
    setSelectedAddr(addr.id)
    setAddingAddr(false)
  }

  async function placeOrder() {
    if (!user || !selectedAddr || !cart.length) return
    
    setPlacing(true)
    setError(null)
    
    try {
      // Prepare order data
      const orderData = {
        userId: user.id,
        addressId: selectedAddr,
        couponId: coupon?.id,
        cartItems: cart,
        subtotal,
        discountAmount: discount,
        deliveryCharge: delivery,
        totalAmount: total,
        notes: null,
      }

      // Step 1: Create Razorpay order
      console.log('Creating Razorpay order...')
      const razorpayOrder = await createRazorpayOrder({
        amount: total,
        currency: 'INR',
        receipt: `order-${user.id}-${Date.now()}`,
        customer_name: user.full_name || 'Customer',
        customer_email: user.email,
        customer_phone: user.phone || undefined,
      })

      // Step 2: Open Razorpay checkout
      console.log('Opening Razorpay checkout...')
      await openRazorpayCheckout({
        key: RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        amount: Math.round(total * 100), // Convert to paise
        currency: 'INR',
        name: 'Agrawal Enterprise',
        description: `Order for ${user.email}`,
        customer_name: user.full_name || 'Customer',
        customer_email: user.email,
        customer_phone: user.phone,
        onSuccess: async (response) => {
          console.log('Payment successful, verifying...', response)
          // Step 3: Verify payment on backend
          try {
            const verification = await verifyRazorpayPayment(response, orderData)
            
            if (verification.success) {
              // Payment verified - order created
              console.log('Payment verified, order created:', verification.orderId)
              
              // Clear cart
              await cartService.clear(user.id)
              await refetch()
              
              // Show confirmation
              setOrderId(verification.orderId)
              setPlaced(true)
              setPlacing(false)
            } else {
              // Verification failed
              setError(verification.error || 'Payment verification failed. Please contact support.')
              setPlacing(false)
            }
          } catch (verifyErr: any) {
            console.error('Verification error:', verifyErr)
            setError(verifyErr.message || 'Failed to verify payment. Please contact support.')
            setPlacing(false)
          }
        },
        onError: (err) => {
          console.error('Payment error:', err)
          setError(err.message || 'Payment failed. Please try again.')
          setPlacing(false)
        },
      })
    } catch (err: any) {
      console.error('Order creation error:', err)
      setError(err.message || 'Failed to process order. Please try again.')
      setPlacing(false)
    }
  }

  if (authLoading || cartLoading) return <PageLoader label="Loading checkout..." />
  if (!user) return <div className="section-shell py-20 text-center"><p className="text-blue-500">Please <Link href="/login" className="font-bold text-orange-500">log in</Link> to checkout.</p></div>

  if (placed) return (
    <div className="section-shell flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center py-20">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-green-100 text-green-600"><Check size={48} strokeWidth={3} /></div>
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Order placed!</p>
        <h1 className="mt-3 text-4xl font-black text-blue-950">Thank you!</h1>
        <p className="mt-3 max-w-sm text-blue-500">Order <strong className="text-blue-900">#{orderId}</strong> confirmed. You'll receive an update shortly.</p>
      </div>
      <div className="flex gap-4">
        <Link href="/account/orders" className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white">Track my order</Link>
        <Link href="/products" className="rounded-full border border-blue-200 px-6 py-3 font-bold text-blue-700">Continue shopping</Link>
      </div>
    </div>
  )

  if (!cart.length) return <div className="section-shell py-20 text-center"><p className="text-blue-500">Your cart is empty. <Link href="/products" className="font-bold text-orange-500">Shop now</Link></p></div>

  const currentAddr = addresses.find(a => a.id === selectedAddr)

  return (
    <div className="section-shell py-12">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      
      <Link href="/cart" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-orange-500 mb-8"><ArrowLeft size={18} /> Back to cart</Link>
      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-400'}`}>{i < step ? <Check size={14} /> : i + 1}</div>
            <span className={`text-sm font-bold ${i === step ? 'text-blue-900' : 'text-blue-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-blue-200" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-blue-950">Delivery address</h2>
              {addresses.map(addr => (
                <label key={addr.id} className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-white p-5 transition ${selectedAddr === addr.id ? 'border-orange-500 shadow-md shadow-orange-100' : 'border-blue-100 hover:border-orange-300'}`}>
                  <input type="radio" checked={selectedAddr === addr.id} onChange={() => setSelectedAddr(addr.id)} className="mt-1 accent-orange-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-blue-950">{addr.full_name}</p>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">{addr.label}</span>
                      {addr.is_default && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">Default</span>}
                    </div>
                    <p className="mt-1 text-sm text-blue-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p className="text-sm text-blue-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="mt-1 text-sm text-blue-400">{addr.phone}</p>
                  </div>
                </label>
              ))}

              {addingAddr ? (
                <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 space-y-4">
                  <h3 className="font-black text-blue-950">New address</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['full_name', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'] as const).map(field => (
                      <input key={field} placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} value={newAddr[field]} onChange={e => setNewAddr(a => ({ ...a, [field]: e.target.value }))} className="rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none placeholder:text-blue-300 focus:border-orange-400" />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAddingAddr(false)} className="flex-1 rounded-xl border border-blue-200 py-3 text-sm font-bold text-blue-600">Cancel</button>
                    <button onClick={saveAddress} className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white">Save address</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingAddr(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 py-5 text-sm font-bold text-blue-500 hover:border-orange-400 hover:text-orange-500">
                  <Plus size={17} /> Add a new address
                </button>
              )}

              <button onClick={() => setStep(1)} disabled={!selectedAddr} className="w-full rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg disabled:opacity-60 hover:bg-orange-600">
                Continue to payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-blue-950">Payment method</h2>
              
              {/* Info about Razorpay payment */}
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex gap-3">
                <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900">Secure Payment</p>
                  <p className="text-xs text-orange-700 mt-1">Payment is processed securely via Razorpay. Your payment details are not stored on our servers.</p>
                </div>
              </div>

              {[{ id: 'razorpay', label: 'UPI / Card / Wallet', desc: 'Secured by Razorpay. Pay via UPI, Credit/Debit Card, or Digital Wallet' }].map(m => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-5 transition ${payMethod === m.id ? 'border-orange-500' : 'border-blue-100 hover:border-orange-300'}`}>
                  <input type="radio" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-orange-500" disabled />
                  <div><p className="font-black text-blue-950">{m.label}</p><p className="text-sm text-blue-400">{m.desc}</p></div>
                </label>
              ))}

              {/* Coupon */}
              <div className="rounded-2xl border border-blue-100 bg-white p-5">
                <h3 className="mb-3 font-black text-blue-950">Coupon code</h3>
                <div className="flex gap-3">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="flex-1 rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-orange-400" />
                  <button onClick={applyCoupon} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Apply</button>
                </div>
                {couponError && <p className="mt-2 text-sm text-red-500">{couponError}</p>}
                {coupon && <p className="mt-2 text-sm font-bold text-green-600">✓ {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : formatCurrency(coupon.discount_value)} applied!</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-blue-200 py-4 font-bold text-blue-700 hover:border-orange-400">Back</button>
                <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg hover:bg-orange-600">Review order</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && currentAddr && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-blue-950">Review your order</h2>
              <div className="rounded-2xl border bg-white p-5">
                <div className="flex items-center gap-3"><MapPin size={18} className="text-orange-500" /><div><p className="font-black text-blue-950">{currentAddr.full_name}</p><p className="text-sm text-blue-500">{currentAddr.line1}, {currentAddr.city} — {currentAddr.pincode}</p></div></div>
              </div>
              <div className="rounded-2xl border bg-white p-5">
                <div className="flex items-center gap-3"><CreditCard size={18} className="text-orange-500" /><p className="font-black text-blue-950">Razorpay (UPI / Card / Wallet)</p></div>
              </div>
              <div className="rounded-2xl border bg-white p-5 space-y-3">
                {cart.map(item => {
                  const img = item.product?.product_images?.find(i => i.is_primary) || item.product?.product_images?.[0]
                  return (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-blue-50">{img ? <img src={img.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs font-black text-blue-200">AG</div>}</div>
                      <span className="flex-1 font-semibold text-blue-900">{item.product?.name} <span className="text-blue-400">× {item.quantity}</span></span>
                      <span className="font-black text-blue-900">{formatCurrency((item.product_size?.price || 0) * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-blue-200 py-4 font-bold text-blue-700 hover:border-orange-400">Back</button>
                <button onClick={placeOrder} disabled={placing} className="flex-1 rounded-xl bg-orange-500 py-4 font-bold text-white shadow-lg hover:bg-orange-600 disabled:opacity-70">
                  {placing ? 'Processing...' : `Pay now · ${formatCurrency(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-black text-blue-950">Bag ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h3>
          <div className="mt-4 space-y-3">
            {cart.map(item => {
              const img = item.product?.product_images?.find(i => i.is_primary) || item.product?.product_images?.[0]
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-blue-50">{img ? <img src={img.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-black text-blue-200">AG</div>}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-blue-900">{item.product?.name}</p>
                    <p className="text-xs text-blue-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-black text-blue-900">{formatCurrency((item.product_size?.price || 0) * item.quantity)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-blue-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon discount</span><span>−{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between text-blue-600"><span>Delivery</span><span>{delivery === 0 ? <span className="font-bold text-green-600">Free</span> : formatCurrency(delivery)}</span></div>
            <div className="flex justify-between font-black text-blue-950 text-base border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}