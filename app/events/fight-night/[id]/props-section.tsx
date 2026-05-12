"use client"

import { useEffect, useState, useCallback } from "react"
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

export default function PropsSection({ fightNightId }: PropsSectionProps) {
  const { user } = useAuth()
  const [props, setProps] = useState<FightNightProp[]>([])
  const [userPicks, setUserPicks] = useState<Record<string, FightNightPropPick>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProps(fightNightId)
      // Hide voided props from the public view
      setProps(data.filter((p) => p.status !== "voided"))
      if (user) {
        const picks = await getUserPropPicks(fightNightId, user.uid)
        const map: Record<string, FightNightPropPick> = {}
        for (const p of picks) map[p.propId] = p
        setUserPicks(map)
      }
    } finally {
      setLoading(false)
    }
  }, [fightNightId, user])

  useEffect(() => {
    load()
  }, [load])

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
        await load()
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
        <p className="text-white/30 text-sm">Loading props…</p>
      </div>
    )
  }

  if (props.length === 0) {
    return (
      <div className="text-center py-12 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium">No props yet for this event.</p>
      </div>
    )
  }

  return (
    <Carousel ariaLabel="Props" swipeHint={`Swipe → for more props · ${props.length} total`}>
      {props.map((prop) => {
          const myPick = userPicks[prop.id]
          const myError = errorById[prop.id]
          const isLocked = prop.status === "locked" || prop.status === "settled"
          const isSettled = prop.status === "settled"
          const userWon =
            isSettled && myPick && myPick.optionId === prop.correctOptionId

          return (
            <div
              key={prop.id}
              className={`snap-start shrink-0 w-[85vw] sm:w-[340px] border rounded-xl p-5 ${
                isSettled && userWon
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isSettled
                    ? "border-white/8 bg-white/2 opacity-70"
                    : isLocked
                      ? "border-amber-500/20 bg-amber-500/3"
                      : "border-white/8 bg-white/2"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-white text-[15px] font-bold leading-snug">
                  {prop.title}
                </h3>
                {prop.description && (
                  <p className="text-white/45 text-xs font-medium leading-5 mt-1">
                    {prop.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {prop.isUnderdog && (
                  <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Underdog
                  </span>
                )}
                {prop.boutNumber && (
                  <span className="text-white/40 text-[10px] font-bold tracking-wider uppercase">
                    Bout {prop.boutNumber}
                  </span>
                )}
                {isLocked && !isSettled && (
                  <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase">
                    Locked
                  </span>
                )}
                {isSettled && (
                  <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                    Settled
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-blue-400 text-xs font-semibold tabular-nums">
                {prop.pointsReward} pts
              </span>
              {prop.isUnderdog && (
                <span className="text-amber-400/60 text-xs font-medium">1.25× multiplier</span>
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
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : isCorrect
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                            : isMyPick
                              ? "border-white/15 bg-white/5 text-white/60"
                              : "border-white/5 bg-white/2 text-white/40"
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

                if (myPick) {
                  // User has already picked — show their choice highlighted, others muted
                  return (
                    <div
                      key={opt.id}
                      className={`px-4 py-3 rounded-lg border text-sm font-semibold ${
                        isMyPick
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                          : "border-white/5 bg-white/2 text-white/35"
                      }`}
                    >
                      {opt.label}
                      {isMyPick && (
                        <span className="ml-2 text-[9px] font-bold tracking-wider uppercase text-amber-400">
                          · Your Pick
                        </span>
                      )}
                    </div>
                  )
                }

                if (isLocked) {
                  return (
                    <div
                      key={opt.id}
                      className="px-4 py-3 rounded-lg border border-white/5 bg-white/2 text-sm font-semibold text-white/30"
                    >
                      {opt.label}
                    </div>
                  )
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handlePick(prop.id, opt.id)}
                    disabled={submitting === prop.id}
                    className="px-4 py-3 rounded-lg border border-white/10 bg-white/2 text-sm font-semibold text-white/80 hover:border-white/25 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {myError && (
              <p className="mt-3 text-red-400 text-xs font-medium">{myError}</p>
            )}

              {isSettled && myPick && (
                <p
                  className={`mt-3 text-[11px] font-bold tracking-wider uppercase ${
                    userWon ? "text-emerald-400" : "text-white/45"
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
