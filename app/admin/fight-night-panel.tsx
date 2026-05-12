"use client"

import { useState, useEffect, useCallback } from "react"
import type { TXMXEvent, AdminEventBout } from "../actions/events"
import { getAdminEventBouts } from "../actions/events"
import { recordBoutResult, getMatchPicksForEvent, type MatchPick } from "../actions/match-picks"
import { notifyEventWinners } from "../actions/event-leaderboard"
import CheckInWidget from "./check-in-widget"
import PrizeManager from "./prize-manager"
import { useAdminAuth } from "./admin-auth-gate"

interface FightNightPanelProps {
  events: TXMXEvent[]
}

type BoutAction = "fighter1" | "fighter2" | "draw"

export default function FightNightPanel({ events }: FightNightPanelProps) {
  const { user: adminUser } = useAdminAuth()
  const [selectedEventId, setSelectedEventId] = useState("")
  const [bouts, setBouts] = useState<AdminEventBout[]>([])
  const [picks, setPicks] = useState<MatchPick[]>([])
  const [loading, setLoading] = useState(false)
  const [settlingBout, setSettlingBout] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [lastResult, setLastResult] = useState<{
    boutNumber: number
    settled: number
    winners: number
  } | null>(null)

  // Winner notification state
  const [prizeLabel, setPrizeLabel] = useState("BOXR Station prize")
  const [claimInstructions, setClaimInstructions] = useState(
    "Reply to this email by Sunday to claim. We'll coordinate pickup at BOXR Station."
  )
  const [topN, setTopN] = useState(1)
  const [atEventOnly, setAtEventOnly] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notifyResult, setNotifyResult] = useState<{
    sent: number
    skipped: number
    errors: number
  } | null>(null)

  // Filter to events relevant for fight-night ops:
  // today's events or events in the next 7 days
  const today = new Date().toISOString().slice(0, 10)
  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const relevantEvents = events
    .filter((e) => e.date >= today && e.date <= inSevenDays && e.eventNumber)
    .sort((a, b) => a.date.localeCompare(b.date))

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  const loadData = useCallback(async () => {
    if (!selectedEvent?.eventNumber) {
      setBouts([])
      setPicks([])
      return
    }
    setLoading(true)
    setError("")
    try {
      const [boutData, pickData] = await Promise.all([
        getAdminEventBouts(selectedEvent.eventNumber),
        getMatchPicksForEvent(selectedEvent.id),
      ])
      setBouts(boutData)
      setPicks(pickData)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [selectedEvent])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleRecord(boutNumber: number, action: BoutAction) {
    if (!selectedEvent?.eventNumber) return
    setSettlingBout(boutNumber)
    setError("")
    setLastResult(null)
    try {
      const res = await recordBoutResult(
        selectedEvent.id,
        selectedEvent.eventNumber,
        boutNumber,
        action
      )
      if (res.success) {
        setLastResult({
          boutNumber,
          settled: res.settled,
          winners: res.winners,
        })
        await loadData()
      } else {
        setError(res.error || "Failed to record result")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record result")
    } finally {
      setSettlingBout(null)
    }
  }

  // Group picks by bout for the per-bout summary
  const picksByBout = new Map<number, MatchPick[]>()
  for (const p of picks) {
    if (!picksByBout.has(p.boutNumber)) picksByBout.set(p.boutNumber, [])
    picksByBout.get(p.boutNumber)!.push(p)
  }

  const settledCount = bouts.filter(
    (b) => b.winnerResolution && b.winnerResolution !== ""
  ).length

  const allBoutsSettled = bouts.length > 0 && settledCount === bouts.length

  async function handleNotifyWinners() {
    if (!selectedEvent) return
    if (
      !confirm(
        `Send winner emails to the top ${topN} finisher${topN === 1 ? "" : "s"}? This sends real email via Resend.`
      )
    ) {
      return
    }
    setNotifying(true)
    setNotifyResult(null)
    setError("")
    try {
      const res = await notifyEventWinners(selectedEvent.id, {
        topN,
        prizeLabel,
        claimInstructions,
        atEventOnly,
      })
      setNotifyResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to notify winners")
    } finally {
      setNotifying(false)
    }
  }

  return (
    <div>
      {/* Event selector + progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400 max-w-md"
        >
          <option value="">Select an event…</option>
          {relevantEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.date} — {event.promoter} ({event.city})
              {event.boutCount > 0 ? ` · ${event.boutCount} bouts` : ""}
              {event.eventMode === "free-props" ? " · FREE-PROPS" : ""}
            </option>
          ))}
        </select>

        {selectedEvent && bouts.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
              Progress
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFB800] rounded-full transition-all"
                  style={{
                    width: `${bouts.length > 0 ? (settledCount / bouts.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-sm font-bold text-gray-800 tabular-nums">
                {settledCount}
                <span className="text-gray-400 font-medium">/{bouts.length}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Result banner */}
      {lastResult && (
        <div className="mb-5 border border-green-200 bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-green-800 text-sm font-semibold">
              Bout {lastResult.boutNumber} recorded
            </p>
            <p className="text-green-700 text-xs">
              {lastResult.settled} picks settled · {lastResult.winners} winners
            </p>
          </div>
          <button
            onClick={() => setLastResult(null)}
            className="text-green-700 hover:text-green-900 text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
          <p className="text-red-800 text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* No selection */}
      {!selectedEventId && (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm font-medium mb-2">
            Pick an event above to start running fight night.
          </p>
          <p className="text-gray-300 text-xs">
            Only events in the next 7 days are shown.
          </p>
        </div>
      )}

      {/* Loading */}
      {selectedEventId && loading && (
        <p className="text-gray-400 text-sm py-8 text-center">Loading bouts…</p>
      )}

      {/* No bouts */}
      {selectedEventId && !loading && bouts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm font-medium">
            No bouts on this event yet. Add bouts in the Events tab first.
          </p>
        </div>
      )}

      {/* Check-in widget — visible whenever an event is selected */}
      {selectedEventId && (
        <div className="mb-6">
          <CheckInWidget eventId={selectedEventId} adminUid={adminUser?.uid || ""} />
        </div>
      )}

      {/* Winner notify panel — appears once all bouts settled */}
      {selectedEventId && !loading && allBoutsSettled && (
        <div className="mb-6 border border-[#FFB800]/30 bg-amber-50/40 rounded-xl p-5">
          <p className="text-[10px] font-bold text-[#B07F00] tracking-[0.25em] uppercase mb-3">
            Event Complete — Notify Winners
          </p>
          <p className="text-sm text-gray-700 font-medium mb-4">
            All {bouts.length} bouts settled. Send prize-claim emails to the top finishers on the event leaderboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1">TOP N</label>
              <input
                type="number"
                min={1}
                max={10}
                value={topN}
                onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] px-3 py-2 rounded-md focus:outline-none focus:border-[#FFB800]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1">PRIZE LABEL</label>
              <input
                type="text"
                value={prizeLabel}
                onChange={(e) => setPrizeLabel(e.target.value)}
                placeholder="e.g. BOXR Station prize pack"
                className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] px-3 py-2 rounded-md focus:outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1">CLAIM INSTRUCTIONS</label>
            <textarea
              value={claimInstructions}
              onChange={(e) => setClaimInstructions(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] px-3 py-2 rounded-md focus:outline-none focus:border-[#FFB800] resize-none"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={atEventOnly}
                onChange={(e) => setAtEventOnly(e.target.checked)}
                className="accent-[#FFB800]"
              />
              <span className="text-[12px] text-gray-700 font-medium">
                On-premises only (Tier 2 check-in)
              </span>
            </label>
            <p className="text-[10px] text-gray-400">
              Skip until check-in is wired in Tier 2.
            </p>
          </div>

          {notifyResult && (
            <div className="mb-3 border border-green-200 bg-green-50 rounded-lg px-3 py-2">
              <p className="text-green-800 text-[12px] font-semibold">
                Sent {notifyResult.sent} · Skipped {notifyResult.skipped} (no email) · Errors {notifyResult.errors}
              </p>
            </div>
          )}

          <button
            onClick={handleNotifyWinners}
            disabled={notifying || !prizeLabel.trim()}
            className="px-5 py-2.5 bg-[#FFB800] text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50"
          >
            {notifying ? "Sending…" : `Notify Top ${topN}`}
          </button>

          {/* Prize claim tracker */}
          <div className="mt-6 border-t border-amber-500/20 pt-5">
            <p className="text-[10px] font-bold text-[#B07F00] tracking-[0.25em] uppercase mb-3">
              Prize Claim Tracker
            </p>
            <PrizeManager eventId={selectedEventId} />
          </div>
        </div>
      )}

      {/* Bouts list */}
      {selectedEventId && !loading && bouts.length > 0 && (
        <div className="space-y-3">
          {bouts.map((bout) => {
            const boutPicks = picksByBout.get(bout.boutNumber) || []
            const totalPicks = boutPicks.length
            const isSettled = !!bout.winnerResolution
            const isSettling = settlingBout === bout.boutNumber
            const winnerName =
              bout.winnerResolution === "fighter1"
                ? bout.fighter1
                : bout.winnerResolution === "fighter2"
                  ? bout.fighter2
                  : bout.winnerResolution === "draw"
                    ? "Draw"
                    : null

            return (
              <div
                key={`${bout.docId}-${bout.boutNumber}`}
                className={`border rounded-xl p-4 sm:p-5 transition-colors ${
                  isSettled
                    ? "border-green-200 bg-green-50/50"
                    : isSettling
                      ? "border-amber-200 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-gray-300 w-7 text-center">
                      #{bout.boutNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                        {bout.fighter1}
                        <span className="text-gray-300 font-normal mx-2">vs</span>
                        {bout.fighter2}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {bout.weightClass && (
                          <span className="text-[10px] text-gray-400">
                            {bout.weightClass}
                          </span>
                        )}
                        {bout.titleFight && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-semibold">
                            TITLE
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 tabular-nums">
                          {totalPicks} pick{totalPicks !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSettled && winnerName && (
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-bold text-green-600 tracking-[0.2em] uppercase mb-0.5">
                        Winner
                      </p>
                      <p className="text-[13px] font-bold text-gray-900">
                        {winnerName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {!isSettled ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleRecord(bout.boutNumber, "fighter1")}
                      disabled={isSettling}
                      className="px-3 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-800 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettling ? "…" : bout.fighter1}
                    </button>
                    <button
                      onClick={() => handleRecord(bout.boutNumber, "draw")}
                      disabled={isSettling}
                      className="px-3 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-500 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => handleRecord(bout.boutNumber, "fighter2")}
                      disabled={isSettling}
                      className="px-3 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-800 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettling ? "…" : bout.fighter2}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-green-700 font-semibold tracking-wider uppercase">
                      Settled
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">
                      {boutPicks.filter((p) => p.settled && p.won).length} winners /{" "}
                      {boutPicks.filter((p) => p.settled).length} picks settled
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
