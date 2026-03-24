import type { Metadata } from "next"
import { getOpenProps } from "../actions/props"
import PicksClient from "./picks-client"

export const metadata: Metadata = {
  title: "Prop Picks | Predict Bout Outcomes",
  description:
    "Place your picks on Texas boxing bouts. Earn Skill Points for correct predictions and climb the TXMX leaderboard. Black Card subscribers only.",
  openGraph: {
    title: "Prop Picks | TXMX Boxing",
    description:
      "Predict bout outcomes. Earn Skill Points. Climb the ranks.",
    url: "https://www.txmxboxing.com/picks",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/picks",
  },
}

export default async function PicksPage() {
  const props = await getOpenProps()

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            Black Card &middot; Prop Picks
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Make Your Picks
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Predict bout outcomes to earn Skill Points. Correct picks move you
            up the leaderboard. Underdog picks pay 1.25x.
          </p>
        </div>
        <PicksClient props={props} />
      </div>
    </main>
  )
}
