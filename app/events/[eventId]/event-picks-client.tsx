"use client"

import { useState, useEffect, useCallback } from "react"
import type { EventBout } from "../../actions/events"
import {
  placeMatchPick,
  getUserMatchPicksForEvent,
  type MatchPick,
  type MatchPickInput,
} from "../../actions/match-picks"
import { useAuth } from "../../../lib/auth-context"
import AuthModal from "../../../components/auth-modal"

interface EventPicksClientProps {
  eventId: string
  eventNumber: string
  bouts: EventBout[]
  upcoming: boolean
}

export default function EventPicksClient({
  eventId,
  eventNumber,
  bouts,
  upcoming,
}: EventPicksClientProps) {
  const { user } = useAuth()
  const [picks, setPicks] = useState<MatchPick[]>([])
  const [loading, setLoading] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const fetchPicks = useCallback(async () => {
    if (!user) {
      setPicks([])
      return
    }
    setLoading(true)
    try {
      const data = await getUserMatchPicksForEvent(user.uid, eventId)
      setPicks(data)
    } catch {
      // Silently fail — picks just won't show
    } finally {
      setLoading(false)
    }
  }, [user, eventId])

  useEffect(() => {
    fetchPicks()
  }, [fetchPicks])

  // Build lookup: boutNumber → existing pick
  const pickMap = new Map<number, MatchPick>()
  for (const p of picks) {
    pickMap.set(p.boutNumber, p)
  }

  return (
    <>
      <div className="space-y-3">
        {bouts.map((bout, i) => (
          <BoutPickCard
            key={`${bout.boutNumber}-${i}`}
            bout={bout}
            eventId={eventId}
            eventNumber={eventNumber}
            upcoming={upcoming}
            userId={user?.uid || null}
            existingPick={pickMap.get(bout.boutNumber) || null}
            onPickPlaced={fetchPicks}
            onAuthRequired={() => setIsAuthOpen(true)}
            loading={loading}
          />
        ))}
      </div>

      {/* Summary bar */}
      {user && picks.length > 0 && (
        <div className="mt-8 border border-white/10 rounded-xl bg-white/3 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Picks
                </p>
                <p className="text-white text-lg font-bold tabular-nums">
                  {picks.length}
                  <span className="text-white/30 text-sm font-medium">
                    /{bouts.length}
                  </span>
                </p>
              </div>
              {picks.some((p) => p.settled) && (
                <>
                  <div>
                    <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                      Wins
                    </p>
                    <p className="text-emerald-400 text-lg font-bold tabular-nums">
                      {picks.filter((p) => p.won === true).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                      SP Earned
                    </p>
                    <p className="text-amber-400 text-lg font-bold tabular-nums">
                      {picks.reduce((sum, p) => sum + (p.spAwarded || 0), 0)}
                    </p>
                  </div>
                </>
              )}
            </div>
            {picks.length < bouts.length && upcoming && (
              <p className="text-white/30 text-xs font-semibold">
                {bouts.length - picks.length} bout
                {bouts.length - picks.length !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}

// ── Individual Bout Card ──────────────────────────────────

function BoutPickCard({
  bout,
  eventId,
  eventNumber,
  upcoming,
  userId,
  existingPick,
  onPickPlaced,
  onAuthRequired,
  loading,
}: {
  bout: EventBout
  eventId: string
  eventNumber: string
  upcoming: boolean
  userId: string | null
  existingPick: MatchPick | null
  onPickPlaced: () => void
  onAuthRequired: () => void
  loading: boolean
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isPast = !upcoming
  const isWinner1 = bout.winnerResolution === "fighter1"
  const isWinner2 = bout.winnerResolution === "fighter2"
  const isDraw = bout.winnerResolution === "draw"

  const hasPick = !!existingPick
  const pickedFighter1 = existingPick?.pickedFighterId === bout.fighter1Id
  const pickedFighter2 = existingPick?.pickedFighterId === bout.fighter2Id

  async function handlePick(fighterId: string, fighterName: string) {
    if (!userId) {
      onAuthRequired()
      return
    }
    if (hasPick || submitting) return

    setSubmitting(true)
    setError("")

    const input: MatchPickInput = {
      eventId,
      eventNumber,
      boutNumber: bout.boutNumber,
      fighter1Id: bout.fighter1Id,
      fighter1Name: bout.fighter1,
      fighter2Id: bout.fighter2Id,
      fighter2Name: bout.fighter2,
      pickedFighterId: fighterId,
      pickedFighterName: fighterName,
    }

    try {
      const result = await placeMatchPick(userId, input)
      if (result.success) {
        onPickPlaced()
      } else {
        setError(result.error || "Failed to place pick")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  // Determine pick result state
  let pickResultClass = ""
  let pickResultLabel = ""
  if (existingPick?.settled) {
    if (existingPick.won) {
      pickResultClass = "border-emerald-500/25 bg-emerald-500/5"
      pickResultLabel = `+${existingPick.spAwarded} SP`
    } else {
      pickResultClass = "border-red-500/15 bg-red-500/3"
      pickResultLabel = "Incorrect"
    }
  }

  const methodLabel =
    bout.method || (isPast && isDraw ? "DRAW" : "")

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        pickResultClass ||
        (hasPick
          ? "border-white/15 bg-white/3"
          : "border-white/8 bg-white/2 hover:bg-white/3")
      }`}
    >
      <div className="px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Bout number */}
          <div className="w-8 shrink-0">
            <span className="text-white/20 text-xs font-bold tabular-nums">
              {bout.boutNumber}
            </span>
          </div>

          {/* Fighters — clickable for picks on upcoming events */}
          <div className="flex-1 min-w-0">
            {upcoming && !hasPick ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePick(bout.fighter1Id, bout.fighter1)}
                  disabled={submitting || loading || !bout.fighter1Id}
                  className="text-sm font-bold leading-snug text-white/80 hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {bout.fighter1 || "TBA"}
                </button>
                <span className="text-white/20 text-xs font-medium">vs</span>
                <button
                  onClick={() => handlePick(bout.fighter2Id, bout.fighter2)}
                  disabled={submitting || loading || !bout.fighter2Id}
                  className="text-sm font-bold leading-snug text-white/80 hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {bout.fighter2 || "TBA"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-bold leading-snug ${
                    pickedFighter1 && existingPick?.settled
                      ? existingPick.won
                        ? "text-emerald-400"
                        : "text-red-400/70"
                      : pickedFighter1
                        ? "text-amber-400"
                        : isPast && isWinner1
                          ? "text-white"
                          : isPast && !isDraw
                            ? "text-white/40"
                            : "text-white/80"
                  }`}
                >
                  {bout.fighter1 || "TBA"}
                  {pickedFighter1 && (
                    <span className="ml-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                      ← Your pick
                    </span>
                  )}
                </span>
                <span className="text-white/20 text-xs font-medium">vs</span>
                <span
                  className={`text-sm font-bold leading-snug ${
                    pickedFighter2 && existingPick?.settled
                      ? existingPick.won
                        ? "text-emerald-400"
                        : "text-red-400/70"
                      : pickedFighter2
                        ? "text-amber-400"
                        : isPast && isWinner2
                          ? "text-white"
                          : isPast && !isDraw
                            ? "text-white/40"
                            : "text-white/80"
                  }`}
                >
                  {bout.fighter2 || "TBA"}
                  {pickedFighter2 && (
                    <span className="ml-1.5 text-[10px] font-bold tracking-wider uppercase opacity-60">
                      ← Your pick
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Weight class + rounds */}
            <div className="flex items-center gap-3 mt-1">
              {bout.weightClass && (
                <span className="text-white/35 text-xs font-medium leading-5">
                  {bout.weightClass}
                </span>
              )}
              {bout.scheduledRounds > 0 && (
                <span className="text-white/25 text-xs font-medium leading-5 tabular-nums">
                  {bout.scheduledRounds} rds
                </span>
              )}
              {bout.titleFight && (
                <span className="text-amber-400/70 text-[10px] font-bold tracking-wider uppercase">
                  Title
                </span>
              )}
            </div>
          </div>

          {/* Right side: result or pick prompt */}
          <div className="flex items-center gap-3 shrink-0">
            {pickResultLabel && (
              <span
                className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                  existingPick?.won
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400/60 bg-red-500/8 border-red-500/15"
                }`}
              >
                {pickResultLabel}
              </span>
            )}
            {isPast && methodLabel && !hasPick && (
              <span
                className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                  bout.method === "KO" || bout.method === "TKO"
                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                    : isDraw
                      ? "text-white/50 bg-white/5 border-white/10"
                      : "text-white/60 bg-white/5 border-white/10"
                }`}
              >
                {methodLabel}
              </span>
            )}
            {upcoming && !hasPick && (
              <span className="text-white/20 text-[10px] font-bold tracking-[0.15em] uppercase hidden sm:block">
                Tap a fighter
              </span>
            )}
            {hasPick && !existingPick?.settled && upcoming && (
              <span className="text-amber-500/50 text-[10px] font-bold tracking-[0.15em] uppercase">
                Locked in
              </span>
            )}
          </div>
        </div>

        {/* Scores for decisions */}
        {isPast && bout.scores && bout.scores.length > 0 && (
          <div className="mt-2 pl-8 flex flex-wrap gap-x-4 gap-y-0.5">
            {bout.scores.map((score, i) => (
              <span
                key={i}
                className="text-white/25 text-[11px] font-medium leading-5 tabular-nums"
              >
                {score}
              </span>
            ))}
          </div>
        )}

        {/* Referee */}
        {isPast && bout.referee && (
          <p className="mt-1 pl-8 text-white/20 text-[11px] font-medium leading-5">
            Ref: {bout.referee}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-2 pl-8 text-red-400 text-xs font-medium">{error}</p>
        )}
      </div>
    </div>
  )
}
