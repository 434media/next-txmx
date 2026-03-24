"use client"

import { useState, useMemo, useCallback } from "react"
import type { TXMXEvent, EventBout } from "../actions/events"
import { getEventBouts } from "../actions/events"

const PER_PAGE = 20

interface EventsClientProps {
  events: TXMXEvent[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBD"
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getRelativeLabel(dateStr: string): "upcoming" | "past" | "today" {
  if (!dateStr) return "upcoming"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateStr + "T12:00:00")
  eventDate.setHours(0, 0, 0, 0)
  if (eventDate.getTime() === today.getTime()) return "today"
  return eventDate > today ? "upcoming" : "past"
}

export default function EventsClient({ events }: EventsClientProps) {
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [tab, setTab] = useState<"all" | "upcoming" | "past">("all")
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [boutsCache, setBoutsCache] = useState<Record<string, EventBout[]>>({})
  const [loadingBouts, setLoadingBouts] = useState<string | null>(null)

  const cities = useMemo(() => {
    const c = new Set(events.map((e) => e.city).filter(Boolean))
    return Array.from(c).sort()
  }, [events])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          e.promoter.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
        if (!match) return false
      }
      if (cityFilter !== "all" && e.city !== cityFilter) return false
      if (tab === "upcoming") {
        const rel = getRelativeLabel(e.date)
        return rel === "upcoming" || rel === "today"
      }
      if (tab === "past") return getRelativeLabel(e.date) === "past"
      return true
    })
  }, [events, search, cityFilter, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  )

  const handleFilterChange = (
    setter: (v: string) => void,
    value: string
  ) => {
    setter(value)
    setPage(1)
  }

  const handleToggle = useCallback(
    async (event: TXMXEvent) => {
      if (expandedId === event.id) {
        setExpandedId(null)
        return
      }

      setExpandedId(event.id)

      // Fetch bouts if not cached and event has bout data
      if (!boutsCache[event.id] && event.eventNumber && event.boutCount > 0) {
        setLoadingBouts(event.id)
        try {
          const bouts = await getEventBouts(event.eventNumber)
          setBoutsCache((prev) => ({ ...prev, [event.id]: bouts }))
        } catch {
          setBoutsCache((prev) => ({ ...prev, [event.id]: [] }))
        } finally {
          setLoadingBouts(null)
        }
      }
    },
    [expandedId, boutsCache]
  )

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-white/10 pb-px">
        {(["all", "upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setPage(1)
              setExpandedId(null)
            }}
            className={`px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
              tab === t
                ? "text-white border-white"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by promoter, venue, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white text-sm font-medium leading-6 placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => handleFilterChange(setCityFilter, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">
          {filtered.length} Event{filtered.length !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-white/40 text-xs font-medium tabular-nums">
            Page {safePage} of {totalPages}
          </p>
        )}
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-white/40 text-sm font-medium leading-6">
            No events match your search.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setCityFilter("all")
              setTab("all")
              setPage(1)
            }}
            className="mt-3 text-white/60 text-xs font-semibold tracking-wider uppercase hover:text-white transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((event) => {
            const rel = getRelativeLabel(event.date)
            const isExpanded = expandedId === event.id
            const bouts = boutsCache[event.id]
            const isLoading = loadingBouts === event.id
            const hasBoutData = event.boutCount > 0 && event.eventNumber

            return (
              <div
                key={event.id}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isExpanded
                    ? "border-white/15 bg-white/3"
                    : "border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/15"
                }`}
              >
                {/* Event Header — clickable */}
                <button
                  onClick={() => handleToggle(event)}
                  className="w-full text-left px-6 py-5 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Date */}
                    <div className="sm:w-40 shrink-0">
                      <p className="text-white/80 text-sm font-bold leading-6 tabular-nums">
                        {formatDate(event.date)}
                      </p>
                      {rel === "today" && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full border border-green-500/20">
                          Today
                        </span>
                      )}
                      {rel === "upcoming" && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[15px] font-bold leading-snug truncate">
                        {event.promoter || "TBA"}
                      </p>
                      <p className="text-white/50 text-sm font-medium leading-6 truncate mt-0.5">
                        {event.venue}
                      </p>
                    </div>

                    {/* Meta + chevron */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-bold leading-6">
                          {event.city}
                        </p>
                        {event.boutCount > 0 && (
                          <p className="text-white/40 text-xs font-medium leading-5">
                            {event.boutCount} bout
                            {event.boutCount !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-white/30 transition-transform duration-200 shrink-0 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Fight Card */}
                {isExpanded && (
                  <div className="border-t border-white/8 px-6 py-5">
                    {/* Event details */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                      {event.address && (
                        <p className="text-white/35 text-xs font-medium leading-5">
                          {event.address}
                        </p>
                      )}
                      {event.eventNumber && (
                        <p className="text-white/25 text-xs font-medium leading-5 tabular-nums">
                          TDLR #{event.eventNumber}
                        </p>
                      )}
                    </div>

                    {!hasBoutData ? (
                      <div className="py-6 text-center">
                        <p className="text-white/30 text-sm font-medium leading-6">
                          {rel === "past"
                            ? "No fight card data available for this event."
                            : "Fight card TBA"}
                        </p>
                      </div>
                    ) : isLoading ? (
                      <div className="py-6 text-center">
                        <p className="text-white/30 text-sm font-medium leading-6 animate-pulse">
                          Loading fight card...
                        </p>
                      </div>
                    ) : bouts && bouts.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
                          Fight Card
                        </p>
                        {bouts.map((bout, i) => (
                          <BoutRow key={`${bout.boutNumber}-${i}`} bout={bout} isPast={rel === "past"} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-white/30 text-sm font-medium leading-6">
                          {rel === "past"
                            ? "Fight results not yet imported."
                            : "Fight card TBA"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-4 py-2 text-sm font-semibold text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (p === 1 || p === totalPages) return true
                if (Math.abs(p - safePage) <= 1) return true
                return false
              })
              .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) {
                  acc.push("ellipsis")
                }
                acc.push(p)
                return acc
              }, [])
              .map((item, i) =>
                item === "ellipsis" ? (
                  <span
                    key={`e-${i}`}
                    className="px-2 text-white/30 text-sm select-none"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
                      item === safePage
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-white/50 hover:bg-white/5 hover:text-white/70"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-4 py-2 text-sm font-semibold text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Next
          </button>
        </nav>
      )}
    </>
  )
}

function BoutRow({ bout, isPast }: { bout: EventBout; isPast: boolean }) {
  const isWinner1 = bout.result === "W"
  const isWinner2 = bout.result === "L"
  const isDraw = bout.winnerResolution === "draw"

  const methodLabel =
    bout.method || (isPast ? (isDraw ? "DRAW" : "") : "")

  return (
    <div className="border border-white/5 rounded-lg px-4 py-3 bg-white/2 hover:bg-white/3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Bout number */}
        <div className="w-8 shrink-0">
          <span className="text-white/20 text-xs font-bold tabular-nums">
            {bout.boutNumber}
          </span>
        </div>

        {/* Fighters */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-bold leading-snug ${
                isPast && isWinner1
                  ? "text-white"
                  : isPast && !isDraw
                    ? "text-white/40"
                    : "text-white/80"
              }`}
            >
              {bout.fighter1 || "TBA"}
            </span>
            <span className="text-white/20 text-xs font-medium">vs</span>
            <span
              className={`text-sm font-bold leading-snug ${
                isPast && isWinner2
                  ? "text-white"
                  : isPast && !isDraw
                    ? "text-white/40"
                    : "text-white/80"
              }`}
            >
              {bout.fighter2 || "TBA"}
            </span>
          </div>

          {/* Weight class + rounds */}
          <div className="flex items-center gap-3 mt-1">
            {bout.weightClass && (
              <span className="text-white/35 text-xs font-medium leading-5">
                {bout.weightClass}
              </span>
            )}
            {bout.scheduledRounds > 0 && (
              <span className="text-white/25 text-xs font-medium leading-5 tabular-nums">
                {bout.scheduledRounds} rds
              </span>
            )}
            {bout.titleFight && (
              <span className="text-amber-400/70 text-[10px] font-bold tracking-wider uppercase">
                Title
              </span>
            )}
          </div>
        </div>

        {/* Result */}
        {isPast && (
          <div className="flex items-center gap-3 shrink-0">
            {methodLabel && (
              <span
                className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                  bout.method === "KO" || bout.method === "TKO"
                    ? "text-red-400 bg-red-500/10 border-red-500/20"
                    : isDraw
                      ? "text-white/50 bg-white/5 border-white/10"
                      : "text-white/60 bg-white/5 border-white/10"
                }`}
              >
                {methodLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scores — shown for decisions */}
      {isPast && bout.scores && bout.scores.length > 0 && (
        <div className="mt-2 pl-8 flex flex-wrap gap-x-4 gap-y-0.5">
          {bout.scores.map((score, i) => (
            <span
              key={i}
              className="text-white/25 text-[11px] font-medium leading-5 tabular-nums"
            >
              {score}
            </span>
          ))}
        </div>
      )}

      {/* Referee */}
      {isPast && bout.referee && (
        <p className="mt-1 pl-8 text-white/20 text-[11px] font-medium leading-5">
          Ref: {bout.referee}
        </p>
      )}
    </div>
  )
}
