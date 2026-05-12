import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getFightNight, getBouts } from "../../../actions/fightnight"
import FightNightHero from "./fight-night-hero"
import CheckInForm from "./check-in-form"
import MyStanding from "./my-standing"
import FightCard from "./fight-card"
import LeaderboardLive from "./leaderboard-live"
import PollsSection from "./polls-section"
import PropsSection from "./props-section"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const fn = await getFightNight(id)
  if (!fn) return { title: "Fight Night Not Found | TXMX Boxing" }

  const title = `${fn.title} | TXMX Fight Night`
  const description = `${fn.title} at ${fn.venue || fn.city}. Pick winners, climb the leaderboard, win prizes. Free to play.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.txmxboxing.com/events/fight-night/${id}`,
      siteName: "TXMX Boxing",
      locale: "en_US",
      type: "website",
      ...(fn.flyerUrl ? { images: [{ url: fn.flyerUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://www.txmxboxing.com/events/fight-night/${id}`,
    },
  }
}

export default async function FightNightDetailPage({ params }: PageProps) {
  const { id } = await params
  const fightNight = await getFightNight(id)
  if (!fightNight) notFound()

  const bouts = await getBouts(id)
  const isCompleted = fightNight.status === "completed"

  return (
    <main className="relative min-h-screen bg-black font-sans">
      <FightNightHero fightNight={fightNight} boutCount={bouts.length} />

      {/* Sticky back link */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-8">
        <Link
          href="/events/fight-night"
          className="inline-flex items-center gap-2 text-white/30 text-[11px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors mb-2 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Fight Night
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
        {/* Standing + check-in row */}
        {!isCompleted && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <MyStanding fightNightId={fightNight.id} />
            <CheckInForm fightNightId={fightNight.id} />
          </div>
        )}

        {/* Fight card */}
        <div id="fight-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-lg font-bold uppercase tracking-tight">
                Fight Card
              </h2>
              <span className="text-white/30 text-xs font-medium tabular-nums">
                {bouts.length} bout{bouts.length !== 1 ? "s" : ""}
              </span>
            </div>
            {!isCompleted && (
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                Pick Winners → Earn Points
              </span>
            )}
          </div>
          <FightCard fightNightId={fightNight.id} initialBouts={bouts} />
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-lg font-bold uppercase tracking-tight">
              Leaderboard
            </h2>
            <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
              This event only
            </span>
          </div>
          <LeaderboardLive fightNightId={fightNight.id} />
        </div>

        {/* Props */}
        {fightNight.propsEnabled && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-bold uppercase tracking-tight">
                Props
              </h2>
              <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                Pick · Earn Points
              </span>
            </div>
            <PropsSection fightNightId={fightNight.id} />
          </div>
        )}

        {/* Polls */}
        {fightNight.pollsEnabled && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-lg font-bold uppercase tracking-tight">
                Polls
              </h2>
              <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                Vote · Tap to pick
              </span>
            </div>
            <PollsSection fightNightId={fightNight.id} />
          </div>
        )}

        {/* Prize call-out for completed events */}
        {isCompleted && fightNight.prizeLabel && (
          <div className="mt-12 border border-amber-500/30 rounded-xl bg-amber-500/5 p-6">
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">
              Final Standings · Prize Awarded
            </p>
            <p className="text-white text-base font-bold leading-snug">
              The top finisher won: {fightNight.prizeLabel}
            </p>
            {fightNight.prizeDetails && (
              <p className="text-white/50 text-sm font-medium leading-6 mt-2">
                {fightNight.prizeDetails}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
