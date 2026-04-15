"use client"

import { useState } from "react"
import Link from "next/link"
import type { GymWithRoster, GymRosterFighter } from "../actions/gyms"
import type { Season } from "../actions/seasons"
import { useAuth } from "../../lib/auth-context"
import { setGymPledge } from "../actions/users"

interface PledgeClientProps {
  gyms: GymWithRoster[]
  season: Season | null
  seasonWeek: number | null
  seasonTotalWeeks: number
}

function formatRecord(r: { wins: number; losses: number; draws: number }) {
  return `${r.wins}-${r.losses}${r.draws > 0 ? `-${r.draws}` : ""}`
}

export default function PledgeClient({
  gyms,
  season,
  seasonWeek,
  seasonTotalWeeks,
}: PledgeClientProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [search, setSearch] = useState("")
  const [pledging, setPledging] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [expandedGym, setExpandedGym] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "roster" | "fans" | "record">(
    "roster"
  )

  const isBlackCard = profile?.subscriptionStatus === "active"
  const currentPledge = profile?.gymPledge
  const isLocked = !!(
    profile?.gymPledgeLockedUntil &&
    new Date(profile.gymPledgeLockedUntil) > new Date()
  )

  // Filter — search gyms AND fighters
  const filtered = gyms.filter((g) =>
    search
      ? g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.city?.toLowerCase().includes(search.toLowerCase()) ||
        g.roster.some((f) =>
          `${f.firstName} ${f.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      : true
  )

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (currentPledge === a.id) return -1
    if (currentPledge === b.id) return 1
    switch (sortBy) {
      case "roster":
        return b.roster.length - a.roster.length
      case "fans":
        return b.fanCount - a.fanCount
      case "record":
        return b.rosterRecord.wins - a.rosterRecord.wins
      default:
        return a.name.localeCompare(b.name)
    }
  })

  async function handlePledge(gymId: string) {
    if (!user) return
    setError("")
    setPledging(gymId)
    try {
      await setGymPledge(user.uid, gymId)
      await refreshProfile()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to pledge")
    } finally {
      setPledging(null)
    }
  }

  /* ─── Hero Section ─── */
  const heroSection = (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
          Black Card
        </span>
        <span className="text-white/30 text-[10px] font-semibold tracking-wider uppercase">
          16-Week Season
        </span>
      </div>
      <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-5 uppercase">
        Choose your <span className="text-amber-500">franchise</span>
      </h1>
      <p className="text-white/55 text-sm sm:text-base font-semibold leading-7 max-w-2xl mb-3">
        Scout the rosters. Study the records. Pledge to the gym you believe in.
        Every time one of your gym&apos;s fighters wins, you earn Loyalty
        Points. Locked once pledged — choose wisely.
      </p>
      <p className="text-white/35 text-xs font-medium leading-relaxed max-w-xl">
        💎 +10,000 LP per gym roster win &middot; Fan multiplier: 1.1x per 1K
        pledged fans
      </p>
    </div>
  )

  /* ─── Season Timeline ─── */
  const seasonTimeline = season && seasonWeek !== null && (
    <div className="mb-10 border border-white/10 rounded-2xl p-5 sm:p-6 bg-white/2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
            Current Season
          </p>
          <p className="text-white text-sm font-bold leading-snug">
            {season.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white text-2xl font-black tabular-nums leading-none">
            {seasonWeek}
            <span className="text-white/30 text-sm font-bold">
              /{seasonTotalWeeks}
            </span>
          </p>
          <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
            Weeks
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-700"
            style={{
              width: `${Math.round((seasonWeek / seasonTotalWeeks) * 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-white/30 font-medium">
            {new Date(season.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-[9px] text-white/30 font-medium">
            {new Date(season.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )

  /* ─── Not logged in ─── */
  if (!user) {
    return (
      <>
        {heroSection}
        {seasonTimeline}
        <div className="text-center py-24 border border-white/10 rounded-xl bg-white/2">
          <p className="text-white/60 text-sm font-semibold leading-6 mb-2">
            Sign in to pledge to a gym.
          </p>
          <p className="text-white/35 text-xs leading-5">
            The Gym Pledge is a Black Card feature.
          </p>
        </div>
      </>
    )
  }

  /* ─── Not Black Card ─── */
  if (!isBlackCard) {
    return (
      <>
        {heroSection}
        {seasonTimeline}
        <div className="text-center py-24 border border-amber-500/20 rounded-xl bg-amber-500/3">
          <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-4" />
          <p className="text-white text-sm font-bold leading-6 mb-2">
            Black Card Required
          </p>
          <p className="text-white/45 text-xs leading-5 max-w-sm mx-auto">
            The Gym Pledge is a Black Card feature. Subscribe for $14.99/mo to
            choose your franchise and start earning Loyalty Points.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      {heroSection}
      {seasonTimeline}

      {/* ─── Current Pledge Status ─── */}
      {currentPledge && (
        <div className="mb-10 border border-amber-500/30 rounded-2xl p-6 bg-amber-500/5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                Your Franchise
              </p>
            </div>
            <p className="text-white text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight">
              {gyms.find((g) => g.id === currentPledge)?.name || currentPledge}
            </p>
            {isLocked && profile?.gymPledgeLockedUntil && (
              <p className="text-white/40 text-xs font-medium leading-5 mt-2">
                🔒 Locked until{" "}
                {new Date(profile.gymPledgeLockedUntil).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 border border-red-500/30 rounded-xl px-4 py-3 bg-red-500/10">
          <p className="text-red-400 text-sm font-semibold leading-6">
            {error}
          </p>
        </div>
      )}

      {/* ─── Search + Sort Controls ─── */}
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
            placeholder="Search gyms or fighters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm font-medium leading-6 placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(
            [
              { key: "roster", label: "Roster" },
              { key: "record", label: "Record" },
              { key: "fans", label: "Fans" },
              { key: "name", label: "A-Z" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-lg transition-colors ${
                sortBy === opt.key
                  ? "bg-amber-500/20 text-amber-500"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Stats Overview ─── */}
      <div className="grid grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden mb-8">
        <div className="bg-black px-4 py-5 text-center">
          <p className="text-2xl sm:text-3xl font-black text-amber-500 tabular-nums">
            {gyms.length}
          </p>
          <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase mt-1">
            Gyms
          </p>
        </div>
        <div className="bg-black px-4 py-5 text-center">
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
            {gyms.reduce((sum, g) => sum + g.roster.length, 0)}
          </p>
          <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase mt-1">
            Fighters
          </p>
        </div>
        <div className="bg-black px-4 py-5 text-center">
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
            {gyms.reduce((sum, g) => sum + g.fanCount, 0)}
          </p>
          <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase mt-1">
            Fans Pledged
          </p>
        </div>
      </div>

      {/* ─── Gym Cards ─── */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm font-medium leading-6">
            No gyms found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((gym) => {
            const isPledged = currentPledge === gym.id
            const isExpanded = expandedGym === gym.id
            const activeFighters = gym.roster.filter(
              (f) => f.status === "active"
            )

            return (
              <div
                key={gym.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isPledged
                    ? "border-amber-500/40 bg-amber-500/3"
                    : "border-white/8 bg-white/2 hover:border-white/15"
                }`}
              >
                {/* Gym Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-tight truncate leading-tight">
                          {gym.name}
                        </h3>
                        {isPledged && (
                          <span className="shrink-0 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            Your Franchise
                          </span>
                        )}
                      </div>
                      {gym.city && (
                        <p className="text-white/45 text-xs font-medium leading-5">
                          {gym.city}
                          {gym.state ? `, ${gym.state}` : ""}
                        </p>
                      )}
                    </div>
                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-white font-black text-lg tabular-nums leading-none">
                          {formatRecord(gym.rosterRecord)}
                        </p>
                        <p className="text-[9px] text-white/35 font-semibold uppercase tracking-wider mt-0.5">
                          Record
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/80 font-black text-lg tabular-nums leading-none">
                          {gym.roster.length}
                        </p>
                        <p className="text-[9px] text-white/35 font-semibold uppercase tracking-wider mt-0.5">
                          Roster
                        </p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-amber-500 font-black text-lg tabular-nums leading-none">
                          {gym.fanCount}
                        </p>
                        <p className="text-[9px] text-white/35 font-semibold uppercase tracking-wider mt-0.5">
                          Fans
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() =>
                        setExpandedGym(isExpanded ? null : gym.id)
                      }
                      className="text-[10px] font-bold tracking-wider uppercase text-white/45 hover:text-white/70 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                      {isExpanded ? "Hide" : "View"} Roster (
                      {activeFighters.length} active)
                    </button>

                    {isPledged ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-amber-500 text-xs font-bold tracking-wider uppercase">
                          Pledged
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePledge(gym.id)}
                        disabled={isLocked || pledging !== null}
                        className="text-xs font-bold tracking-wider uppercase px-5 py-2 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {pledging === gym.id
                          ? "Pledging..."
                          : isLocked
                            ? "Locked"
                            : "Pledge This Gym"}
                      </button>
                    )}
                  </div>
                </div>

                {/* ─── Expanded Roster ─── */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-white/1">
                    {gym.roster.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <p className="text-white/30 text-sm font-medium">
                          No fighters linked to this gym yet.
                        </p>
                        <p className="text-white/20 text-xs mt-1">
                          Fighters are linked by the admin team via the gym
                          field.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {gym.roster.map((fighter) => (
                          <FighterRow key={fighter.id} fighter={fighter} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── How It Works ─── */}
      <div className="mt-14 border border-white/10 rounded-2xl p-6 sm:p-8 bg-white/2">
        <p className="text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
          How The Pledge Works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏟️</span>
              <p className="text-white text-sm font-bold">
                1. Scout &amp; Pledge
              </p>
            </div>
            <p className="text-white/45 text-xs font-medium leading-5">
              Browse gym rosters, study fighter records, and pledge to the gym
              you believe will dominate the season. Locked for 16 weeks.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🥊</span>
              <p className="text-white text-sm font-bold">2. Fights Happen</p>
            </div>
            <p className="text-white/45 text-xs font-medium leading-5">
              Throughout the 16-week season, fighters from every gym compete
              across Texas events. Every win matters.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💎</span>
              <p className="text-white text-sm font-bold">3. Earn LP</p>
            </div>
            <p className="text-white/45 text-xs font-medium leading-5">
              Each time a fighter on your gym&apos;s roster wins, you earn
              10,000 Loyalty Points. More fans pledged = higher multiplier.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Fighter Row Component ─── */
function FighterRow({ fighter }: { fighter: GymRosterFighter }) {
  const isActive = fighter.status === "active"
  const totalBouts =
    fighter.record.wins + fighter.record.losses + fighter.record.draws
  const winPct =
    totalBouts > 0 ? Math.round((fighter.record.wins / totalBouts) * 100) : 0

  return (
    <Link
      href={`/fighters/${fighter.slug}`}
      className="flex items-center gap-4 px-5 sm:px-6 py-3.5 hover:bg-white/3 transition-colors group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden shrink-0 bg-white/5">
        {fighter.profileImageUrl ? (
          <img
            src={fighter.profileImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
            {fighter.firstName[0]}
            {fighter.lastName[0]}
          </div>
        )}
      </div>

      {/* Name + Class */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-bold uppercase tracking-tight truncate group-hover:text-white/80 transition-colors">
            {fighter.firstName} {fighter.lastName}
          </p>
          {fighter.nickname && (
            <span className="text-amber-500/60 text-[10px] font-semibold truncate hidden sm:inline">
              &quot;{fighter.nickname}&quot;
            </span>
          )}
          {!isActive && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/10 shrink-0">
              {fighter.status}
            </span>
          )}
        </div>
        <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">
          {fighter.weightClass}
        </p>
      </div>

      {/* Record */}
      <div className="text-right shrink-0">
        <p className="text-white font-black text-sm tabular-nums">
          {formatRecord(fighter.record)}
        </p>
        {totalBouts > 0 && (
          <p className="text-white/30 text-[10px] font-semibold tabular-nums">
            {winPct}% W · {fighter.record.knockouts} KO
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  )
}
