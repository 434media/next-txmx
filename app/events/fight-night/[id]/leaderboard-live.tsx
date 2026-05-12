"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit as limitFn,
} from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import type { FightNightStanding } from "../../../actions/fightnight-standings"

interface LeaderboardLiveProps {
  fightNightId: string
  atEventOnly?: boolean
}

const TOP_N = 3
const NEIGHBORS = 2

export default function LeaderboardLive({
  fightNightId,
  atEventOnly = false,
}: LeaderboardLiveProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<FightNightStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!fightNightId) return
    const ref = collection(db, "fightNights", fightNightId, "standings")
    const q = query(ref, orderBy("points", "desc"), limitFn(500))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => d.data() as FightNightStanding)
        setEntries(atEventOnly ? data.filter((e) => e.atEvent) : data)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [fightNightId, atEventOnly])

  if (loading) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-6 py-10 text-center">
        <p className="text-white/40 text-sm font-medium">Loading leaderboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-500/20 rounded-xl bg-red-500/5 px-6 py-6">
        <p className="text-red-400 text-sm font-medium">
          Leaderboard unavailable: {error}
        </p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-6 py-10 text-center">
        <p className="text-white/70 text-sm font-semibold leading-6 mb-1">
          No picks yet.
        </p>
        <p className="text-white/45 text-xs leading-5">
          Be the first — pick a bout to land on the board.
        </p>
      </div>
    )
  }

  const myIndex = user ? entries.findIndex((e) => e.userId === user.uid) : -1
  const meHasRank = myIndex >= 0 && (entries[myIndex].points || 0) > 0
  const meInTop = myIndex >= 0 && myIndex < TOP_N

  // Compose the rows to render in collapsed mode.
  type Row =
    | { kind: "entry"; entry: FightNightStanding; position: number }
    | { kind: "divider" }

  let rows: Row[]
  if (expanded) {
    rows = entries.map((e, i) => ({ kind: "entry" as const, entry: e, position: i + 1 }))
  } else if (meHasRank && meInTop) {
    // User is already on the podium — show top 5 for context below them.
    rows = entries
      .slice(0, 5)
      .map((e, i) => ({ kind: "entry" as const, entry: e, position: i + 1 }))
  } else if (meHasRank) {
    // Show top 3 + a divider + the user's neighborhood.
    const top = entries
      .slice(0, TOP_N)
      .map((e, i) => ({ kind: "entry" as const, entry: e, position: i + 1 }))
    const start = Math.max(TOP_N, myIndex - NEIGHBORS)
    const end = Math.min(entries.length, myIndex + NEIGHBORS + 1)
    const hood = entries
      .slice(start, end)
      .map((e, i) => ({ kind: "entry" as const, entry: e, position: start + i + 1 }))
    rows = [...top, { kind: "divider" as const }, ...hood]
  } else {
    // User isn't on the board yet — just top 3.
    rows = entries
      .slice(0, TOP_N)
      .map((e, i) => ({ kind: "entry" as const, entry: e, position: i + 1 }))
  }

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
      <div className="divide-y divide-white/5">
        {rows.map((row, i) => {
          if (row.kind === "divider") {
            return (
              <div
                key={`div-${i}`}
                className="px-4 sm:px-5 py-2 flex items-center gap-2 bg-white/2"
              >
                <span className="text-white/30 text-[9px] font-bold tracking-[0.3em] uppercase">
                  Your neighborhood
                </span>
                <span className="h-px flex-1 bg-white/8" />
              </div>
            )
          }
          const { entry, position } = row
          return (
            <Row
              key={entry.userId}
              entry={entry}
              position={position}
              isMe={user?.uid === entry.userId}
            />
          )
        })}
      </div>

      {entries.length > rows.filter((r) => r.kind === "entry").length && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-4 sm:px-5 py-2.5 border-t border-white/8 bg-white/2 hover:bg-white/4 transition-colors text-white/55 hover:text-white text-[11px] font-bold tracking-[0.2em] uppercase"
        >
          {expanded
            ? "Collapse"
            : `Show full board — ${entries.length} player${entries.length === 1 ? "" : "s"}`}
        </button>
      )}

      <div className="px-4 sm:px-5 py-2 border-t border-white/8 bg-white/2 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-emerald-400/70 text-[10px] font-bold tracking-widest uppercase">
          Live · Updates as bouts settle
        </p>
      </div>
    </div>
  )
}

function Row({
  entry,
  position,
  isMe,
}: {
  entry: FightNightStanding
  position: number
  isMe: boolean
}) {
  const rankColor =
    position === 1
      ? "text-amber-400"
      : position === 2
        ? "text-white/70"
        : position === 3
          ? "text-amber-600"
          : "text-white/35"

  return (
    <div
      className={`flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors ${
        isMe
          ? "bg-amber-500/8 border-l-2 border-amber-500"
          : "hover:bg-white/3"
      }`}
    >
      <span
        className={`shrink-0 w-7 text-sm font-bold tabular-nums ${rankColor}`}
      >
        {position}
      </span>

      <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
        {entry.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.photoURL}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-white/40 text-[11px] font-bold">
            {(entry.displayName || "?")[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-semibold leading-tight truncate">
          {entry.displayName || "Anonymous"}
          {isMe && <span className="text-amber-400 ml-1.5">· you</span>}
        </p>
        {entry.atEvent && (
          <p className="text-emerald-400/70 text-[9px] font-bold tracking-wider uppercase leading-tight mt-0.5">
            At Event
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-white text-sm font-bold tabular-nums leading-none">
          {(entry.points || 0).toLocaleString()}
          <span className="text-white/35 text-xs font-medium ml-1">pts</span>
        </p>
        <p className="text-white/40 text-[10px] font-medium tabular-nums leading-tight mt-1">
          {entry.picksWon || 0}/{entry.picksMade || 0} picks
        </p>
      </div>
    </div>
  )
}
