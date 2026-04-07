import type { Metadata } from 'next'
import SeasonsClient from './seasons-client'

export const metadata: Metadata = {
  title: 'Seasons | TXMX Boxing',
  description: 'Compete in seasonal leaderboards, earn exclusive rewards, and prove you\'re the best picker in Texas boxing.',
  openGraph: {
    title: 'Seasons | TXMX Boxing',
    description: 'Seasonal leaderboards with exclusive rewards for top performers.',
    url: 'https://www.txmxboxing.com/seasons',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.txmxboxing.com/seasons',
  },
}

export default function SeasonsPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Seasons
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Compete in time-limited seasons. Earn SP through predictions and engagement — top finishers win exclusive rewards.
          </p>
        </div>
        <SeasonsClient />
      </div>
    </main>
  )
}
