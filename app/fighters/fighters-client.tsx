"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Fighter } from "../../lib/types/fighter"

const PER_PAGE = 24

// ── Reusable filter dropdown ──────────────────────────────────────────
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  searchable = false,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setSearch("")
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [close])

  const filtered = useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, search])

  const displayLabel =
    value === "all" ? label : options.find((o) => o.value === value)?.label ?? value

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch("") }}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors cursor-pointer min-w-[140px] text-left"
      >
        <span className={value === "all" ? "text-white/80" : "text-white truncate max-w-40"}>
          {displayLabel}
        </span>
        <svg className={`w-3.5 h-3.5 text-white/40 shrink-0 ml-auto transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 right-0 sm:left-0 w-64 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase().replace("all ", "")}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-xs font-medium placeholder:text-white/40 focus:outline-none focus:border-white/25 transition-colors"
                autoFocus
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto overscroll-contain py-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange("all"); close() }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${value === "all" ? "text-amber-500 bg-amber-500/10" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              >
                {label}
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); close() }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors truncate ${value === o.value ? "text-amber-500 bg-amber-500/10" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {searchable && filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-white/40 text-xs font-medium">
                No results for &ldquo;{search}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

interface FightersClientProps {
  fighters: Fighter[]
}

export default function FightersClient({ fighters }: FightersClientProps) {
  const [search, setSearch] = useState("")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [weightFilter, setWeightFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [gymFilter, setGymFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const weightClasses = useMemo(() => {
    const classes = new Set(fighters.map((f) => f.weightClass).filter(Boolean))
    return Array.from(classes).sort()
  }, [fighters])

  const gyms = useMemo(() => {
    const g = new Set(fighters.map((f) => f.gym).filter(Boolean) as string[])
    return Array.from(g).sort()
  }, [fighters])

  const regionOptions = [
    { value: "TX", label: "Texas" },
    { value: "MX", label: "Mexico" },
    { value: "OTHER", label: "Other" },
  ]

  const weightClassOptions = useMemo(
    () => weightClasses.map((wc) => ({ value: wc, label: wc })),
    [weightClasses]
  )

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "retired", label: "Retired" },
  ]

  const gymOptions = useMemo(
    () => gyms.map((g) => ({ value: g, label: g })),
    [gyms]
  )

  const filtered = useMemo(() => {
    return fighters.filter((f) => {
      const searchText =
        `${f.firstName} ${f.lastName} ${f.nickname || ""} ${f.gym || ""} ${f.residence?.city || ""} ${f.trainer || ""}`.toLowerCase()
      if (search && !searchText.includes(search.toLowerCase())) return false
      if (regionFilter !== "all" && f.region !== regionFilter) return false
      if (weightFilter !== "all" && f.weightClass !== weightFilter) return false
      if (statusFilter !== "all" && f.status !== statusFilter) return false
      if (gymFilter !== "all" && f.gym !== gymFilter) return false
      return true
    })
  }, [fighters, search, regionFilter, weightFilter, statusFilter, gymFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  )

  // Reset to page 1 when filters change
  const handleFilterChange = (
    setter: (v: string) => void,
    value: string
  ) => {
    setter(value)
    setPage(1)
  }

  return (
    <>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
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
            placeholder="Search by name, gym, city, or trainer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white text-sm font-medium leading-6 placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
          />
        </div>
        <FilterDropdown
          label="All Regions"
          value={regionFilter}
          options={regionOptions}
          onChange={(v) => handleFilterChange(setRegionFilter, v)}
        />
        <FilterDropdown
          label="All Weight Classes"
          value={weightFilter}
          options={weightClassOptions}
          onChange={(v) => handleFilterChange(setWeightFilter, v)}
          searchable
        />
        <FilterDropdown
          label="All Statuses"
          value={statusFilter}
          options={statusOptions}
          onChange={(v) => handleFilterChange(setStatusFilter, v)}
        />
        {gyms.length > 0 && (
          <FilterDropdown
            label="All Gyms"
            value={gymFilter}
            options={gymOptions}
            onChange={(v) => handleFilterChange(setGymFilter, v)}
            searchable
          />
        )}
      </div>

      {/* Results count + pagination info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/60 text-xs font-bold tracking-widest uppercase">
          {filtered.length} Fighter{filtered.length !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-white/50 text-xs font-semibold tabular-nums">
            Page {safePage} of {totalPages}
          </p>
        )}
      </div>

      {/* Fighter Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 mb-4">
            <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm font-semibold leading-6">
            No fighters match your search.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setRegionFilter("all")
              setWeightFilter("all")
              setStatusFilter("all")
              setGymFilter("all")
              setPage(1)
            }}
            className="mt-3 text-amber-500/70 text-xs font-bold tracking-wider uppercase hover:text-amber-400 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((fighter) => (
            <Link
              key={fighter.id}
              href={`/fighters/${fighter.slug}`}
              className="group border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 bg-white/2 hover:bg-white/5"
            >
              {/* Fighter Image */}
              <div className="relative h-52 bg-white/5">
                {fighter.profileImageUrl ? (
                  <Image
                    src={fighter.profileImageUrl}
                    alt={`${fighter.firstName} ${fighter.lastName}`}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/3">
                    <span className="text-white/20 text-5xl font-bold uppercase select-none">
                      {fighter.firstName[0]}
                      {fighter.lastName[0]}
                    </span>
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-sm ${
                      fighter.status === "active"
                        ? "bg-green-500/20 text-green-400 border border-green-500/20"
                        : fighter.status === "retired"
                          ? "bg-red-500/20 text-red-400 border border-red-500/20"
                          : "bg-white/10 text-white/50 border border-white/10"
                    }`}
                  >
                    {fighter.status}
                  </span>
                </div>
              </div>

              {/* Fighter Info */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="text-white text-[15px] font-bold leading-snug uppercase">
                    {fighter.firstName} {fighter.lastName}
                  </h2>
                  <span className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase shrink-0 mt-1">
                    {fighter.region}
                  </span>
                </div>
                {fighter.nickname && (
                  <p className="text-amber-500/50 text-xs font-semibold leading-5 mb-2">
                    &ldquo;{fighter.nickname}&rdquo;
                  </p>
                )}
                <div className="flex items-baseline gap-3 mt-2">
                  <p className="text-white text-base font-black tabular-nums leading-6">
                    {fighter.record.wins}-{fighter.record.losses}
                    {fighter.record.draws > 0
                      ? `-${fighter.record.draws}`
                      : ""}
                  </p>
                  {fighter.record.knockouts > 0 && (
                    <p className="text-white/55 text-xs font-semibold leading-5">
                      {fighter.record.knockouts} KO
                      {fighter.koPercentage
                        ? ` (${fighter.koPercentage}%)`
                        : ""}
                    </p>
                  )}
                </div>
                {fighter.weightClass && (
                  <p className="text-white/50 text-xs font-semibold leading-5 mt-1.5">
                    {fighter.weightClass}
                  </p>
                )}
                {fighter.gym && (
                  <p className="text-white/40 text-[11px] font-medium leading-5 mt-1 truncate">
                    {fighter.gym}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-4 py-2.5 text-sm font-bold text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages near current
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
                    className="px-2 text-white/40 text-sm select-none"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-9 h-9 text-sm font-bold rounded-lg transition-colors ${
                      item === safePage
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
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
            className="px-4 py-2.5 text-sm font-bold text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Next
          </button>
        </nav>
      )}
    </>
  )
}
