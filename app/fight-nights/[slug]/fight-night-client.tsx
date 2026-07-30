"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Swords, Trophy, Zap } from "lucide-react"
import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../../../lib/firebase-client"
import { useAuth } from "../../../lib/auth-context"
import { FAN_ACCOUNTS_ENABLED } from "../../../lib/feature-flags"
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
  /** Resolved flyer URL (with fallback) for the compact event header. */
  flyerUrl?: string
}

export default function FightNightClient({ fightNight, bouts, flyerUrl }: FightNightClientProps) {
  const { user } = useAuth()
  const [hasLiveBout, setHasLiveBout] = useState(false)
  const [hasPicks, setHasPicks] = useState(false)
  // Mobile section switcher (fixed bottom tab bar). On xl+ all sections show
  // side-by-side and the bar is hidden, so this only drives the mobile view.
  const [tab, setTab] = useState<"fights" | "board" | "extras">("fights")
  const gameRef = useRef<HTMLElement | null>(null)
  // Count of OPEN props the signed-in user hasn't picked yet — drives the badge
  // on the Props tab so the highest-value action (props = 5× a pick) is surfaced.
  const [openPropCount, setOpenPropCount] = useState(0)

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

  // Live count of OPEN props the user hasn't picked yet (Props-tab badge).
  useEffect(() => {
    if (!user || !fightNight || !fightNight.propsEnabled) {
      setOpenPropCount(0)
      return
    }
    const fid = fightNight.id
    let openIds = new Set<string>()
    let pickedIds = new Set<string>()
    const recompute = () => {
      let n = 0
      openIds.forEach((id) => {
        if (!pickedIds.has(id)) n++
      })
      setOpenPropCount(n)
    }
    const unsubProps = onSnapshot(
      collection(db, "fightNights", fid, "props"),
      (snap) => {
        openIds = new Set(
          snap.docs
            .filter((d) => (d.data() as { status?: string }).status === "open")
            .map((d) => d.id)
        )
        recompute()
      }
    )
    const unsubPicks = onSnapshot(
      query(
        collection(db, "fightNights", fid, "propPicks"),
        where("userId", "==", user.uid)
      ),
      (snap) => {
        pickedIds = new Set(
          snap.docs.map((d) => (d.data() as { propId: string }).propId)
        )
        recompute()
      }
    )
    return () => {
      unsubProps()
      unsubPicks()
    }
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

  // Fan accounts are off (lib/feature-flags.ts) — nobody can play, so the night
  // renders as a spectator view: the full card and the live board, updating in
  // real time, with no pick targets and no sign-up. Props/polls are omitted
  // because submitting either requires an account.
  if (!FAN_ACCOUNTS_ENABLED) {
    return (
      <section id="game" className="scroll-mt-24">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-2 h-2 bg-neutral-300" />
          <p className="text-neutral-500 text-[10px] font-bold tracking-[0.25em] uppercase">
            Following Live
          </p>
        </div>
        <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
          Watch the card move.
        </h2>
        <p className="text-neutral-600 text-sm font-semibold leading-7 mb-8 max-w-md">
          Fan picks are closed for now. The card, the results, and the
          leaderboard all update live — nothing to sign up for.
        </p>

        <div className="xl:grid xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-10 xl:items-start">
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
            <FightCard fightNightId={fightNight.id} initialBouts={bouts} readOnly />
          </div>

          <div className="xl:sticky xl:self-start xl:top-[120px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-neutral-900 text-lg font-bold uppercase tracking-tight">
                Leaderboard
              </h3>
            </div>
            {fightNight.prizeLabel && (
              <PrizeChip
                label={fightNight.prizeLabel}
                details={fightNight.prizeDetails}
              />
            )}
            <LeaderboardLive fightNightId={fightNight.id} />
          </div>
        </div>
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
  const hasExtras = !!(fightNight.propsEnabled || fightNight.pollsEnabled)
  const extrasLabel = fightNight.propsEnabled ? "Props" : "Polls"
  const switchTab = (t: "fights" | "board" | "extras") => {
    setTab(t)
    // Jump to the top of the game so the newly-shown section starts in view.
    gameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  return (
    <section id="game" ref={gameRef} className="scroll-mt-24 pb-24 xl:pb-0">
      {/* Compact event header — persistent identity (small poster + title)
          for signed-in users, since the marketing hero and flyer aside are now
          hidden once you're in the game. */}
      <div className="flex items-center gap-4 mb-8">
        {flyerUrl && (
          <div className="relative w-12 h-16 sm:w-14 sm:h-18 shrink-0 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Inline styles beat the global `img { height: auto }` rule so the
                poster actually fills the thumbnail (same pattern as HeroFeatured). */}
            <img
              src={flyerUrl}
              alt=""
              aria-hidden
              className="absolute inset-0"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-emerald-600 text-[10px] font-bold tracking-[0.25em] uppercase">
              {hasPicks ? "Tonight" : "You're In"}
            </p>
          </div>
          <h2 className="text-neutral-900 text-xl sm:text-2xl font-black uppercase tracking-tight leading-[1.05] truncate">
            {fightNight.title || "Fight Night"}
          </h2>
          <p className="text-neutral-500 text-xs font-medium mt-0.5 truncate">
            {[fightNight.venue, `${bouts.length} bout${bouts.length !== 1 ? "s" : ""}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

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
      {/* Two-column game grid at xl+. Below xl, the fixed bottom tab bar swaps
          which section is visible (one at a time) so the live game is navigable
          without endless scroll. `hidden xl:block` = mobile-toggled / always-on
          at xl. */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] xl:gap-10 xl:items-start">
        {/* Fights */}
        <div className={`mb-12 xl:mb-0 ${tab === "fights" ? "" : "hidden xl:block"}`}>
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

        {/* Right rail: Leaderboard (board tab) + Beyond-the-Bouts (extras tab).
            Sticks at xl+ so standings stay visible while scrolling fights. */}
        <div
          className={`xl:space-y-12 xl:sticky xl:self-start ${
            hasLiveBout ? "xl:top-[180px]" : "xl:top-[120px]"
          }`}
        >
          <div className={tab === "board" ? "" : "hidden xl:block"}>
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

          {hasExtras && (
            <div className={tab === "extras" ? "" : "hidden xl:block"}>
              <BeyondTheBouts
                fightNightId={fightNight.id}
                propsEnabled={!!fightNight.propsEnabled}
                pollsEnabled={!!fightNight.pollsEnabled}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile section nav — fixed bottom tab bar (app-style). Hidden on xl,
          where every section shows side-by-side. */}
      <nav className="xl:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
        <div className={`grid ${hasExtras ? "grid-cols-3" : "grid-cols-2"}`}>
          <GameTab label="Fights" active={tab === "fights"} onClick={() => switchTab("fights")}>
            <Swords className="w-5 h-5" strokeWidth={2} />
          </GameTab>
          <GameTab label="Board" active={tab === "board"} onClick={() => switchTab("board")}>
            <Trophy className="w-5 h-5" strokeWidth={2} />
          </GameTab>
          {hasExtras && (
            <GameTab
              label={extrasLabel}
              active={tab === "extras"}
              onClick={() => switchTab("extras")}
              count={openPropCount}
            >
              <Zap className="w-5 h-5" strokeWidth={2} />
            </GameTab>
          )}
        </div>
      </nav>
    </section>
  )
}

// One tab in the mobile bottom nav. Amber top bar marks the active section
// (amber kept strictly as an accent, not a fill).
function GameTab({
  label,
  active,
  onClick,
  count,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${
        active ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
      }`}
    >
      {active && (
        <span className="absolute top-0 inset-x-5 h-0.5 bg-amber-500 rounded-full" />
      )}
      <span className="relative">
        {children}
        {!!count && count > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center tabular-nums leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{label}</span>
    </button>
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
