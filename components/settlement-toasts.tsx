"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { X } from "lucide-react"
import { db } from "../lib/firebase-client"
import { useAuth } from "../lib/auth-context"
import type { FightNight, FightNightBout } from "../app/actions/fightnight"
import type { FightNightPick } from "../app/actions/fightnight-picks"

interface SettlementToastsProps {
  activeFightNight: FightNight | null
}

interface Toast {
  id: string
  boutNumber: number
  won: boolean
  isDraw: boolean
  pointsAwarded: number
  pickedFighter: string
  winnerFighter: string | null
}

const TOAST_DURATION_MS = 6000

/**
 * Fires a transient toast when one of the signed-in user's picks transitions
 * from unsettled → settled. Subscribes to the user's picks for the active
 * fight night and tracks which docs we've already announced so reload-time
 * doesn't replay a night's worth of results.
 */
export default function SettlementToasts({ activeFightNight }: SettlementToastsProps) {
  const { user } = useAuth()
  const [toasts, setToasts] = useState<Toast[]>([])
  const seenSettledRef = useRef<Set<string>>(new Set())
  const initialSyncDoneRef = useRef(false)
  const boutsRef = useRef<Record<number, FightNightBout>>({})

  // Track bouts so we can resolve fighter names on a settlement.
  useEffect(() => {
    if (!activeFightNight) {
      boutsRef.current = {}
      return
    }
    const q = query(collection(db, "fightNights", activeFightNight.id, "bouts"))
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<number, FightNightBout> = {}
      for (const d of snap.docs) {
        const b = d.data() as FightNightBout
        map[b.boutNumber] = b
      }
      boutsRef.current = map
    })
    return () => unsub()
  }, [activeFightNight])

  // Watch the user's picks and detect settlement transitions.
  useEffect(() => {
    if (!user || !activeFightNight) {
      seenSettledRef.current = new Set()
      initialSyncDoneRef.current = false
      setToasts([])
      return
    }
    const q = query(
      collection(db, "fightNights", activeFightNight.id, "picks"),
      where("userId", "==", user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const fresh: Toast[] = []
      for (const d of snap.docs) {
        const pick = d.data() as FightNightPick
        if (!pick.settled) continue
        if (seenSettledRef.current.has(d.id)) continue

        seenSettledRef.current.add(d.id)

        // First snapshot fills the seen set so we don't announce picks the
        // user has already seen settle in a prior session.
        if (!initialSyncDoneRef.current) continue

        const bout = boutsRef.current[pick.boutNumber]
        const pickedFighter =
          pick.pickedCorner === "fighter1"
            ? bout?.fighter1Name || "Red corner"
            : bout?.fighter2Name || "Blue corner"
        const isDraw = bout?.winnerCorner === "draw"
        const winnerFighter = isDraw
          ? null
          : bout?.winnerCorner === "fighter1"
            ? bout.fighter1Name || "Red corner"
            : bout?.winnerCorner === "fighter2"
              ? bout.fighter2Name || "Blue corner"
              : null

        fresh.push({
          id: d.id,
          boutNumber: pick.boutNumber,
          won: pick.won === true,
          isDraw,
          pointsAwarded: pick.pointsAwarded || 0,
          pickedFighter,
          winnerFighter,
        })
      }
      if (fresh.length > 0) {
        setToasts((prev) => [...prev, ...fresh])
      }
      initialSyncDoneRef.current = true
    })
    return () => unsub()
  }, [user, activeFightNight])

  // Auto-dismiss each toast on a per-toast timer so older toasts age out
  // even when newer ones arrive in quick succession.
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, TOAST_DURATION_MS)
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [toasts])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col-reverse gap-2 sm:max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const won = toast.won
  return (
    <div
      role="status"
      className={`pointer-events-auto rounded-xl border backdrop-blur-md shadow-2xl px-4 py-3 ${
        won
          ? "border-emerald-500/40 bg-emerald-950/90"
          : "border-white/10 bg-black/90"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-1.5 ${
              won ? "text-emerald-400" : "text-white/45"
            }`}
          >
            Bout {toast.boutNumber} · Settled
          </p>
          {won ? (
            <>
              <p className="text-white text-base font-black leading-tight">
                Your pick won
              </p>
              <p className="text-emerald-300 text-sm font-bold mt-1 tabular-nums">
                +{toast.pointsAwarded} pts
              </p>
            </>
          ) : toast.isDraw ? (
            <>
              <p className="text-white text-sm font-bold leading-tight">
                Draw — no points
              </p>
              <p className="text-white/55 text-xs font-medium mt-1">
                Your pick: {toast.pickedFighter}
              </p>
            </>
          ) : (
            <>
              <p className="text-white text-sm font-bold leading-tight">
                {toast.winnerFighter ? `${toast.winnerFighter} took it` : "Bout settled"}
              </p>
              <p className="text-white/55 text-xs font-medium mt-1">
                Your pick: {toast.pickedFighter}
              </p>
            </>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-white/40 hover:text-white/80 transition-colors -mt-1 -mr-1 p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
