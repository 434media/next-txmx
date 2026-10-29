import 'server-only'

import { firestore } from "../firebase-admin"
import type { UserRecord } from "../../app/actions/users"

// Internal server-side helpers. NOT a "use server" module: nothing here is
// callable from the browser. These used to be exported server actions, which
// made them public POST endpoints; they are only ever called by other server
// code (the Stripe webhook, /api/stripe/subscribe and the token-verified
// createSubscriptionIntent action).

export async function getUserByUid(
  uid: string
): Promise<UserRecord | null> {
  const snap = await firestore.collection("users").doc(uid).get()
  if (!snap.exists) return null
  return snap.data() as UserRecord
}

export async function getUserByStripeCustomerId(
  customerId: string
): Promise<UserRecord | null> {
  const snap = await firestore
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get()

  if (snap.empty) return null
  return snap.docs[0].data() as UserRecord
}

export async function updateUserSubscription(
  uid: string,
  data: {
    subscriptionStatus: UserRecord["subscriptionStatus"]
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
) {
  const ref = firestore.collection("users").doc(uid)
  await ref.update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}
