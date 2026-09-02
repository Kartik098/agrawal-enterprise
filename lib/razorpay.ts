/**
 * Razorpay Configuration & Utilities
 * Frontend client-side utilities - never includes secret key
 */
import { supabase } from '@/lib/supabase'
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!

if (!RAZORPAY_KEY_ID) {
  throw new Error('Missing NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable')
}

export interface RazorpayOrderOptions {
  amount: number // Amount in paise (smallest unit: 100 paise = 1 rupee)
  currency: string
  receipt: string // Order reference ID
  customer_name: string
  customer_email: string
  customer_phone?: string
}

export interface RazorpayPaymentData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/**
 * Create a Razorpay order on the backend
 */
export async function createRazorpayOrder(options: RazorpayOrderOptions): Promise<{ id: string }> {
  const res = await fetch('/api/payments/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create Razorpay order')
  }

  return res.json()
}

/**
 * Verify payment on the backend
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpayPaymentData,
  orderData: any
): Promise<{ success: boolean; orderId?: number; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return {
      success: false,
      error: 'Your session has expired. Please log in again.',
    }
  }

  const res = await fetch('/api/payments/razorpay/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      order_data: orderData,
    }),
  })

  const result = await res.json()

  if (!res.ok) {
    return {
      success: false,
      error: result.error || 'Payment verification failed',
    }
  }

  return result
}

/**
 * Load Razorpay checkout script
 */
export function loadRazorpayScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve((window as any).Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve((window as any).Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay checkout
 */
export async function openRazorpayCheckout(options: {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  callback_url?: string
  onSuccess: (response: RazorpayPaymentData) => void
  onError: (error: any) => void
}): Promise<void> {
  await loadRazorpayScript()

  const Razorpay = (window as any).Razorpay

  const checkoutOptions = {
    key: options.key,
    order_id: options.order_id,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    customer_notification: 1,
    prefill: {
      name: options.customer_name,
      email: options.customer_email,
      contact: options.customer_phone,
    },
    handler: (response: RazorpayPaymentData) => {
      options.onSuccess(response)
    },
    modal: {
      ondismiss: () => {
        options.onError({ message: 'Payment cancelled' })
      },
    },
  }

  const razorpay = new Razorpay(checkoutOptions)
  razorpay.open()
}
