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

/** Aggregated pick counts per bout for the crowd-stake meter. */
interface BoutStake {
  fighter1: number
  fighter2: number
  total: number
}

export default function FightCard({ fightNightId, initialBouts }: FightCardProps) {
  const { user } = useAuth()
  const [bouts, setBouts] = useState<FightNightBout[]>(initialBouts)
  const [picks, setPicks] = useState<Record<number, FightNightPick>>({})
  const [stakeByBout, setStakeByBout] = useState<Record<number, BoutStake>>({})

  // Real-time bout statuses
  useEffect(() => {
    const q = query(
      collection(db, "fightNights", fightNightId, "bouts"),
      orderBy("boutNumber", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => d.data() as FightNightBout)
        .sort((a, b) => (a.order ?? a.boutNumber) - (b.order ?? b.boutNumber))
      if (data.length > 0) setBouts(data)
    })
    return () => unsub()
  }, [fightNightId])

  // Crowd-stake meter — single listener on all picks, grouped per-bout
  // on the client. One listener is cheaper than 8 per-bout listeners and
  // the data is tiny (one small doc per fan per bout).
  useEffect(() => {
    const q = query(collection(db, "fightNights", fightNightId, "picks"))
    const unsub = onSnapshot(q, (snap) => {
      const counts: Record<number, BoutStake> = {}
      for (const doc of snap.docs) {
        const pick = doc.data() as FightNightPick
        const n = pick.boutNumber
        if (!counts[n]) counts[n] = { fighter1: 0, fighter2: 0, total: 0 }
        counts[n].total++
        if (pick.pickedCorner === "fighter1") counts[n].fighter1++
        else if (pick.pickedCorner === "fighter2") counts[n].fighter2++
      }
      setStakeByBout(counts)
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
      <div className="text-center py-16 border border-neutral-200 rounded-xl bg-neutral-50">
        <p className="text-neutral-400 text-sm font-medium">
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
          swipeHint={`Swipe for all ${bouts.length} bouts`}
          scrollStep={400}
        >
          {bouts.map((bout) => (
            <div
              key={bout.boutNumber}
              data-bout-anchor={bout.boutNumber}
              className="snap-start shrink-0 w-[88vw] sm:w-[380px] scroll-mt-32 min-h-[60dvh] flex"
            >
              <BoutCard
                fightNightId={fightNightId}
                bout={bout}
                pick={picks[bout.boutNumber]}
                userId={user?.uid || null}
                stake={stakeByBout[bout.boutNumber] || null}
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
              stake={stakeByBout[bout.boutNumber] || null}
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
  stake,
}: {
  fightNightId: string
  bout: FightNightBout
  pick: FightNightPick | undefined
  userId: string | null
  stake: BoutStake | null
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
    if (isLocked) return
    // Re-tapping the current pick is a no-op (skip network round-trip).
    if (userPicked === corner) return
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
      className={`w-full flex flex-col border rounded-xl overflow-hidden transition-colors ${
        isCompleted && userWon
          ? "border-emerald-200 bg-emerald-50"
          : isCompleted && pick && !userWon
            ? "border-neutral-200 bg-neutral-50 opacity-70"
            : bout.status === "live"
              ? "border-red-200 bg-red-50"
              : "border-neutral-200 bg-neutral-50"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-neutral-400 text-[10px] font-bold tabular-nums">
            #{bout.boutNumber}
          </span>
          {bout.isMainEvent && (
            <span className="text-white text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-neutral-900">
              Main Event
            </span>
          )}
          {bout.weightClass && (
            <span className="text-neutral-400 text-[10px] font-medium">
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
            <span className="text-red-600 text-[10px] font-bold tracking-wider uppercase">
              Live · Locked
            </span>
          </span>
        )}
        {isCompleted && winnerName && (
          <span className="text-emerald-600 text-[10px] font-bold tracking-wider uppercase">
            Winner: {winnerName}
          </span>
        )}
      </div>

      {/* Matchup — portraits + records, whole cell taps to pick. The portrait
          band grows to fill the taller mobile carousel card (big imagery, no
          dead space); a min-height keeps it substantial in the desktop grid. */}
      <div className="relative flex divide-x divide-neutral-200 flex-1">
        <FighterCell
          corner="red"
          name={bout.fighter1Name}
          nickname={bout.fighter1Nickname}
          photoUrl={bout.fighter1PhotoUrl}
          record={bout.fighter1Record}
          kos={bout.fighter1Kos}
          gym={bout.fighter1Gym}
          selected={f1Selected}
          won={f1Won}
          dim={isCompleted && !!bout.winnerCorner && bout.winnerCorner !== "fighter1"}
          locked={isLocked}
          submitting={submitting === "fighter1"}
          onClick={() => handlePick("fighter1")}
        />
        <FighterCell
          corner="blue"
          name={bout.fighter2Name}
          nickname={bout.fighter2Nickname}
          photoUrl={bout.fighter2PhotoUrl}
          record={bout.fighter2Record}
          kos={bout.fighter2Kos}
          gym={bout.fighter2Gym}
          selected={f2Selected}
          won={f2Won}
          dim={isCompleted && !!bout.winnerCorner && bout.winnerCorner !== "fighter2"}
          locked={isLocked}
          submitting={submitting === "fighter2"}
          onClick={() => handlePick("fighter2")}
        />
        {/* Center VS — sits on the divider, in the portrait band. */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-neutral-900 text-white border-2 border-white shadow-md flex items-center justify-center text-[11px] font-black tracking-wider pointer-events-none">
          VS
        </span>
      </div>

      {/* Footer status */}
      {/* Crowd-stake meter — surfaces real-time pick distribution as
          social proof while the bout is still open or in flight. Hidden
          on settled bouts (those show the user's own outcome below). */}
      {!isCompleted && stake && stake.total > 0 && (
        <CrowdStakeMeter stake={stake} />
      )}

      {error && (
        <div className="px-4 py-2 border-t border-red-200 bg-red-50">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}
      {!error && !isCompleted && !isLocked && (
        <div className="px-4 py-2 border-t border-neutral-200">
          <p className="text-neutral-500 text-[11px] font-medium">
            {userPicked
              ? "Tap the other corner to switch · locks at the bell."
              : "Tap a corner to pick · locks at the bell."}
          </p>
        </div>
      )}
      {!error && userPicked && isCompleted && (
        <div className="px-4 py-2 border-t border-neutral-200">
          {userWon ? (
            <p className="text-emerald-600 text-[11px] font-bold tracking-wider uppercase">
              ✓ Pick won · +{pick?.pointsAwarded || 0} pts
            </p>
          ) : (
            <p className="text-neutral-400 text-[11px] font-medium">
              Pick lost.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// One fighter in a bout — a tappable cell with a portrait, name, nickname,
// record, and gym. The portrait fills the band (object-cover, beating the
// global `img { height:auto }` rule via inline styles); no photo → a monogram.
function FighterCell({
  corner,
  name,
  nickname,
  photoUrl,
  record,
  kos,
  gym,
  selected,
  won,
  dim,
  locked,
  submitting,
  onClick,
}: {
  corner: "red" | "blue"
  name: string
  nickname?: string
  photoUrl?: string
  record?: string
  kos?: number
  gym?: string
  selected: boolean
  won: boolean
  dim: boolean
  locked: boolean
  submitting: boolean
  onClick: () => void
}) {
  const initial = (name?.trim() || "?")[0].toUpperCase()
  const cornerDot = corner === "red" ? "bg-red-500" : "bg-blue-500"
  const cornerLabel = corner === "red" ? "Red Corner" : "Blue Corner"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked || submitting}
      className={`relative flex-1 min-w-0 flex flex-col text-left transition-all ${
        selected && won
          ? "bg-emerald-100"
          : selected
            ? "bg-neutral-100 ring-2 ring-inset ring-neutral-900"
            : won
              ? "bg-emerald-50"
              : dim
                ? "opacity-60"
                : locked
                  ? ""
                  : "hover:bg-neutral-100 cursor-pointer"
      } ${submitting ? "opacity-50" : ""}`}
    >
      {selected && (
        <span className="absolute top-2 right-2 z-10 text-amber-600 text-[9px] font-bold tracking-wider uppercase">
          · Your Pick
        </span>
      )}

      {/* Portrait */}
      <div className="relative flex-1 min-h-40 bg-neutral-100 overflow-hidden">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name || ""}
            referrerPolicy="no-referrer"
            className="absolute inset-0"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-neutral-100 to-neutral-200">
            <span className="text-neutral-300 text-5xl font-black">{initial}</span>
          </div>
        )}
      </div>

      {/* Info — fixed height so a fighter with more fields (gym, nickname)
          doesn't shrink its portrait relative to the other corner; both cells
          then keep equal images and equal content sections. */}
      <div className="px-3 py-3 h-32 overflow-hidden">
        <p className="flex items-center gap-1.5 mb-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cornerDot}`} />
          <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase">
            {cornerLabel}
          </span>
        </p>
        <p
          className={`text-base font-bold leading-tight truncate ${
            won ? "text-emerald-600" : "text-neutral-900"
          }`}
        >
          {name || "TBA"}
        </p>
        {nickname && (
          <p className="text-neutral-500 text-xs font-medium italic leading-snug truncate">
            &ldquo;{nickname}&rdquo;
          </p>
        )}
        {record && (
          <p className="text-neutral-600 text-xs font-semibold tabular-nums mt-1">
            {record}
            {kos ? ` · ${kos} KO` : ""}
          </p>
        )}
        {gym && (
          <p className="text-neutral-400 text-[11px] font-medium leading-5 truncate mt-0.5">
            {gym}
          </p>
        )}
      </div>
    </button>
  )
}

function CrowdStakeMeter({ stake }: { stake: BoutStake }) {
  const f1Pct = stake.total > 0 ? Math.round((stake.fighter1 / stake.total) * 100) : 0
  const f2Pct = stake.total > 0 ? 100 - f1Pct : 0
  return (
    <div className="px-4 py-2.5 border-t border-neutral-200">
      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium tabular-nums mb-1.5">
        <span>{f1Pct}% picked red</span>
        <span className="text-neutral-400">
          {stake.total} pick{stake.total === 1 ? "" : "s"}
        </span>
        <span>{f2Pct}% picked blue</span>
      </div>
      <div className="h-1 rounded-full bg-neutral-200 overflow-hidden flex">
        <div className="bg-red-500" style={{ width: `${f1Pct}%` }} />
        <div className="bg-blue-500" style={{ width: `${f2Pct}%` }} />
      </div>
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
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : lostIt
                ? "bg-neutral-100 text-neutral-500 border border-neutral-200"
                : isCompleted
                  ? "bg-neutral-200 text-neutral-600 border border-neutral-200"
                  : "bg-transparent text-neutral-400 border border-neutral-300 hover:border-neutral-500 hover:text-neutral-700"

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
            ? "text-red-600"
            : statusTone === "neutral"
              ? "text-neutral-700"
              : "text-neutral-500"
        }`}
      >
        {statusLabel}
      </p>
    </div>
  )
}
