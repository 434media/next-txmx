"use client"

import { useState, useEffect, useCallback } from "react"
import type { TXMXEvent } from "../actions/events"
import {
  settleEventMatchPicks,
  getMatchPicksForEvent,
  type MatchPick,
} from "../actions/match-picks"

interface SettlementManagerProps {
  events: TXMXEvent[]
}

export default function SettlementManager({ events }: SettlementManagerProps) {
  const [selectedEventId, setSelectedEventId] = useState("")
  const [picks, setPicks] = useState<MatchPick[]>([])
  const [loading, setLoading] = useState(false)
  const [settling, setSettling] = useState(false)
  const [result, setResult] = useState<{
    settled: number
    winners: number
    draws: number
    skipped: number
    errors: number
  } | null>(null)
  const [error, setError] = useState("")

  // Filter to past events that have bout data
  const pastEvents = events.filter((e) => {
    if (!e.date || !e.eventNumber) return false
    const today = new Date().toISOString().slice(0, 10)
    return e.date < today
  })

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  const loadPicks = useCallback(async () => {
    if (!selectedEventId) {
      setPicks([])
      return
    }
    setLoading(true)
    setResult(null)
    setError("")
    try {
      const data = await getMatchPicksForEvent(selectedEventId)
      setPicks(data)
    } catch {
      setPicks([])
    } finally {
      setLoading(false)
    }
  }, [selectedEventId])

  useEffect(() => {
    loadPicks()
  }, [loadPicks])

  async function handleSettle() {
    if (!selectedEvent) return
    setSettling(true)
    setError("")
    setResult(null)
    try {
      const res = await settleEventMatchPicks(
        selectedEvent.id,
        selectedEvent.eventNumber
      )
      if (res.success) {
        setResult(res)
        await loadPicks()
      } else {
        setError("Settlement failed")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Settlement error")
    } finally {
      setSettling(false)
    }
  }

  const unsettled = picks.filter((p) => !p.settled)
  const settled = picks.filter((p) => p.settled)
  const wins = settled.filter((p) => p.won === true)
  const losses = settled.filter((p) => p.won === false)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400 max-w-md"
        >
          <option value="">Select an event to settle...</option>
          {pastEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.date} — {event.promoter} ({event.city}){" "}
              {event.boutCount > 0 ? `· ${event.boutCount} bouts` : ""}
            </option>
          ))}
        </select>

        {selectedEvent && unsettled.length > 0 && (
          <button
            onClick={handleSettle}
            disabled={settling}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {settling ? "Settling..." : `Settle ${unsettled.length} Picks`}
          </button>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className="mb-6 border border-green-200 bg-green-50 rounded-lg px-4 py-3">
          <p className="text-green-800 text-sm font-semibold mb-1">
            Settlement complete
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-green-700">
            <span>
              <strong>{result.settled}</strong> settled
            </span>
            <span>
              <strong>{result.winners}</strong> winners
            </span>
            <span>
              <strong>{result.draws}</strong> draws
            </span>
            <span>
              <strong>{result.skipped}</strong> skipped
            </span>
            {result.errors > 0 && (
              <span className="text-red-600">
                <strong>{result.errors}</strong> errors
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
          <p className="text-red-800 text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Stats */}
      {selectedEventId && !loading && picks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-1">
              Total Picks
            </p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">
              {picks.length}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-1">
              Unsettled
            </p>
            <p className="text-xl font-bold text-amber-600 tabular-nums">
              {unsettled.length}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-1">
              Winners
            </p>
            <p className="text-xl font-bold text-green-600 tabular-nums">
              {wins.length}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-1">
              Losses
            </p>
            <p className="text-xl font-bold text-red-500 tabular-nums">
              {losses.length}
            </p>
          </div>
        </div>
      )}

      {/* Picks table */}
      {selectedEventId && loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          Loading picks...
        </p>
      ) : selectedEventId && picks.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No match picks for this event.
        </p>
      ) : picks.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Bout
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Matchup
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Pick
                </th>
                <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Status
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  SP
                </th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => (
                <tr
                  key={pick.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-2.5 text-gray-400 tabular-nums">
                    {pick.boutNumber}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">
                    <span className="font-medium">{pick.fighter1Name}</span>
                    <span className="text-gray-300 mx-1.5">vs</span>
                    <span className="font-medium">{pick.fighter2Name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-gray-900">
                      {pick.pickedFighterName}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {!pick.settled ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
                        Pending
                      </span>
                    ) : pick.won ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-green-500/15 text-green-600 border border-green-500/30">
                        Win
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                        Loss
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {pick.spAwarded != null ? (
                      <span
                        className={
                          pick.spAwarded > 0
                            ? "text-green-600 font-semibold"
                            : "text-gray-300"
                        }
                      >
                        {pick.spAwarded > 0
                          ? `+${pick.spAwarded}`
                          : pick.spAwarded}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!selectedEventId && (
        <div className="text-center py-12">
          <p className="text-gray-300 text-sm font-medium">
            Select a past event to view and settle match picks.
          </p>
          <p className="text-gray-300 text-xs mt-2">
            Settlement compares user picks against real TDLR bout results and
            awards SP to correct predictions.
          </p>
        </div>
      )}
    </div>
  )
}
