import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { stripe } from "../../../../lib/stripe"
import { getUserByUid, updateUserSubscription } from "../../../actions/users"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = await getAuth().verifyIdToken(token)
    const user = await getUserByUid(decoded.uid)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If user already has an active subscription, redirect to billing portal
    if (user.subscriptionStatus === "active" && user.stripeCustomerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${request.nextUrl.origin}/scorecard`,
      })
      return NextResponse.json({ url: portalSession.url })
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

    // Create checkout session for $14.99/mo subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TXMX Black Card",
              description:
                "Monthly subscription — Prop Picks, Leaderboard, Rewards Store, and full TXMX economy access.",
            },
            unit_amount: 1499,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/scorecard?subscribed=true`,
      cancel_url: `${request.nextUrl.origin}/scorecard`,
      subscription_data: {
        metadata: { firebaseUid: decoded.uid },
      },
      metadata: { firebaseUid: decoded.uid },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe subscribe error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
