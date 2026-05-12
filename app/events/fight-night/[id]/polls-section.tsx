"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "../../../../lib/auth-context"
import {
  type FightNightPoll,
  getPolls,
  votePoll,
  getUserVotesForFightNight,
} from "../../../actions/fightnight-polls"
import RecapSequence from "./recap-sequence"

interface PollsSectionProps {
  fightNightId: string
}

export default function PollsSection({ fightNightId }: PollsSectionProps) {
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
        // Optimistically reflect vote + reload
        setUserVotes((m) => ({ ...m, [pollId]: optionIndex }))
        await load()
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
        <p className="text-white/30 text-sm">Loading polls…</p>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium">No polls yet for this event.</p>
      </div>
    )
  }

  // Group polls by ID prefix so the section reads as a progression
  // through the night (Opening → Vibes → Recap) rather than a long stack.
  const groups: { label: string; tag: string; polls: typeof polls }[] = [
    { label: "Opening — warm up the crowd", tag: "Opening", polls: polls.filter((p) => p.id.startsWith("opening-")) },
    { label: "Vibe checks — call the fight", tag: "Vibes", polls: polls.filter((p) => p.id.startsWith("bout-")) },
    { label: "Recap — your call on the night", tag: "Recap", polls: polls.filter((p) => p.id.startsWith("night-")) },
  ]
  const ungrouped = polls.filter(
    (p) =>
      !p.id.startsWith("opening-") &&
      !p.id.startsWith("bout-") &&
      !p.id.startsWith("night-")
  )
  if (ungrouped.length > 0) {
    groups.push({ label: "More polls", tag: "More", polls: ungrouped })
  }

  function renderPoll(poll: (typeof polls)[number]) {
    const userVote = userVotes[poll.id]
    const hasVoted = userVote !== undefined
    const isClosed = poll.status === "closed"
    const showResults = hasVoted || isClosed
    const totalVotes = poll.totalVotes || 0
    const myError = errorById[poll.id]

    return (
      <div
        key={poll.id}
        className={`border rounded-xl p-5 ${
          isClosed ? "border-white/5 bg-white/2 opacity-70" : "border-white/8 bg-white/2"
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
                        <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <p className={`text-sm font-semibold leading-snug truncate ${isMyPick ? "text-white" : "text-white/70"}`}>
                        {opt.label}
                      </p>
                    </div>
                    <p className={`text-xs font-bold tabular-nums shrink-0 ${isMyPick ? "text-amber-400" : "text-white/55"}`}>
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

        {myError && <p className="mt-3 text-red-400 text-xs font-medium">{myError}</p>}

        <p className="mt-3 text-white/50 text-[10px] font-bold tracking-wider uppercase">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {hasVoted && !isClosed && " · you voted"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {groups.map((group) =>
        group.polls.length === 0 ? null : (
          <div key={group.tag}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase">
                {group.tag}
              </span>
              <span className="text-white/55 text-xs font-medium">
                — {group.label}
              </span>
            </div>

            {/* Recap is rendered as a step-through onboarding-style sequence.
                Everything else stays as quick-scan stacks. */}
            {group.tag === "Recap" ? (
              <RecapSequence fightNightId={fightNightId} polls={group.polls} />
            ) : (
              <div className="space-y-4">{group.polls.map(renderPoll)}</div>
            )}
          </div>
        )
      )}
    </div>
  )
}
