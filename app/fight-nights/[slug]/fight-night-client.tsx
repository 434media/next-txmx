"use client"

import { useEffect, useState } from "react"
import { collection, doc, onSnapshot, query } from "firebase/firestore"
import { db } from "../../../lib/firebase-client"
import { useAuth } from "../../../lib/auth-context"
import SignUpForm from "../../../components/fight-nights/sign-up-form"
import StatusStrip from "./_components/status-strip"
import FightCard from "./_components/fight-card"
import LeaderboardLive from "./_components/leaderboard-live"
import BeyondTheBouts from "./_components/beyond-the-bouts"
import type { FightNight, FightNightBout } from "../../actions/fightnight"
import type { FightNightStanding } from "../../actions/fightnight-standings"

interface FightNightClientProps {
  fightNight: FightNight | null
  bouts: FightNightBout[]
}

export default function FightNightClient({ fightNight, bouts }: FightNightClientProps) {
  const { user } = useAuth()
  const [hasLiveBout, setHasLiveBout] = useState(false)
  const [hasPicks, setHasPicks] = useState(false)

  // When any bout is live, push the Fight Card section to the top so the
  // action lands first in the scroll. The sticky StatusStrip persists
  // above all sections so the user's own state never leaves the viewport.
  useEffect(() => {
    if (!fightNight) {
      setHasLiveBout(false)
      return
    }
    const q = query(collection(db, "fightNights", fightNight.id, "bouts"))
    const unsub = onSnapshot(q, (snap) => {
      setHasLiveBout(
        snap.docs.some((d) => (d.data() as FightNightBout).status === "live")
      )
    })
    return () => unsub()
  }, [fightNight])

  // Track whether the signed-in user has any picks on this event — drives
  // the hero variant. First visit (no picks) gets the full welcome + how-
  // to-play copy; return visits (any pick made) get a compact one-line
  // event header so the page footprint shrinks every time after.
  useEffect(() => {
    if (!user || !fightNight) {
      setHasPicks(false)
      return
    }
    const ref = doc(db, "fightNights", fightNight.id, "standings", user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setHasPicks(false)
        return
      }
      const entry = snap.data() as FightNightStanding
      setHasPicks((entry.picksMade || 0) > 0)
    })
    return () => unsub()
  }, [user, fightNight])

  // Toggle a body class that lets globals.css hide the page-level
  // marketing + flyer aside and collapse the outer grid to a single
  // column on lg+, so the game grid gets the full max-w-7xl width.
  // Only active for signed-in users on an active fight night.
  useEffect(() => {
    if (typeof document === "undefined") return
    const active = !!user && !!fightNight
    if (!active) return
    document.body.classList.add("fn-game-active")
    return () => document.body.classList.remove("fn-game-active")
  }, [user, fightNight])

  // No active fight night yet — pre-event state
  if (!fightNight) {
    return (
      <section className="border border-neutral-200 rounded-xl bg-neutral-50 px-6 py-12 text-center">
        <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">
          Setting Up
        </p>
        <h3 className="text-neutral-900 text-xl font-bold tracking-tight mb-2">
          Card not live yet
        </h3>
        <p className="text-neutral-500 text-sm font-medium leading-6 max-w-md mx-auto">
          The fight card is being prepped. Come back when doors open and you'll see
          the bouts, polls, and live leaderboard here.
        </p>
      </section>
    )
  }

  // Not signed in — show two paths
  if (!user) {
    return (
      <section id="play" className="scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-2 h-2 bg-amber-500" />
          <p className="text-amber-600 text-[10px] font-bold tracking-[0.25em] uppercase">
            Get Started
          </p>
        </div>
        <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
          Create your free account.
        </h2>
        <p className="text-neutral-600 text-sm font-semibold leading-7 mb-7 max-w-md">
          Pick the winners on tonight&apos;s card and climb the leaderboard — free,
          and you&apos;re playing in 15 seconds.
        </p>
        <div className="max-w-md">
          <SignUpForm />
        </div>
      </section>
    )
  }

  // Signed in — render the game grid
  return (
    <section id="game" className="scroll-mt-24">
      {hasPicks ? (
        /* Return-visit compact hero — single line that orients the user
           in the night without re-teaching the game every reload. */
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-10">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-emerald-500" />
            <p className="text-emerald-600 text-[10px] font-bold tracking-[0.25em] uppercase">
              Tonight
            </p>
          </div>
          <span className="text-neutral-300">·</span>
          <p className="text-neutral-900 text-base sm:text-lg font-bold tracking-tight leading-tight truncate">
            {fightNight.title || "Fight Night"}
          </p>
        </div>
      ) : (
        /* First-visit full hero — orients new users with the "what is this"
           framing + how-to-play sentence. */
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-2 bg-emerald-500" />
            <p className="text-emerald-600 text-[10px] font-bold tracking-[0.25em] uppercase">
              You&apos;re In
            </p>
          </div>
          <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
            Welcome,{" "}
            <span className="text-amber-600">
              {user.displayName?.split(" ")[0] || "Champ"}
            </span>
            .
          </h2>
          <p className="text-neutral-600 text-sm font-medium leading-7 max-w-lg mb-10">
            Tonight&apos;s prize goes to the top of the board. Start by picking winners
            on each bout below — every correct call earns Skill Points.
          </p>
        </>
      )}

      {/* Sticky status HUD — replaces the old in-flow Standing card so the
          user's points, rank, and pick ratio stay one glance away no matter
          where they are on the page. */}
      <StatusStrip fightNightId={fightNight.id} hasLiveBout={hasLiveBout} />

      {/* Two-column game grid at xl+: Fight Card on the left (~60%),
          Leaderboard + Beyond-the-Bouts as a sticky right rail (~40%).
          Below xl, this collapses to a single stacked column.
          The body class set by the page-marketing effect hides the
          page-level flyer aside on lg+, freeing the full max-w-7xl
          width for this grid. */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-10 xl:items-start">
        {/* Left col: Fight Card */}
        <div className="mb-12 xl:mb-0">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-neutral-900 text-lg font-bold uppercase tracking-tight">
              Fight Card
            </h3>
            {hasLiveBout ? (
              <span className="text-red-600 text-[10px] font-bold tracking-[0.2em] uppercase">
                · Live Now
              </span>
            ) : (
              <span className="text-neutral-400 text-xs font-medium tabular-nums">
                {bouts.length} bout{bouts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <FightCard fightNightId={fightNight.id} initialBouts={bouts} />
        </div>

        {/* Right rail: Leaderboard + Beyond-the-Bouts. Sticks at xl+ so
            the user can keep scrolling through fights on the left while
            standings stay visible on the right. */}
        <div
          className={`space-y-12 xl:sticky xl:self-start ${
            hasLiveBout ? "xl:top-[180px]" : "xl:top-[120px]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-neutral-900 text-lg font-bold uppercase tracking-tight">
                Leaderboard
              </h3>
              <span className="text-neutral-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                Top 3 · Your neighborhood
              </span>
            </div>
            {fightNight.prizeLabel && (
              <PrizeChip
                label={fightNight.prizeLabel}
                details={fightNight.prizeDetails}
              />
            )}
            <LeaderboardLive fightNightId={fightNight.id} />
          </div>

          {(fightNight.propsEnabled || fightNight.pollsEnabled) && (
            <BeyondTheBouts
              fightNightId={fightNight.id}
              propsEnabled={!!fightNight.propsEnabled}
              pollsEnabled={!!fightNight.pollsEnabled}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function PrizeChip({ label, details }: { label: string; details?: string }) {
  const [open, setOpen] = useState(false)
  const hasDetails = !!details?.trim()

  return (
    <div className="mb-3 border border-amber-200 bg-amber-50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => hasDetails && setOpen((v) => !v)}
        disabled={!hasDetails}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left ${
          hasDetails ? "hover:bg-amber-100 transition-colors cursor-pointer" : "cursor-default"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 text-amber-600 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 4h14l-1.5 9a3 3 0 01-3 2.5h-5a3 3 0 01-3-2.5L5 4zM9 20h6M12 16v4M8 4V3h8v1"
          />
        </svg>
        <span className="text-amber-600 text-[9px] font-bold tracking-[0.25em] uppercase shrink-0">
          Tonight's Prize
        </span>
        <span className="text-neutral-400">·</span>
        <span className="text-neutral-800 text-xs font-semibold leading-snug truncate flex-1">
          {label}
        </span>
        {hasDetails && (
          <svg
            className={`w-3 h-3 text-neutral-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {hasDetails && open && (
        <div className="px-3 pb-3 -mt-1">
          <p className="text-neutral-600 text-xs font-medium leading-5">{details}</p>
        </div>
      )}
    </div>
  )
}
