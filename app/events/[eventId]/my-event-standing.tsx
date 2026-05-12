"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../../lib/firebase-client"
import { useAuth } from "../../../lib/auth-context"
import type { EventLeaderboardEntry } from "../../actions/event-leaderboard"

interface MyEventStandingProps {
  eventId: string
}

export default function MyEventStanding({ eventId }: MyEventStandingProps) {
  const { user } = useAuth()
  const [entry, setEntry] = useState<EventLeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !eventId) {
      setLoading(false)
      return
    }

    const ref = doc(db, "eventLeaderboards", eventId, "entries", user.uid)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setEntry(snap.exists() ? (snap.data() as EventLeaderboardEntry) : null)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsubscribe()
  }, [user, eventId])

  if (!user) return null
  if (loading) return null
  if (!entry || (entry.picksMade === 0 && entry.spEarned === 0)) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-5 py-4">
        <p className="text-white/40 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
          Your Standing
        </p>
        <p className="text-white/55 text-sm font-medium leading-6">
          Make your first pick to land on the board.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-amber-500/30 rounded-xl bg-gradient-to-br from-amber-500/8 to-transparent px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
            Your Standing
          </p>
          <p className="text-white text-xl font-black tabular-nums leading-none">
            {entry.spEarned.toLocaleString()}
            <span className="text-white/40 text-sm font-medium ml-1.5">SP</span>
          </p>
        </div>

        <div className="text-center">
          <p className="text-white/40 text-[9px] font-bold tracking-wider uppercase mb-0.5">
            Picks
          </p>
          <p className="text-white text-base font-bold tabular-nums">
            {entry.picksWon}
            <span className="text-white/30">/</span>
            {entry.picksMade}
          </p>
        </div>

        <div className="text-right">
          <p className="text-white/40 text-[9px] font-bold tracking-wider uppercase mb-0.5">
            Status
          </p>
          {entry.atEvent ? (
            <p className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
              · At Event
            </p>
          ) : (
            <p className="text-white/50 text-[11px] font-bold tracking-wider uppercase">
              Online
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
