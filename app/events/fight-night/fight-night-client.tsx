"use client"

import { useEffect, useState } from "react"
import { collection, doc, onSnapshot, query } from "firebase/firestore"
import { db } from "../../../lib/firebase-client"
import { useAuth } from "../../../lib/auth-context"
import WalkInForm from "./walk-in-form"
import StatusStrip from "./[id]/status-strip"
import FightCard from "./[id]/fight-card"
import LeaderboardLive from "./[id]/leaderboard-live"
import BeyondTheBouts from "./[id]/beyond-the-bouts"
import type { FightNight, FightNightBout } from "../../actions/fightnight"
import type { FightNightStanding } from "../../actions/fightnight-standings"

interface FightNightClientProps {
  fightNight: FightNight | null
  bouts: FightNightBout[]
}

export default function FightNightClient({ fightNight, bouts }: FightNightClientProps) {
  const { user, signInWithGoogle } = useAuth()
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
      <section className="border border-white/10 rounded-xl bg-white/2 px-6 py-12 text-center">
        <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">
          Setting Up
        </p>
        <h3 className="text-white text-xl font-bold tracking-tight mb-2">
          Card not live yet
        </h3>
        <p className="text-white/55 text-sm font-medium leading-6 max-w-md mx-auto">
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
          <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
            Get Started
          </p>
        </div>
        <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
          Two ways in.
        </h2>
        <p className="text-white/65 text-sm font-semibold leading-7 mb-8 max-w-lg">
          One tap with Google, or quick sign up with your name and email. Either way, you're playing in 15 seconds.
        </p>

        {/* Mobile-first venue priority: walk-in shows ABOVE sign-in on phone.
            Desktop restores the natural left-right order (sign-in then walk-in). */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-xl overflow-hidden">
          {/* Sign in with Google */}
          <div className="bg-black p-6 sm:p-7 order-2 md:order-1">
            <p className="text-white/50 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
              Have a Google Account?
            </p>
            <h3 className="text-white text-lg font-bold leading-tight mb-2">
              Sign in with one tap
            </h3>
            <p className="text-white/60 text-sm font-medium leading-6 mb-5">
              Fastest way in. Your picks and points stick with you for every TXMX event after this one.
            </p>
            <button
              onClick={() => signInWithGoogle().catch(() => {})}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors rounded-md"
            >
              <GoogleIcon className="w-4 h-4" />
              Sign in with Google
            </button>
          </div>

          {/* Walk-in form — mobile-first priority for venue users */}
          <div className="bg-black p-6 sm:p-7 order-1 md:order-2 relative">
            {/* Mobile-only attention strip — emphasizes this is the venue path */}
            <span
              aria-hidden
              className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-amber-500"
            />
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
              New Here? Start Here
            </p>
            <h3 className="text-white text-lg font-bold leading-tight mb-2">
              Quick sign up
            </h3>
            <p className="text-white/60 text-sm font-medium leading-6 mb-5">
              Just your name and email — and you're playing.
            </p>
            <WalkInForm fightNightId={fightNight.id} />
          </div>
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
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase">
              Tonight
            </p>
          </div>
          <span className="text-white/20">·</span>
          <p className="text-white text-base sm:text-lg font-bold tracking-tight leading-tight truncate">
            {fightNight.title || "Fight Night"}
          </p>
        </div>
      ) : (
        /* First-visit full hero — orients new users with the "what is this"
           framing + how-to-play sentence. */
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-2 bg-emerald-500" />
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase">
              You&apos;re In
            </p>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
            Welcome,{" "}
            <span className="text-amber-400">
              {user.displayName?.split(" ")[0] || "Champ"}
            </span>
            .
          </h2>
          <p className="text-white/65 text-sm font-medium leading-7 max-w-lg mb-10">
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
            <h3 className="text-white text-lg font-bold uppercase tracking-tight">
              Fight Card
            </h3>
            {hasLiveBout ? (
              <span className="text-red-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                · Live Now
              </span>
            ) : (
              <span className="text-white/30 text-xs font-medium tabular-nums">
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
              <h3 className="text-white text-lg font-bold uppercase tracking-tight">
                Leaderboard
              </h3>
              <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
                Top 3 · Your neighborhood
              </span>
            </div>
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
