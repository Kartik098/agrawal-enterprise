import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/web-push-server'

/**
 * POST /api/payments/razorpay/verify
 * Verify Razorpay payment signature and create order if valid
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_data,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured')
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 500 }
      )
    }

    // Verify signature
    const body_str = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body_str)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      console.error('Signature verification failed:', {
        expected: generated_signature,
        received: razorpay_signature,
      })
      return NextResponse.json(
        { success: false, error: 'Payment signature verification failed' },
        { status: 401 }
      )
    }

    // Signature is valid - now create the order in the database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify the authenticated user matches the order
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(
      req.headers.get('authorization')?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate that the user owns this order
    if (order_data.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - user mismatch' },
        { status: 401 }
      )
    }

    // Check for duplicate order (idempotency)
    // Look for an order with the same razorpay_payment_id
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', razorpay_payment_id)
      .maybeSingle()

    if (existingOrder) {
      // Order already created for this payment
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        message: 'Order already created for this payment',
      })
    }

    // Create the order with payment verification
    const ORDER_SELECT = `
      *,
      user:users(id, full_name, email, phone),
      address:addresses(*),
      coupon:coupons(*),
      order_items(
        *,
        product:products(id, name, slug, sku, product_images(*)),
        product_size:product_sizes(*, size:sizes(*)),
        product_color:product_colors(*, color:colors(*))
      )
    `

    // 1. Create the order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: order_data.userId,
        address_id: order_data.addressId,
        coupon_id: order_data.couponId || null,
        status: 'processing',
        payment_status: 'paid',
        payment_method: 'razorpay',
        payment_id: razorpay_payment_id,
        subtotal: order_data.subtotal,
        discount_amount: order_data.discountAmount,
        delivery_charge: order_data.deliveryCharge,
        total_amount: order_data.totalAmount,
        notes: order_data.notes || null,
      })
      .select()
      .single()

    if (orderErr) {
      console.error('Failed to create order:', orderErr)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // 2. Insert order items
    const items = order_data.cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_size_id: item.product_size_id,
      product_color_id: item.product_color_id,
      quantity: item.quantity,
      unit_price: item.product_size?.price || 0,
      total_price: (item.product_size?.price || 0) * item.quantity,
    }))

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(items)

    if (itemsErr) {
      console.error('Failed to create order items:', itemsErr)
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // 3. Decrement inventory for each item
    for (const item of order_data.cartItems) {
      const { error: invErr } = await supabase.rpc('decrement_inventory', {
        p_product_size_id: item.product_size_id,
        p_quantity: item.quantity,
      })

      if (invErr) {
        console.error('Failed to decrement inventory:', invErr)
        // Don't fail the order if inventory update fails
      }
    }

    // 4. Increment coupon used_count
    if (order_data.couponId) {
      await supabase.rpc('increment_coupon_usage', {
        p_coupon_id: order_data.couponId,
      })
    }

    // 5. Create customer and admin notifications
    try {
      const notificationsToInsert = [
        {
          user_id: order.user_id,
          type: 'order_created',
          title: 'Order placed successfully',
          message: `Your order #${order.id} has been placed successfully.`,
          entity_type: 'order',
          entity_id: order.id,
        },
      ]

      // Fetch admin users to send admin order notifications
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('is_admin', true)

      if (adminUsers && adminUsers.length > 0) {
        adminUsers.forEach((admin: { id: string }) => {
          if (admin.id !== order.user_id) {
            notificationsToInsert.push({
              user_id: admin.id,
              type: 'order_created',
              title: 'New order received',
              message: `A new order #${order.id} has been placed. Please review the order.`,
              entity_type: 'order',
              entity_id: order.id,
            })
          }
        })
      }

      const { error: notificationErr } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)

      if (notificationErr) {
        console.error('Failed to create order notifications:', notificationErr)
      }

      // Send Web Push notifications (async/background)
      sendPushToUser(order.user_id, {
        title: 'Order placed successfully',
        message: `Your order #${order.id} has been placed successfully.`,
        url: `/account/orders/${order.id}`,
        entityType: 'order',
        entityId: order.id,
      }).catch(err => console.error('Push notification failed:', err))

      if (adminUsers && adminUsers.length > 0) {
        adminUsers.forEach((admin: { id: string }) => {
          sendPushToUser(admin.id, {
            title: 'New order received',
            message: `A new order #${order.id} has been placed. Please review the order.`,
            url: `/admin/orders/${order.id}`,
            entityType: 'order',
            entityId: order.id,
          }).catch(err => console.error('Admin push notification failed:', err))
        })
      }
    } catch (notificationErr) {
      console.error('Failed to create order notifications:', notificationErr)
    }

    // 6. Send admin notification email
    try {
      await sendOrderNotificationToAdmin(
        order.id,
        order_data.userId,
        order.total_amount,
        order_data.cartItems.length
      )
    } catch (emailErr) {
      console.error('Failed to send admin notification:', emailErr)
      // Don't fail the order if email fails
    }

    // Fetch complete order data
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', order.id)
      .single()

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order: completeOrder,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Send admin notification email about new order
 */
async function sendOrderNotificationToAdmin(
  orderId: number,
  userId: string,
  totalAmount: number,
  itemCount: number
): Promise<void> {
  // For now, we'll log this. Implement email service as needed
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@agrawal-enterprise.com'
  
  

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // Example:
  // await sendEmail({
  //   to: adminEmail,
  //   subject: `New Order Received - #${orderId}`,
  //   template: 'admin-order-notification',
  //   data: { orderId, totalAmount, itemCount }
  // })
}
