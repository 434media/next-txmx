import type { Metadata } from "next"
import Link from "next/link"
import { getGymsWithRosters } from "../actions/gyms"
import { getActiveSeason } from "../actions/seasons"
import PledgeClient from "./pledge-client"

export const metadata: Metadata = {
  title: "Gym Pledge | Choose Your Franchise",
  description:
    "Pledge to a Texas boxing gym for the 16-week season. Earn Loyalty Points when your gym's fighters win — the franchise system for Texas boxing fans.",
  openGraph: {
    title: "Gym Pledge | TXMX Boxing",
    description:
      "Choose your gym. Earn LP when your fighters win. The franchise system for Texas boxing.",
    url: "https://www.txmxboxing.com/pledge",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gym Pledge | TXMX Boxing",
    description:
      "Choose your gym. Earn LP when your fighters win. The franchise system for Texas boxing.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/pledge",
  },
}

export default async function PledgePage() {
  const [gyms, season] = await Promise.all([
    getGymsWithRosters(),
    getActiveSeason(),
  ])

  let seasonWeek: number | null = null
  let seasonTotalWeeks = 16
  if (season) {
    const start = new Date(season.startDate)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
    const end = new Date(season.endDate)
    const totalMs = end.getTime() - start.getTime()
    seasonTotalWeeks = Math.max(1, Math.ceil(totalMs / (7 * 24 * 60 * 60 * 1000)))
    seasonWeek = Math.max(1, Math.min(diffWeeks, seasonTotalWeeks))
  }

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-white/40">
            <li>
              <Link href="/scorecard" className="hover:text-white/70 transition-colors">
                Scorecard
              </Link>
            </li>
            <li className="text-white/15">/</li>
            <li className="text-amber-500/70">Pledge</li>
          </ol>
        </nav>

        <PledgeClient
          gyms={gyms}
          season={season}
          seasonWeek={seasonWeek}
          seasonTotalWeeks={seasonTotalWeeks}
        />
      </div>
    </main>
  )
}
