"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore"
import { db } from "../../lib/firebase-client"
import {
  type FightNight,
  type FightNightStatus,
  type FightNightBout,
  getFightNights,
  getActiveFightNight,
  createFightNight,
  updateFightNight,
  deleteFightNight,
  getBouts,
  upsertBout,
  deleteBout,
} from "../actions/fightnight"
import {
  recordFightNightBoutResult,
  markBoutLive,
  reopenFightNightBout,
  getPickCount,
  getPicksForBout,
  type FightNightPick,
} from "../actions/fightnight-picks"
import {
  rotateCheckInCode,
  getCheckInCode,
  getCheckIns,
  type CheckInCode,
} from "../actions/fightnight-checkin"
import {
  awardTopFinishers,
  getPrizes,
  markPrizeClaimed,
  markPrizeForfeited,
  notifyFightNightWinners,
  type FightNightPrize,
} from "../actions/fightnight-prizes"
import { sendFightNightRecap } from "../actions/fightnight-recap"
import {
  type FightNightPoll,
  createPoll,
  getPolls,
  closePoll,
  deletePoll,
} from "../actions/fightnight-polls"
import {
  type FightNightProp,
  type PropStatus,
  createProp,
  getProps,
  updatePropStatus,
  settleProp,
  voidProp,
  deleteProp,
} from "../actions/fightnight-props"
import {
  type FightNightStanding,
  getStandings,
} from "../actions/fightnight-standings"
import { useAdminAuth } from "./admin-auth-gate"
import FlyerUploader from "./flyer-uploader"
import UserActivityDrawer from "./user-activity-drawer"

const inputClass =
  "w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
const labelClass =
  "text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1"

const STATUS_LABELS: Record<FightNightStatus, string> = {
  announced: "Announced",
  doors_open: "Doors Open",
  live: "Live",
  completed: "Completed",
}

const STATUS_STYLES: Record<FightNightStatus, string> = {
  announced: "bg-blue-50 text-blue-700 border-blue-200",
  doors_open: "bg-amber-50 text-amber-700 border-amber-200",
  live: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-green-50 text-green-700 border-green-200",
}

export default function FightNightsManager() {
  const [fightNights, setFightNights] = useState<FightNight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Use the SAME selection logic as the public landing page so admin
      // and `/events/fight-night` always resolve to the same fight night.
      // Only seeds the selection on first load — admin can switch manually.
      const [data, active] = await Promise.all([
        getFightNights(),
        getActiveFightNight(),
      ])
      setFightNights(data)
      setSelectedId((current) => current || active?.id || data[0]?.id || "")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selected = fightNights.find((f) => f.id === selectedId) || null

  async function handleCreate() {
    setCreating(true)
    setError("")
    try {
      const fn = await createFightNight({
        title: "New Fight Night",
        subtitle: "TXMX Boxing presents",
        date: new Date().toISOString().slice(0, 10),
      })
      await load()
      setSelectedId(fn.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      {/* List of fight nights + create button */}
      <div className="flex items-center justify-between mb-5">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-gray-400 max-w-md"
        >
          <option value="">Select a fight night…</option>
          {fightNights.map((fn) => (
            <option key={fn.id} value={fn.id}>
              {fn.date} — {fn.title || "(untitled)"} · {STATUS_LABELS[fn.status]}
            </option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {creating ? "Creating…" : "+ New Fight Night"}
        </button>
      </div>

      {error && (
        <div className="mb-4 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : !selected ? (
        <div className="border border-dashed border-gray-200 rounded-xl px-6 py-16 text-center">
          <p className="text-gray-400 text-sm font-medium mb-1">
            {fightNights.length === 0
              ? "No fight nights yet. Click + New Fight Night above to start."
              : "Pick a fight night above to edit."}
          </p>
        </div>
      ) : (
        <FightNightDetail
          key={selected.id}
          fightNight={selected}
          onChange={load}
        />
      )}
    </div>
  )
}

// ── Detail view (metadata + bouts + live control) ───────────

type DetailTab =
  | "overview"
  | "card"
  | "polls"
  | "props"
  | "live"
  | "standings"
  | "prizes"

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "card", label: "Fight Card" },
  { key: "polls", label: "Polls" },
  { key: "props", label: "Props" },
  { key: "live", label: "Live" },
  { key: "standings", label: "Standings" },
  { key: "prizes", label: "Prizes" },
]

function FightNightDetail({
  fightNight,
  onChange,
}: {
  fightNight: FightNight
  onChange: () => void
}) {
  const [tab, setTab] = useState<DetailTab>("overview")
  // When set, the user-activity drawer renders over everything. Cleared
  // by closing the drawer (backdrop, X, or Escape). Drives drill-down
  // from both the Participants feed and the Leaderboard preview.
  const [drilldownUserId, setDrilldownUserId] = useState<string | null>(null)
  const [hasLiveBout, setHasLiveBout] = useState(false)
  const [pendingBouts, setPendingBouts] = useState(0)

  // Small live subscription on bouts so the Live tab can flash a beacon
  // when a bout is in progress, and show how many bouts still need settling.
  useEffect(() => {
    const q = query(collection(db, "fightNights", fightNight.id, "bouts"))
    const unsub = onSnapshot(q, (snap) => {
      let live = false
      let pending = 0
      for (const d of snap.docs) {
        const b = d.data() as FightNightBout
        if (b.status === "live") live = true
        if (b.status !== "completed") pending++
      }
      setHasLiveBout(live)
      setPendingBouts(pending)
    })
    return () => unsub()
  }, [fightNight.id])

  return (
    <div>
      {/* Persistent header — event identity */}
      <div className="border-b border-gray-200 pb-5 mb-0">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.25em] uppercase mb-1">
              {fightNight.subtitle || "Fight Night"}
            </p>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight truncate">
              {fightNight.title || "(untitled)"}
            </h2>
            <p className="text-[12px] text-gray-500 font-medium mt-1">
              {fightNight.date || "TBD"}
              {fightNight.venue ? ` · ${fightNight.venue}` : ""}
              {fightNight.city ? ` · ${fightNight.city}` : ""}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[fightNight.status]}`}
          >
            {STATUS_LABELS[fightNight.status]}
          </span>
        </div>
      </div>

      {/* Vercel-style tab bar */}
      <nav className="border-b border-gray-200 -mx-1 mb-6">
        <div className="flex items-center gap-1 overflow-x-auto px-1">
          {TABS.map((t) => {
            const isActive = tab === t.key
            const isLiveTab = t.key === "live"
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-3 py-3 text-[13px] tracking-tight whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-gray-900 font-semibold"
                    : isLiveTab
                      ? "text-gray-800 font-semibold hover:text-gray-900"
                      : "text-gray-500 font-medium hover:text-gray-900"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t.label}
                  {isLiveTab && hasLiveBout && (
                    <span className="relative flex w-2 h-2" aria-label="A bout is live">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
                    </span>
                  )}
                  {isLiveTab && !hasLiveBout && pendingBouts > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gray-900 text-white text-[10px] font-bold tabular-nums">
                      {pendingBouts}
                    </span>
                  )}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-900 rounded-t-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <div className="space-y-6">
            <OverviewPanel fightNight={fightNight} onTabChange={setTab} />
            <MetadataPanel fightNight={fightNight} onChange={onChange} />
          </div>
        )}
        {tab === "card" && <BoutsPanel fightNight={fightNight} />}
        {tab === "polls" && <PollsPanel fightNight={fightNight} />}
        {tab === "props" && <PropsPanel fightNight={fightNight} />}
        {tab === "live" && <LivePanel fightNight={fightNight} />}
        {tab === "standings" && (
          <div className="space-y-6">
            <LeaderboardPreviewPanel
              fightNight={fightNight}
              onDrillDown={setDrilldownUserId}
            />
            <ParticipantsPanel
              fightNight={fightNight}
              onDrillDown={setDrilldownUserId}
            />
          </div>
        )}
        {tab === "prizes" && <PrizesPanel fightNight={fightNight} />}
      </div>

      {/* Per-user activity drawer — mounts as an overlay on top of the
          tab content. Opened by clicking a row in Participants or
          Leaderboard, closed via X / backdrop / Escape. */}
      {drilldownUserId && (
        <UserActivityDrawer
          fightNightId={fightNight.id}
          userId={drilldownUserId}
          onClose={() => setDrilldownUserId(null)}
        />
      )}
    </div>
  )
}

// ── Overview Panel ─────────────────────────────────────────

function OverviewPanel({
  fightNight,
  onTabChange,
}: {
  fightNight: FightNight
  onTabChange: (tab: DetailTab) => void
}) {
  const [stats, setStats] = useState({
    bouts: 0,
    boutsCompleted: 0,
    participants: 0,
    picksPlaced: 0,
    topPoints: 0,
    topName: "",
    pollsCount: 0,
    propsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bouts, top, polls, props, picksPlaced] = await Promise.all([
        getBouts(fightNight.id),
        getStandings(fightNight.id, { limit: 1 }),
        getPolls(fightNight.id, "all"),
        getProps(fightNight.id),
        getPickCount(fightNight.id),
      ])
      const participantCount = (await getStandings(fightNight.id, { limit: 1000 })).length
      const topPlayer = top[0]
      setStats({
        bouts: bouts.length,
        boutsCompleted: bouts.filter((b) => b.status === "completed").length,
        participants: participantCount,
        picksPlaced,
        topPoints: topPlayer?.points || 0,
        topName: topPlayer?.displayName || (topPlayer ? "Anonymous" : ""),
        pollsCount: polls.length,
        propsCount: props.length,
      })
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  const avgPicks =
    stats.participants > 0
      ? (stats.picksPlaced / stats.participants).toFixed(1)
      : "0"

  const cards = [
    {
      label: "Bouts settled",
      value: `${stats.boutsCompleted}/${stats.bouts}`,
      hint: stats.bouts === 0 ? "Add bouts" : null,
      tab: "card" as DetailTab,
    },
    {
      label: "Participants",
      value: stats.participants.toLocaleString(),
      hint: stats.participants === 0 ? "Nobody signed up yet" : null,
      tab: "standings" as DetailTab,
    },
    {
      label: "Picks placed",
      value: stats.picksPlaced.toLocaleString(),
      hint:
        stats.picksPlaced === 0
          ? "No picks yet"
          : stats.participants > 0
            ? `${avgPicks} per player`
            : null,
      tab: "live" as DetailTab,
    },
    {
      label: "Top player",
      value: stats.topPoints > 0 ? stats.topPoints.toLocaleString() + " pts" : "—",
      hint: stats.topName || null,
      tab: "standings" as DetailTab,
    },
    {
      label: "Polls",
      value: stats.pollsCount.toString(),
      hint: stats.pollsCount === 0 ? "Create polls" : null,
      tab: "polls" as DetailTab,
    },
    {
      label: "Props",
      value: stats.propsCount.toString(),
      hint: stats.propsCount === 0 ? "Create props" : null,
      tab: "props" as DetailTab,
    },
  ]

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Overview
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="text-[10px] text-gray-500 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onTabChange(c.tab)}
            className="bg-white text-left px-4 py-4 hover:bg-gray-50 transition-colors group"
          >
            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-1">
              {c.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
              {loading ? "…" : c.value}
            </p>
            {c.hint && (
              <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate group-hover:text-gray-600 transition-colors">
                {c.hint}
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

// ── Check-Ins Panel (track users) ──────────────────────────

interface CheckInRecord {
  userId: string
  displayName: string | null
  email: string | null
  checkedInAt: string
  codeUsed: string
}

function CheckInsPanel({ fightNight }: { fightNight: FightNight }) {
  const [records, setRecords] = useState<CheckInRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCheckIns(fightNight.id)
      setRecords(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Check-Ins ({records.length})
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="text-[10px] text-gray-500 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No one has checked in yet. Rotate a code in Check-In Code above and announce it from the ring.
        </p>
      ) : (
        <div className="border border-gray-100 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  User
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Email
                </th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Checked In
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.userId} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-[12px] text-gray-800 font-semibold truncate">
                    {r.displayName || "Anonymous"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-gray-500 truncate">
                    {r.email || "—"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-gray-500 text-right tabular-nums">
                    {new Date(r.checkedInAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ── Participants Panel (live signup feed) ──────────────────

/**
 * Live feed of everyone who's joined the fight night, ordered by most
 * recent. Real-time via onSnapshot so the admin can watch fans stream in
 * during the event. Distinguishes walk-in (custom-token guest UID prefix
 * `guest_`) from authenticated accounts (Google sign-in or any other
 * provider that produced a regular Firebase Auth UID).
 */
function ParticipantsPanel({
  fightNight,
  onDrillDown,
}: {
  fightNight: FightNight
  onDrillDown: (userId: string) => void
}) {
  const [participants, setParticipants] = useState<FightNightStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // Re-render once a minute so relative timestamps stay accurate without
  // each row managing its own timer.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, "fightNights", fightNight.id, "standings"),
      orderBy("joinedAt", "desc"),
      fbLimit(200)
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setParticipants(snap.docs.map((d) => d.data() as FightNightStanding))
        setLoading(false)
      },
      () => setLoading(false)
    )
    return () => unsub()
  }, [fightNight.id])

  const total = participants.length
  // useMemo on the same dep set as `tick` so it recomputes minute-over-minute
  const counts = (() => {
    void tick
    const now = Date.now()
    let last10m = 0
    let walkIn = 0
    let google = 0
    for (const p of participants) {
      const joined = new Date(p.joinedAt).getTime()
      if (now - joined < 10 * 60_000) last10m++
      if (p.userId.startsWith("guest_")) walkIn++
      else google++
    }
    return { last10m, walkIn, google }
  })()

  return (
    <section className="border border-gray-200 rounded-xl bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              Participants
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Live signup feed · most recent first
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-900 text-lg font-bold tabular-nums leading-none">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">
              Total
            </p>
          </div>
        </div>

        {/* Quick counts strip */}
        <div className="grid grid-cols-3 gap-2">
          <CountTile label="Last 10 min" value={counts.last10m} accent="emerald" />
          <CountTile label="Walk-in" value={counts.walkIn} accent="amber" />
          <CountTile label="Google" value={counts.google} accent="blue" />
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {loading ? (
          <p className="px-5 py-8 text-gray-400 text-sm text-center">Loading…</p>
        ) : participants.length === 0 ? (
          <p className="px-5 py-8 text-gray-400 text-sm text-center">
            No signups yet. The feed updates live as fans join.
          </p>
        ) : (
          participants.map((p) => (
            <ParticipantRow
              key={p.userId}
              entry={p}
              onClick={() => onDrillDown(p.userId)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function CountTile({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: "emerald" | "amber" | "blue"
}) {
  const palette =
    accent === "emerald"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : accent === "amber"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-blue-700 bg-blue-50 border-blue-200"
  return (
    <div className={`border rounded-md px-2.5 py-1.5 ${palette}`}>
      <p className="text-base font-bold tabular-nums leading-none">{value}</p>
      <p className="text-[9px] font-bold tracking-wider uppercase mt-1 opacity-80">
        {label}
      </p>
    </div>
  )
}

function ParticipantRow({
  entry,
  onClick,
}: {
  entry: FightNightStanding
  onClick: () => void
}) {
  const isWalkIn = entry.userId.startsWith("guest_")
  const method = isWalkIn ? "Walk-in" : "Google"
  const methodClass = isWalkIn
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-blue-700 bg-blue-50 border-blue-200"
  const joinedAgo = formatRelativeTime(entry.joinedAt)

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
    >
      <div className="w-16 shrink-0">
        <p className="text-[11px] text-gray-500 font-medium tabular-nums">
          {joinedAgo}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-gray-900 truncate">
          {entry.displayName || "Anonymous"}
        </p>
        <p className="text-[11px] text-gray-500 truncate">
          {entry.email || "—"}
        </p>
      </div>

      <span
        className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 ${methodClass}`}
      >
        {method}
      </span>

      <div className="text-right w-20 shrink-0">
        <p className="text-[11px] text-gray-700 font-medium tabular-nums">
          {entry.picksMade || 0} pick{(entry.picksMade || 0) === 1 ? "" : "s"}
        </p>
        {(entry.points || 0) > 0 && (
          <p className="text-[10px] text-gray-500 tabular-nums">
            {(entry.points || 0).toLocaleString()} pts
          </p>
        )}
      </div>
    </button>
  )
}

function formatRelativeTime(iso: string): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return "just now"
  if (ms < 60_000) return "just now"
  if (ms < 60 * 60_000) return `${Math.floor(ms / 60_000)}m ago`
  if (ms < 24 * 60 * 60_000) return `${Math.floor(ms / (60 * 60_000))}h ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ── Leaderboard Preview Panel (read-only) ──────────────────

function LeaderboardPreviewPanel({
  fightNight,
  onDrillDown,
}: {
  fightNight: FightNight
  onDrillDown: (userId: string) => void
}) {
  const [standings, setStandings] = useState<FightNightStanding[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getStandings(fightNight.id, { limit: 25 })
      setStandings(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Leaderboard Preview
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="text-[10px] text-gray-500 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : standings.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No standings yet. Once users pick winners, entries appear here.
        </p>
      ) : (
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  #
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  User
                </th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Picks
                </th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  At Event
                </th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <tr
                  key={s.userId}
                  onClick={() => onDrillDown(s.userId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onDrillDown(s.userId)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open activity for ${s.displayName || "Anonymous"}`}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer focus:outline-none focus:bg-gray-50"
                >
                  <td className="px-3 py-2 text-[12px] tabular-nums text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 text-[12px]">
                    <p className="text-gray-800 font-semibold truncate">
                      {s.displayName || "Anonymous"}
                    </p>
                    <p className="text-gray-400 text-[11px] truncate">{s.email || "—"}</p>
                  </td>
                  <td className="px-3 py-2 text-[12px] text-center tabular-nums text-gray-700">
                    {s.picksWon}/{s.picksMade}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.atEvent ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="text-gray-300 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-right tabular-nums font-bold text-gray-900">
                    {s.points.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ── Props Panel ────────────────────────────────────────────

function PropsPanel({ fightNight }: { fightNight: FightNight }) {
  const [props, setProps] = useState<FightNightProp[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [optionsText, setOptionsText] = useState("")
  const [pointsReward, setPointsReward] = useState(500)
  const [isUnderdog, setIsUnderdog] = useState(false)
  const [boutNumber, setBoutNumber] = useState<number | "">("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProps(fightNight.id)
      setProps(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate() {
    setError("")
    const options = optionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    if (!title.trim()) {
      setError("Title required")
      return
    }
    if (options.length < 2) {
      setError("At least 2 options required (one per line)")
      return
    }
    setCreating(true)
    try {
      await createProp(fightNight.id, {
        title,
        description,
        options: options.map((label) => ({ label })),
        pointsReward,
        isUnderdog,
        boutNumber: typeof boutNumber === "number" ? boutNumber : null,
      })
      setTitle("")
      setDescription("")
      setOptionsText("")
      setIsUnderdog(false)
      setBoutNumber("")
      setShowCreate(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create")
    } finally {
      setCreating(false)
    }
  }

  async function handleLock(propId: string) {
    await updatePropStatus(fightNight.id, propId, "locked")
    await load()
  }

  async function handleUnlock(propId: string, boutNumber: number | null) {
    const warning = boutNumber
      ? `Reopen this prop for picking? Fans can pick again. Note: this prop is tied to bout #${boutNumber} — if that bout is already live, it will auto-relock the next time the bout starts.`
      : "Reopen this prop for picking? Fans can pick again until you lock it manually."
    if (!confirm(warning)) return
    await updatePropStatus(fightNight.id, propId, "open")
    await load()
  }

  async function handleSettle(propId: string, optionId: string) {
    await settleProp(fightNight.id, propId, optionId)
    await load()
  }

  async function handleVoid(propId: string) {
    if (!confirm("Void this prop? No points will be awarded.")) return
    await voidProp(fightNight.id, propId)
    await load()
  }

  async function handleDelete(propId: string) {
    if (!confirm("Delete this prop? Picks will be orphaned.")) return
    await deleteProp(fightNight.id, propId)
    await load()
  }

  const STATUS_STYLES: Record<PropStatus, string> = {
    open: "bg-green-50 text-green-700 border-green-200",
    locked: "bg-amber-50 text-amber-700 border-amber-200",
    settled: "bg-blue-50 text-blue-700 border-blue-200",
    voided: "bg-gray-100 text-gray-500 border-gray-200",
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Props ({props.length})
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-[12px] font-semibold text-[#FFB800] hover:text-[#E5A600] tracking-wider transition-colors"
        >
          {showCreate ? "Cancel" : "+ New Prop"}
        </button>
      </div>

      {showCreate && (
        <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-amber-700 tracking-[0.2em] uppercase mb-2">
            New Prop
          </p>
          {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. "Method of victory — Main Event"'
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>DESCRIPTION (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>OPTIONS (one per line, 2+ required)</label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={3}
                placeholder={"KO/TKO\nDecision\nDraw"}
                className={inputClass + " resize-none"}
              />
            </div>
            <div>
              <label className={labelClass}>POINTS</label>
              <input
                type="number"
                min={1}
                value={pointsReward}
                onChange={(e) => setPointsReward(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>BOUT # (optional)</label>
              <input
                type="number"
                min={1}
                value={boutNumber}
                onChange={(e) => {
                  const v = e.target.value
                  setBoutNumber(v === "" ? "" : Number(v))
                }}
                placeholder="—"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderdog}
                  onChange={(e) => setIsUnderdog(e.target.checked)}
                  className="accent-[#FFB800]"
                />
                <span className="text-[11px] text-gray-700 font-medium">
                  Underdog (1.25× payout)
                </span>
              </label>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-1.5 bg-[#FFB800] text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Prop"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading props…</p>
      ) : props.length === 0 ? (
        <p className="text-gray-400 text-sm">No props yet.</p>
      ) : (
        <div className="space-y-2">
          {props.map((prop) => (
            <div key={prop.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 leading-snug">
                    {prop.title}
                  </p>
                  {prop.description && (
                    <p className="text-[11px] text-gray-500 leading-5 mt-0.5">
                      {prop.description}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[prop.status]}`}
                >
                  {prop.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {prop.options.map((opt) => {
                  const isCorrect = prop.correctOptionId === opt.id
                  return (
                    <span
                      key={opt.id}
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        isCorrect
                          ? "bg-green-50 text-green-700 border-green-200 font-semibold"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {opt.label}
                      {isCorrect && " ✓"}
                    </span>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                <span>{prop.pointsReward} pts</span>
                {prop.isUnderdog && <span className="text-amber-600 font-semibold">Underdog 1.25×</span>}
                {prop.boutNumber && <span>· Bout {prop.boutNumber}</span>}
              </div>

              {/* Actions per status */}
              {prop.status === "open" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLock(prop.id)}
                    className="text-[11px] px-3 py-1 rounded-md border border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Lock
                  </button>
                  <button
                    onClick={() => handleVoid(prop.id)}
                    className="text-[11px] px-3 py-1 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    Void
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="text-[11px] px-3 py-1 rounded-md text-gray-300 hover:text-red-500 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              )}

              {prop.status === "locked" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-gray-500 mr-1">Settle:</span>
                  {prop.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSettle(prop.id, opt.id)}
                      className="text-[11px] px-2.5 py-1 rounded-md border border-green-200 text-green-700 hover:bg-green-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleUnlock(prop.id, prop.boutNumber)}
                    className="text-[11px] px-3 py-1 rounded-md text-gray-500 hover:text-amber-700"
                  >
                    Reopen
                  </button>
                  <button
                    onClick={() => handleVoid(prop.id)}
                    className="text-[11px] px-3 py-1 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    Void
                  </button>
                </div>
              )}

              {(prop.status === "settled" || prop.status === "voided") && (
                <button
                  onClick={() => handleDelete(prop.id)}
                  className="text-[11px] text-gray-300 hover:text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Polls Panel ────────────────────────────────────────────

function PollsPanel({ fightNight }: { fightNight: FightNight }) {
  const [polls, setPolls] = useState<FightNightPoll[]>([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [optionsText, setOptionsText] = useState("")
  const [boutNumber, setBoutNumber] = useState<number | "">("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPolls(fightNight.id, "all")
      setPolls(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate() {
    setError("")
    const options = optionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
    if (!question.trim()) {
      setError("Question required")
      return
    }
    if (options.length < 2) {
      setError("At least 2 options required (one per line)")
      return
    }
    setCreating(true)
    try {
      await createPoll(fightNight.id, {
        question,
        options,
        boutNumber: typeof boutNumber === "number" ? boutNumber : null,
      })
      setQuestion("")
      setOptionsText("")
      setBoutNumber("")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create poll")
    } finally {
      setCreating(false)
    }
  }

  async function handleClose(pollId: string) {
    await closePoll(fightNight.id, pollId)
    await load()
  }

  async function handleDelete(pollId: string) {
    if (!confirm("Delete this poll? Votes will also be orphaned.")) return
    await deletePoll(fightNight.id, pollId)
    await load()
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
        Polls
      </h3>

      <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3 mb-4">
        <p className="text-[10px] font-bold text-amber-700 tracking-[0.2em] uppercase mb-2">
          New Poll
        </p>
        {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>QUESTION</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='e.g. "Will the main event go to decision?"'
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>OPTIONS (one per line, 2+ required)</label>
            <textarea
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              rows={3}
              placeholder={"Yes — decision\nNo — KO/TKO\nDraw"}
              className={inputClass + " resize-none"}
            />
          </div>
          <div>
            <label className={labelClass}>BOUT # (optional)</label>
            <input
              type="number"
              min={1}
              value={boutNumber}
              onChange={(e) => {
                const v = e.target.value
                setBoutNumber(v === "" ? "" : Number(v))
              }}
              placeholder="—"
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-4 py-1.5 bg-[#FFB800] text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create Poll"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading polls…</p>
      ) : polls.length === 0 ? (
        <p className="text-gray-400 text-sm">No polls yet.</p>
      ) : (
        <div className="space-y-2">
          {polls.map((poll) => (
            <div key={poll.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[13px] font-bold text-gray-900 flex-1">
                  {poll.question}
                </p>
                <span
                  className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                    poll.status === "open"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {poll.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {poll.options.map((opt, i) => (
                  <span
                    key={i}
                    className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
                  >
                    {opt.label}
                    <span className="text-gray-400 ml-1">· {opt.votes}</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">
                  {poll.totalVotes} votes
                  {poll.boutNumber && ` · Bout ${poll.boutNumber}`}
                </span>
                <div className="flex-1" />
                {poll.status === "open" && (
                  <button
                    onClick={() => handleClose(poll.id)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => handleDelete(poll.id)}
                  className="text-[10px] text-gray-300 hover:text-red-500 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Metadata Panel ──────────────────────────────────────────

function MetadataPanel({
  fightNight,
  onChange,
}: {
  fightNight: FightNight
  onChange: () => void
}) {
  const [edit, setEdit] = useState({
    title: fightNight.title,
    subtitle: fightNight.subtitle,
    venue: fightNight.venue,
    city: fightNight.city,
    address: fightNight.address,
    date: fightNight.date,
    doorsAt: fightNight.doorsAt,
    firstBellAt: fightNight.firstBellAt,
    status: fightNight.status,
    flyerUrl: fightNight.flyerUrl,
    prizeLabel: fightNight.prizeLabel,
    prizeDetails: fightNight.prizeDetails,
    promoCopy: fightNight.promoCopy,
    propsEnabled: fightNight.propsEnabled,
    pollsEnabled: fightNight.pollsEnabled,
  })
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    try {
      await updateFightNight(fightNight.id, edit)
      setSavedAt(new Date().toLocaleTimeString())
      onChange()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Delete this fight night? Subcollections (bouts, picks, standings, prizes) are NOT deleted automatically — clean those up manually in Firestore if needed."
      )
    )
      return
    await deleteFightNight(fightNight.id)
    onChange()
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Event Metadata
        </h3>
        <span
          className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[fightNight.status]}`}
        >
          {STATUS_LABELS[fightNight.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelClass}>TITLE</label>
          <input
            type="text"
            value={edit.title}
            onChange={(e) => setEdit((d) => ({ ...d, title: e.target.value }))}
            placeholder="e.g. Members Only Fight Night"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>SUBTITLE / EYEBROW</label>
          <input
            type="text"
            value={edit.subtitle}
            onChange={(e) => setEdit((d) => ({ ...d, subtitle: e.target.value }))}
            placeholder="e.g. BOXR Station Presents"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>STATUS</label>
          <select
            value={edit.status}
            onChange={(e) =>
              setEdit((d) => ({ ...d, status: e.target.value as FightNightStatus }))
            }
            className={inputClass}
          >
            <option value="announced">Announced</option>
            <option value="doors_open">Doors Open</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>VENUE</label>
          <input
            type="text"
            value={edit.venue}
            onChange={(e) => setEdit((d) => ({ ...d, venue: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>CITY</label>
          <input
            type="text"
            value={edit.city}
            onChange={(e) => setEdit((d) => ({ ...d, city: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>ADDRESS</label>
          <input
            type="text"
            value={edit.address}
            onChange={(e) => setEdit((d) => ({ ...d, address: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>DATE</label>
          <input
            type="date"
            value={edit.date}
            onChange={(e) => setEdit((d) => ({ ...d, date: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <FlyerUploader
            fightNightId={fightNight.id}
            currentUrl={edit.flyerUrl}
            onUploaded={async (url) => {
              setEdit((d) => ({ ...d, flyerUrl: url }))
              // Persist immediately so the upload isn't lost if admin doesn't click Save
              try {
                await updateFightNight(fightNight.id, { flyerUrl: url })
                onChange()
              } catch {
                // Non-critical — local state still reflects the new URL
              }
            }}
          />
        </div>
        <div>
          <label className={labelClass}>DOORS AT (ISO)</label>
          <input
            type="datetime-local"
            value={edit.doorsAt ? edit.doorsAt.slice(0, 16) : ""}
            onChange={(e) =>
              setEdit((d) => ({
                ...d,
                doorsAt: e.target.value ? new Date(e.target.value).toISOString() : "",
              }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>FIRST BELL (ISO)</label>
          <input
            type="datetime-local"
            value={edit.firstBellAt ? edit.firstBellAt.slice(0, 16) : ""}
            onChange={(e) =>
              setEdit((d) => ({
                ...d,
                firstBellAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>PRIZE LABEL</label>
          <input
            type="text"
            value={edit.prizeLabel}
            onChange={(e) => setEdit((d) => ({ ...d, prizeLabel: e.target.value }))}
            placeholder="e.g. BOXR Station prize pack"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>PRIZE DETAILS</label>
          <input
            type="text"
            value={edit.prizeDetails}
            onChange={(e) =>
              setEdit((d) => ({ ...d, prizeDetails: e.target.value }))
            }
            placeholder="Long-form details for the landing"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>PROMO COPY</label>
          <textarea
            rows={3}
            value={edit.promoCopy}
            onChange={(e) => setEdit((d) => ({ ...d, promoCopy: e.target.value }))}
            placeholder="Short copy shown on the landing page"
            className={inputClass + " resize-none"}
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={edit.propsEnabled}
              onChange={(e) =>
                setEdit((d) => ({ ...d, propsEnabled: e.target.checked }))
              }
              className="accent-[#FFB800]"
            />
            <span className="text-[12px] text-gray-700 font-medium">Props enabled</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={edit.pollsEnabled}
              onChange={(e) =>
                setEdit((d) => ({ ...d, pollsEnabled: e.target.checked }))
              }
              className="accent-[#FFB800]"
            />
            <span className="text-[12px] text-gray-700 font-medium">Polls enabled</span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-[#FFB800] text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && (
          <p className="text-[11px] text-green-600 font-medium">Saved at {savedAt}</p>
        )}
        <div className="flex-1" />
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-red-500 text-[12px] font-medium hover:bg-red-50 rounded-md transition-colors"
        >
          Delete
        </button>
      </div>
    </section>
  )
}

// ── Bouts Panel ────────────────────────────────────────────

function BoutsPanel({ fightNight }: { fightNight: FightNight }) {
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBouts(fightNight.id)
      setBouts(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd() {
    const next = bouts.length === 0 ? 1 : Math.max(...bouts.map((b) => b.boutNumber)) + 1
    await upsertBout(fightNight.id, next, {})
    await load()
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Fight Card ({bouts.length} bouts)
        </h3>
        <button
          onClick={handleAdd}
          className="text-[12px] font-semibold text-[#FFB800] hover:text-[#E5A600] tracking-wider transition-colors"
        >
          + Add Bout
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading bouts…</p>
      ) : bouts.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No bouts yet. Click + Add Bout to start the card.
        </p>
      ) : (
        <div className="space-y-2">
          {bouts.map((bout) => (
            <BoutRow
              key={bout.boutNumber}
              fightNightId={fightNight.id}
              bout={bout}
              onChange={load}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function BoutRow({
  fightNightId,
  bout,
  onChange,
}: {
  fightNightId: string
  bout: FightNightBout
  onChange: () => void
}) {
  const [edit, setEdit] = useState(false)
  const [data, setData] = useState({
    fighter1Name: bout.fighter1Name,
    fighter1Gym: bout.fighter1Gym,
    fighter2Name: bout.fighter2Name,
    fighter2Gym: bout.fighter2Gym,
    weightClass: bout.weightClass,
    isMainEvent: bout.isMainEvent,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await upsertBout(fightNightId, bout.boutNumber, data)
      setEdit(false)
      onChange()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete bout #${bout.boutNumber}? Picks on this bout will still exist but won't render.`
      )
    )
      return
    await deleteBout(fightNightId, bout.boutNumber)
    onChange()
  }

  if (!edit) {
    return (
      <div className="border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-3">
        <span className="text-[10px] font-mono text-gray-300 w-6">#{bout.boutNumber}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-gray-800 truncate">
            <span className="font-semibold">{bout.fighter1Name || "TBA"}</span>
            <span className="text-gray-300 mx-1.5">vs</span>
            <span className="font-semibold">{bout.fighter2Name || "TBA"}</span>
          </p>
          <p className="text-[10px] text-gray-400">
            {bout.weightClass || "—"}
            {bout.isMainEvent && (
              <span className="ml-2 text-amber-600 font-semibold">MAIN EVENT</span>
            )}
          </p>
        </div>
        <span
          className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
            bout.status === "completed"
              ? "bg-green-50 text-green-700"
              : bout.status === "live"
                ? "bg-red-50 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {bout.status}
        </span>
        <button
          onClick={() => setEdit(true)}
          className="text-[10px] text-gray-400 hover:text-[#FFB800] px-1.5 py-1"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-[10px] text-gray-300 hover:text-red-500 px-1.5 py-1"
        >
          Del
        </button>
      </div>
    )
  }

  return (
    <div className="border border-[#FFB800]/30 rounded-lg p-3 bg-amber-50/30">
      <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] mb-2">
        BOUT #{bout.boutNumber}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className={labelClass}>FIGHTER 1</label>
          <input
            type="text"
            value={data.fighter1Name}
            onChange={(e) => setData((d) => ({ ...d, fighter1Name: e.target.value }))}
            placeholder="Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>F1 GYM</label>
          <input
            type="text"
            value={data.fighter1Gym}
            onChange={(e) => setData((d) => ({ ...d, fighter1Gym: e.target.value }))}
            placeholder="Gym"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>FIGHTER 2</label>
          <input
            type="text"
            value={data.fighter2Name}
            onChange={(e) => setData((d) => ({ ...d, fighter2Name: e.target.value }))}
            placeholder="Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>F2 GYM</label>
          <input
            type="text"
            value={data.fighter2Gym}
            onChange={(e) => setData((d) => ({ ...d, fighter2Gym: e.target.value }))}
            placeholder="Gym"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>WEIGHT CLASS</label>
          <input
            type="text"
            value={data.weightClass}
            onChange={(e) => setData((d) => ({ ...d, weightClass: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isMainEvent}
              onChange={(e) =>
                setData((d) => ({ ...d, isMainEvent: e.target.checked }))
              }
              className="accent-[#FFB800]"
            />
            <span className="text-[11px] text-gray-600">Main Event</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-[#FFB800] text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setEdit(false)}
          className="px-3 py-1.5 text-gray-500 text-[11px]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Check-In Panel ─────────────────────────────────────────

function CheckInPanel({ fightNight }: { fightNight: FightNight }) {
  const { user: adminUser } = useAdminAuth()
  const [code, setCode] = useState<CheckInCode | null>(null)
  const [ttl, setTtl] = useState(10)
  const [rotating, setRotating] = useState(false)
  const [, setTick] = useState(0)

  const load = useCallback(async () => {
    const c = await getCheckInCode(fightNight.id)
    setCode(c)
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  async function handleRotate() {
    setRotating(true)
    try {
      const next = await rotateCheckInCode(fightNight.id, ttl, adminUser?.uid || "")
      setCode(next)
    } finally {
      setRotating(false)
    }
  }

  const ms = code ? new Date(code.validUntil).getTime() - Date.now() : 0
  const expired = code ? ms <= 0 : false
  const mm = Math.max(0, Math.floor(ms / 60000))
  const ss = Math.max(0, Math.floor((ms % 60000) / 1000))

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
        Check-In Code
      </h3>
      {code ? (
        <div
          className={`rounded-xl px-4 py-5 mb-4 text-center border-2 ${
            expired ? "bg-red-50 border-red-200" : "bg-amber-50 border-[#FFB800]/40"
          }`}
        >
          <p
            className="text-5xl sm:text-6xl font-black tabular-nums tracking-[0.3em] leading-none mb-2"
            style={{ color: expired ? "#b91c1c" : "#0a0a0a" }}
          >
            {code.currentCode}
          </p>
          <p
            className={`text-[10px] font-bold tracking-[0.25em] uppercase ${expired ? "text-red-600" : "text-emerald-700"}`}
          >
            {expired
              ? "Expired — Rotate Now"
              : `Valid · ${mm}:${ss.toString().padStart(2, "0")} left`}
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Total check-ins: {code.totalCheckIns}
          </p>
        </div>
      ) : (
        <div className="rounded-xl px-4 py-8 mb-4 text-center border-2 border-dashed border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-400">No active code.</p>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div>
          <label className={labelClass}>TTL (min)</label>
          <input
            type="number"
            min={1}
            max={60}
            value={ttl}
            onChange={(e) => setTtl(parseInt(e.target.value) || 10)}
            className="w-20 bg-white border border-gray-200 text-gray-900 text-[13px] px-2 py-2 rounded-md"
          />
        </div>
        <button
          onClick={handleRotate}
          disabled={rotating}
          className="flex-1 px-4 py-2 bg-[#FFB800] text-white text-[12px] font-semibold rounded-md disabled:opacity-50"
        >
          {rotating ? "Rotating…" : code ? "Rotate Code" : "Generate Code"}
        </button>
      </div>
    </section>
  )
}

// ── Live Control Panel ─────────────────────────────────────

function LivePanel({ fightNight }: { fightNight: FightNight }) {
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [picksByBout, setPicksByBout] = useState<Record<number, FightNightPick[]>>({})
  const [busyBout, setBusyBout] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [confirming, setConfirming] = useState<{
    boutNumber: number
    corner: "fighter1" | "fighter2" | "draw"
  } | null>(null)

  // Live bouts — react instantly to status changes from this or another admin.
  useEffect(() => {
    const q = query(
      collection(db, "fightNights", fightNight.id, "bouts"),
      orderBy("boutNumber", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setBouts(snap.docs.map((d) => d.data() as FightNightBout))
    })
    return () => unsub()
  }, [fightNight.id])

  // Pick data per bout — drives the "X picked Gomez / Y picked Paez" stakes
  // meter on every card (live AND settled).
  //
  // - Scheduled / live bouts: real-time onSnapshot so the meter updates as
  //   fans place picks.
  // - Completed bouts: one-shot fetch. Settled picks are frozen, so a
  //   subscription would waste a listener for data that never changes.
  useEffect(() => {
    const unsubs: (() => void)[] = []
    let cancelled = false
    for (const bout of bouts) {
      if (bout.status === "completed") {
        getPicksForBout(fightNight.id, bout.boutNumber).then((picks) => {
          if (cancelled) return
          setPicksByBout((prev) => ({ ...prev, [bout.boutNumber]: picks }))
        })
        continue
      }
      const q = query(
        collection(db, "fightNights", fightNight.id, "picks"),
        where("boutNumber", "==", bout.boutNumber)
      )
      const unsub = onSnapshot(q, (snap) => {
        const picks = snap.docs.map((d) => d.data() as FightNightPick)
        setPicksByBout((prev) => ({ ...prev, [bout.boutNumber]: picks }))
      })
      unsubs.push(unsub)
    }
    return () => {
      cancelled = true
      unsubs.forEach((u) => u())
    }
  }, [fightNight.id, bouts])

  async function handleStart(boutNumber: number) {
    setBusyBout(boutNumber)
    setError("")
    try {
      await markBoutLive(fightNight.id, boutNumber)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyBout(null)
    }
  }

  async function handleDeclare(
    boutNumber: number,
    corner: "fighter1" | "fighter2" | "draw"
  ) {
    setBusyBout(boutNumber)
    setError("")
    setConfirming(null)
    try {
      const res = await recordFightNightBoutResult(fightNight.id, boutNumber, corner)
      if (!res.success) setError(res.error || "Failed")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyBout(null)
    }
  }

  async function handleReopen(boutNumber: number) {
    if (
      !confirm(
        `Reopen bout #${boutNumber}? This unsettles every pick on the bout and reverses any points that were awarded. Push notifications already sent are NOT recalled.`
      )
    )
      return
    setBusyBout(boutNumber)
    setError("")
    try {
      const res = await reopenFightNightBout(fightNight.id, boutNumber)
      if (!res.success) setError(res.error || "Failed")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusyBout(null)
    }
  }

  const settledCount = bouts.filter((b) => b.status === "completed").length
  const liveBout = bouts.find((b) => b.status === "live")
  const nextScheduled = bouts.find((b) => b.status === "scheduled")
  const focusBoutNumber = liveBout?.boutNumber ?? nextScheduled?.boutNumber ?? null

  return (
    <section className="border border-gray-200 rounded-xl bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            Live Control
          </h3>
          <p className="text-[11px] text-gray-500 font-medium tabular-nums">
            {settledCount} of {bouts.length} settled
          </p>
        </div>
        <p className="text-[12px] text-gray-600 leading-relaxed">
          Run each bout in two steps.{" "}
          <span className="font-semibold text-gray-900">Start the bout</span>{" "}
          when the bell rings — fan picks lock for that fight.{" "}
          <span className="font-semibold text-gray-900">Declare a winner</span>{" "}
          when it&apos;s over — picks settle and points hit the leaderboard.
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          <p className="text-red-700 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="p-5">
        {bouts.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Add bouts in the Fight Card tab first, then come back here to run the night.
          </p>
        ) : (
          <div className="space-y-3">
            {bouts.map((bout) => (
              <BoutControlCard
                key={bout.boutNumber}
                bout={bout}
                picks={picksByBout[bout.boutNumber] || []}
                isBusy={busyBout === bout.boutNumber}
                isFocused={focusBoutNumber === bout.boutNumber}
                confirming={
                  confirming?.boutNumber === bout.boutNumber ? confirming.corner : null
                }
                onStart={() => handleStart(bout.boutNumber)}
                onAskConfirm={(c) =>
                  setConfirming({ boutNumber: bout.boutNumber, corner: c })
                }
                onCancelConfirm={() => setConfirming(null)}
                onConfirmDeclare={(c) => handleDeclare(bout.boutNumber, c)}
                onReopen={() => handleReopen(bout.boutNumber)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function BoutControlCard({
  bout,
  picks,
  isBusy,
  isFocused,
  confirming,
  onStart,
  onAskConfirm,
  onCancelConfirm,
  onConfirmDeclare,
  onReopen,
}: {
  bout: FightNightBout
  picks: FightNightPick[]
  isBusy: boolean
  isFocused: boolean
  confirming: "fighter1" | "fighter2" | "draw" | null
  onStart: () => void
  onAskConfirm: (c: "fighter1" | "fighter2" | "draw") => void
  onCancelConfirm: () => void
  onConfirmDeclare: (c: "fighter1" | "fighter2" | "draw") => void
  onReopen: () => void
}) {
  const isScheduled = bout.status === "scheduled"
  const isLive = bout.status === "live"
  const isCompleted = bout.status === "completed"

  const f1Picks = picks.filter((p) => p.pickedCorner === "fighter1").length
  const f2Picks = picks.filter((p) => p.pickedCorner === "fighter2").length
  const totalPicks = picks.length

  const winnerName =
    bout.winnerCorner === "fighter1"
      ? bout.fighter1Name
      : bout.winnerCorner === "fighter2"
        ? bout.fighter2Name
        : bout.winnerCorner === "draw"
          ? "Draw"
          : null

  const borderClass = isCompleted
    ? "border-green-200 bg-green-50/40"
    : isLive
      ? "border-red-300 bg-red-50/40 ring-2 ring-red-100"
      : isFocused
        ? "border-amber-300 bg-amber-50/30 ring-2 ring-amber-100"
        : "border-gray-200"

  return (
    <div className={`border rounded-lg ${borderClass}`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-200/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold text-gray-400 tabular-nums w-8 shrink-0">
            #{bout.boutNumber}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-gray-900 truncate">
              {bout.fighter1Name || "TBA"}
              <span className="text-gray-300 font-normal mx-1.5">vs</span>
              {bout.fighter2Name || "TBA"}
            </p>
            {(bout.weightClass || bout.isMainEvent) && (
              <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">
                {[bout.isMainEvent ? "Main Event" : null, bout.weightClass]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* State chip */}
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-bold tracking-wider uppercase text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Settled
          </span>
        ) : isLive ? (
          <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-bold tracking-wider uppercase text-red-700">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red-500" />
            </span>
            Live · Picks Locked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-bold tracking-wider uppercase text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            Scheduled
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        {isCompleted ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-gray-700">
                <span className="text-gray-500">Winner:</span>{" "}
                <span className="font-bold text-green-700">{winnerName}</span>
              </p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Final tally
              </p>
            </div>
            <PickMeter
              f1Name={bout.fighter1Name || "Red"}
              f2Name={bout.fighter2Name || "Blue"}
              f1Picks={f1Picks}
              f2Picks={f2Picks}
              total={totalPicks}
              locked={true}
              winnerCorner={bout.winnerCorner ?? null}
            />
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={onReopen}
                disabled={isBusy}
                className="text-[11px] text-gray-500 hover:text-amber-700 font-medium tracking-wide transition-colors disabled:opacity-50"
              >
                {isBusy ? "Reopening…" : "Reopen bout"}
              </button>
            </div>
          </>
        ) : (
          <>
            <PickMeter
              f1Name={bout.fighter1Name || "Red"}
              f2Name={bout.fighter2Name || "Blue"}
              f1Picks={f1Picks}
              f2Picks={f2Picks}
              total={totalPicks}
              locked={isLive}
            />

            <div className="mt-4">
              {isScheduled ? (
                <>
                  <button
                    onClick={onStart}
                    disabled={isBusy}
                    className="w-full px-4 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-bold tracking-wide transition-colors disabled:opacity-50"
                  >
                    {isBusy ? "Starting…" : "Start Bout · Lock Picks"}
                  </button>
                  <details className="mt-2">
                    <summary className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer">
                      Already over? Skip ahead and declare a winner →
                    </summary>
                    <div className="mt-2">
                      <WinnerButtons
                        bout={bout}
                        confirming={confirming}
                        isBusy={isBusy}
                        f1Picks={f1Picks}
                        f2Picks={f2Picks}
                        onAskConfirm={onAskConfirm}
                        onCancelConfirm={onCancelConfirm}
                        onConfirmDeclare={onConfirmDeclare}
                      />
                    </div>
                  </details>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold text-gray-600 mb-2 tracking-wide uppercase">
                    Declare winner
                  </p>
                  <WinnerButtons
                    bout={bout}
                    confirming={confirming}
                    isBusy={isBusy}
                    f1Picks={f1Picks}
                    f2Picks={f2Picks}
                    onAskConfirm={onAskConfirm}
                    onCancelConfirm={onCancelConfirm}
                    onConfirmDeclare={onConfirmDeclare}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PickMeter({
  f1Name,
  f2Name,
  f1Picks,
  f2Picks,
  total,
  locked,
  winnerCorner,
}: {
  f1Name: string
  f2Name: string
  f1Picks: number
  f2Picks: number
  total: number
  locked: boolean
  /** When set, marks the winning legend with a "Won" chip — used to
   *  retain the final tally on settled bouts. */
  winnerCorner?: "fighter1" | "fighter2" | "draw" | null
}) {
  const f1Pct = total > 0 ? Math.round((f1Picks / total) * 100) : 0
  const f2Pct = total > 0 ? 100 - f1Pct : 0
  const f1Won = winnerCorner === "fighter1"
  const f2Won = winnerCorner === "fighter2"
  // Highlight the side with fewer picks if they ended up winning — that
  // is an "upset" in crowd-sentiment terms; surface it explicitly.
  const upset =
    !!winnerCorner &&
    winnerCorner !== "draw" &&
    total > 0 &&
    ((f1Won && f1Picks < f2Picks) || (f2Won && f2Picks < f1Picks))

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
        <span className="font-semibold text-gray-700 truncate flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          <span className="truncate">{f1Name}</span>
          {f1Won && <WonBadge />}
        </span>
        <span className="text-gray-400 tabular-nums shrink-0 text-[10px]">
          {total === 0
            ? "No picks"
            : `${total} pick${total === 1 ? "" : "s"}${locked ? " · locked" : ""}`}
          {upset && <span className="ml-1 text-amber-600 font-bold">· upset</span>}
        </span>
        <span className="font-semibold text-gray-700 truncate flex items-center gap-1.5 min-w-0 justify-end">
          {f2Won && <WonBadge />}
          <span className="truncate">{f2Name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
        {total > 0 && (
          <>
            <div
              className={`${f1Won ? "bg-green-500" : "bg-red-400"}`}
              style={{ width: `${f1Pct}%` }}
            />
            <div
              className={`${f2Won ? "bg-green-500" : "bg-blue-400"}`}
              style={{ width: `${f2Pct}%` }}
            />
          </>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] mt-1 tabular-nums text-gray-500">
        <span>
          {f1Picks}
          {total > 0 && ` · ${f1Pct}%`}
        </span>
        <span>
          {f2Picks}
          {total > 0 && ` · ${f2Pct}%`}
        </span>
      </div>
    </div>
  )
}

function WonBadge() {
  return (
    <span className="inline-flex items-center text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 shrink-0 leading-none">
      Won
    </span>
  )
}

function WinnerButtons({
  bout,
  confirming,
  isBusy,
  f1Picks,
  f2Picks,
  onAskConfirm,
  onCancelConfirm,
  onConfirmDeclare,
}: {
  bout: FightNightBout
  confirming: "fighter1" | "fighter2" | "draw" | null
  isBusy: boolean
  f1Picks: number
  f2Picks: number
  onAskConfirm: (c: "fighter1" | "fighter2" | "draw") => void
  onCancelConfirm: () => void
  onConfirmDeclare: (c: "fighter1" | "fighter2" | "draw") => void
}) {
  if (confirming) {
    const target =
      confirming === "fighter1"
        ? `${bout.fighter1Name || "Red corner"} wins`
        : confirming === "fighter2"
          ? `${bout.fighter2Name || "Blue corner"} wins`
          : "Draw — nobody wins"
    const winners =
      confirming === "fighter1"
        ? f1Picks
        : confirming === "fighter2"
          ? f2Picks
          : 0

    return (
      <div className="border border-amber-300 bg-amber-50 rounded-md p-3">
        <p className="text-[12px] text-gray-900 mb-1">
          Settle bout #{bout.boutNumber} — <span className="font-bold">{target}</span>?
        </p>
        <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
          {winners} fan{winners === 1 ? "" : "s"} will earn points. Once settled,
          this bout&apos;s picks are final.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onConfirmDeclare(confirming)}
            disabled={isBusy}
            className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold disabled:opacity-50"
          >
            {isBusy ? "Settling…" : "Yes, settle"}
          </button>
          <button
            onClick={onCancelConfirm}
            disabled={isBusy}
            className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 text-[11px] font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
      <button
        onClick={() => onAskConfirm("fighter1")}
        disabled={isBusy || !bout.fighter1Name}
        className="px-3 py-2.5 rounded-md border-2 border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">
          {bout.fighter1Name || "Red"} wins
        </p>
        <p className="text-[10px] text-gray-500 tabular-nums mt-0.5">
          {f1Picks} pick{f1Picks === 1 ? "" : "s"} correct
        </p>
      </button>
      <button
        onClick={() => onAskConfirm("draw")}
        disabled={isBusy}
        className="px-3 py-2.5 rounded-md border-2 border-gray-200 bg-white hover:border-gray-500 text-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <p className="text-[11px] font-bold text-gray-900 leading-tight">Draw</p>
        <p className="text-[10px] text-gray-500 mt-0.5">no points</p>
      </button>
      <button
        onClick={() => onAskConfirm("fighter2")}
        disabled={isBusy || !bout.fighter2Name}
        className="px-3 py-2.5 rounded-md border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 text-right transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">
          {bout.fighter2Name || "Blue"} wins
        </p>
        <p className="text-[10px] text-gray-500 tabular-nums mt-0.5">
          {f2Picks} pick{f2Picks === 1 ? "" : "s"} correct
        </p>
      </button>
    </div>
  )
}

// ── Prizes Panel ──────────────────────────────────────────

function PrizesPanel({ fightNight }: { fightNight: FightNight }) {
  const { user: adminUser } = useAdminAuth()
  const [prizes, setPrizes] = useState<FightNightPrize[]>([])
  const [loading, setLoading] = useState(true)
  const [topN, setTopN] = useState(1)
  const [prizeLabel, setPrizeLabel] = useState(fightNight.prizeLabel || "BOXR Station prize")
  const [atEventOnly, setAtEventOnly] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [claimInstructions, setClaimInstructions] = useState(
    "Reply to this email by Sunday to claim. We'll coordinate pickup at the venue.",
  )
  const [notifyResult, setNotifyResult] = useState<{
    sent: number
    skipped: number
    errors: number
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPrizes(fightNight.id)
      setPrizes(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleAward() {
    if (!confirm(`Award the top ${topN} on the leaderboard?`)) return
    setBusy(true)
    try {
      await awardTopFinishers(fightNight.id, { topN, prizeLabel, atEventOnly })
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleClaim(prizeId: string) {
    setBusy(true)
    try {
      await markPrizeClaimed(
        fightNight.id,
        prizeId,
        adminUser?.uid || "",
        notesById[prizeId] || ""
      )
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleForfeit(prizeId: string) {
    if (!confirm("Mark forfeited?")) return
    setBusy(true)
    try {
      await markPrizeForfeited(
        fightNight.id,
        prizeId,
        adminUser?.uid || "",
        notesById[prizeId] || ""
      )
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handleNotify() {
    if (
      !confirm(
        "Send winner emails to all pending-prize recipients? This is a real send via Resend."
      )
    )
      return
    setBusy(true)
    setNotifyResult(null)
    try {
      const res = await notifyFightNightWinners(fightNight.id, claimInstructions)
      setNotifyResult(res)
    } finally {
      setBusy(false)
    }
  }

  const [recapResult, setRecapResult] = useState<{
    sent: number
    skipped: number
    errors: number
    firstError?: string
  } | null>(null)

  async function handleRecap() {
    if (
      !confirm(
        "Send the post-event recap email to every participant? Already-emailed users will be skipped (safe to re-run if a batch fails)."
      )
    )
      return
    setBusy(true)
    setRecapResult(null)
    try {
      const res = await sendFightNightRecap(fightNight.id, { claimInstructions })
      setRecapResult(res)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">
        Prizes
      </h3>

      {/* Award top N */}
      <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-3 mb-4">
        <p className="text-[10px] font-bold text-amber-700 tracking-[0.2em] uppercase mb-2">
          Award Top N
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <label className={labelClass}>TOP N</label>
            <input
              type="number"
              min={1}
              max={10}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>PRIZE LABEL</label>
            <input
              type="text"
              value={prizeLabel}
              onChange={(e) => setPrizeLabel(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={atEventOnly}
              onChange={(e) => setAtEventOnly(e.target.checked)}
              className="accent-[#FFB800]"
            />
            <span className="text-[11px] text-gray-700 font-medium">
              On-premises only (atEvent=true)
            </span>
          </label>
          <div className="flex-1" />
          <button
            onClick={handleAward}
            disabled={busy}
            className="px-4 py-1.5 bg-[#FFB800] text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {busy ? "Awarding…" : `Award Top ${topN}`}
          </button>
        </div>
      </div>

      {/* Notify winners */}
      {prizes.some((p) => p.status === "pending") && (
        <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-blue-700 tracking-[0.2em] uppercase mb-2">
            Email Winners
          </p>
          <div className="mb-2">
            <label className={labelClass}>CLAIM INSTRUCTIONS</label>
            <textarea
              rows={2}
              value={claimInstructions}
              onChange={(e) => setClaimInstructions(e.target.value)}
              className={inputClass + " resize-none"}
            />
          </div>
          {notifyResult && (
            <div className="mb-2 border border-green-200 bg-green-50 rounded px-2.5 py-1.5">
              <p className="text-[11px] text-green-700 font-medium">
                Sent {notifyResult.sent} · Skipped {notifyResult.skipped} (no email) · Errors{" "}
                {notifyResult.errors}
              </p>
            </div>
          )}
          <button
            onClick={handleNotify}
            disabled={busy}
            className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send Winner Emails"}
          </button>
        </div>
      )}

      {/* Post-event recap to everyone — fires personal stats + top finishers */}
      <div className="border border-gray-200 bg-gray-50/60 rounded-lg p-3 mb-4">
        <p className="text-[10px] font-bold text-gray-700 tracking-[0.2em] uppercase mb-1">
          Post-event Recap
        </p>
        <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
          Emails every participant their final standing, points, and the
          top three of the night. Prize winners get claim instructions
          inlined. Idempotent — re-running skips users who already received it.
        </p>
        {recapResult && (
          <div
            className={`mb-3 border rounded px-2.5 py-1.5 ${
              recapResult.errors > 0
                ? "border-amber-200 bg-amber-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <p
              className={`text-[11px] font-medium ${
                recapResult.errors > 0 ? "text-amber-700" : "text-green-700"
              }`}
            >
              Sent {recapResult.sent} · Skipped {recapResult.skipped} · Errors{" "}
              {recapResult.errors}
              {recapResult.firstError ? ` — ${recapResult.firstError}` : ""}
            </p>
          </div>
        )}
        <button
          onClick={handleRecap}
          disabled={busy}
          className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send Recap to All Participants"}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading prizes…</p>
      ) : prizes.length === 0 ? (
        <p className="text-gray-400 text-sm">No prizes awarded yet.</p>
      ) : (
        <div className="space-y-2">
          {prizes.map((prize) => (
            <div key={prize.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[10px] text-[#FFB800] font-bold tracking-[0.2em] uppercase">
                    #{prize.position} · {prize.status}
                  </p>
                  <p className="text-[13px] font-bold text-gray-900">
                    {prize.displayName || "Anonymous"}
                  </p>
                  <p className="text-[11px] text-gray-500">{prize.email || "no email"}</p>
                </div>
                <p className="text-[12px] font-bold tabular-nums text-gray-700">
                  {prize.pointsEarned.toLocaleString()} pts
                </p>
              </div>
              {prize.status === "pending" ? (
                <div>
                  <input
                    type="text"
                    value={notesById[prize.id] || ""}
                    onChange={(e) =>
                      setNotesById((m) => ({ ...m, [prize.id]: e.target.value }))
                    }
                    placeholder="Notes (e.g. picked up 9:32pm)"
                    className={inputClass + " mb-2"}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaim(prize.id)}
                      disabled={busy}
                      className="px-3 py-1.5 bg-green-600 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
                    >
                      Mark Claimed
                    </button>
                    <button
                      onClick={() => handleForfeit(prize.id)}
                      disabled={busy}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-md disabled:opacity-50"
                    >
                      Forfeit
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 italic">
                  {prize.notes || "—"}
                  {prize.claimedAt && (
                    <span className="ml-2 text-green-600 font-medium">
                      Claimed {new Date(prize.claimedAt).toLocaleString()}
                    </span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
