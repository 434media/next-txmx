import type { Metadata } from "next"
import CheckoutClient from "./checkout-client"

export const metadata: Metadata = {
  title: "Checkout — TXMX Black Card",
  description:
    "Subscribe to the TXMX Black Card for $14.99/mo. Unlock Prop Picks, Leaderboard, Rewards Store, and full TXMX economy access.",
  openGraph: {
    title: "TXMX Black Card | $14.99/mo",
    description:
      "Unlock Prop Picks, Leaderboard, Rewards Store, and full TXMX economy access.",
    url: "https://www.txmxboxing.com/checkout",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TXMX Black Card | $14.99/mo",
    description:
      "Unlock Prop Picks, Leaderboard, Rewards Store, and full economy access.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/checkout",
  },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
