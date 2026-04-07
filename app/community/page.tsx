import type { Metadata } from 'next'
import CommunityClient from './community-client'

export const metadata: Metadata = {
  title: 'Community | TXMX Boxing',
  description: 'Join the conversation with Texas boxing fans. Share predictions, hype up fighters, and connect with the community.',
  openGraph: {
    title: 'Community | TXMX Boxing',
    description: 'The fan feed for Texas boxing.',
    url: 'https://www.txmxboxing.com/community',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.txmxboxing.com/community',
  },
}

export default function CommunityPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6 sm:px-8">
        <div className="mb-8">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-2 uppercase">
            Community
          </h1>
          <p className="text-white/40 text-sm">The fan feed for Texas boxing</p>
        </div>
        <CommunityClient />
      </div>
    </main>
  )
}
