"use client"

import { useAuth } from "../../../lib/auth-context"

interface HeroCtaProps {
  /** Whether an active fight night exists. When null, no game is wired up yet
   *  and we soften the CTA to a single "How It Works" link. */
  hasActiveEvent: boolean
}

/**
 * State-aware hero CTAs.
 *  - Signed out + active event  → Get Started (primary)  + How It Works
 *  - Signed in + active event   → Open Tonight's Card (primary)
 *  - No active event            → How It Works only
 *
 * All CTAs are anchor links — no JS state lift needed; just scrolls to the
 * relevant section below.
 */
export default function HeroCta({ hasActiveEvent }: HeroCtaProps) {
  const { user } = useAuth()

  if (!hasActiveEvent) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <a
          href="#how-it-works"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all rounded-md group"
        >
          How It Works
          <ChevronIcon />
        </a>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <a
          href="#game"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md group"
        >
          Open Tonight's Card
          <ArrowIcon />
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <a
        href="#play"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md group"
      >
        Get Started
        <ArrowIcon />
      </a>
      <a
        href="#how-it-works"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all rounded-md group"
      >
        How It Works
        <ChevronIcon />
      </a>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
