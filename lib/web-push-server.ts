import webpush from 'web-push'
import { supabaseAdmin } from '@/lib/supabase-admin'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@agrawal-enterprise.com'

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  } catch (err) {
    console.error('Failed to initialize VAPID details:', err)
  }
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; message: string; url?: string; entityType?: string; entityId?: number }
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return
  }

  try {
    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error || !subs || subs.length === 0) return

    const pushPayload = JSON.stringify(payload)

    await Promise.all(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          )
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription has expired or is invalid, remove it from DB
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id)
          } else {
            console.error('Web push error:', err)
          }
        }
      })
    )
  } catch (err) {
    console.error('Failed to send push notification to user:', err)
  }
}
