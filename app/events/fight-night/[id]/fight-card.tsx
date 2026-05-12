"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc as docFn,
} from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import { placeFightNightPick } from "../../../actions/fightnight-picks"
import type { FightNightBout } from "../../../actions/fightnight"
import type { FightNightPick } from "../../../actions/fightnight-picks"
import Carousel from "./carousel"

interface FightCardProps {
  fightNightId: string
  initialBouts: FightNightBout[]
}

/**
 * Look up the currently-rendered bout wrapper for a given bout number.
 * Both the mobile carousel and the desktop grid render wrappers tagged
 * with `data-bout-anchor` — only one is visible at a time, so we pick
 * the one with non-zero layout. Falls back to the first match if neither
 * appears visible (e.g. during initial hydration).
 */
function findVisibleBoutElement(num: string): HTMLElement | null {
  if (typeof document === "undefined") return null
  const els = document.querySelectorAll<HTMLElement>(
    `[data-bout-anchor="${num}"]`
  )
  for (const el of els) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 || rect.height > 0) return el
  }
  return els[0] || null
}

export default function FightCard({ fightNightId, initialBouts }: FightCardProps) {
  const { user } = useAuth()
  const [bouts, setBouts] = useState<FightNightBout[]>(initialBouts)
  const [picks, setPicks] = useState<Record<number, FightNightPick>>({})

  // Real-time bout statuses
  useEffect(() => {
    const q = query(
      collection(db, "fightNights", fightNightId, "bouts"),
      orderBy("boutNumber", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => d.data() as FightNightBout)
      if (data.length > 0) setBouts(data)
    })
    return () => unsub()
  }, [fightNightId])

  // Real-time user picks (one doc per bout, doc id = userId_boutNumber)
  useEffect(() => {
    if (!user) return
    // Listen on the entire picks subcollection filtered to this user via doc id pattern
    // Simpler: just subscribe to each bout's pick doc individually
    const unsubs: (() => void)[] = []
    for (const bout of bouts) {
      const ref = docFn(
        db,
        "fightNights",
        fightNightId,
        "picks",
        `${user.uid}_${bout.boutNumber}`
      )
      const u = onSnapshot(ref, (snap) => {
        setPicks((prev) => {
          const next = { ...prev }
          if (snap.exists()) {
            next[bout.boutNumber] = snap.data() as FightNightPick
          } else {
            delete next[bout.boutNumber]
          }
          return next
        })
      })
      unsubs.push(u)
    }
    return () => unsubs.forEach((u) => u())
  }, [user, fightNightId, bouts])

  // Honor #bout-N hash anchors used by the LiveRibbon Jump CTA. Both the
  // mobile carousel and the desktop grid render bout wrappers, but only
  // one is visible at a time — query by data-attribute and pick the
  // visible one before scrolling.
  useEffect(() => {
    if (typeof window === "undefined" || bouts.length === 0) return
    function scrollToHash() {
      const hash = window.location.hash
      if (!hash.startsWith("#bout-")) return
      const num = hash.slice("#bout-".length)
      const el = findVisibleBoutElement(num)
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    }
    // initial mount — wait a tick for layout to settle
    const t = window.setTimeout(scrollToHash, 120)
    window.addEventListener("hashchange", scrollToHash)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("hashchange", scrollToHash)
    }
  }, [bouts.length])

  // Auto-scroll to the live bout. Two behaviors:
  //  - First time we observe a live bout in this session: center it on the
  //    page so a fresh visitor lands on the action.
  //  - Subsequent live-bout transitions (e.g., bout 3 → bout 4): only ensure
  //    horizontal centering inside the carousel, never yank the page
  //    vertically (the user might be reading polls/standings).
  //
  // Skips entirely when the URL hash explicitly points at a different bout
  // (the user just clicked Jump for that one — respect that intent).
  const lastAutoScrolledRef = useRef<number | null>(null)
  const hasAutoScrolledRef = useRef(false)
  const liveBoutNumber =
    bouts.find((b) => b.status === "live")?.boutNumber ?? null

  useEffect(() => {
    if (typeof window === "undefined") return
    if (liveBoutNumber == null) return
    if (lastAutoScrolledRef.current === liveBoutNumber) return

    const hash = window.location.hash
    if (hash.startsWith("#bout-") && hash !== `#bout-${liveBoutNumber}`) return

    const el = findVisibleBoutElement(String(liveBoutNumber))
    if (!el) return

    const block: ScrollLogicalPosition = hasAutoScrolledRef.current
      ? "nearest"
      : "center"

    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block, inline: "center" })
    }, 150)
    lastAutoScrolledRef.current = liveBoutNumber
    hasAutoScrolledRef.current = true
    return () => window.clearTimeout(t)
  }, [liveBoutNumber])

  if (bouts.length === 0) {
    return (
      <div className="text-center py-16 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium">
          Fight card TBA. Bouts will appear here when announced.
        </p>
      </div>
    )
  }

  return (
    <>
      <BoutProgressStrip bouts={bouts} picks={picks} />

      {/* Mobile + tablet: horizontal carousel (swipe through bouts). */}
      <div className="lg:hidden">
        <Carousel
          ariaLabel="Fight card"
          swipeHint={`Swipe → for all ${bouts.length} bouts`}
          scrollStep={400}
        >
          {bouts.map((bout) => (
            <div
              key={bout.boutNumber}
              data-bout-anchor={bout.boutNumber}
              className="snap-start shrink-0 w-[88vw] sm:w-[380px] scroll-mt-32"
            >
              <BoutCard
                fightNightId={fightNightId}
                bout={bout}
                pick={picks[bout.boutNumber]}
                userId={user?.uid || null}
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* Desktop (lg+): all bouts visible as a responsive grid. Each card is
          at least 320px wide; the grid auto-fills based on the available
          column width, so 1 col at lg / 2 at xl / more at very wide. */}
      <div
        className="hidden lg:grid lg:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] lg:gap-4"
        role="list"
        aria-label="Fight card"
      >
        {bouts.map((bout) => (
          <div
            key={bout.boutNumber}
            data-bout-anchor={bout.boutNumber}
            role="listitem"
            className="scroll-mt-32"
          >
            <BoutCard
              fightNightId={fightNightId}
              bout={bout}
              pick={picks[bout.boutNumber]}
              userId={user?.uid || null}
            />
          </div>
        ))}
      </div>
    </>
  )
}

function BoutCard({
  fightNightId,
  bout,
  pick,
  userId,
}: {
  fightNightId: string
  bout: FightNightBout
  pick: FightNightPick | undefined
  userId: string | null
}) {
  const [submitting, setSubmitting] = useState<"fighter1" | "fighter2" | null>(null)
  const [error, setError] = useState("")

  const isLocked = bout.status === "live" || bout.status === "completed"
  const isCompleted = bout.status === "completed"
  const userPicked = pick?.pickedCorner || null

  async function handlePick(corner: "fighter1" | "fighter2") {
    if (!userId) {
      setError("Sign in to make picks")
      return
    }
    if (userPicked) return
    if (isLocked) return
    setSubmitting(corner)
    setError("")
    try {
      const res = await placeFightNightPick(fightNightId, userId, bout.boutNumber, corner)
      if (!res.success) setError(res.error || "Failed to place pick")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place pick")
    } finally {
      setSubmitting(null)
    }
  }

  const winnerName =
    bout.winnerCorner === "fighter1"
      ? bout.fighter1Name
      : bout.winnerCorner === "fighter2"
        ? bout.fighter2Name
        : bout.winnerCorner === "draw"
          ? "Draw"
          : null

  // Visual treatment based on user pick + result
  const f1Selected = userPicked === "fighter1"
  const f2Selected = userPicked === "fighter2"
  const f1Won = isCompleted && bout.winnerCorner === "fighter1"
  const f2Won = isCompleted && bout.winnerCorner === "fighter2"
  const userWon = isCompleted && userPicked && userPicked === bout.winnerCorner

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        isCompleted && userWon
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isCompleted && pick && !userWon
            ? "border-white/8 bg-white/2 opacity-70"
            : bout.status === "live"
              ? "border-red-500/30 bg-red-500/5"
              : "border-white/8 bg-white/2"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white/30 text-[10px] font-bold tabular-nums">
            #{bout.boutNumber}
          </span>
          {bout.isMainEvent && (
            <span className="text-amber-400 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Main Event
            </span>
          )}
          {bout.weightClass && (
            <span className="text-white/35 text-[10px] font-medium">
              {bout.weightClass}
            </span>
          )}
        </div>
        {bout.status === "live" && (
          <span className="flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red-500" />
            </span>
            <span className="text-red-400 text-[10px] font-bold tracking-wider uppercase">
              Live · Locked
            </span>
          </span>
        )}
        {isCompleted && winnerName && (
          <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
            Winner: {winnerName}
          </span>
        )}
      </div>

      {/* Fighter buttons */}
      <div className="grid grid-cols-2 divide-x divide-white/5">
        <button
          onClick={() => handlePick("fighter1")}
          disabled={!!userPicked || isLocked || !!submitting}
          className={`text-left px-4 py-4 transition-all relative ${
            f1Selected && f1Won
              ? "bg-emerald-500/10"
              : f1Selected
                ? "bg-amber-500/10"
                : f1Won
                  ? "bg-emerald-500/5"
                  : !userPicked && !isLocked
                    ? "hover:bg-white/4 cursor-pointer"
                    : "opacity-60"
          } ${submitting === "fighter1" ? "opacity-50" : ""}`}
        >
          {f1Selected && (
            <span className="absolute top-2 right-2 text-amber-400 text-[9px] font-bold tracking-wider uppercase">
              · Your Pick
            </span>
          )}
          <p className="text-white/35 text-[10px] font-bold tracking-wider uppercase mb-1">
            Red Corner
          </p>
          <p className={`text-base font-bold leading-tight ${f1Won ? "text-emerald-400" : "text-white"} truncate`}>
            {bout.fighter1Name || "TBA"}
          </p>
          {bout.fighter1Gym && (
            <p className="text-white/40 text-xs font-medium leading-5 truncate mt-0.5">
              {bout.fighter1Gym}
            </p>
          )}
        </button>
        <button
          onClick={() => handlePick("fighter2")}
          disabled={!!userPicked || isLocked || !!submitting}
          className={`text-left px-4 py-4 transition-all relative ${
            f2Selected && f2Won
              ? "bg-emerald-500/10"
              : f2Selected
                ? "bg-amber-500/10"
                : f2Won
                  ? "bg-emerald-500/5"
                  : !userPicked && !isLocked
                    ? "hover:bg-white/4 cursor-pointer"
                    : "opacity-60"
          } ${submitting === "fighter2" ? "opacity-50" : ""}`}
        >
          {f2Selected && (
            <span className="absolute top-2 right-2 text-amber-400 text-[9px] font-bold tracking-wider uppercase">
              · Your Pick
            </span>
          )}
          <p className="text-white/35 text-[10px] font-bold tracking-wider uppercase mb-1">
            Blue Corner
          </p>
          <p className={`text-base font-bold leading-tight ${f2Won ? "text-emerald-400" : "text-white"} truncate`}>
            {bout.fighter2Name || "TBA"}
          </p>
          {bout.fighter2Gym && (
            <p className="text-white/40 text-xs font-medium leading-5 truncate mt-0.5">
              {bout.fighter2Gym}
            </p>
          )}
        </button>
      </div>

      {/* Footer status */}
      {error && (
        <div className="px-4 py-2 border-t border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-xs font-medium">{error}</p>
        </div>
      )}
      {!error && userPicked && !isCompleted && !isLocked && (
        <div className="px-4 py-2 border-t border-white/5">
          <p className="text-white/45 text-[11px] font-medium">
            Pick locked in. Waiting for the bell.
          </p>
        </div>
      )}
      {!error && userPicked && isCompleted && (
        <div className="px-4 py-2 border-t border-white/5">
          {userWon ? (
            <p className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
              ✓ Pick won · +{pick?.pointsAwarded || 0} pts
            </p>
          ) : (
            <p className="text-white/35 text-[11px] font-medium">
              Pick lost.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// At-a-glance progress through the night. One dot per bout, color-coded by
// status + the signed-in user's pick outcome. Clicking a dot scrolls the
// carousel to that bout (and the page if needed).
function BoutProgressStrip({
  bouts,
  picks,
}: {
  bouts: FightNightBout[]
  picks: Record<number, FightNightPick>
}) {
  const liveBout = bouts.find((b) => b.status === "live") || null
  const settledBouts = bouts.filter((b) => b.status === "completed")
  const allSettled = settledBouts.length === bouts.length && bouts.length > 0
  const lastSettled =
    [...bouts].reverse().find((b) => b.status === "completed") || null
  const nextUp =
    !liveBout && lastSettled
      ? bouts.find(
          (b) =>
            b.boutNumber > lastSettled.boutNumber && b.status === "scheduled"
        )
      : null

  let statusLabel: string
  let statusTone: "live" | "neutral" | "muted"
  if (liveBout) {
    statusLabel = `Bout ${liveBout.boutNumber} of ${bouts.length} · Live now`
    statusTone = "live"
  } else if (allSettled) {
    statusLabel = "Night complete"
    statusTone = "muted"
  } else if (lastSettled && nextUp) {
    statusLabel = `Bout ${lastSettled.boutNumber} settled · Bout ${nextUp.boutNumber} up next`
    statusTone = "neutral"
  } else if (lastSettled) {
    statusLabel = `Bout ${lastSettled.boutNumber} settled`
    statusTone = "neutral"
  } else {
    statusLabel = `${bouts.length} bouts tonight`
    statusTone = "muted"
  }

  function handleJump(boutNumber: number) {
    if (typeof window === "undefined") return
    const el = findVisibleBoutElement(String(boutNumber))
    el?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }

  return (
    <div className="mb-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div
        className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 py-1"
        role="group"
        aria-label="Bout progress"
      >
        {bouts.map((bout) => {
          const isCompleted = bout.status === "completed"
          const isLive = bout.status === "live"
          const myPick = picks[bout.boutNumber]
          const wonIt = isCompleted && myPick?.won === true
          const lostIt = isCompleted && myPick && myPick.won !== true

          const stateClass = isLive
            ? "bg-red-500 text-white border border-red-400 ring-2 ring-red-500/40 animate-pulse"
            : wonIt
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
              : lostIt
                ? "bg-white/8 text-white/45 border border-white/15"
                : isCompleted
                  ? "bg-white/10 text-white/55 border border-white/15"
                  : "bg-transparent text-white/40 border border-white/15 hover:border-white/30 hover:text-white/70"

          const stateText = isLive
            ? "live now"
            : wonIt
              ? "settled · your pick won"
              : lostIt
                ? "settled · your pick lost"
                : isCompleted
                  ? "settled"
                  : "upcoming"

          return (
            <button
              key={bout.boutNumber}
              type="button"
              onClick={() => handleJump(bout.boutNumber)}
              className={`shrink-0 w-7 h-7 sm:w-7 sm:h-7 rounded-full text-[10px] font-bold tabular-nums flex items-center justify-center transition-all hover:scale-110 ${stateClass}`}
              aria-label={`Jump to bout ${bout.boutNumber} — ${bout.fighter1Name || "TBA"} vs ${bout.fighter2Name || "TBA"} (${stateText})`}
              title={`Bout ${bout.boutNumber}: ${bout.fighter1Name || "TBA"} vs ${bout.fighter2Name || "TBA"}`}
            >
              {bout.boutNumber}
            </button>
          )
        })}
      </div>
      <p
        className={`text-xs font-semibold shrink-0 tabular-nums ${
          statusTone === "live"
            ? "text-red-400"
            : statusTone === "neutral"
              ? "text-white/70"
              : "text-white/45"
        }`}
      >
        {statusLabel}
      </p>
    </div>
  )
}
