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
  /**
   * Which subset of polls to render. The Polls and Recap tabs share the
   * same `polls` collection but split it by ID prefix so each tab is its
   * own focused surface.
   *   - "main"  (default): everything that isn't a recap poll
   *   - "recap": only night-prefixed polls
   */
  filter?: "main" | "recap"
}

export default function PollsSection({
  fightNightId,
  filter = "main",
}: PollsSectionProps) {
  const { user } = useAuth()
  const [polls, setPolls] = useState<FightNightPoll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [errorById, setErrorById] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPolls(fightNightId, "all")
      setPolls(data)
      if (user) {
        const votes = await getUserVotesForFightNight(fightNightId, user.uid)
        const map: Record<string, number> = {}
        for (const v of votes) map[v.pollId] = v.optionIndex
        setUserVotes(map)
      }
    } finally {
      setLoading(false)
    }
  }, [fightNightId, user])

  useEffect(() => {
    load()
  }, [load])

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
        setUserVotes((m) => ({ ...m, [pollId]: optionIndex }))
        await load()
      } else {
        setErrorById((m) => ({ ...m, [pollId]: res.error || "Failed to vote" }))
      }
    } finally {
      setSubmitting(null)
    }
  }

  // Filter to the subset this section is responsible for.
  const visiblePolls = polls.filter((p) =>
    filter === "recap" ? p.id.startsWith("night-") : !p.id.startsWith("night-")
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white/30 text-sm">Loading polls…</p>
      </div>
    )
  }

  if (visiblePolls.length === 0) {
    return (
      <div className="text-center py-12 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium">
          {filter === "recap"
            ? "Recap polls open after the night winds down."
            : "No polls yet for this event."}
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

    return (
      <div
        key={poll.id}
        className={`snap-start shrink-0 w-[85vw] sm:w-[360px] border rounded-xl p-5 ${
          isClosed
            ? "border-white/5 bg-white/2 opacity-70"
            : "border-white/8 bg-white/2"
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-white text-[15px] font-bold leading-snug flex-1">
            {poll.question}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {poll.boutNumber && (
              <span className="text-white/55 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                Bout {poll.boutNumber}
              </span>
            )}
            {isClosed && (
              <span className="text-white/55 text-[10px] font-bold tracking-wider uppercase">
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
                      ? "border-amber-500/30 bg-amber-500/5"
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
                onClick={() => handleVote(poll.id, i)}
                disabled={submitting === poll.id}
                className="w-full text-left border border-white/8 rounded-lg px-4 py-3 hover:border-white/20 hover:bg-white/4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-white text-sm font-semibold leading-snug">
                  {opt.label}
                </p>
              </button>
            )
          })}
        </div>

        {myError && (
          <p className="mt-3 text-red-400 text-xs font-medium">{myError}</p>
        )}

        <p className="mt-3 text-white/50 text-[10px] font-bold tracking-wider uppercase">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {hasVoted && !isClosed && " · you voted"}
        </p>
      </div>
    )
  }

  const swipeHint =
    filter === "recap"
      ? `Swipe → for all ${visiblePolls.length} recap polls`
      : `Swipe → for all ${visiblePolls.length} polls`

  return (
    <Carousel
      ariaLabel={filter === "recap" ? "Recap polls" : "Polls"}
      swipeHint={swipeHint}
      scrollStep={380}
    >
      {visiblePolls.map(renderPoll)}
    </Carousel>
  )
}
