"use client"

import { useEffect, useState, useCallback } from "react"
import { collection, onSnapshot, query } from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import {
  type FightNightProp,
  type FightNightPropPick,
  getProps,
  getUserPropPicks,
  placePropPick,
} from "../../../actions/fightnight-props"
import Carousel from "./carousel"

interface PropsSectionProps {
  fightNightId: string
}

/** Aggregate of all picks on a single prop, used to render the crowd-
 *  stake bars on each option. */
interface PropStake {
  byOption: Record<string, number>
  total: number
}

export default function PropsSection({ fightNightId }: PropsSectionProps) {
  const { user } = useAuth()
  const [props, setProps] = useState<FightNightProp[]>([])
  const [userPicks, setUserPicks] = useState<Record<string, FightNightPropPick>>({})
  const [stakeByProp, setStakeByProp] = useState<Record<string, PropStake>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<Record<string, string>>({})

  // Silent refetch — used after a pick so the card swaps in the user's
  // selection and updated state without unmounting the carousel. The
  // visible "Saving…" pill on the card itself (via `submitting`) keeps
  // the section's height stable so the page doesn't reflow the flyer
  // into view.
  const refresh = useCallback(async () => {
    const data = await getProps(fightNightId)
    setProps(data.filter((p) => p.status !== "voided"))
    if (user) {
      const picks = await getUserPropPicks(fightNightId, user.uid)
      const map: Record<string, FightNightPropPick> = {}
      for (const p of picks) map[p.propId] = p
      setUserPicks(map)
    }
  }, [fightNightId, user])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refresh()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  // Crowd-stake meter — single listener on the prop-picks collection,
  // grouped by propId + optionId on the client. One listener for the
  // whole tab is cheaper than per-prop subscriptions, and the data is
  // small (one doc per fan per prop they've picked).
  useEffect(() => {
    const q = query(collection(db, "fightNights", fightNightId, "propPicks"))
    const unsub = onSnapshot(q, (snap) => {
      const next: Record<string, PropStake> = {}
      for (const doc of snap.docs) {
        const pick = doc.data() as FightNightPropPick
        const stake = next[pick.propId] || { byOption: {}, total: 0 }
        stake.byOption[pick.optionId] = (stake.byOption[pick.optionId] || 0) + 1
        stake.total++
        next[pick.propId] = stake
      }
      setStakeByProp(next)
    })
    return () => unsub()
  }, [fightNightId])

  async function handlePick(propId: string, optionId: string) {
    if (!user) {
      setErrorById((m) => ({ ...m, [propId]: "Sign in to pick" }))
      return
    }
    setSubmitting(propId)
    setErrorById((m) => ({ ...m, [propId]: "" }))
    try {
      const res = await placePropPick(fightNightId, user.uid, propId, optionId)
      if (res.success) {
        await refresh()
      } else {
        setErrorById((m) => ({ ...m, [propId]: res.error || "Failed" }))
      }
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 text-sm">Loading props…</p>
      </div>
    )
  }

  if (props.length === 0) {
    return (
      <div className="text-center py-12 border border-neutral-200 rounded-xl bg-neutral-50">
        <p className="text-neutral-400 text-sm font-medium">No props yet for this event.</p>
      </div>
    )
  }

  return (
    <Carousel ariaLabel="Props" swipeHint={`Swipe for more props · ${props.length} total`}>
      {props.map((prop) => {
          const myPick = userPicks[prop.id]
          const myError = errorById[prop.id]
          const isLocked = prop.status === "locked" || prop.status === "settled"
          const isSettled = prop.status === "settled"
          const userWon =
            isSettled && myPick && myPick.optionId === prop.correctOptionId
          const stake = stakeByProp[prop.id]
          // Show the crowd-stake bars on open + locked props. Settled
          // props already render their own correct/incorrect bars.
          const showStakes = !isSettled && !!stake && stake.total > 0
          const isSaving = submitting === prop.id

          return (
            <div
              key={prop.id}
              className={`snap-start shrink-0 w-[85vw] sm:w-[340px] border rounded-xl p-5 ${
                isSettled && userWon
                  ? "border-emerald-200 bg-emerald-50"
                  : isSettled
                    ? "border-neutral-200 bg-neutral-50 opacity-70"
                    : isLocked
                      ? "border-amber-200 bg-amber-50"
                      : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-neutral-900 text-[15px] font-bold leading-snug">
                  {prop.title}
                </h3>
                {prop.description && (
                  <p className="text-neutral-500 text-xs font-medium leading-5 mt-1">
                    {prop.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {prop.isUnderdog && (
                  <span className="text-amber-600 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                    Underdog
                  </span>
                )}
                {prop.boutNumber && (
                  <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase">
                    Bout {prop.boutNumber}
                  </span>
                )}
                {isLocked && !isSettled && (
                  <span className="text-amber-600 text-[10px] font-bold tracking-wider uppercase">
                    Locked
                  </span>
                )}
                {isSettled && (
                  <span className="text-emerald-600 text-[10px] font-bold tracking-wider uppercase">
                    Settled
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-blue-600 text-xs font-semibold tabular-nums">
                {prop.pointsReward} pts
              </span>
              {prop.isUnderdog && (
                <span className="text-amber-600 text-xs font-medium">1.25× multiplier</span>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prop.options.map((opt) => {
                const isMyPick = myPick?.optionId === opt.id
                const isCorrect = isSettled && prop.correctOptionId === opt.id

                if (isSettled) {
                  return (
                    <div
                      key={opt.id}
                      className={`px-4 py-3 rounded-lg border text-sm font-semibold flex items-center justify-between ${
                        isCorrect && isMyPick
                          ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                          : isCorrect
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : isMyPick
                              ? "border-neutral-200 bg-neutral-100 text-neutral-600"
                              : "border-neutral-200 bg-neutral-50 text-neutral-400"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isCorrect && (
                        <span className="text-[9px] font-bold tracking-wider uppercase shrink-0">
                          Correct
                        </span>
                      )}
                      {isMyPick && !isCorrect && (
                        <span className="text-[9px] font-bold tracking-wider uppercase shrink-0">
                          Your Pick
                        </span>
                      )}
                    </div>
                  )
                }

                const optVotes = stake?.byOption[opt.id] || 0
                const optPct =
                  showStakes && stake && stake.total > 0
                    ? (optVotes / stake.total) * 100
                    : 0

                if (isLocked) {
                  // Locked but not settled — dim everything; show user's
                  // pick highlighted if they had one. Crowd stake bar
                  // persists so admins/fans see the final distribution
                  // before settlement.
                  return (
                    <div
                      key={opt.id}
                      className={`relative overflow-hidden px-4 py-3 rounded-lg border text-sm font-semibold ${
                        isMyPick
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-neutral-200 bg-neutral-50 text-neutral-400"
                      }`}
                    >
                      {showStakes && optPct > 0 && (
                        <span
                          className={`absolute inset-y-0 left-0 ${
                            isMyPick ? "bg-amber-100" : "bg-neutral-200"
                          } transition-all duration-500`}
                          style={{ width: `${optPct}%` }}
                        />
                      )}
                      <span className="relative flex items-center justify-between gap-2">
                        <span className="truncate">
                          {opt.label}
                          {isMyPick && (
                            <span className="ml-2 text-[9px] font-bold tracking-wider uppercase text-amber-600">
                              · Your Pick
                            </span>
                          )}
                        </span>
                        {showStakes && (
                          <span
                            className={`shrink-0 text-[10px] font-bold tabular-nums ${
                              isMyPick ? "text-amber-600" : "text-neutral-400"
                            }`}
                          >
                            {optPct.toFixed(0)}%
                          </span>
                        )}
                      </span>
                    </div>
                  )
                }

                // Open state — every option stays tappable so users can
                // swap their pick freely until the prop locks. Current
                // pick gets an amber highlight; the rest stay neutral.
                // Crowd-stake bar shows share of all picks for that option.
                return (
                  <button
                    key={opt.id}
                    onClick={() => handlePick(prop.id, opt.id)}
                    disabled={submitting === prop.id}
                    className={`relative overflow-hidden text-left px-4 py-3 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMyPick
                        ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    {showStakes && optPct > 0 && (
                      <span
                        className={`absolute inset-y-0 left-0 ${
                          isMyPick ? "bg-amber-200" : "bg-neutral-200"
                        } transition-all duration-500 pointer-events-none`}
                        style={{ width: `${optPct}%` }}
                      />
                    )}
                    <span className="relative flex items-center justify-between gap-2">
                      <span className="truncate">
                        {opt.label}
                        {isMyPick && (
                          <span className="ml-2 text-[9px] font-bold tracking-wider uppercase text-amber-600">
                            · Your Pick
                          </span>
                        )}
                      </span>
                      {showStakes && (
                        <span
                          className={`shrink-0 text-[10px] font-bold tabular-nums ${
                            isMyPick ? "text-amber-600" : "text-neutral-500"
                          }`}
                        >
                          {optPct.toFixed(0)}%
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {!isSettled && !isLocked && (
              <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-medium">
                <p className="text-neutral-500">
                  {isSaving ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Saving…
                    </span>
                  ) : (
                    <>
                      {myPick ? "Tap another to switch · " : "Tap to pick · "}
                      {prop.boutNumber
                        ? `locks when bout ${prop.boutNumber} starts.`
                        : "locks at the bell."}
                    </>
                  )}
                </p>
                {showStakes && stake && (
                  <p className="text-neutral-400 tabular-nums shrink-0">
                    {stake.total} pick{stake.total === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            )}
            {isLocked && !isSettled && showStakes && stake && (
              <p className="mt-3 text-neutral-400 text-[11px] font-medium tabular-nums">
                {stake.total} pick{stake.total === 1 ? "" : "s"} · locked
              </p>
            )}

            {myError && (
              <p className="mt-3 text-red-600 text-xs font-medium">{myError}</p>
            )}

              {isSettled && myPick && (
                <p
                  className={`mt-3 text-[11px] font-bold tracking-wider uppercase ${
                    userWon ? "text-emerald-600" : "text-neutral-500"
                  }`}
                >
                  {userWon
                    ? `✓ +${myPick.pointsAwarded} pts`
                    : "Pick lost."}
                </p>
              )}
            </div>
          )
        })}
    </Carousel>
  )
}
