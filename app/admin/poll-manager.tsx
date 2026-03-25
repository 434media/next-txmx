"use client"

import { useState, useEffect } from "react"
import type { Poll } from "../actions/polls"
import { getPolls, createPoll, closePoll } from "../actions/polls"

export default function PollManager() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [category, setCategory] = useState<"event" | "fighter" | "general">("general")
  const [closesAt, setClosesAt] = useState("")
  const [saving, setSaving] = useState(false)

  const loadPolls = async () => {
    setLoading(true)
    try {
      const all = await getPolls("all", 50)
      setPolls(all)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  const handleCreate = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) return
    setSaving(true)
    try {
      await createPoll({
        question: question.trim(),
        options: options.filter((o) => o.trim()),
        category,
        closesAt: closesAt || undefined,
      })
      setQuestion("")
      setOptions(["", ""])
      setCategory("general")
      setClosesAt("")
      setShowAdd(false)
      await loadPolls()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleClose = async (pollId: string) => {
    await closePoll(pollId)
    setPolls((prev) => prev.map((p) => (p.id === pollId ? { ...p, status: "closed" as const } : p)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Fan Polls</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          {showAdd ? "Cancel" : "+ New Poll"}
        </button>
      </div>

      {/* Add Poll Form */}
      {showAdd && (
        <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Who wins this weekend's main event?"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...options]
                        next[i] = e.target.value
                        setOptions(next)
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => setOptions(options.filter((_, j) => j !== i))}
                        className="text-red-500 text-sm font-medium px-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 6 && (
                <button
                  onClick={() => setOptions([...options, ""])}
                  className="mt-2 text-amber-600 text-sm font-medium hover:text-amber-700"
                >
                  + Add Option
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "event" | "fighter" | "general")}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="fighter">Fighter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Closes At (optional)</label>
                <input
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !question.trim() || options.filter((o) => o.trim()).length < 2}
              className="bg-amber-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </div>
      )}

      {/* Polls List */}
      {loading ? (
        <p className="text-gray-400 text-sm animate-pulse">Loading polls...</p>
      ) : polls.length === 0 ? (
        <p className="text-gray-400 text-sm">No polls yet. Create the first one!</p>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <div key={poll.id} className="border border-gray-200 rounded-xl p-5 bg-white">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-sm font-bold text-gray-900">{poll.question}</h3>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    poll.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {poll.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                {poll.options.map((opt, i) => {
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-amber-500/20 h-full flex items-center px-3"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        >
                          <span className="text-gray-700 text-xs font-medium truncate">{opt.label}</span>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs font-medium tabular-nums w-14 text-right">
                        {opt.votes} ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs font-medium tabular-nums">
                  {poll.totalVotes} total votes — {poll.category}
                </p>
                {poll.status === "open" && (
                  <button
                    onClick={() => handleClose(poll.id)}
                    className="text-red-500 text-xs font-semibold hover:text-red-600"
                  >
                    Close Poll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
