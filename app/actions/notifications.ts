'use server'

import { firestore } from '../../lib/firebase-admin'
import { uidFromIdToken } from '../../lib/fan-auth'
import { requireAdmin } from '../../lib/admin-auth'
import webpush from 'web-push'

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function savePushSubscription(
  idToken: string,
  subscription: PushSubscriptionData
) {
  // The subscription is stored under the verified caller's uid only.
  const userId = await uidFromIdToken(idToken)
  if (!userId) return { success: false, error: 'Not signed in' }
  if (
    !subscription ||
    typeof subscription.endpoint !== 'string' ||
    typeof subscription.keys?.p256dh !== 'string' ||
    typeof subscription.keys?.auth !== 'string'
  ) {
    return { success: false, error: 'Invalid subscription' }
  }
  await firestore
    .collection('pushSubscriptions')
    .doc(userId)
    .set({
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      userId,
      createdAt: new Date().toISOString(),
    })

  return { success: true }
}

export async function removePushSubscription(idToken: string) {
  const userId = await uidFromIdToken(idToken)
  if (!userId) return { success: false, error: 'Not signed in' }
  await firestore.collection('pushSubscriptions').doc(userId).delete()
  return { success: true }
}

export async function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

/**
 * Send a push notification to a specific subset of users. Used for
 * fight-night events where only fans who have an interest in a particular
 * bout should be pinged (e.g., "your pick just settled").
 *
 * The `tag` arg lets a later notification replace an earlier one on the
 * same topic — e.g., a "bout 3 settled" push replaces a "bout 3 live" push
 * if the user hasn't read it yet.
 */
export async function sendPushToUsers(
  userIds: string[],
  title: string,
  body: string,
  url: string = '/',
  tag?: string
) {
  await requireAdmin()
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:guna@434media.com'

  if (!vapidPublic || !vapidPrivate) {
    return { success: false, sent: 0, failed: 0, error: 'VAPID keys not configured' }
  }
  if (userIds.length === 0) {
    return { success: true, sent: 0, failed: 0 }
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

  const payload = JSON.stringify({
    title,
    body,
    url,
    tag: tag || `txmx-${Date.now()}`,
  })

  // Firestore `in` queries cap at 30 ids per call — chunk to stay safe.
  const chunks: string[][] = []
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30))
  }

  let sent = 0
  let failed = 0

  for (const chunk of chunks) {
    const snap = await firestore
      .collection('pushSubscriptions')
      .where('userId', 'in', chunk)
      .get()
    for (const doc of snap.docs) {
      const sub = doc.data()
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          payload
        )
        sent++
      } catch (err: unknown) {
        failed++
        if (err && typeof err === 'object' && 'statusCode' in err) {
          const statusCode = (err as { statusCode: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            await doc.ref.delete()
          }
        }
      }
    }
  }

  return { success: true, sent, failed }
}
