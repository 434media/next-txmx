"use client"

import { useState } from "react"
import type { GymData } from "../actions/gyms"
import { useAuth } from "../../lib/auth-context"
import { setGymPledge } from "../actions/users"

interface PledgeClientProps {
  gyms: GymData[]
}

export default function PledgeClient({ gyms }: PledgeClientProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [search, setSearch] = useState("")
  const [pledging, setPledging] = useState<string | null>(null)
  const [error, setError] = useState("")

  const isBlackCard = profile?.subscriptionStatus === "active"
  const currentPledge = profile?.gymPledge
  const isLocked = !!(
    profile?.gymPledgeLockedUntil &&
    new Date(profile.gymPledgeLockedUntil) > new Date()
  )

  const filtered = gyms.filter((g) =>
    search ? g.name.toLowerCase().includes(search.toLowerCase()) : true
  )

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

  if (!user) {
    return (
      <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/50 text-sm font-medium leading-6 mb-2">
          Sign in to pledge to a gym.
        </p>
        <p className="text-white/30 text-xs leading-5">
          The Gym Pledge is a Black Card feature.
        </p>
      </div>
    )
  }

  if (!isBlackCard) {
    return (
      <div className="text-center py-24 border border-amber-500/20 rounded-xl bg-amber-500/3">
        <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-4" />
        <p className="text-white text-sm font-semibold leading-6 mb-2">
          Black Card Required
        </p>
        <p className="text-white/40 text-xs leading-5 max-w-sm mx-auto">
          The Gym Pledge is a Black Card feature. Subscribe for $14.99/mo to
          choose your franchise and start earning Loyalty Points.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Current Pledge Status */}
      {currentPledge && (
        <div className="mb-10 border border-purple-500/30 rounded-xl p-6 bg-purple-500/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <p className="text-purple-400 text-xs font-semibold tracking-[0.2em] uppercase">
              Your Pledge
            </p>
          </div>
          <p className="text-white text-lg font-bold leading-snug">
            {gyms.find((g) => g.id === currentPledge)?.name || currentPledge}
          </p>
          {isLocked && profile?.gymPledgeLockedUntil && (
            <p className="text-white/40 text-xs font-medium leading-5 mt-2">
              Locked until{" "}
              {new Date(profile.gymPledgeLockedUntil).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 border border-red-500/30 rounded-lg px-4 py-3 bg-red-500/10">
          <p className="text-red-400 text-sm font-medium leading-6">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
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
            placeholder="Search gyms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white text-sm font-medium leading-6 placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-colors"
          />
        </div>
      </div>

      {/* Gym Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm font-medium leading-6">
            No gyms found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((gym) => {
            const isPledged = currentPledge === gym.id
            return (
              <div
                key={gym.id}
                className={`border rounded-xl p-5 transition-all duration-200 ${
                  isPledged
                    ? "border-purple-500/40 bg-purple-500/5"
                    : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                }`}
              >
                <h3 className="text-white text-[15px] font-bold leading-snug mb-1">
                  {gym.name}
                </h3>
                {gym.city && (
                  <p className="text-white/45 text-xs font-medium leading-5 mb-4">
                    {gym.city}
                    {gym.state ? `, ${gym.state}` : ""}
                  </p>
                )}
                {isPledged ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-purple-400 text-xs font-bold tracking-wider uppercase">
                      Pledged
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePledge(gym.id)}
                    disabled={isLocked || pledging !== null}
                    className="text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {pledging === gym.id
                      ? "Pledging..."
                      : isLocked
                        ? "Locked"
                        : "Pledge"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
