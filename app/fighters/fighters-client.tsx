"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Fighter } from "../../lib/types/fighter"

const PER_PAGE = 24

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
        <select
          value={regionFilter}
          onChange={(e) => handleFilterChange(setRegionFilter, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All Regions</option>
          <option value="TX">Texas</option>
          <option value="MX">Mexico</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={weightFilter}
          onChange={(e) => handleFilterChange(setWeightFilter, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All Weight Classes</option>
          {weightClasses.map((wc) => (
            <option key={wc} value={wc}>
              {wc}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="retired">Retired</option>
        </select>
        {gyms.length > 0 && (
          <select
            value={gymFilter}
            onChange={(e) => handleFilterChange(setGymFilter, e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-medium leading-6 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Gyms</option>
            {gyms.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count + pagination info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase">
          {filtered.length} Fighter{filtered.length !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-white/40 text-xs font-medium tabular-nums">
            Page {safePage} of {totalPages}
          </p>
        )}
      </div>

      {/* Fighter Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-white/40 text-sm font-medium leading-6">
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
            className="mt-3 text-white/60 text-xs font-semibold tracking-wider uppercase hover:text-white transition-colors"
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
              className="group border border-white/8 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 bg-white/2 hover:bg-white/4"
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
                    <span className="text-white/15 text-5xl font-bold uppercase select-none">
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
                  <h2 className="text-white text-[15px] font-bold leading-snug">
                    {fighter.firstName} {fighter.lastName}
                  </h2>
                  <span className="text-white/40 text-[11px] font-semibold tracking-wider shrink-0 mt-0.5">
                    {fighter.region}
                  </span>
                </div>
                {fighter.nickname && (
                  <p className="text-white/45 text-xs font-medium leading-5 mb-2">
                    &ldquo;{fighter.nickname}&rdquo;
                  </p>
                )}
                <div className="flex items-baseline gap-4 mt-2">
                  <p className="text-white/80 text-sm font-bold tabular-nums leading-6">
                    {fighter.record.wins}-{fighter.record.losses}
                    {fighter.record.draws > 0
                      ? `-${fighter.record.draws}`
                      : ""}
                  </p>
                  {fighter.record.knockouts > 0 && (
                    <p className="text-white/45 text-xs font-medium leading-5">
                      {fighter.record.knockouts} KO
                      {fighter.koPercentage
                        ? ` (${fighter.koPercentage}%)`
                        : ""}
                    </p>
                  )}
                </div>
                {fighter.weightClass && (
                  <p className="text-white/35 text-xs font-medium leading-5 mt-1.5">
                    {fighter.weightClass}
                  </p>
                )}
                {fighter.gym && (
                  <p className="text-white/30 text-[11px] font-medium leading-5 mt-1 truncate">
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
            className="px-4 py-2 text-sm font-semibold text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
