"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit as limitFn,
} from "firebase/firestore"
import { db } from "../../../lib/firebase-client"
import { useAuth } from "../../../lib/auth-context"
import type { EventLeaderboardEntry } from "../../actions/event-leaderboard"

const RANK_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  hall_of_fame: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  champion: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  contender: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  rookie: { text: "text-white/50", bg: "bg-white/5", border: "border-white/10" },
}

interface EventLeaderboardLiveProps {
  eventId: string
  /** When true, only show entries flagged atEvent (Tier 2 check-in). Default false in Tier 1. */
  atEventOnly?: boolean
  /** Max entries to show */
  maxEntries?: number
}

export default function EventLeaderboardLive({
  eventId,
  atEventOnly = false,
  maxEntries = 50,
}: EventLeaderboardLiveProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<EventLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return

    const entriesRef = collection(db, "eventLeaderboards", eventId, "entries")
    const q = query(entriesRef, orderBy("spEarned", "desc"), limitFn(maxEntries * 2))

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => d.data() as EventLeaderboardEntry)
        const filtered = atEventOnly ? data.filter((e) => e.atEvent) : data
        setEntries(filtered.slice(0, maxEntries))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [eventId, atEventOnly, maxEntries])

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
        <p className="text-white/40 text-sm font-medium leading-6 mb-1">
          No picks yet for this event.
        </p>
        <p className="text-white/25 text-xs leading-5">
          Be the first — pick a bout to land on the board.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
      <div className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 bg-white/3 border-b border-white/8">
        <div className="col-span-1 text-white/40 text-[10px] font-bold tracking-widest uppercase">
          #
        </div>
        <div className="col-span-5 text-white/40 text-[10px] font-bold tracking-widest uppercase">
          User
        </div>
        <div className="col-span-3 text-center text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Picks
        </div>
        <div className="col-span-3 text-right text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Event SP
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map((entry, i) => {
          const position = i + 1
          const style = RANK_STYLES[entry.rank] || RANK_STYLES.rookie
          const isMe = user?.uid === entry.userId

          return (
            <div
              key={entry.userId}
              className={`grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 items-center transition-colors ${
                isMe ? "bg-amber-500/8 border-l-2 border-amber-500" : "hover:bg-white/3"
              }`}
            >
              <div className="col-span-1">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    position === 1
                      ? "text-amber-400"
                      : position === 2
                        ? "text-white/70"
                        : position === 3
                          ? "text-amber-600"
                          : "text-white/30"
                  }`}
                >
                  {position}
                </span>
              </div>

              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-full border ${style.border} ${style.bg} flex items-center justify-center shrink-0 overflow-hidden`}>
                  {entry.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className={`${style.text} text-[11px] font-bold`}>
                      {(entry.displayName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold leading-tight truncate">
                    {entry.displayName || "Anonymous"}
                    {isMe && <span className="text-amber-400 ml-1.5">· you</span>}
                  </p>
                  {entry.atEvent && (
                    <p className="text-emerald-400/80 text-[9px] font-bold tracking-wider uppercase leading-tight mt-0.5">
                      At Event
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-3 text-center">
                <p className="text-white/70 text-xs font-medium tabular-nums">
                  {entry.picksWon}
                  <span className="text-white/30">/</span>
                  {entry.picksMade}
                </p>
              </div>

              <div className="col-span-3 text-right">
                <p className="text-white text-sm font-bold tabular-nums">
                  {entry.spEarned.toLocaleString()}
                  <span className="text-white/30 text-xs font-medium ml-1">SP</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 sm:px-6 py-2.5 border-t border-white/8 bg-white/2 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-emerald-400/70 text-[10px] font-bold tracking-widest uppercase">
          Live · Updates as bouts settle
        </p>
      </div>
    </div>
  )
}
