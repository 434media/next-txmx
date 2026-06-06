import type { Metadata } from "next"
import Link from "next/link"
import {
  getActiveFightNight,
  getUpcomingFightNights,
  getPastFightNights,
} from "../actions/fightnight"
import { getLeaderboard } from "../actions/users"
import FightNightCard from "../../components/fight-nights/fight-night-card"

export const metadata: Metadata = {
  title: "Fight Nights | TXMX Boxing",
  description:
    "The skill-based fan game played live at local fight cards. Pick winners, call props, vote polls, and climb the leaderboard. See upcoming fight nights and play live.",
  openGraph: {
    title: "Fight Nights | TXMX Boxing",
    description:
      "Pick winners, call props, climb the leaderboard — live at every fight night. Powered by TXMX Boxing.",
    url: "https://www.txmxboxing.com/fight-nights",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fight Nights | TXMX Boxing",
    description: "Pick winners. Stack points. Climb the leaderboard — live.",
  },
  alternates: { canonical: "https://www.txmxboxing.com/fight-nights" },
}

// Revalidate every 5 minutes so newly announced nights and leaderboard
// movement surface without a redeploy (the live game lives on the dynamic
// /fight-nights/[slug] pages).
export const revalidate = 300

export default async function FightNightsHubPage() {
  const [featured, upcomingRaw, pastRaw, leaders] = await Promise.all([
    getActiveFightNight(),
    getUpcomingFightNights(),
    getPastFightNights(),
    getLeaderboard(10),
  ])

  // Don't repeat the featured night in the calendar/archive grids.
  const upcoming = upcomingRaw.filter((f) => f.id !== featured?.id)
  const past = pastRaw.filter((f) => f.id !== featured?.id)

  return (
    <main className="relative min-h-dvh bg-black font-sans">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-20">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-block w-2 h-2 bg-amber-500" />
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase">
              The Fan Game
            </p>
          </div>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase mb-6">
            Fight Nights
          </h1>
          <p className="text-white/65 text-base sm:text-lg font-semibold leading-7 max-w-xl">
            The skill-based fan game played live at local fight cards. Pick
            winners, call props, vote polls, and climb the leaderboard — in
            person or online. Free to play.
          </p>
        </header>

        {/* Featured night */}
        {featured ? (
          <section className="mb-16">
            <SectionLabel>
              {featured.status === "completed" ? "Latest Event" : "Happening Next"}
            </SectionLabel>
            <FightNightCard fightNight={featured} featured />
          </section>
        ) : (
          <section className="mb-16 border border-dashed border-white/15 rounded-xl px-6 py-12 text-center">
            <p className="text-white/40 text-sm font-medium">
              No fight night announced yet — follow TXMX for the next drop.
            </p>
          </section>
        )}

        {/* Upcoming calendar */}
        {upcoming.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Upcoming</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((fn) => (
                <FightNightCard key={fn.id} fightNight={fn} />
              ))}
            </div>
          </section>
        )}

        {/* Past fight nights — only renders once there are completed events */}
        {past.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Past Fight Nights</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((fn) => (
                <FightNightCard key={fn.id} fightNight={fn} />
              ))}
            </div>
          </section>
        )}

        {/* Global leaderboard teaser */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <SectionLabel className="mb-0">Global Leaderboard</SectionLabel>
            <Link
              href="/leaderboard"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>

          {leaders.length === 0 ? (
            <div className="border border-dashed border-white/15 rounded-xl px-6 py-10 text-center">
              <p className="text-white/40 text-sm font-medium">
                The all-time board fills up as fans play. Be the first.
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right w-28">Skill Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((p, i) => (
                    <tr
                      key={p.uid}
                      className={`border-t border-white/5 ${i === 0 ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="px-4 py-3 text-white/50 text-sm font-bold tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-semibold truncate">
                        {p.displayName?.trim() || "Fan"}
                      </td>
                      <td className="px-4 py-3 text-right text-white text-sm font-bold tabular-nums">
                        {(p.skillPoints || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-5 ${className}`}>
      {children}
    </p>
  )
}
