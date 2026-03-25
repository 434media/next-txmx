"use client"

import { useState, useEffect, useCallback } from "react"
import type { Prop, PropType, PropStatus, PropOption } from "../actions/props"
import {
  getProps,
  createProp,
  updatePropStatus,
  settleProp,
} from "../actions/props"
import type { TXMXEvent } from "../actions/events"

interface PropManagerProps {
  events: TXMXEvent[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export default function PropManager({ events }: PropManagerProps) {
  const [props, setProps] = useState<Prop[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<PropStatus | "all">("all")

  // Create form state
  const [eventId, setEventId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [propType, setPropType] = useState<PropType>("match_winner")
  const [isUnderdog, setIsUnderdog] = useState(false)
  const [spReward, setSpReward] = useState(100)
  const [tcReward, setTcReward] = useState(10)
  const [options, setOptions] = useState<PropOption[]>([
    { id: generateId(), label: "" },
    { id: generateId(), label: "" },
  ])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const fetchProps = useCallback(async () => {
    setLoading(true)
    try {
      const data =
        filter === "all" ? await getProps() : await getProps(filter)
      setProps(data)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchProps()
  }, [fetchProps])

  async function handleCreate() {
    if (!title.trim() || options.some((o) => !o.label.trim())) {
      setError("Title and all options are required")
      return
    }
    setCreating(true)
    setError("")
    try {
      const selectedEvent = events.find((e) => e.id === eventId)
      await createProp({
        eventId: eventId || "",
        eventDate: selectedEvent?.date || "",
        title: title.trim(),
        description: description.trim(),
        type: propType,
        options: options.map((o) => ({
          id: o.id,
          label: o.label.trim(),
        })),
        spReward,
        tcReward,
        isUnderdog,
      })
      setTitle("")
      setDescription("")
      setOptions([
        { id: generateId(), label: "" },
        { id: generateId(), label: "" },
      ])
      setShowCreate(false)
      await fetchProps()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create prop")
    } finally {
      setCreating(false)
    }
  }

  async function handleLock(propId: string) {
    await updatePropStatus(propId, "locked")
    await fetchProps()
  }

  async function handleVoid(propId: string) {
    await updatePropStatus(propId, "voided")
    await fetchProps()
  }

  async function handleSettle(propId: string, correctOptionId: string) {
    await settleProp(propId, correctOptionId)
    await fetchProps()
  }

  const STATUS_COLORS: Record<PropStatus, string> = {
    open: "bg-green-500/15 text-green-600 border-green-500/30",
    locked: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    settled: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    voided: "bg-gray-200 text-gray-500 border-gray-300",
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PropStatus | "all")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
          >
            <option value="all">All Props</option>
            <option value="open">Open</option>
            <option value="locked">Locked</option>
            <option value="settled">Settled</option>
            <option value="voided">Voided</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Create Prop"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
            New Prop
          </h3>

          {error && (
            <div className="mb-4 border border-red-200 rounded-lg px-4 py-2 bg-red-50">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
                Event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              >
                <option value="">No Event (Standalone)</option>
                {events.slice(0, 30).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.date} — {e.promoter} ({e.city})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
                Type
              </label>
              <select
                value={propType}
                onChange={(e) => setPropType(e.target.value as PropType)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              >
                <option value="match_winner">Match Winner</option>
                <option value="method">Method</option>
                <option value="round">Round</option>
                <option value="over_under">Over/Under</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Rodriguez vs. Garcia — Who Wins?"'
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional additional context..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {/* Options */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold w-6 text-center">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const updated = [...options]
                      updated[i] = { ...opt, label: e.target.value }
                      setOptions(updated)
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() =>
                        setOptions(options.filter((_, j) => j !== i))
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                setOptions([...options, { id: generateId(), label: "" }])
              }
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              + Add Option
            </button>
          </div>

          {/* Rewards + Underdog */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
                SP Reward
              </label>
              <input
                type="number"
                value={spReward}
                onChange={(e) => setSpReward(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
                TC Reward
              </label>
              <input
                type="number"
                value={tcReward}
                onChange={(e) => setTcReward(Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderdog}
                  onChange={(e) => setIsUnderdog(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-gray-500">
                  Underdog (1.25x)
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="text-sm font-semibold px-6 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Prop"}
          </button>
        </div>
      )}

      {/* Props List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Loading props...</p>
        </div>
      ) : props.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No props found.</p>
          <p className="text-gray-300 text-xs mt-1">
            Create your first prop to start accepting predictions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {props.map((prop) => (
            <PropCard
              key={prop.id}
              prop={prop}
              statusColors={STATUS_COLORS}
              onLock={() => handleLock(prop.id)}
              onVoid={() => handleVoid(prop.id)}
              onSettle={(optionId) => handleSettle(prop.id, optionId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PropCard({
  prop,
  statusColors,
  onLock,
  onVoid,
  onSettle,
}: {
  prop: Prop
  statusColors: Record<PropStatus, string>
  onLock: () => void
  onVoid: () => void
  onSettle: (optionId: string) => void
}) {
  const [settlingWith, setSettlingWith] = useState<string | null>(null)

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 leading-snug">
            {prop.title}
          </h4>
          {prop.description && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {prop.description}
            </p>
          )}
        </div>
        <span
          className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border shrink-0 ${statusColors[prop.status]}`}
        >
          {prop.status}
        </span>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2 mb-4">
        {prop.options.map((opt) => {
          const isCorrect = prop.correctOptionId === opt.id
          return (
            <div
              key={opt.id}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                isCorrect
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {opt.label}
              {isCorrect && " ✓"}
            </div>
          )
        })}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <span>
          {prop.spReward} SP · {prop.tcReward} TC
        </span>
        {prop.isUnderdog && (
          <span className="text-amber-500 font-semibold">Underdog 1.25x</span>
        )}
        <span>{prop.type.replace("_", " ")}</span>
      </div>

      {/* Actions */}
      {prop.status === "open" && (
        <div className="flex items-center gap-2">
          <button
            onClick={onLock}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
          >
            Lock
          </button>
          <button
            onClick={onVoid}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Void
          </button>
        </div>
      )}

      {prop.status === "locked" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium mr-2">
            Settle:
          </span>
          {prop.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSettlingWith(opt.id)
                onSettle(opt.id)
              }}
              disabled={settlingWith !== null}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {settlingWith === opt.id ? "Settling..." : opt.label}
            </button>
          ))}
          <button
            onClick={onVoid}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Void
          </button>
        </div>
      )}
    </div>
  )
}
