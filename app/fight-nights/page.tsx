import type { Metadata } from "next"
import {
  getActiveFightNight,
  getUpcomingFightNights,
  getPastFightNights,
  getLastCompletedFightNight,
} from "../actions/fightnight"
import { getSeasonStandings } from "../actions/season-standings"
import { getStandings } from "../actions/fightnight-standings"
import FightNightCard from "../../components/fight-nights/fight-night-card"
import HowItWorks from "../../components/fight-nights/how-it-works"
import IntroHero from "../../components/fight-nights/intro-hero"
import RecapSpotlight from "../../components/fight-nights/recap-spotlight"
import SeasonBoard from "../../components/fight-nights/season-board"
import HubFaq from "../../components/fight-nights/hub-faq"
import { Section, Eyebrow } from "../../components/fight-nights/section"

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
  const [featured, upcomingRaw, pastRaw, leaders, lastEvent] = await Promise.all([
    getActiveFightNight(),
    getUpcomingFightNights(),
    getPastFightNights(),
    getSeasonStandings(10),
    getLastCompletedFightNight(),
  ])

  // Winner of the most recent completed event — powers the recap spotlight.
  const lastWinner = lastEvent
    ? (await getStandings(lastEvent.id, { limit: 1 }))[0] ?? null
    : null

  // `featured` is no longer rendered as its own band — it's only used to keep
  // the active night from repeating in the calendar/archive grids below.
  const upcoming = upcomingRaw.filter((f) => f.id !== featured?.id)
  const past = pastRaw.filter((f) => f.id !== featured?.id && f.id !== lastEvent?.id)

  return (
    <main className="relative min-h-dvh bg-white font-sans pb-24">
      {/* 1 — INTRO HERO: brand intro to the fan game (text left / video right). */}
      <IntroHero />

      {/* 2 — HOW IT WORKS. */}
      <Section id="how-it-works">
        <HowItWorks variant="hub" />
      </Section>

      {/* 3 — PROOF: last event recap + winner spotlight. */}
      <RecapSpotlight event={lastEvent} winner={lastWinner} />

      {/* 4 — COMPETITION: all-time board. */}
      <SeasonBoard leaders={leaders} />

      {/* 5 — BROWSE: upcoming + past. */}
      {(upcoming.length > 0 || past.length > 0) && (
        <Section className="space-y-14">
          {upcoming.length > 0 && (
            <div>
              <Eyebrow tone="neutral">Upcoming</Eyebrow>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map((fn) => (
                  <FightNightCard key={fn.id} fightNight={fn} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <Eyebrow tone="neutral">Past Fight Nights</Eyebrow>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {past.map((fn) => (
                  <FightNightCard key={fn.id} fightNight={fn} />
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 6 — FAQ: full-bleed band that closes the page. */}
      <HubFaq />
    </main>
  )
}
