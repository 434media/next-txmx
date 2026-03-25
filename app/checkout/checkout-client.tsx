"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "../../lib/auth-context"
import { createSubscriptionIntent } from "../actions/stripe-subscribe"
import AuthModal from "../../components/auth-modal"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const cardStyle = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "16px",
      fontWeight: "500",
      "::placeholder": { color: "#71717a" },
      iconColor: "#FFB800",
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { user, refreshProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!stripe || !elements || !user) return

      setLoading(true)
      setError(null)

      try {
        const idToken = await user.getIdToken()
        const { clientSecret } = await createSubscriptionIntent(idToken)

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error("Card element not found")

        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: user.email || undefined,
                name: user.displayName || undefined,
              },
            },
          }
        )

        if (confirmError) {
          setError(confirmError.message || "Payment failed")
        } else {
          setComplete(true)
          await refreshProfile()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    },
    [stripe, elements, user, refreshProfile]
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                Black Card — $14.99/mo
              </p>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tight uppercase">
              Sign in to get started
            </h2>
            <p className="text-white/50 text-sm font-medium leading-relaxed">
              Create an account or sign in to unlock the full TXMX economy.
            </p>
          </div>

          {/* What you get */}
          <ul className="space-y-3">
            {[
              "Predict bout outcomes for Skill Points",
              "Choose your Gym Franchise for the 16-week season",
              "Spend TX-Credits on real merch and access",
              "Compete for rank and status-gated rewards",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-white/50 text-sm font-semibold"
              >
                <span className="text-amber-500 mt-0.5 shrink-0">&#9654;</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Sign In button */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full text-center text-black text-sm font-semibold tracking-widest uppercase bg-amber-500 hover:bg-amber-400 px-8 py-3 transition-colors"
          >
            SIGN IN
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    )
  }

  if (complete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Welcome to the Black Card
          </h2>
          <p className="text-zinc-400">
            Your subscription is active. You now have full access to Prop Picks,
            Leaderboard, Rewards Store, and the complete TXMX economy.
          </p>
          <button
            onClick={() => router.push("/scorecard")}
            className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            Open Scorecard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-amber-500 font-bold text-sm uppercase tracking-widest">
            TXMX Boxing
          </p>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Black Card
          </h1>
          <p className="text-zinc-500 text-sm">
            Monthly membership &bull; Cancel anytime
          </p>
        </div>

        {/* Price */}
        <div className="border border-zinc-800 p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-white font-bold uppercase tracking-wider">
              TXMX Black Card
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-white">$14.99</span>
              <span className="text-zinc-500 text-sm">/mo</span>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            {[
              "Prop Picks & Predictions",
              "Leaderboard & Rankings",
              "Rewards Store Access",
              "Full TXMX Economy",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-amber-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span className="text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Card Details
            </label>
            <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-none focus-within:border-amber-500/50 transition-colors">
              <CardElement options={cardStyle} />
            </div>
          </div>

          {error && (
            <div className="border border-red-900/50 bg-red-950/30 p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Subscribe — $14.99/mo"
            )}
          </button>

          <p className="text-center text-zinc-600 text-xs">
            Secured by Stripe. Your card details never touch our servers.
          </p>
        </form>

        {/* Back link */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            &larr; Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutClient() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
