import type { Metadata } from "next"
import Link from "next/link"
import PollsClient from "./polls-client"

export const metadata: Metadata = {
  title: "Fan Polls | Vote & Earn TC",
  description:
    "Cast your vote on fan polls about Texas boxing. Earn 10 TX-Credits for every vote. Share your opinion on upcoming fights, fighter matchups, and more.",
  openGraph: {
    title: "Fan Polls | TXMX Boxing",
    description:
      "Vote on boxing polls and earn TX-Credits. Your voice matters.",
    url: "https://www.txmxboxing.com/polls",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fan Polls | TXMX Boxing",
    description:
      "Vote on boxing polls and earn TX-Credits. Your voice matters.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/polls",
  },
}

export default function PollsPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-12">
        <Link
          href="/scorecard"
          className="inline-flex items-center gap-2 text-white/30 text-[11px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors mb-8 group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Scorecard
        </Link>
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Fan Polls
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Cast your vote and earn 10 TC for every poll. Your opinion shapes the conversation.
          </p>
        </div>
        <PollsClient />
      </div>
    </main>
  )
}
