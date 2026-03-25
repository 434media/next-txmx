"use server"

import { stripe } from "../../lib/stripe"
import { getAuth } from "firebase-admin/auth"
import { getUserByUid, updateUserSubscription } from "./users"
import "../../lib/firebase-admin"

async function getOrCreateBlackCardProduct(): Promise<string> {
  const products = await stripe.products.list({ limit: 100 })
  const existing = products.data.find(
    (p) => p.metadata.app === "txmx-black-card" && p.active
  )
  if (existing) return existing.id

  const product = await stripe.products.create({
    name: "TXMX Black Card",
    description:
      "Monthly subscription — Prop Picks, Leaderboard, Rewards Store, and full TXMX economy access.",
    metadata: { app: "txmx-black-card" },
  })
  return product.id
}

export async function createSubscriptionIntent(idToken: string) {
  const decoded = await getAuth().verifyIdToken(idToken)
  const user = await getUserByUid(decoded.uid)

  if (!user) {
    throw new Error("User not found")
  }

  if (user.subscriptionStatus === "active") {
    throw new Error("Already subscribed")
  }

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.displayName || undefined,
      metadata: { firebaseUid: decoded.uid },
    })
    customerId = customer.id
    await updateUserSubscription(decoded.uid, {
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: customerId,
    })
  }

  const productId = await getOrCreateBlackCardProduct()

  // Create subscription with incomplete payment to get a PaymentIntent
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price_data: {
          currency: "usd",
          product: productId,
          unit_amount: 1499,
          recurring: { interval: "month" },
        },
      },
    ],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: { firebaseUid: decoded.uid },
  })

  // latest_invoice is expanded to a full Invoice object, and payment_intent is expanded within it
  const invoice = subscription.latest_invoice as unknown as {
    payment_intent: { client_secret: string } | null
  }

  if (!invoice?.payment_intent?.client_secret) {
    throw new Error("Failed to create payment intent")
  }

  return {
    clientSecret: invoice.payment_intent.client_secret,
    subscriptionId: subscription.id,
  }
}
