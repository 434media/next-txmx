"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getEventPrizes,
  markPrizeClaimed,
  markPrizeForfeited,
  type EventPrize,
} from "../actions/event-prizes"
import { useAdminAuth } from "./admin-auth-gate"

interface PrizeManagerProps {
  eventId: string
}

const STATUS_STYLES: Record<EventPrize["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  claimed: "bg-green-50 text-green-700 border-green-200",
  forfeited: "bg-gray-100 text-gray-500 border-gray-200",
}

export default function PrizeManager({ eventId }: PrizeManagerProps) {
  const { user: adminUser } = useAdminAuth()
  const [prizes, setPrizes] = useState<EventPrize[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEventPrizes(eventId)
      setPrizes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prizes")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    load()
  }, [load])

  async function handleClaim(prize: EventPrize) {
    setBusyId(prize.id)
    setError("")
    try {
      await markPrizeClaimed(prize.id, adminUser?.uid || "", notesById[prize.id] || "")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark claimed")
    } finally {
      setBusyId(null)
    }
  }

  async function handleForfeit(prize: EventPrize) {
    if (!confirm(`Mark prize for ${prize.displayName || prize.userId} as forfeited?`)) return
    setBusyId(prize.id)
    setError("")
    try {
      await markPrizeForfeited(prize.id, adminUser?.uid || "", notesById[prize.id] || "")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark forfeited")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <p className="text-gray-400 text-sm py-4">Loading prizes…</p>
    )
  }

  if (prizes.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-lg px-4 py-5 text-center">
        <p className="text-gray-400 text-sm font-medium">
          No prizes awarded yet. Use "Notify Top N" above to create prize records.
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-3 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          <p className="text-red-700 text-xs font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        {prizes.map((prize) => (
          <div
            key={prize.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#FFB800] tracking-[0.2em] uppercase">
                    #{prize.position}
                  </span>
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[prize.status]}`}
                  >
                    {prize.status}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-gray-900 truncate">
                  {prize.displayName || "Anonymous"}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {prize.email || "no email on file"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                  Earned
                </p>
                <p className="text-[13px] font-bold text-gray-800 tabular-nums">
                  {prize.spEarned.toLocaleString()} SP
                </p>
              </div>
            </div>

            <p className="text-[12px] text-gray-600 mb-3">
              <span className="text-gray-400">Prize:</span>{" "}
              <span className="font-medium">{prize.prizeLabel}</span>
            </p>

            {prize.status === "pending" ? (
              <div>
                <input
                  type="text"
                  value={notesById[prize.id] || ""}
                  onChange={(e) =>
                    setNotesById((m) => ({ ...m, [prize.id]: e.target.value }))
                  }
                  placeholder="Notes (optional) — e.g. picked up at venue 9:32pm"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-[12px] px-3 py-2 rounded-md mb-2 focus:outline-none focus:border-gray-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClaim(prize)}
                    disabled={busyId === prize.id}
                    className="px-4 py-1.5 bg-green-600 text-white text-[11px] font-semibold tracking-wider rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {busyId === prize.id ? "…" : "Mark Claimed"}
                  </button>
                  <button
                    onClick={() => handleForfeit(prize)}
                    disabled={busyId === prize.id}
                    className="px-4 py-1.5 bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold tracking-wider rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Forfeit
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {prize.notes && (
                  <p className="text-[11px] text-gray-500 italic mb-1">
                    Notes: {prize.notes}
                  </p>
                )}
                {prize.claimedAt && prize.status === "claimed" && (
                  <p className="text-[10px] text-green-600 font-medium">
                    Claimed {new Date(prize.claimedAt).toLocaleString()}
                  </p>
                )}
                {prize.status === "forfeited" && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    Forfeited
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
