import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payments/razorpay/create-order
 * Create a Razorpay order for the frontend to use in checkout
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      amount,
      currency = 'INR',
      receipt,
      customer_name,
      customer_email,
      customer_phone,
    } = body

    if (!amount || !receipt || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

 
    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 500 }
      )
    }

    // Create order with Razorpay API
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes: {
        customer_name,
        customer_email,
        customer_phone: customer_phone || '',
      },
    }

    // Use basic auth for Razorpay API
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Razorpay API error:', error)
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 500 }
      )
    }

    const razorpayOrder = await response.json()
    return NextResponse.json({ id: razorpayOrder.id })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
