"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "../../../../lib/auth-context"
import {
  type FightNightPoll,
  getPolls,
  votePoll,
  getUserVotesForFightNight,
} from "../../../actions/fightnight-polls"
import Carousel from "./carousel"

interface PollsSectionProps {
  fightNightId: string
}

export default function PollsSection({
  fightNightId,
}: PollsSectionProps) {
  const { user } = useAuth()
  const [polls, setPolls] = useState<FightNightPoll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<Record<string, string>>({})

  // Silent refetch — used after a vote so the card swaps in fresh tallies
  // without unmounting the carousel. The visible "Saving…" pill lives on
  // the card itself (via `submitting`), keeping the section's height stable
  // and stopping the page from reflowing the flyer into view.
  const refresh = useCallback(async () => {
    const data = await getPolls(fightNightId, "all")
    setPolls(data)
    if (user) {
      const votes = await getUserVotesForFightNight(fightNightId, user.uid)
      const map: Record<string, number> = {}
      for (const v of votes) map[v.pollId] = v.optionIndex
      setUserVotes(map)
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

  async function handleVote(pollId: string, optionIndex: number) {
    if (!user) {
      setErrorById((m) => ({ ...m, [pollId]: "Sign in to vote" }))
      return
    }
    setSubmitting(pollId)
    setErrorById((m) => ({ ...m, [pollId]: "" }))
    try {
      const res = await votePoll(fightNightId, user.uid, pollId, optionIndex)
      if (res.success) {
        // Optimistic update — flips the card to results immediately
        setUserVotes((m) => ({ ...m, [pollId]: optionIndex }))
        // Silent background refresh — pulls fresh tallies without
        // collapsing the section.
        await refresh()
      } else {
        setErrorById((m) => ({ ...m, [pollId]: res.error || "Failed to vote" }))
      }
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 text-sm">Loading polls…</p>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12 border border-neutral-200 rounded-xl bg-neutral-50">
        <p className="text-neutral-400 text-sm font-medium">
          No polls yet for this event.
        </p>
      </div>
    )
  }

  function renderPoll(poll: FightNightPoll) {
    const userVote = userVotes[poll.id]
    const hasVoted = userVote !== undefined
    const isClosed = poll.status === "closed"
    const showResults = hasVoted || isClosed
    const totalVotes = poll.totalVotes || 0
    const myError = errorById[poll.id]
    const isSaving = submitting === poll.id

    return (
      <div
        key={poll.id}
        className={`snap-start shrink-0 w-[85vw] sm:w-[360px] border rounded-xl p-5 ${
          isClosed
            ? "border-neutral-200 bg-neutral-50 opacity-70"
            : "border-neutral-200 bg-neutral-50"
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-neutral-900 text-[15px] font-bold leading-snug flex-1">
            {poll.question}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {poll.boutNumber && (
              <span className="text-neutral-500 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">
                Bout {poll.boutNumber}
              </span>
            )}
            {isClosed && (
              <span className="text-neutral-500 text-[10px] font-bold tracking-wider uppercase">
                Closed
              </span>
            )}
          </div>
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
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 ${
                      isMyPick ? "bg-neutral-300" : "bg-neutral-200"
                    } transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isMyPick && (
                        <svg
                          className="w-3.5 h-3.5 text-amber-600 shrink-0"
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
                          isMyPick ? "text-neutral-900" : "text-neutral-600"
                        }`}
                      >
                        {opt.label}
                      </p>
                    </div>
                    <p
                      className={`text-xs font-bold tabular-nums shrink-0 ${
                        isMyPick ? "text-amber-600" : "text-neutral-500"
                      }`}
                    >
                      {pct.toFixed(0)}%
                      <span className="text-neutral-400 ml-1.5">·</span>
                      <span className="text-neutral-400 ml-1.5">{opt.votes}</span>
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={i}
                onClick={() => handleVote(poll.id, i)}
                disabled={submitting === poll.id}
                className="w-full text-left border border-neutral-200 rounded-lg px-4 py-3 hover:border-neutral-300 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-neutral-900 text-sm font-semibold leading-snug">
                  {opt.label}
                </p>
              </button>
            )
          })}
        </div>

        {myError && (
          <p className="mt-3 text-red-600 text-xs font-medium">{myError}</p>
        )}

        <p className="mt-3 text-neutral-500 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span>
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            {hasVoted && !isClosed && !isSaving && " · you voted"}
          </span>
          {isSaving && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Saving…
              </span>
            </>
          )}
        </p>
      </div>
    )
  }

  return (
    <Carousel
      ariaLabel="Polls"
      swipeHint={`Swipe for all ${polls.length} polls`}
      scrollStep={380}
    >
      {polls.map(renderPoll)}
    </Carousel>
  )
}
