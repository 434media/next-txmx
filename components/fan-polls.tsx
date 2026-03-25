"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../lib/auth-context"
import type { Poll, UserVote } from "../app/actions/polls"
import { votePoll, getPolls, getUserVotes } from "../app/actions/polls"

export default function FanPolls() {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [voting, setVoting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [openPolls, closedPolls] = await Promise.all([
          getPolls("open", 5),
          getPolls("closed", 3),
        ])
        setPolls([...openPolls, ...closedPolls])

        if (user) {
          const votes = await getUserVotes(user.uid)
          const map: Record<string, number> = {}
          for (const v of votes) {
            map[v.pollId] = v.optionIndex
          }
          setUserVotes(map)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!user) {
      setToast("Sign in to vote")
      setTimeout(() => setToast(null), 2500)
      return
    }

    setVoting(pollId)
    const result = await votePoll(user.uid, pollId, optionIndex)
    setVoting(null)

    if (result.success) {
      setUserVotes((prev) => ({ ...prev, [pollId]: optionIndex }))
      // Update local poll data
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((opt, i) =>
              i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          }
        })
      )
      setToast("+10 TC earned!")
      setTimeout(() => setToast(null), 2500)
    } else {
      setToast(result.error || "Couldn't vote")
      setTimeout(() => setToast(null), 2500)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/30 text-sm animate-pulse">Loading polls...</p>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-white/40 text-sm">No polls right now. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const hasVoted = poll.id in userVotes
        const votedIndex = userVotes[poll.id]
        const isOpen = poll.status === "open"
        const showResults = hasVoted || !isOpen

        return (
          <div
            key={poll.id}
            className="border border-white/10 rounded-xl bg-white/2 overflow-hidden"
          >
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-white text-[15px] font-bold leading-snug">
                  {poll.question}
                </h3>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    isOpen
                      ? "bg-green-500/15 text-green-400 border border-green-500/20"
                      : "bg-white/10 text-white/40 border border-white/10"
                  }`}
                >
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <div className="space-y-2">
                {poll.options.map((option, i) => {
                  const pct =
                    poll.totalVotes > 0
                      ? Math.round((option.votes / poll.totalVotes) * 100)
                      : 0
                  const isSelected = votedIndex === i
                  const isWinner =
                    showResults &&
                    option.votes ===
                      Math.max(...poll.options.map((o) => o.votes)) &&
                    option.votes > 0

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isOpen && !hasVoted) handleVote(poll.id, i)
                      }}
                      disabled={!isOpen || hasVoted || voting === poll.id}
                      className={`w-full text-left relative rounded-lg overflow-hidden transition-all ${
                        isOpen && !hasVoted
                          ? "hover:bg-white/8 cursor-pointer border border-white/10 hover:border-white/20"
                          : "border border-white/8 cursor-default"
                      } ${isSelected ? "border-emerald-500/30!" : ""}`}
                    >
                      {/* Result bar */}
                      {showResults && (
                        <div
                          className={`absolute inset-0 transition-all duration-500 ${
                            isWinner ? "bg-emerald-500/10" : "bg-white/4"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      )}

                      <div className="relative px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isOpen && !hasVoted && (
                            <div className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0" />
                          )}
                          {hasVoted && isSelected && (
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span
                            className={`text-sm font-medium truncate ${
                              isSelected
                                ? "text-emerald-400"
                                : isWinner
                                  ? "text-white"
                                  : "text-white/70"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>

                        {showResults && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-white/40 text-xs font-medium tabular-nums">
                              {option.votes}
                            </span>
                            <span className="text-white/60 text-xs font-bold tabular-nums w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-white/30 text-xs font-medium tabular-nums">
                  {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
                </p>
                {isOpen && !hasVoted && user && (
                  <p className="text-emerald-400/60 text-[10px] font-semibold tracking-wider">
                    +10 TC FOR VOTING
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-60 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-white text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}
