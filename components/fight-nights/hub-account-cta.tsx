"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "../../lib/auth-context"
import {
  getUserSeasonStanding,
  type SeasonStanding,
} from "../../app/actions/season-standings"
import { Section, Eyebrow } from "./section"
import SignUpForm from "./sign-up-form"

// Real TXMX fight-night photography for the full-bleed band.
const JOIN_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fbam-crowd.jpg?alt=media"

interface FeaturedRef {
  slug: string
  title: string
  status: string
}

interface HubAccountCtaProps {
  /** The featured event, if any — used to deep-link a signed-in fan straight
   *  into the playable night. Null when nothing is announced. */
  featured: FeaturedRef | null
}

/**
 * Persistent account on-ramp for the Fight Nights hub, rendered as a contained
 * two-column card (content left / photo right). Works with NO live event
 * (account creation is event-independent — see SignUpForm). A live "join this
 * event" flow still lives on the per-event slug page; this is purely "get an
 * account so your picks and points follow you everywhere."
 */
export default function HubAccountCta({ featured }: HubAccountCtaProps) {
  const { user, loading } = useAuth()

  return (
    <Section id="join">
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 md:min-h-[460px]">
        {/* Content — left */}
        <div className="order-2 md:order-1 p-8 sm:p-10 flex flex-col justify-center">
          {loading ? (
            <div className="h-[260px] rounded-xl border border-neutral-200 bg-neutral-100 animate-pulse" />
          ) : user ? (
            <SignedIn featured={featured} userId={user.uid} name={user.displayName} />
          ) : (
            <SignedOut />
          )}
        </div>

        {/* Photo — right. object-cover fills the panel; the panel always has
            height from grid stretch / min-h so it can't collapse. */}
        <div className="relative order-1 md:order-2 min-h-80 md:min-h-0 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={JOIN_IMAGE}
            alt="Fans playing the TXMX fan game at a live fight night"
            className="absolute inset-0"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </Section>
  )
}

// ── Signed-in: welcome + season snapshot + play CTA ──────────────────────────

function SignedIn({
  featured,
  userId,
  name,
}: {
  featured: FeaturedRef | null
  userId: string
  name: string | null
}) {
  const [standing, setStanding] = useState<SeasonStanding | null>(null)

  useEffect(() => {
    let active = true
    getUserSeasonStanding(userId)
      .then((s) => {
        if (active) setStanding(s)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [userId])

  const playable = featured && featured.status !== "completed"
  const firstName = name?.trim().split(" ")[0] || "Champ"

  return (
    <>
      <Eyebrow tone="emerald" mb="mb-3">
        You&apos;re In
      </Eyebrow>
      <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95]">
        Welcome back, <span className="text-amber-600">{firstName}</span>.
      </h2>
      <p className="text-neutral-600 text-sm sm:text-base font-medium leading-7 mt-3 mb-8">
        {standing
          ? `${(standing.points || 0).toLocaleString()} pts · ${standing.eventsPlayed || 0} ${
              (standing.eventsPlayed || 0) === 1 ? "night" : "nights"
            } played all-time.`
          : "Your picks and points follow you to every fight night."}
      </p>

      {playable ? (
        <Link
          href={`/fight-nights/${featured!.slug}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors self-start"
        >
          Play {featured!.status === "live" ? "Live" : "Now"} →
        </Link>
      ) : (
        <Link
          href="/leaderboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-neutral-100 transition-colors self-start"
        >
          View Leaderboard →
        </Link>
      )}
    </>
  )
}

// ── Signed-out: create-account on-ramp ───────────────────────────────────────

function SignedOut() {
  return (
    <>
      <Eyebrow tone="amber" mb="mb-3">
        Join the Game
      </Eyebrow>
      <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
        Create your free account.
      </h2>
      <p className="text-neutral-600 text-sm font-semibold leading-7 mb-7">
        Pick winners, call props, and climb the all-time leaderboard. One account
        plays every TXMX fight night — free to play.
      </p>
      <SignUpForm />
    </>
  )
}
