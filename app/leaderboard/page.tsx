import type { Metadata } from "next"
import { getLeaderboard } from "../actions/users"
import LeaderboardClient from "./leaderboard-client"

export const metadata: Metadata = {
  title: "Leaderboard | Top-Ranked TXMX Fans",
  description:
    "See who's climbing the ranks on TXMX Boxing. Skill Points leaderboard — the best pickers in Texas boxing, ranked by accuracy and engagement.",
  openGraph: {
    title: "Leaderboard | TXMX Boxing",
    description:
      "Top-ranked TXMX fans. Climb the ranks through skill-based predictions.",
    url: "https://www.txmxboxing.com/leaderboard",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/leaderboard",
  },
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard(100)

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Leaderboard
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            The best pickers in Texas boxing — ranked by Skill Points earned
            through accurate predictions.
          </p>
        </div>
        <LeaderboardClient entries={leaderboard} />
      </div>
    </main>
  )
}
