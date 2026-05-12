"use client"

import { useEffect, useState, useCallback } from "react"
import {
  rotateCheckInCode,
  getCheckInCode,
  type CheckInCode,
} from "../actions/event-checkin"

interface CheckInWidgetProps {
  eventId: string
  adminUid?: string
}

function formatRemaining(validUntil: string): { label: string; expired: boolean } {
  const ms = new Date(validUntil).getTime() - Date.now()
  if (ms <= 0) return { label: "EXPIRED", expired: true }
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  return {
    label: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    expired: false,
  }
}

export default function CheckInWidget({ eventId, adminUid = "" }: CheckInWidgetProps) {
  const [code, setCode] = useState<CheckInCode | null>(null)
  const [rotating, setRotating] = useState(false)
  const [ttlMinutes, setTtlMinutes] = useState(10)
  const [error, setError] = useState("")
  const [, setTick] = useState(0)

  const load = useCallback(async () => {
    try {
      const c = await getCheckInCode(eventId)
      setCode(c)
    } catch {
      // Non-critical
    }
  }, [eventId])

  useEffect(() => {
    load()
  }, [load])

  // Re-render every second to update the countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  async function handleRotate() {
    setRotating(true)
    setError("")
    try {
      const next = await rotateCheckInCode(eventId, ttlMinutes, adminUid)
      setCode(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rotate code")
    } finally {
      setRotating(false)
    }
  }

  const remaining = code ? formatRemaining(code.validUntil) : null

  return (
    <div className="border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase mb-1">
            Check-In Code
          </p>
          <p className="text-[12px] text-gray-500 font-medium leading-snug max-w-xs">
            Announce this code from the ring. Only on-premises fans who enter it
            count for the prize.
          </p>
        </div>
        {code && (
          <div className="text-right shrink-0">
            <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              Total Check-ins
            </p>
            <p className="text-xl font-black text-gray-800 tabular-nums">
              {code.totalCheckIns}
            </p>
          </div>
        )}
      </div>

      {/* Code display */}
      {code ? (
        <div
          className={`rounded-xl px-4 py-5 mb-4 text-center border-2 transition-colors ${
            remaining?.expired
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-[#FFB800]/40"
          }`}
        >
          <p
            className="text-5xl sm:text-6xl font-black tabular-nums tracking-[0.3em] leading-none mb-2"
            style={{
              color: remaining?.expired ? "#b91c1c" : "#0a0a0a",
            }}
          >
            {code.currentCode}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                remaining?.expired ? "bg-red-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <p
              className={`text-[10px] font-bold tracking-[0.25em] uppercase ${
                remaining?.expired ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {remaining?.expired ? "Expired — Rotate Now" : `Valid · ${remaining?.label} left`}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl px-4 py-8 mb-4 text-center border-2 border-dashed border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-400 font-medium">
            No active code. Rotate one to start check-in.
          </p>
        </div>
      )}

      {/* Rotate controls */}
      <div className="flex items-center gap-2">
        <div>
          <label className="text-[9px] font-bold text-gray-400 tracking-[0.15em] block mb-1">
            TTL (MIN)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={ttlMinutes}
            onChange={(e) => setTtlMinutes(parseInt(e.target.value) || 10)}
            className="w-20 bg-white border border-gray-200 text-gray-900 text-[13px] px-2 py-2 rounded-md focus:outline-none focus:border-[#FFB800]"
          />
        </div>
        <button
          onClick={handleRotate}
          disabled={rotating}
          className="flex-1 mt-5 px-4 py-2 bg-[#FFB800] text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50"
        >
          {rotating ? "Rotating…" : code ? "Rotate Code" : "Generate Code"}
        </button>
      </div>

      {error && <p className="mt-3 text-red-600 text-xs font-medium">{error}</p>}
    </div>
  )
}
