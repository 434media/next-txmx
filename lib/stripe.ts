// Stripe retired 2026-10-31 (keys removed); code kept for reuse. Restore keys to re-enable.

import 'server-only'

import Stripe from 'stripe'

let client: Stripe | null = null

/**
 * The server-side Stripe client, or null when STRIPE_SECRET_KEY is not set.
 * Built on first use rather than at module load, so the site builds and runs
 * without the key. Every caller must handle null as "Stripe is off".
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}
