'use server'

import { stripe } from '../../lib/stripe'
import { SPONSOR_PACKAGES } from '../../lib/iconic-series-products'

export async function startCheckoutSession(packageId: string) {
  const sponsorPackage = SPONSOR_PACKAGES.find(p => p.id === packageId)
  if (!sponsorPackage) {
    throw new Error(`Package with id "${packageId}" not found`)
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sponsorPackage.name,
            description: sponsorPackage.description,
          },
          unit_amount: sponsorPackage.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session')
  }

  return session.client_secret
}
