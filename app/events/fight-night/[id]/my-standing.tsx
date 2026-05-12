"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import type { FightNightStanding } from "../../../actions/fightnight-standings"

interface MyStandingProps {
  fightNightId: string
}

export default function MyStanding({ fightNightId }: MyStandingProps) {
  const { user } = useAuth()
  const [entry, setEntry] = useState<FightNightStanding | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !fightNightId) {
      setLoading(false)
      return
    }
    const ref = doc(db, "fightNights", fightNightId, "standings", user.uid)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setEntry(snap.exists() ? (snap.data() as FightNightStanding) : null)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return () => unsubscribe()
  }, [user, fightNightId])

  if (!user) return null
  if (loading) return null

  if (!entry || (entry.picksMade === 0 && entry.points === 0)) {
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
            {entry.points.toLocaleString()}
            <span className="text-white/40 text-sm font-medium ml-1.5">pts</span>
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
