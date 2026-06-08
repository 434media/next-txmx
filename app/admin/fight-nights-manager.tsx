"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
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
  getPicksForBout,
  type FightNightPick,
} from "../actions/fightnight-picks"
import {
  awardTopFinishers,
  getPrizes,
  markPrizeClaimed,
  markPrizeForfeited,
  notifyFightNightWinners,
  type FightNightPrize,
} from "../actions/fightnight-prizes"
import { sendFightNightRecap, getRecapEmailPreview } from "../actions/fightnight-recap"
import {
  type FightNightPoll,
  createPoll,
  getPolls,
  closePoll,
  reopenPoll,
  deletePoll,
  updatePoll,
} from "../actions/fightnight-polls"
import {
  type FightNightProp,
  type PropStatus,
  createProp,
  getProps,
  updatePropStatus,
  updateProp,
  settleProp,
  voidProp,
  deleteProp,
} from "../actions/fightnight-props"
import { type FightNightStanding } from "../actions/fightnight-standings"
import { useAdminAuth } from "./admin-auth-gate"
import FlyerUploader from "./flyer-uploader"
import UserActivityDrawer from "./user-activity-drawer"
import Combobox, { type ComboboxOption } from "./combobox"
import FighterPicker from "./fighter-picker"
import GymPicker from "./gym-picker"
import { getFighters } from "../actions/fighters"
import { getGyms, type GymData } from "../actions/gyms"
import { type Fighter, WEIGHT_CLASSES } from "../../lib/types/fighter"

const inputClass =
  "w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/30 placeholder:text-gray-400 rounded-md"
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

// Solid status dots for the combobox picker.
const STATUS_DOT: Record<FightNightStatus, string> = {
  announced: "bg-blue-500",
  doors_open: "bg-amber-500",
  live: "bg-red-500",
  completed: "bg-green-500",
}

// Active-cell styling for the status segmented control.
const SEG_ACTIVE: Record<FightNightStatus, string> = {
  announced: "bg-blue-50 text-blue-700",
  doors_open: "bg-amber-50 text-amber-700",
  live: "bg-red-50 text-red-700",
  completed: "bg-green-50 text-green-700",
}

/** Section header with an optional one-line description (Vercel settings style). */
function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-gray-500 tracking-[0.15em] uppercase">
        {title}
      </p>
      {desc && <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>}
    </div>
  )
}

const ONBOARDING_KEY = "txmx-fn-onboarding-dismissed"

const ONBOARDING_STEPS: { title: string; desc: string }[] = [
  { title: "Set up the event", desc: "Title, venue, date, prize, and flyer in the Details tab." },
  { title: "Build the fight card", desc: "Add each bout in the Fight Card tab." },
  { title: "Add engagement", desc: "Optional polls and props fans play along with." },
  { title: "Run it live", desc: "Start each bout and declare winners in the Live tab." },
  { title: "Award prizes", desc: "Watch Standings, then award winners and send the recap." },
]

/** Dismissible "how it works" card. Replaces the static description and the
 * header stepper — explains the workflow + lifecycle, then gets out of the way.
 * Dismissal is remembered in localStorage with a small re-open affordance. */
function FightNightsOnboarding() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(localStorage.getItem(ONBOARDING_KEY) === "1")
  }, [])

  if (!mounted) return null

  if (dismissed) {
    return (
      <button
        onClick={() => {
          localStorage.removeItem(ONBOARDING_KEY)
          setDismissed(false)
        }}
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        How it works
      </button>
    )
  }

  return (
    <div className="relative border border-gray-200 rounded-xl bg-gray-50/60 p-5 mb-5">
      <button
        onClick={() => {
          localStorage.setItem(ONBOARDING_KEY, "1")
          setDismissed(true)
        }}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="text-sm font-bold text-gray-800 mb-1">How Fight Nights work</p>
      <p className="text-[12px] text-gray-500 mb-4 max-w-2xl">
        Each fight night is the live fan game for one event — build it, run it
        live, and award prizes. Fans play along on its public page.
      </p>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ONBOARDING_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold tabular-nums inline-flex items-center justify-center">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold text-gray-800 leading-tight">
                {s.title}
              </span>
              <span className="block text-[11px] text-gray-500 leading-snug mt-0.5">
                {s.desc}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="text-[11px] text-gray-400 mt-4">
        Status moves Announced → Doors Open → Live → Completed (set it in
        Details). Completed events show a recap on the public page.
      </p>
    </div>
  )
}

export default function FightNightsManager() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fnParam = searchParams.get("fn")

  const [fightNights, setFightNights] = useState<FightNight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>("")
  const [activeId, setActiveId] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Write `fn`/`tab` query params so the selected night + tab survive a
  // refresh and are shareable. Pass null to clear a param.
  const updateUrl = useCallback(
    (next: { fn?: string | null; tab?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.fn !== undefined) {
        if (next.fn) params.set("fn", next.fn)
        else params.delete("fn")
      }
      if (next.tab !== undefined) {
        if (next.tab) params.set("tab", next.tab)
        else params.delete("tab")
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Use the SAME selection logic as the public landing page so admin
      // and the featured night on `/fight-nights` resolve to the same event.
      // A `?fn=` in the URL wins; otherwise seed from the active night.
      const [data, active] = await Promise.all([
        getFightNights(),
        getActiveFightNight(),
      ])
      setFightNights(data)
      setActiveId(active?.id || "")
      const fromUrl = fnParam
        ? data.find((f) => f.slug === fnParam || f.id === fnParam)
        : null
      setSelectedId(
        (current) => current || fromUrl?.id || active?.id || data[0]?.id || ""
      )
    } finally {
      setLoading(false)
    }
  }, [fnParam])

  function selectNight(id: string) {
    setSelectedId(id)
    const fn = fightNights.find((f) => f.id === id)
    // Clear `tab` so the newly selected night opens on its status default.
    updateUrl({ fn: fn ? fn.slug || fn.id : null, tab: null })
  }

  useEffect(() => {
    load()
  }, [load])

  const selected = fightNights.find((f) => f.id === selectedId) || null

  // Group the picker so it's obvious what's current vs finished. The active
  // night (what the public site features) is pinned to the top of Upcoming.
  const upcoming = fightNights
    .filter((f) => f.status !== "completed")
    .sort((a, b) => {
      if (a.id === activeId) return -1
      if (b.id === activeId) return 1
      return (a.date || "").localeCompare(b.date || "")
    })
  const past = fightNights
    .filter((f) => f.status === "completed")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  const nightOptions: ComboboxOption[] = [
    ...upcoming.map((fn) => ({
      value: fn.id,
      label: fn.title || "(untitled)",
      hint: `${fn.date || "TBD"}${fn.id === activeId ? " · Active" : ""}`,
      dotClass: STATUS_DOT[fn.status],
      group: "Live / Upcoming",
    })),
    ...past.map((fn) => ({
      value: fn.id,
      label: fn.title || "(untitled)",
      hint: fn.date || "TBD",
      dotClass: STATUS_DOT[fn.status],
      group: "Past",
    })),
  ]

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
      updateUrl({ fn: fn.slug || fn.id, tab: null })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      {/* What this page does — dismissible onboarding */}
      <FightNightsOnboarding />

      {/* Fight-night picker (grouped, status dots) + create button */}
      <div className="flex items-center gap-3 mb-5">
        <Combobox
          value={selectedId}
          onSelect={selectNight}
          options={nightOptions}
          placeholder="Select a fight night…"
          searchPlaceholder="Search fight nights…"
          ariaLabel="Select fight night"
          className="max-w-md flex-1"
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
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
  | "details"
  | "card"
  | "polls"
  | "props"
  | "live"
  | "standings"
  | "prizes"

const TABS: { key: DetailTab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "card", label: "Fight Card" },
  { key: "polls", label: "Polls" },
  { key: "props", label: "Props" },
  { key: "live", label: "Live" },
  { key: "standings", label: "Standings" },
  { key: "prizes", label: "Prizes" },
]

/** The tab to open by default for a given lifecycle stage — so a new event
 * lands on setup, and a running event lands on the command center. Overridden
 * by an explicit `?tab=` in the URL. */
function defaultTabForStatus(status: FightNightStatus): DetailTab {
  switch (status) {
    case "announced":
      return "details"
    case "doors_open":
    case "live":
      return "live"
    case "completed":
      return "standings"
    default:
      return "details"
  }
}

function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 w-full text-left"
    >
      <span>
        <span className="block text-[13px] font-medium text-gray-800">{label}</span>
        {hint && <span className="block text-[11px] text-gray-400 mt-0.5">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  )
}

function FightNightDetail({
  fightNight,
  onChange,
}: {
  fightNight: FightNight
  onChange: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlTab = searchParams.get("tab")
  const initialTab: DetailTab =
    urlTab && TABS.some((t) => t.key === urlTab)
      ? (urlTab as DetailTab)
      : defaultTabForStatus(fightNight.status)
  const [tab, setTabState] = useState<DetailTab>(initialTab)

  // Switching a tab writes `?tab=` (preserving `fn`) so refresh / back-forward
  // / shared links land on the same tab.
  const setTab = useCallback(
    (next: DetailTab) => {
      setTabState(next)
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", next)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )
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
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/fight-nights/${fightNight.slug || fightNight.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md px-2 py-1 transition-colors"
            >
              View live page
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
            <span
              className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLES[fightNight.status]}`}
            >
              {STATUS_LABELS[fightNight.status]}
            </span>
          </div>
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
        {tab === "details" && (
          <MetadataPanel fightNight={fightNight} onChange={onChange} />
        )}
        {tab === "card" && <BoutsPanel fightNight={fightNight} />}
        {tab === "polls" && <PollsPanel fightNight={fightNight} />}
        {tab === "props" && <PropsPanel fightNight={fightNight} />}
        {tab === "live" && <LivePanel fightNight={fightNight} />}
        {tab === "standings" && (
          <StandingsPanel
            fightNight={fightNight}
            onDrillDown={setDrilldownUserId}
          />
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

// ── Standings Panel (one live board: ranked + roster) ──────

/**
 * The single Standings view. One live subscription feeds a ranked leaderboard
 * (default) and a "just joined" roster behind a sort toggle — so the admin gets
 * who's-winning, who's-joining, total, velocity, and search without two stacked
 * scroll areas. The indicator follows event status: Live only during
 * doors/live, Final once completed, Not started before.
 */
function StandingsPanel({
  fightNight,
  onDrillDown,
}: {
  fightNight: FightNight
  onDrillDown: (userId: string) => void
}) {
  const [participants, setParticipants] = useState<FightNightStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"rank" | "joined">("rank")

  // Minute tick keeps "joined Xm ago" + the velocity count fresh.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])

  // One live subscription drives both views. Ordered by joinedAt so the roster
  // + velocity are correct; ranking is a client-side sort over the same set.
  useEffect(() => {
    const q = query(
      collection(db, "fightNights", fightNight.id, "standings"),
      orderBy("joinedAt", "desc"),
      fbLimit(500)
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

  const last10m = (() => {
    void tick
    const now = Date.now()
    let n = 0
    for (const p of participants) {
      if (now - new Date(p.joinedAt).getTime() < 10 * 60_000) n++
    }
    return n
  })()

  // True leaderboard position by points over everyone (not the filtered view),
  // so the rank shown stays correct even while searching.
  const rankByUser = (() => {
    const ranked = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0))
    const m = new Map<string, number>()
    ranked.forEach((p, i) => m.set(p.userId, i + 1))
    return m
  })()

  // Status-aware live indicator.
  const live =
    fightNight.status === "doors_open" || fightNight.status === "live"
  const liveLabel = live
    ? "Live"
    : fightNight.status === "completed"
      ? "Final"
      : "Not started"

  const term = search.trim().toLowerCase()
  const filtered = term
    ? participants.filter(
        (p) =>
          (p.displayName || "").toLowerCase().includes(term) ||
          (p.email || "").toLowerCase().includes(term)
      )
    : participants
  const rows =
    sort === "rank"
      ? [...filtered].sort((a, b) => (b.points || 0) - (a.points || 0))
      : [...filtered].sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        )

  return (
    <section className="border border-gray-200 rounded-xl bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
              Standings
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase ${
                live ? "text-emerald-700" : "text-gray-400"
              }`}
            >
              {live && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {liveLabel}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-900 text-lg font-bold tabular-nums leading-none">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">
              Players
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setSort("rank")}
              className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                sort === "rank"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rank
            </button>
            <button
              type="button"
              onClick={() => setSort("joined")}
              className={`px-3 py-1.5 text-[11px] font-semibold border-l border-gray-200 transition-colors ${
                sort === "joined"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Just joined
            </button>
          </div>
          {last10m > 0 && (
            <CountTile label="Joined · last 10 min" value={last10m} />
          )}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className={inputClass}
        />
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {loading ? (
          <p className="px-5 py-8 text-gray-400 text-sm text-center">Loading…</p>
        ) : participants.length === 0 ? (
          <p className="px-5 py-8 text-gray-400 text-sm text-center">
            {fightNight.status === "completed"
              ? "No one played this fight night."
              : "No players yet. Standings fill in live as fans join and pick winners."}
          </p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-gray-400 text-sm text-center">
            No one matches &ldquo;{search}&rdquo;.
          </p>
        ) : (
          rows.map((p) => (
            <StandingRow
              key={p.userId}
              entry={p}
              rank={rankByUser.get(p.userId) ?? 0}
              mode={sort}
              onClick={() => onDrillDown(p.userId)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function StandingRow({
  entry,
  rank,
  mode,
  onClick,
}: {
  entry: FightNightStanding
  rank: number
  mode: "rank" | "joined"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
    >
      <div className="w-14 shrink-0">
        {mode === "rank" ? (
          <p className="text-[13px] font-bold tabular-nums text-gray-400">#{rank}</p>
        ) : (
          <p className="text-[11px] text-gray-500 font-medium tabular-nums">
            {formatRelativeTime(entry.joinedAt)}
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-gray-900 truncate">
          {entry.displayName || "Anonymous"}
        </p>
        <p className="text-[11px] text-gray-500 truncate">{entry.email || "—"}</p>
      </div>

      <div className="text-right w-24 shrink-0">
        <p className="text-[13px] text-gray-900 font-bold tabular-nums">
          {(entry.points || 0).toLocaleString()}
          <span className="text-gray-400 text-[11px] font-medium ml-1">pts</span>
        </p>
        <p className="text-[10px] text-gray-500 tabular-nums">
          {entry.picksWon || 0}/{entry.picksMade || 0} picks
        </p>
      </div>
    </button>
  )
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 rounded-md px-3 py-1.5">
      <span className="text-base font-bold tabular-nums leading-none text-emerald-700">
        {value}
      </span>
      <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-700/80">
        {label}
      </span>
    </div>
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

// ── Props Panel ────────────────────────────────────────────

function PropsPanel({ fightNight }: { fightNight: FightNight }) {
  const [props, setProps] = useState<FightNightProp[]>([])
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [pointsReward, setPointsReward] = useState(500)
  const [isUnderdog, setIsUnderdog] = useState(false)
  const [boutNumber, setBoutNumber] = useState<number | "">("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Inline-edit state — when set, the matching prop row swaps to a form.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [editPointsReward, setEditPointsReward] = useState(500)
  const [editIsUnderdog, setEditIsUnderdog] = useState(false)
  const [editBoutNumber, setEditBoutNumber] = useState<number | "">("")
  const [editError, setEditError] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [propData, boutData] = await Promise.all([
        getProps(fightNight.id),
        getBouts(fightNight.id),
      ])
      setProps(propData)
      setBouts(boutData)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate() {
    setError("")
    const opts = options.map((o) => o.trim()).filter(Boolean)
    if (!title.trim()) {
      setError("Title required")
      return
    }
    if (opts.length < 2) {
      setError("At least 2 options required")
      return
    }
    setCreating(true)
    try {
      await createProp(fightNight.id, {
        title,
        description,
        options: opts.map((label) => ({ label })),
        pointsReward,
        isUnderdog,
        boutNumber: typeof boutNumber === "number" ? boutNumber : null,
      })
      setTitle("")
      setDescription("")
      setOptions(["", ""])
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

  function startEdit(prop: FightNightProp) {
    setEditingId(prop.id)
    setEditTitle(prop.title)
    setEditDescription(prop.description)
    setEditOptions(prop.options.map((o) => o.label))
    setEditPointsReward(prop.pointsReward)
    setEditIsUnderdog(prop.isUnderdog)
    setEditBoutNumber(prop.boutNumber ?? "")
    setEditError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError("")
  }

  async function saveEdit(propId: string) {
    setEditError("")
    const lines = editOptions.map((l) => l.trim()).filter(Boolean)
    if (!editTitle.trim()) {
      setEditError("Title required")
      return
    }
    if (lines.length < 2) {
      setEditError("At least 2 options required")
      return
    }
    const original = props.find((p) => p.id === propId)
    // Preserve option IDs by position so existing picks still resolve.
    // Lines beyond the original count become brand-new options (server
    // will mint a fresh id). Reordering is treated as relabeling — admins
    // who actually want a fresh structure should delete + recreate.
    const options = lines.map((label, i) => ({
      id: original?.options[i]?.id,
      label,
    }))
    setSavingEdit(true)
    try {
      await updateProp(fightNight.id, propId, {
        title: editTitle,
        description: editDescription,
        options,
        pointsReward: editPointsReward,
        isUnderdog: editIsUnderdog,
        boutNumber: typeof editBoutNumber === "number" ? editBoutNumber : null,
      })
      setEditingId(null)
      await load()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingEdit(false)
    }
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
          className="text-[12px] font-semibold text-gray-900 hover:text-gray-800 tracking-wider transition-colors"
        >
          {showCreate ? "Cancel" : "+ New Prop"}
        </button>
      </div>

      {showCreate && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-2">
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
              <label className={labelClass}>OPTIONS (2+ required)</label>
              <OptionRows options={options} onChange={setOptions} />
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
              <label className={labelClass}>LINKED BOUT (optional)</label>
              <BoutSelect bouts={bouts} value={boutNumber} onChange={setBoutNumber} />
            </div>
            <div className="sm:col-span-2 flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderdog}
                  onChange={(e) => setIsUnderdog(e.target.checked)}
                  className="accent-gray-900"
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
            className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
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
          {props.map((prop) => {
            if (editingId === prop.id) {
              return (
                <div
                  key={prop.id}
                  className="border border-gray-200 bg-gray-50 rounded-lg p-3"
                >
                  <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-2">
                    Editing Prop
                  </p>
                  {editError && (
                    <p className="text-red-600 text-xs mb-2">{editError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>TITLE</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>DESCRIPTION (optional)</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>OPTIONS (2+ required)</label>
                      <OptionRows options={editOptions} onChange={setEditOptions} />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Order matters: each row maps to the existing option in the same
                        slot, so picks survive label edits. Adding rows creates new
                        options; removing rows orphans any picks on them.
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>POINTS</label>
                      <input
                        type="number"
                        min={1}
                        value={editPointsReward}
                        onChange={(e) =>
                          setEditPointsReward(Number(e.target.value))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>LINKED BOUT (optional)</label>
                      <BoutSelect
                        bouts={bouts}
                        value={editBoutNumber}
                        onChange={setEditBoutNumber}
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsUnderdog}
                          onChange={(e) => setEditIsUnderdog(e.target.checked)}
                          className="accent-gray-900"
                        />
                        <span className="text-[11px] text-gray-700 font-medium">
                          Underdog (1.25× payout)
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(prop.id)}
                      disabled={savingEdit}
                      className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={savingEdit}
                      className="px-3 py-1.5 text-[11px] text-gray-600 hover:text-gray-900 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }

            return (
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
                  {prop.isUnderdog && (
                    <span className="text-gray-900 font-semibold">Underdog 1.25×</span>
                  )}
                  {prop.boutNumber && <span>· Bout {prop.boutNumber}</span>}
                </div>

                {/* Actions per status */}
                {prop.status === "open" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(prop)}
                      className="text-[11px] px-3 py-1 rounded-md text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleLock(prop.id)}
                      className="text-[11px] px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
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
                      onClick={() => startEdit(prop)}
                      className="text-[11px] px-3 py-1 rounded-md text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleUnlock(prop.id, prop.boutNumber)}
                      className="text-[11px] px-3 py-1 rounded-md text-gray-500 hover:text-gray-900"
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

                {prop.status === "voided" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(prop)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="text-[11px] text-gray-300 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {prop.status === "settled" && (
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="text-[11px] text-gray-300 hover:text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Polls Panel ────────────────────────────────────────────

/** Links a poll/prop to a real bout on the card (or none). */
function BoutSelect({
  bouts,
  value,
  onChange,
}: {
  bouts: FightNightBout[]
  value: number | ""
  onChange: (v: number | "") => void
}) {
  const options: ComboboxOption[] = [
    { value: "", label: "Not tied to a bout" },
    ...bouts.map((b) => ({
      value: String(b.boutNumber),
      label: `Bout ${b.boutNumber} — ${b.fighter1Name || "TBA"} vs ${b.fighter2Name || "TBA"}`,
    })),
  ]
  return (
    <Combobox
      value={value === "" ? "" : String(value)}
      options={options}
      onSelect={(v) => onChange(v === "" ? "" : Number(v))}
      placeholder="Not tied to a bout"
      searchPlaceholder="Search bouts…"
      ariaLabel="Linked bout"
    />
  )
}

/** Editable list of option strings with add/remove (min 2). */
function OptionRows({
  options,
  onChange,
}: {
  options: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={opt}
            onChange={(e) => onChange(options.map((o, j) => (j === i ? e.target.value : o)))}
            placeholder={`Option ${i + 1}`}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(options.filter((_, j) => j !== i))}
            disabled={options.length <= 2}
            aria-label="Remove option"
            className="shrink-0 w-7 h-7 inline-flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...options, ""])}
        className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        + Add option
      </button>
    </div>
  )
}

function PollsPanel({ fightNight }: { fightNight: FightNight }) {
  const [polls, setPolls] = useState<FightNightPoll[]>([])
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [boutNumber, setBoutNumber] = useState<number | "">("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  // Inline-edit state — when set, the matching poll row swaps to a form.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [editBoutNumber, setEditBoutNumber] = useState<number | "">("")
  const [editError, setEditError] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pollData, boutData] = await Promise.all([
        getPolls(fightNight.id, "all"),
        getBouts(fightNight.id),
      ])
      setPolls(pollData)
      setBouts(boutData)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  function resetCreate() {
    setQuestion("")
    setOptions(["", ""])
    setBoutNumber("")
    setError("")
  }

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate() {
    setError("")
    const opts = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim()) {
      setError("Question required")
      return
    }
    if (opts.length < 2) {
      setError("At least 2 options required")
      return
    }
    setCreating(true)
    try {
      await createPoll(fightNight.id, {
        question,
        options: opts,
        boutNumber: typeof boutNumber === "number" ? boutNumber : null,
      })
      resetCreate()
      setShowCreate(false)
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

  async function handleReopen(pollId: string) {
    await reopenPoll(fightNight.id, pollId)
    await load()
  }

  async function handleDelete(poll: FightNightPoll) {
    const warn =
      poll.totalVotes > 0
        ? ` ${poll.totalVotes} vote${poll.totalVotes === 1 ? "" : "s"} will be orphaned.`
        : ""
    if (!confirm(`Delete this poll?${warn}`)) return
    await deletePoll(fightNight.id, poll.id)
    await load()
  }

  function startEdit(poll: FightNightPoll) {
    setEditingId(poll.id)
    setEditQuestion(poll.question)
    setEditOptions(poll.options.map((o) => o.label))
    setEditBoutNumber(poll.boutNumber ?? "")
    setEditError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError("")
  }

  async function saveEdit(pollId: string) {
    setEditError("")
    const opts = editOptions.map((o) => o.trim()).filter(Boolean)
    if (!editQuestion.trim()) {
      setEditError("Question required")
      return
    }
    if (opts.length < 2) {
      setEditError("At least 2 options required")
      return
    }
    const original = polls.find((p) => p.id === pollId)
    const optionCountChanged =
      !!original && opts.length !== original.options.length
    if (
      optionCountChanged &&
      original &&
      original.totalVotes > 0 &&
      !confirm(
        `This poll has ${original.totalVotes} vote${original.totalVotes === 1 ? "" : "s"}. Changing the number of options will reset all vote tallies to 0. Continue?`
      )
    ) {
      return
    }
    setSavingEdit(true)
    try {
      await updatePoll(fightNight.id, pollId, {
        question: editQuestion,
        options: opts,
        boutNumber: typeof editBoutNumber === "number" ? editBoutNumber : null,
      })
      setEditingId(null)
      await load()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <section className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Polls
        </h3>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="text-[12px] font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            + New poll
          </button>
        )}
      </div>

      {showCreate && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
              New Poll
            </p>
            <button
              onClick={() => {
                setShowCreate(false)
                resetCreate()
              }}
              aria-label="Cancel"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
          <div className="space-y-2 mb-2">
            <div>
              <label className={labelClass}>QUESTION</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder='e.g. "Will the main event go to decision?"'
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>OPTIONS (2+ required)</label>
              <OptionRows options={options} onChange={setOptions} />
            </div>
            <div>
              <label className={labelClass}>LINKED BOUT (optional)</label>
              <BoutSelect bouts={bouts} value={boutNumber} onChange={setBoutNumber} />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Poll"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading polls…</p>
      ) : polls.length === 0 ? (
        <p className="text-gray-400 text-sm">No polls yet.</p>
      ) : (
        <div className="space-y-2">
          {polls.map((poll) => {
            const isEditing = editingId === poll.id
            if (isEditing) {
              return (
                <div
                  key={poll.id}
                  className="border border-gray-200 bg-gray-50 rounded-lg p-3"
                >
                  <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-2">
                    Editing Poll
                  </p>
                  {editError && (
                    <p className="text-red-600 text-xs mb-2">{editError}</p>
                  )}
                  <div className="space-y-2 mb-2">
                    <div>
                      <label className={labelClass}>QUESTION</label>
                      <input
                        type="text"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>OPTIONS (2+ required)</label>
                      <OptionRows options={editOptions} onChange={setEditOptions} />
                      {poll.totalVotes > 0 && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"} cast.
                          Editing labels keeps tallies; adding/removing options resets them.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>LINKED BOUT (optional)</label>
                      <BoutSelect
                        bouts={bouts}
                        value={editBoutNumber}
                        onChange={setEditBoutNumber}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(poll.id)}
                      disabled={savingEdit}
                      className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={savingEdit}
                      className="px-3 py-1.5 text-[11px] text-gray-600 hover:text-gray-900 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }

            const linkedBout =
              poll.boutNumber != null
                ? bouts.find((b) => b.boutNumber === poll.boutNumber)
                : null

            return (
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
                  <span className="text-[10px] text-gray-400 truncate min-w-0">
                    {poll.totalVotes} votes
                    {linkedBout
                      ? ` · Bout ${linkedBout.boutNumber}: ${linkedBout.fighter1Name || "TBA"} vs ${linkedBout.fighter2Name || "TBA"}`
                      : poll.boutNumber != null
                        ? ` · Bout ${poll.boutNumber}`
                        : ""}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => startEdit(poll)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold shrink-0"
                  >
                    Edit
                  </button>
                  {poll.status === "open" ? (
                    <button
                      onClick={() => handleClose(poll.id)}
                      className="text-[10px] text-gray-600 hover:text-gray-900 font-semibold shrink-0"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(poll.id)}
                      className="text-[10px] text-gray-600 hover:text-gray-900 font-semibold shrink-0"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(poll)}
                    className="text-[10px] text-gray-300 hover:text-red-500 font-semibold shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Metadata Panel ──────────────────────────────────────────

/** Client-side slug normalizer — mirrors the server's `slugify` for live
 * preview/suggestions. The server remains the source of truth for uniqueness. */
function clientSlugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
}

function MetadataPanel({
  fightNight,
  onChange,
}: {
  fightNight: FightNight
  onChange: () => void
}) {
  const initial = {
    slug: fightNight.slug,
    title: fightNight.title,
    subtitle: fightNight.subtitle,
    venue: fightNight.venue,
    city: fightNight.city,
    address: fightNight.address,
    date: fightNight.date,
    status: fightNight.status,
    flyerUrl: fightNight.flyerUrl,
    prizeLabel: fightNight.prizeLabel,
    prizeDetails: fightNight.prizeDetails,
    promoCopy: fightNight.promoCopy,
    propsEnabled: fightNight.propsEnabled,
    pollsEnabled: fightNight.pollsEnabled,
  }
  const [edit, setEdit] = useState(initial)
  // Saved baseline — drives the dirty state (and updates on save / flyer upload).
  const [baseline, setBaseline] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const dirty = JSON.stringify(edit) !== JSON.stringify(baseline)
  const canSave = edit.title.trim().length > 0

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await updateFightNight(fightNight.id, edit)
      setBaseline(edit)
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

  const sectionClass = "border border-gray-200 rounded-xl p-5 bg-white"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
            Event Details
          </h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            How this fight night appears on its public page.
          </p>
        </div>
        {savedAt && !dirty && (
          <p className="text-[11px] text-green-600 font-medium shrink-0">Saved {savedAt}</p>
        )}
      </div>

      {/* Basics */}
      <div className={sectionClass}>
        <SectionHead title="Basics" desc="What this event is and where it lives in the URL." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              TITLE <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={edit.title}
              onChange={(e) => setEdit((d) => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Members Only Fight Night"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>PUBLIC URL SLUG</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={edit.slug}
                onChange={(e) =>
                  setEdit((d) => ({ ...d, slug: clientSlugify(e.target.value) }))
                }
                placeholder="auto-generated from title + date"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setEdit((d) => ({
                    ...d,
                    slug: clientSlugify([d.title, d.date].filter(Boolean).join(" ")),
                  }))
                }
                className="shrink-0 px-3 py-2 text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Suggest
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              /fight-nights/
              <span className="text-gray-600 font-medium">{edit.slug || "…"}</span>
              {" · "}must be unique; clearing it regenerates from the title on save.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>SUBTITLE / EYEBROW</label>
            <input
              type="text"
              value={edit.subtitle}
              onChange={(e) => setEdit((d) => ({ ...d, subtitle: e.target.value }))}
              placeholder="e.g. BOXR Station Presents"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>STATUS</label>
            <div className="flex rounded-md border border-gray-200 overflow-hidden">
              {(["announced", "doors_open", "live", "completed"] as FightNightStatus[]).map(
                (s, i) => {
                  const active = edit.status === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEdit((d) => ({ ...d, status: s }))}
                      className={`flex-1 px-2 py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                        i > 0 ? "border-l border-gray-200" : ""
                      } ${active ? SEG_ACTIVE[s] : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* When & where */}
      <div className={sectionClass}>
        <SectionHead title="When & where" desc="Date and location shown on the public page." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>DATE</label>
            <input
              type="date"
              value={edit.date}
              onChange={(e) => setEdit((d) => ({ ...d, date: e.target.value }))}
              className={inputClass}
            />
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
          <div>
            <label className={labelClass}>ADDRESS</label>
            <input
              type="text"
              value={edit.address}
              onChange={(e) => setEdit((d) => ({ ...d, address: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Promotion */}
      <div className={sectionClass}>
        <SectionHead title="Promotion" desc="Flyer, prize, and copy shown on the public page and in emails." />
        <div className="space-y-3">
          <FlyerUploader
            fightNightId={fightNight.id}
            currentUrl={edit.flyerUrl}
            onUploaded={async (url) => {
              // Flyer persists immediately, so update the baseline too — it
              // shouldn't register as an unsaved change.
              setEdit((d) => ({ ...d, flyerUrl: url }))
              setBaseline((b) => ({ ...b, flyerUrl: url }))
              try {
                await updateFightNight(fightNight.id, { flyerUrl: url })
                onChange()
              } catch {
                // Non-critical — local state still reflects the new URL
              }
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
          <div>
            <label className={labelClass}>PROMO COPY</label>
            <textarea
              rows={3}
              value={edit.promoCopy}
              onChange={(e) => setEdit((d) => ({ ...d, promoCopy: e.target.value }))}
              placeholder="Short copy shown on the landing page"
              className={inputClass + " resize-none"}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className={sectionClass}>
        <SectionHead title="Features" desc="Toggle the engagement modules fans see during the event." />
        <div className="space-y-3">
          <Switch
            checked={edit.propsEnabled}
            onChange={(v) => setEdit((d) => ({ ...d, propsEnabled: v }))}
            label="Prop picks"
            hint="Show prediction props on the fight night page."
          />
          <div className="border-t border-gray-100" />
          <Switch
            checked={edit.pollsEnabled}
            onChange={(v) => setEdit((d) => ({ ...d, pollsEnabled: v }))}
            label="Fan polls"
            hint="Show live polls on the fight night page."
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-xl p-5 bg-red-50/40">
        <p className="text-[11px] font-semibold text-red-600 tracking-[0.15em] uppercase mb-1">
          Danger zone
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[12px] text-gray-600 max-w-md">
            Permanently delete this fight night. Bouts, picks, standings, and
            prizes are not auto-removed.
          </p>
          <button
            onClick={handleDelete}
            className="shrink-0 px-4 py-2 text-[12px] font-semibold text-red-600 border border-red-300 hover:bg-red-100 rounded-md transition-colors"
          >
            Delete fight night
          </button>
        </div>
      </div>

      {/* Unsaved-changes bar — appears only when there are pending edits */}
      {dirty && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 border border-gray-200 rounded-xl bg-white shadow-lg px-4 py-3">
          <p className="text-[12px] text-gray-600 font-medium">
            {canSave ? "You have unsaved changes" : "Title is required to save"}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEdit(baseline)}
              disabled={saving}
              className="px-3 py-2 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="px-5 py-2 bg-gray-900 text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bouts Panel ────────────────────────────────────────────

/** Weight-class picker: the 18 standard boxing divisions, with the Combobox's
 * create row handling catchweights / custom values (type it, then "Use …"). */
function WeightClassField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const options: ComboboxOption[] = WEIGHT_CLASSES.map((w) => ({ value: w, label: w }))

  return (
    <Combobox
      value={value}
      options={options}
      onSelect={onChange}
      placeholder="Select weight class"
      searchPlaceholder="Search or type a catchweight…"
      ariaLabel="Weight class"
      createSlot={(query, close) => (
        <button
          type="button"
          onClick={() => {
            onChange(query)
            close()
          }}
          className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          Use &ldquo;{query}&rdquo;
        </button>
      )}
    />
  )
}

function BoutsPanel({ fightNight }: { fightNight: FightNight }) {
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [fighters, setFighters] = useState<Fighter[]>([])
  const [gyms, setGyms] = useState<GymData[]>([])
  const [loading, setLoading] = useState(true)
  // Bout number to auto-open in edit mode (the one just added).
  const [openBout, setOpenBout] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBouts(fightNight.id)
      setBouts(data)
    } finally {
      setLoading(false)
    }
  }, [fightNight.id])

  const loadFighters = useCallback(async () => {
    setFighters(await getFighters())
  }, [])

  const loadGyms = useCallback(async () => {
    setGyms(await getGyms())
  }, [])

  useEffect(() => {
    load()
    loadFighters()
    loadGyms()
  }, [load, loadFighters, loadGyms])

  async function handleAdd() {
    const next = bouts.length === 0 ? 1 : Math.max(...bouts.map((b) => b.boutNumber)) + 1
    await upsertBout(fightNight.id, next, {})
    setOpenBout(next)
    await load()
  }

  // Drag-to-reorder. boutNumber — the picks/props key — never changes; only the
  // display `order` is rewritten to the new positions.
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  async function handleReorder(from: number, to: number) {
    if (from === to) return
    const next = [...bouts]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const reordered = next.map((b, idx) => ({ ...b, order: idx + 1 }))
    setBouts(reordered) // optimistic — snap into place immediately
    await Promise.all(
      reordered.map((b) => upsertBout(fightNight.id, b.boutNumber, { order: b.order }))
    )
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
          className="text-[12px] font-semibold text-gray-900 hover:text-gray-800 tracking-wider transition-colors"
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
          {bouts.map((bout, index) => (
            <BoutRow
              key={bout.boutNumber}
              fightNightId={fightNight.id}
              bout={bout}
              fighters={fighters}
              gyms={gyms}
              onFightersChanged={loadFighters}
              onGymsChanged={loadGyms}
              defaultEdit={bout.boutNumber === openBout}
              index={index}
              dragging={dragIndex === index}
              dropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => setOverIndex(index)}
              onDrop={() => {
                if (dragIndex !== null) handleReorder(dragIndex, index)
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
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
  fighters,
  gyms,
  onFightersChanged,
  onGymsChanged,
  defaultEdit = false,
  index,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
  onChange,
}: {
  fightNightId: string
  bout: FightNightBout
  fighters: Fighter[]
  gyms: GymData[]
  onFightersChanged: () => void
  onGymsChanged: () => void
  defaultEdit?: boolean
  index: number
  dragging: boolean
  dropTarget: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDrop: () => void
  onDragEnd: () => void
  onChange: () => void
}) {
  const [edit, setEdit] = useState(defaultEdit)
  const [data, setData] = useState({
    fighter1Name: bout.fighter1Name,
    fighter1Gym: bout.fighter1Gym,
    fighter1Id: bout.fighter1Id || "",
    fighter1Slug: bout.fighter1Slug || "",
    fighter1Nickname: bout.fighter1Nickname || "",
    fighter1PhotoUrl: bout.fighter1PhotoUrl || "",
    fighter1Record: bout.fighter1Record || "",
    fighter1Kos: bout.fighter1Kos || 0,
    fighter2Name: bout.fighter2Name,
    fighter2Gym: bout.fighter2Gym,
    fighter2Id: bout.fighter2Id || "",
    fighter2Slug: bout.fighter2Slug || "",
    fighter2Nickname: bout.fighter2Nickname || "",
    fighter2PhotoUrl: bout.fighter2PhotoUrl || "",
    fighter2Record: bout.fighter2Record || "",
    fighter2Kos: bout.fighter2Kos || 0,
    weightClass: bout.weightClass,
    isMainEvent: bout.isMainEvent,
  })
  const [saving, setSaving] = useState(false)

  const canSave =
    data.fighter1Name.trim() !== "" && data.fighter2Name.trim() !== ""

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await upsertBout(fightNightId, bout.boutNumber, data)
      setEdit(false)
      onChange()
    } finally {
      setSaving(false)
    }
  }

  // Cancelling a bout that was never given fighters removes the empty stub
  // (the "+ Add Bout" placeholder) rather than leaving a TBA row behind.
  async function handleCancel() {
    if (!bout.fighter1Name && !bout.fighter2Name) {
      await deleteBout(fightNightId, bout.boutNumber)
      onChange()
    } else {
      setEdit(false)
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
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={onDragEnter}
        onDrop={(e) => {
          e.preventDefault()
          onDrop()
        }}
        className={`rounded-lg px-3 py-2 flex items-center gap-3 transition-all border ${
          dragging ? "opacity-40" : ""
        } ${dropTarget ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-100"}`}
      >
        <span
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("text/plain", String(index))
            onDragStart()
          }}
          onDragEnd={onDragEnd}
          aria-label="Drag to reorder"
          title="Drag to reorder"
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 -ml-1 select-none"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="9" cy="6" r="1.4" />
            <circle cx="15" cy="6" r="1.4" />
            <circle cx="9" cy="12" r="1.4" />
            <circle cx="15" cy="12" r="1.4" />
            <circle cx="9" cy="18" r="1.4" />
            <circle cx="15" cy="18" r="1.4" />
          </svg>
        </span>
        <span className="text-[10px] font-mono text-gray-300 w-6">#{bout.boutNumber}</span>
        {(bout.fighter1Name || bout.fighter2Name) && (
          <div className="flex -space-x-1.5 shrink-0">
            <FighterAvatar url={bout.fighter1PhotoUrl} name={bout.fighter1Name} className="w-7 h-7 text-[11px] ring-1 ring-white" rounded="rounded-full" />
            <FighterAvatar url={bout.fighter2PhotoUrl} name={bout.fighter2Name} className="w-7 h-7 text-[11px] ring-1 ring-white" rounded="rounded-full" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-gray-800 truncate">
            <span className="font-semibold">{bout.fighter1Name || "TBA"}</span>
            <span className="text-gray-300 mx-1.5">vs</span>
            <span className="font-semibold">{bout.fighter2Name || "TBA"}</span>
          </p>
          <p className="text-[10px] text-gray-400">
            {bout.weightClass || "—"}
            {bout.isMainEvent && (
              <span className="ml-2 text-gray-900 font-semibold">MAIN EVENT</span>
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
          className="text-[10px] text-gray-400 hover:text-gray-900 px-1.5 py-1"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-[10px] text-gray-300 hover:text-red-500 px-1.5 py-1"
        >
          Delete
        </button>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
      <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] mb-2">
        BOUT #{bout.boutNumber}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className={labelClass}>FIGHTER 1</label>
          <FighterPicker
            fighters={fighters}
            value={data.fighter1Name}
            onPick={(p) =>
              setData((d) => ({
                ...d,
                fighter1Name: p.name,
                fighter1Gym: p.gym || d.fighter1Gym,
                fighter1Id: p.id,
                fighter1Slug: p.slug,
                fighter1Nickname: p.nickname,
                fighter1PhotoUrl: p.photoUrl,
                fighter1Record: p.record,
                fighter1Kos: p.kos,
                weightClass: p.weightClass || d.weightClass,
              }))
            }
            defaultGym={data.fighter1Gym}
            defaultWeightClass={data.weightClass}
            onFightersChanged={onFightersChanged}
          />
        </div>
        <div>
          <label className={labelClass}>F1 GYM</label>
          <GymPicker
            gyms={gyms}
            value={data.fighter1Gym}
            onChange={(name) => setData((d) => ({ ...d, fighter1Gym: name }))}
            onGymsChanged={onGymsChanged}
          />
        </div>
        <div>
          <label className={labelClass}>FIGHTER 2</label>
          <FighterPicker
            fighters={fighters}
            value={data.fighter2Name}
            onPick={(p) =>
              setData((d) => ({
                ...d,
                fighter2Name: p.name,
                fighter2Gym: p.gym || d.fighter2Gym,
                fighter2Id: p.id,
                fighter2Slug: p.slug,
                fighter2Nickname: p.nickname,
                fighter2PhotoUrl: p.photoUrl,
                fighter2Record: p.record,
                fighter2Kos: p.kos,
                weightClass: p.weightClass || d.weightClass,
              }))
            }
            defaultGym={data.fighter2Gym}
            defaultWeightClass={data.weightClass}
            onFightersChanged={onFightersChanged}
          />
        </div>
        <div>
          <label className={labelClass}>F2 GYM</label>
          <GymPicker
            gyms={gyms}
            value={data.fighter2Gym}
            onChange={(name) => setData((d) => ({ ...d, fighter2Gym: name }))}
            onGymsChanged={onGymsChanged}
          />
        </div>
        <div>
          <label className={labelClass}>WEIGHT CLASS</label>
          <WeightClassField
            value={data.weightClass}
            onChange={(v) => setData((d) => ({ ...d, weightClass: v }))}
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
              className="accent-gray-900"
            />
            <span className="text-[11px] text-gray-600">Main Event</span>
          </label>
        </div>
      </div>

      {/* Card preview — exactly what the fan sees on the slug, so the admin can
          confirm the linked fighter and spot a fighter that still needs a photo. */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] mb-1.5">
          CARD PREVIEW
        </p>
        <div className="grid grid-cols-2 gap-2">
          <FighterMini
            corner="red"
            name={data.fighter1Name}
            nickname={data.fighter1Nickname}
            photoUrl={data.fighter1PhotoUrl}
            record={data.fighter1Record}
            kos={data.fighter1Kos}
            gym={data.fighter1Gym}
          />
          <FighterMini
            corner="blue"
            name={data.fighter2Name}
            nickname={data.fighter2Nickname}
            photoUrl={data.fighter2PhotoUrl}
            record={data.fighter2Record}
            kos={data.fighter2Kos}
            gym={data.fighter2Gym}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-gray-500 text-[11px]"
        >
          Cancel
        </button>
        {!canSave && (
          <span className="text-[10px] text-gray-400">Both fighters are required</span>
        )}
      </div>
    </div>
  )
}

// Small fighter portrait. Inline styles beat the global `img { height:auto }`
// rule so it fills; no photo → a monogram. Shared by the bout preview + row.
function FighterAvatar({
  url,
  name,
  className = "",
  rounded = "rounded",
}: {
  url?: string
  name: string
  className?: string
  rounded?: string
}) {
  const initial = (name?.trim() || "?")[0].toUpperCase()
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-gray-100 border border-gray-200 ${rounded} ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="absolute inset-0"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-black">
          {initial}
        </div>
      )}
    </div>
  )
}

// Bout-card mini profile shown in the admin BoutRow edit form — mirrors the
// public FighterCell so the admin sees exactly what the fan will see, and flags
// a linked fighter that has no image yet ("Needs photo").
function FighterMini({
  corner,
  name,
  nickname,
  photoUrl,
  record,
  kos,
  gym,
}: {
  corner: "red" | "blue"
  name: string
  nickname?: string
  photoUrl?: string
  record?: string
  kos?: number
  gym?: string
}) {
  if (!name?.trim()) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed border-gray-200 bg-white p-2 text-[11px] text-gray-300 min-h-16">
        Pick a fighter
      </div>
    )
  }
  const cornerDot = corner === "red" ? "bg-red-500" : "bg-blue-500"
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-gray-200 bg-white p-2">
      <FighterAvatar url={photoUrl} name={name} className="w-11 h-14 text-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cornerDot}`} />
          <p className="text-[12px] font-semibold text-gray-900 truncate">{name}</p>
        </div>
        {nickname && (
          <p className="text-[11px] text-gray-500 italic truncate">&ldquo;{nickname}&rdquo;</p>
        )}
        <p className="text-[11px] text-gray-500 tabular-nums truncate">
          {record ? `${record}${kos ? ` · ${kos} KO` : ""}` : "No record"}
          {gym ? ` · ${gym}` : ""}
        </p>
        {!photoUrl && (
          <span className="inline-flex items-center mt-1 text-[9px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
            Needs photo
          </span>
        )}
      </div>
    </div>
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
      setBouts(
        snap.docs
          .map((d) => d.data() as FightNightBout)
          .sort((a, b) => (a.order ?? a.boutNumber) - (b.order ?? b.boutNumber))
      )
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

        {bouts.length > 0 && (
          <div className="mt-2.5">
            {liveBout ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-red-500" />
                </span>
                Live now · #{liveBout.boutNumber} {liveBout.fighter1Name || "TBA"}{" "}
                vs {liveBout.fighter2Name || "TBA"}
              </span>
            ) : nextScheduled ? (
              <span className="text-[11px] font-semibold text-gray-700">
                Up next · #{nextScheduled.boutNumber}{" "}
                {nextScheduled.fighter1Name || "TBA"} vs{" "}
                {nextScheduled.fighter2Name || "TBA"}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-green-700">
                All bouts settled — head to the Prizes tab to award winners.
              </span>
            )}
          </div>
        )}
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

  // Settled bouts collapse to a one-line tally so the live/next bout stays
  // prominent on a long card. Expand to see the meter + reopen.
  const [expanded, setExpanded] = useState(false)
  // Scheduled bouts can reveal the "declare without starting" path on demand.
  const [declareOpen, setDeclareOpen] = useState(false)

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
        ? "border-gray-300 bg-gray-50 ring-2 ring-gray-100"
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] text-gray-700 min-w-0 truncate">
                <span className="text-gray-500">Winner:</span>{" "}
                <span className="font-bold text-green-700">{winnerName}</span>
                <span className="text-gray-400 ml-2 tabular-nums">
                  · {totalPicks} pick{totalPicks === 1 ? "" : "s"}
                </span>
              </p>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[11px] text-gray-500 hover:text-gray-900 font-medium tracking-wide transition-colors shrink-0"
              >
                {expanded ? "Hide tally" : "Show tally"}
              </button>
            </div>
            {expanded && (
              <div className="mt-3">
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
                    className="text-[11px] text-gray-500 hover:text-gray-900 font-medium tracking-wide transition-colors disabled:opacity-50"
                  >
                    {isBusy ? "Reopening…" : "Reopen bout"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : isScheduled ? (
          <>
            {/* Desktop: meter fills the width, action sits at natural size on
                the right. Mobile: stacks, button goes full-width. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="flex-1 min-w-0">
                <PickMeter
                  f1Name={bout.fighter1Name || "Red"}
                  f2Name={bout.fighter2Name || "Blue"}
                  f1Picks={f1Picks}
                  f2Picks={f2Picks}
                  total={totalPicks}
                  locked={false}
                />
              </div>
              <div className="shrink-0 flex flex-col gap-1.5 sm:items-end">
                <button
                  onClick={onStart}
                  disabled={isBusy}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-bold tracking-wide transition-colors disabled:opacity-50"
                >
                  {isBusy ? "Starting…" : "Start Bout"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (declareOpen) onCancelConfirm()
                    setDeclareOpen((v) => !v)
                  }}
                  className="text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {declareOpen ? "Cancel" : "Already over? Declare winner →"}
                </button>
              </div>
            </div>

            {declareOpen && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-600 mb-2 tracking-wide uppercase">
                  Declare winner now
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
              </div>
            )}
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
          {upset && <span className="ml-1 text-gray-900 font-bold">· upset</span>}
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
      <div className="border border-gray-200 bg-gray-50 rounded-md p-3">
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
            className="px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold disabled:opacity-50"
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
  const [busy, setBusy] = useState(false)
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [methodById, setMethodById] = useState<Record<string, string>>({})
  const [claimInstructions, setClaimInstructions] = useState(
    "Reply to this email by Sunday to claim. We'll coordinate pickup at the venue.",
  )
  const [previewing, setPreviewing] = useState(false)
  const [notifyResult, setNotifyResult] = useState<{
    sent: number
    skipped: number
    errors: number
    results: Array<{
      displayName: string | null
      email: string | null
      status: "sent" | "skipped" | "error"
    }>
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
      await awardTopFinishers(fightNight.id, { topN, prizeLabel })
      await load()
    } finally {
      setBusy(false)
    }
  }

  // Bulk: award the top N then immediately email those winners.
  async function handleAwardAndNotify() {
    if (
      !confirm(
        `Award the top ${topN} and email the winners now? This sends real emails via Resend.`
      )
    )
      return
    setBusy(true)
    setNotifyResult(null)
    try {
      await awardTopFinishers(fightNight.id, { topN, prizeLabel })
      const res = await notifyFightNightWinners(fightNight.id, claimInstructions)
      setNotifyResult(res)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function handlePreviewRecap() {
    setPreviewing(true)
    try {
      const html = await getRecapEmailPreview(fightNight.id, { claimInstructions })
      const w = window.open("", "_blank")
      if (w) {
        w.document.write(html)
        w.document.close()
      }
    } finally {
      setPreviewing(false)
    }
  }

  async function handleClaim(prizeId: string) {
    setBusy(true)
    try {
      const composed = [methodById[prizeId] || "", notesById[prizeId] || ""]
        .filter(Boolean)
        .join(" · ")
      await markPrizeClaimed(fightNight.id, prizeId, adminUser?.uid || "", composed)
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

      {/* Award winners */}
      <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-1">
          Award Winners
        </p>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
          Reads the final leaderboard and records a prize for the top finishers.
          Set how many places win and what they get, then award.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className={labelClass}>PLACES PAID</label>
            <input
              type="number"
              min={1}
              max={10}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
              className={inputClass}
            />
            <p className="text-[10px] text-gray-400 mt-1">Top {topN} on the board</p>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>PRIZE</label>
            <input
              type="text"
              value={prizeLabel}
              onChange={(e) => setPrizeLabel(e.target.value)}
              className={inputClass}
              placeholder="e.g. BOXR Station gear pack"
            />
            <p className="text-[10px] text-gray-400 mt-1">Shown to each winner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAward}
            disabled={busy}
            className="px-4 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {busy ? "Awarding…" : `Award only`}
          </button>
          <button
            onClick={handleAwardAndNotify}
            disabled={busy}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {busy ? "Working…" : "Award & email"}
          </button>
          <span className="text-[10px] text-gray-400 leading-tight">
            “Award only” records winners. “Award &amp; email” also sends each their prize email.
          </span>
        </div>
      </div>

      {/* Notify winners */}
      {prizes.some((p) => p.status === "pending") && (
        <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-2">
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
            <div className="mb-2 border border-gray-200 bg-white rounded px-2.5 py-2">
              <p className="text-[11px] text-gray-700 font-medium mb-1">
                Sent {notifyResult.sent} · Skipped {notifyResult.skipped} (no email) · Errors{" "}
                {notifyResult.errors}
              </p>
              {notifyResult.results.length > 0 && (
                <ul className="space-y-0.5">
                  {notifyResult.results.map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="truncate text-gray-600 min-w-0">
                        {r.displayName || "Anonymous"}
                        <span className="text-gray-400">
                          {r.email ? ` · ${r.email}` : " · no email"}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-bold uppercase tracking-wide ${
                          r.status === "sent"
                            ? "text-green-600"
                            : r.status === "error"
                              ? "text-red-500"
                              : "text-gray-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button
            onClick={handleNotify}
            disabled={busy}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
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
                ? "border-gray-200 bg-gray-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <p
              className={`text-[11px] font-medium ${
                recapResult.errors > 0 ? "text-gray-700" : "text-green-700"
              }`}
            >
              Sent {recapResult.sent} · Skipped {recapResult.skipped} · Errors{" "}
              {recapResult.errors}
              {recapResult.firstError ? ` — ${recapResult.firstError}` : ""}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecap}
            disabled={busy}
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send Recap to All Participants"}
          </button>
          <button
            onClick={handlePreviewRecap}
            disabled={previewing}
            className="px-4 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold rounded-md disabled:opacity-50"
          >
            {previewing ? "Opening…" : "Preview email"}
          </button>
        </div>
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
                  <p className="text-[10px] text-gray-900 font-bold tracking-[0.2em] uppercase">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={labelClass}>METHOD</label>
                      <Combobox
                        value={methodById[prize.id] || ""}
                        options={[
                          { value: "Picked up at venue", label: "Picked up at venue" },
                          { value: "Shipped", label: "Shipped" },
                          { value: "Other", label: "Other" },
                        ]}
                        onSelect={(v) =>
                          setMethodById((m) => ({ ...m, [prize.id]: v }))
                        }
                        placeholder="Select method"
                        searchable={false}
                        ariaLabel="Claim method"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>NOTE</label>
                      <input
                        type="text"
                        value={notesById[prize.id] || ""}
                        onChange={(e) =>
                          setNotesById((m) => ({ ...m, [prize.id]: e.target.value }))
                        }
                        placeholder="e.g. picked up 9:32pm"
                        className={inputClass}
                      />
                    </div>
                  </div>
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
