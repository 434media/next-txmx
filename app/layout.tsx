import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import { getActiveFightNight } from "./actions/fightnight"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.txmxboxing.com'),
  title: {
    default: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
    template: '%s | TXMX Boxing',
  },
  description: 'TXMX Boxing is the home of Texas–Mexico boxing. Play Fight Nights — the free fan game at every fight card: pick winners, call props, and climb the live leaderboard. Plus verified fighter records and event coverage.',
  keywords: [
    'TXMX Boxing',
    'Texas boxing',
    'Mexico boxing',
    'Fight Nights',
    'boxing fan game',
    'pick winners',
    'boxing predictions',
    'fight night leaderboard',
    'San Antonio boxing',
    'live boxing',
    'fighter records',
    'TDLR boxing',
    'combat sports',
  ],
  authors: [{ name: 'TXMX Boxing' }],
  creator: 'TXMX Boxing',
  publisher: 'TXMX Boxing',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
    description: 'Play Fight Nights — the free fan game at every TXMX fight card. Pick winners, call props, and climb the live leaderboard, in person or online.',
    url: 'https://www.txmxboxing.com',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
    description: 'The free fan game at every TXMX fight card — pick winners, climb the leaderboard. Live, in person or online.',
    creator: '@txmx',
    site: '@txmx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.txmxboxing.com',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Surface the active fight night (if any) into the nav. Fight Night is
  // always visible in the dropdown — this just decides whether to show the
  // red "Live" dot and point to the specific event vs. the landing page.
  let activeFightNight = null
  try {
    activeFightNight = await getActiveFightNight()
  } catch {
    // Non-critical — nav falls back to the landing page only
  }
  return <ClientLayout activeFightNight={activeFightNight}>{children}</ClientLayout>
}
