"use client"

import { useEffect, useState } from "react"
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import type { FightNightStanding } from "../../../actions/fightnight-standings"

interface StatusStripProps {
  fightNightId: string
  hasLiveBout: boolean
}

/**
 * Sticky one-line HUD that keeps the user's points + rank in view as they
 * scroll. Replaces the in-flow MyStanding card — the goal is that the
 * user's identity in tonight's game is never out of sight, so they don't
 * have to scroll back to remember where they stand.
 *
 * Sticks under the navbar (top-16). When a bout is live, the LiveRibbon
 * (fixed top-16, ~44px tall) sits between them and the strip slides down
 * to top-[108px] so the two don't overlap.
 */
export default function StatusStrip({ fightNightId, hasLiveBout }: StatusStripProps) {
  const { user } = useAuth()
  const [entry, setEntry] = useState<FightNightStanding | null>(null)
  const [rank, setRank] = useState<{ position: number; total: number } | null>(null)

  // The user's own standing — single doc subscription, cheap.
  useEffect(() => {
    if (!user) return
    const ref = doc(db, "fightNights", fightNightId, "standings", user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => setEntry(snap.exists() ? (snap.data() as FightNightStanding) : null),
      () => setEntry(null)
    )
    return () => unsub()
  }, [user, fightNightId])

  // Rank position — only subscribe once the user has points, otherwise
  // they're not ranked yet.
  useEffect(() => {
    if (!user || !entry || (entry.points || 0) === 0) {
      setRank(null)
      return
    }
    const q = query(
      collection(db, "fightNights", fightNightId, "standings"),
      orderBy("points", "desc"),
      limit(500)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => d.data() as FightNightStanding)
      const i = docs.findIndex((d) => d.userId === user.uid)
      setRank(i === -1 ? null : { position: i + 1, total: docs.length })
    })
    return () => unsub()
  }, [user, fightNightId, entry])

  if (!user) return null

  const hasPicks = !!entry && (entry.picksMade || 0) > 0

  return (
    <div
      className={`sticky z-20 mb-10 ${
        hasLiveBout ? "top-[108px]" : "top-16"
      }`}
    >
      <div className="py-3 px-4 sm:px-5 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl shadow-lg">
        {hasPicks ? (
          <div className="flex items-center gap-5 sm:gap-8 overflow-x-auto">
            <Stat value={(entry!.points || 0).toLocaleString()} label="pts" />
            <Stat
              value={rank ? `#${rank.position}` : "#—"}
              label={rank ? `of ${rank.total}` : "ranked soon"}
            />
            <Stat
              value={`${entry!.picksWon || 0}/${entry!.picksMade}`}
              label="picks"
            />
          </div>
        ) : (
          <p className="text-neutral-700 text-sm font-semibold flex items-center gap-2 leading-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            You&apos;re in — make your first pick below to land on the board.
          </p>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5 shrink-0">
      <span className="text-neutral-900 text-lg sm:text-xl font-black tabular-nums leading-none">
        {value}
      </span>
      <span className="text-neutral-500 text-[10px] font-bold tracking-[0.15em] uppercase leading-none">
        {label}
      </span>
    </div>
  )
}
