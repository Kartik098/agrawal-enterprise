import { supabase } from '@/lib/supabase'

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function getPushPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported'
  }
  return Notification.permission
}

export async function subscribeUserToPush(userId: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return { success: false, error: 'Push notifications are not supported by your browser' }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied' }
    }

    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY not set')
      return { success: false, error: 'VAPID public key not configured' }
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    })

    const subscriptionJson = subscription.toJSON()
    const endpoint = subscription.endpoint
    const p256dh = subscriptionJson.keys?.p256dh
    const auth = subscriptionJson.keys?.auth

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: 'Failed to extract push subscription keys' }
    }

    // Save to Supabase push_subscriptions
    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )

    if (dbError) {
      console.error('Failed to save push subscription in database:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Push subscription error:', err)
    return { success: false, error: err.message || 'Push subscription failed' }
  }
}
