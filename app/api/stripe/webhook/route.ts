import { NextRequest, NextResponse } from "next/server"
import { stripe } from "../../../../lib/stripe"
import {
  getUserByStripeCustomerId,
  getUserByUid,
  updateUserSubscription,
} from "../../../actions/users"
import { sendSubscriptionConfirmation } from "../../../actions/email"
import type Stripe from "stripe"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === "subscription" && session.metadata?.firebaseUid) {
          await updateUserSubscription(session.metadata.firebaseUid, {
            subscriptionStatus: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          })

          // Send confirmation email via Resend
          try {
            const subscribedUser = await getUserByUid(session.metadata.firebaseUid)
            if (subscribedUser?.email) {
              await sendSubscriptionConfirmation(
                subscribedUser.email,
                subscribedUser.displayName
              )
            }
          } catch (emailErr) {
            console.error("Confirmation email failed:", emailErr)
          }
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as Record<string, unknown>).subscription as string | undefined
        if (subId && invoice.customer) {
          const user = await getUserByStripeCustomerId(
            invoice.customer as string
          )
          if (user) {
            await updateUserSubscription(user.uid, {
              subscriptionStatus: "active",
              stripeSubscriptionId: subId,
            })

            // Send confirmation email on first successful payment
            if (user.subscriptionStatus !== "active" && user.email) {
              try {
                await sendSubscriptionConfirmation(user.email, user.displayName)
              } catch (emailErr) {
                console.error("Confirmation email failed:", emailErr)
              }
            }
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.customer) {
          const user = await getUserByStripeCustomerId(
            invoice.customer as string
          )
          if (user) {
            await updateUserSubscription(user.uid, {
              subscriptionStatus: "past_due",
            })
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        if (subscription.customer) {
          const user = await getUserByStripeCustomerId(
            subscription.customer as string
          )
          if (user) {
            await updateUserSubscription(user.uid, {
              subscriptionStatus: "canceled",
              stripeSubscriptionId: undefined,
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        if (subscription.customer) {
          const user = await getUserByStripeCustomerId(
            subscription.customer as string
          )
          if (user) {
            const status =
              subscription.status === "active"
                ? "active"
                : subscription.status === "past_due"
                  ? "past_due"
                  : subscription.status === "canceled"
                    ? "canceled"
                    : user.subscriptionStatus
            await updateUserSubscription(user.uid, {
              subscriptionStatus: status,
            })
          }
        }
        break
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
