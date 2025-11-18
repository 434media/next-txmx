'use client'

import { useCallback, useEffect, useState } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { startCheckoutSession } from '@/app/actions/iconic-series-stripe'

// Memoize Stripe promise to avoid recreating it
let stripePromise: Promise<Stripe | null> | null = null

const getStripePromise = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
      return null
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export default function SponsorCheckout({ packageId }: { packageId: string }) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const promise = getStripePromise()
    if (promise) {
      setStripePromise(promise)
    } else {
      setError('Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.')
    }
  }, [])

  const startCheckoutSessionForPackage = useCallback(
    () => startCheckoutSession(packageId),
    [packageId]
  )

  if (error) {
    return (
      <div className="w-full p-8 bg-red-500/10 border border-red-500/20 rounded-sm">
        <p className="text-red-500 text-center">{error}</p>
        <p className="text-white/70 text-sm text-center mt-2">
          Please contact support for assistance.
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-white/70">Loading checkout...</p>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret: startCheckoutSessionForPackage }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
