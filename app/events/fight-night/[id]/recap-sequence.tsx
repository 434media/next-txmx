"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import {
  type FightNightPoll,
  votePoll,
  getUserVotesForFightNight,
} from "../../../actions/fightnight-polls"
import type { FightNightStanding } from "../../../actions/fightnight-standings"

interface RecapSequenceProps {
  fightNightId: string
  /** Pre-filtered to the Recap group (poll IDs starting with `night-`) */
  polls: FightNightPoll[]
}

/**
 * Onboarding-style step-through for the Recap poll group. Renders one question
 * at a time with progress dots, smooth transitions, and a personalized closing
 * card that doubles as the end-of-page summary.
 *
 * On mount: jumps to the first unvoted poll so users pick up where they left off.
 */
export default function RecapSequence({ fightNightId, polls }: RecapSequenceProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [optimisticPolls, setOptimisticPolls] = useState<FightNightPoll[]>(polls)
  const [standing, setStanding] = useState<FightNightStanding | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load user's existing votes — jump to first unvoted poll on mount
  useEffect(() => {
    if (!user) {
      setLoaded(true)
      return
    }
    let cancelled = false
    getUserVotesForFightNight(fightNightId, user.uid)
      .then((votes) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        for (const v of votes) map[v.pollId] = v.optionIndex
        setUserVotes(map)
        const firstUnvoted = polls.findIndex((p) => !(p.id in map))
        setStep(firstUnvoted === -1 ? polls.length : firstUnvoted)
        setLoaded(true)
      })
      .catch(() => !cancelled && setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [user, fightNightId, polls])

  // Live-bind the user's standing for the closing card
  useEffect(() => {
    if (!user) return
    const ref = doc(db, "fightNights", fightNightId, "standings", user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      setStanding(snap.exists() ? (snap.data() as FightNightStanding) : null)
    })
    return () => unsub()
  }, [user, fightNightId])

  // Sync local poll copy when the upstream changes (admin closes a poll, new vote counts arrive)
  useEffect(() => {
    setOptimisticPolls(polls)
  }, [polls])

  async function handleVote(pollId: string, optionIndex: number) {
    if (!user) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await votePoll(fightNightId, user.uid, pollId, optionIndex)
      if (!res.success) {
        setError(res.error || "Couldn't register your vote")
        return
      }
      // Optimistic: bump local vote counts so results render without a re-fetch
      setOptimisticPolls((prev) =>
        prev.map((p) =>
          p.id === pollId
            ? {
                ...p,
                totalVotes: (p.totalVotes || 0) + 1,
                options: p.options.map((opt, i) =>
                  i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
                ),
              }
            : p
        )
      )
      setUserVotes((prev) => ({ ...prev, [pollId]: optionIndex }))
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    setStep((s) => Math.min(s + 1, polls.length))
  }

  function jumpTo(targetStep: number) {
    if (targetStep < 0 || targetStep > polls.length) return
    setStep(targetStep)
  }

  if (!loaded) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-6 py-10 text-center">
        <p className="text-white/45 text-sm font-medium">Loading the recap…</p>
      </div>
    )
  }

  // Edge case: signed out (shouldn't reach this since the page gates auth, but
  // we'll show a soft prompt anyway).
  if (!user) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-6 py-10 text-center">
        <p className="text-white/55 text-sm font-medium">
          Sign in to wrap up the night.
        </p>
      </div>
    )
  }

  const isClosing = step >= polls.length
  const currentPoll = isClosing ? null : optimisticPolls[step]
  const hasVoted = currentPoll ? currentPoll.id in userVotes : false
  const isClosed = currentPoll?.status === "closed"
  const showResults = hasVoted || isClosed

  return (
    <div className="relative border border-white/8 rounded-xl bg-white/2 overflow-hidden">
      {/* Top progress meta — sticky inside the card */}
      <div className="px-6 sm:px-8 pt-5 pb-3 flex items-center justify-between">
        <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase">
          {isClosing
            ? "Recap · Complete"
            : `Recap · ${step + 1} of ${polls.length}`}
        </p>
      </div>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isClosing ? "__closing" : currentPoll!.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="px-6 sm:px-8 pb-6 min-h-[280px]"
        >
          {isClosing ? (
            <ClosingCard standing={standing} />
          ) : (
            <PollStep
              poll={currentPoll!}
              showResults={showResults}
              userVote={userVotes[currentPoll!.id]}
              submitting={submitting}
              error={error}
              onVote={(idx) => handleVote(currentPoll!.id, idx)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stepper footer */}
      <div className="px-6 sm:px-8 py-4 border-t border-white/8 flex items-center justify-between gap-3">
        {/* Progress dots — clickable to jump */}
        <div className="flex items-center gap-1.5">
          {polls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Go to question ${i + 1}`}
              aria-current={i === step}
              className={`rounded-full transition-all ${
                i === step
                  ? "w-6 h-1.5 bg-amber-400"
                  : i < step
                    ? "w-1.5 h-1.5 bg-white/45 hover:bg-white/65"
                    : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
          {/* One extra dot for the closing card */}
          <button
            type="button"
            onClick={() => jumpTo(polls.length)}
            aria-label="Go to summary"
            aria-current={isClosing}
            className={`rounded-full transition-all ${
              isClosing
                ? "w-6 h-1.5 bg-amber-400"
                : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
            }`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isClosing && !showResults && (
            <button
              type="button"
              onClick={next}
              className="text-white/45 text-xs font-medium hover:text-white/70 transition-colors"
            >
              Skip
            </button>
          )}
          {!isClosing && showResults && (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors group"
            >
              {step === polls.length - 1 ? "Finish" : "Next"}
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          )}
          {isClosing && step > 0 && (
            <button
              type="button"
              onClick={() => jumpTo(0)}
              className="text-white/45 text-xs font-medium hover:text-white/70 transition-colors"
            >
              Back to start
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Poll step ────────────────────────────────────────────────

function PollStep({
  poll,
  showResults,
  userVote,
  submitting,
  error,
  onVote,
}: {
  poll: FightNightPoll
  showResults: boolean
  userVote: number | undefined
  submitting: boolean
  error: string | null
  onVote: (optionIndex: number) => void
}) {
  const totalVotes = poll.totalVotes || 0

  return (
    <div>
      <h3 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-snug mb-2">
        {poll.question}
      </h3>
      <div className="flex items-center gap-2 mb-6">
        {poll.boutNumber && (
          <span className="text-white/55 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            Bout {poll.boutNumber}
          </span>
        )}
        <span className="text-white/50 text-[10px] font-bold tracking-wider uppercase">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>

      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const pct = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0
          const isMyPick = userVote === i

          if (showResults) {
            return (
              <div
                key={i}
                className={`relative border rounded-lg px-4 py-3 overflow-hidden ${
                  isMyPick
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-white/5 bg-white/2"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 ${
                    isMyPick ? "bg-amber-500/15" : "bg-white/5"
                  } transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isMyPick && (
                      <svg
                        className="w-3.5 h-3.5 text-amber-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    <p
                      className={`text-sm font-semibold leading-snug truncate ${
                        isMyPick ? "text-white" : "text-white/70"
                      }`}
                    >
                      {opt.label}
                    </p>
                  </div>
                  <p
                    className={`text-xs font-bold tabular-nums shrink-0 ${
                      isMyPick ? "text-amber-400" : "text-white/55"
                    }`}
                  >
                    {pct.toFixed(0)}%
                    <span className="text-white/40 ml-1.5">·</span>
                    <span className="text-white/40 ml-1.5">{opt.votes}</span>
                  </p>
                </div>
              </div>
            )
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onVote(i)}
              disabled={submitting}
              className="w-full text-left border border-white/10 rounded-lg px-4 py-3 hover:border-white/25 hover:bg-white/4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="text-white text-sm font-semibold leading-snug">
                {opt.label}
              </p>
            </button>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-red-400 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

// ── Closing card ────────────────────────────────────────────

function ClosingCard({ standing }: { standing: FightNightStanding | null }) {
  return (
    <div className="text-center py-4 sm:py-6">
      <h3 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
        That's a wrap.
      </h3>
      <p className="text-white/65 text-sm sm:text-base font-medium leading-7 max-w-md mx-auto mb-8">
        Thanks for playing tonight. We're building this with local Texas gyms —
        see you at the next one.
      </p>

      {standing && (standing.picksMade > 0 || standing.points > 0) ? (
        <div className="grid grid-cols-2 gap-px bg-white/10 rounded-lg overflow-hidden max-w-sm mx-auto mb-8 border border-white/10">
          <div className="bg-black p-5 text-center">
            <p className="text-amber-400 text-3xl font-black tabular-nums leading-none">
              {standing.points.toLocaleString()}
            </p>
            <p className="text-white/50 text-[9px] font-bold tracking-[0.25em] uppercase mt-2.5">
              Points
            </p>
          </div>
          <div className="bg-black p-5 text-center">
            <p className="text-white text-3xl font-black tabular-nums leading-none">
              {standing.picksWon}
              <span className="text-white/35">/{standing.picksMade}</span>
            </p>
            <p className="text-white/50 text-[9px] font-bold tracking-[0.25em] uppercase mt-2.5">
              Picks Won
            </p>
          </div>
        </div>
      ) : (
        <p className="text-white/40 text-xs font-medium leading-6 max-w-sm mx-auto mb-8">
          Stick around — your points and picks will show up here once the bouts settle.
        </p>
      )}

      <p className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
        Levantamos los puños
      </p>

      <a
        href="https://www.instagram.com/txmxboxing/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-white text-xs font-bold tracking-[0.2em] uppercase hover:text-amber-400 transition-colors group"
      >
        Follow for the next one
        <svg
          className="w-3.5 h-3.5 text-white/60 group-hover:text-amber-400 group-hover:-translate-y-px group-hover:translate-x-px transition-all"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17l9.2-9.2M17 17V8m0 0H8"
          />
        </svg>
      </a>
    </div>
  )
}
