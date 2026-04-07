"use client"

import { useAuth } from "@/lib/auth-context"
import UpsellBanner from "@/components/upsell-banner"
import type { LeaderboardEntry } from "../actions/users"

const RANK_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  hall_of_fame: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  champion: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  contender: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  rookie: {
    bg: "bg-white/5",
    text: "text-white/50",
    border: "border-white/10",
  },
}

const RANK_LABELS: Record<string, string> = {
  hall_of_fame: "Hall of Fame",
  champion: "Champion",
  contender: "Contender",
  rookie: "Rookie",
}

function formatSP(sp: number): string {
  if (sp >= 1_000_000) return `${(sp / 1_000_000).toFixed(1)}M`
  if (sp >= 1_000) return `${(sp / 1_000).toFixed(1)}K`
  return sp.toLocaleString()
}

interface LeaderboardClientProps {
  entries: LeaderboardEntry[]
}

export default function LeaderboardClient({
  entries,
}: LeaderboardClientProps) {
  const { profile } = useAuth()
  const isBlackCard = profile?.subscriptionStatus === 'active'

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium leading-6 mb-2">
          No ranked users yet.
        </p>
        <p className="text-white/30 text-xs leading-5">
          Sign up and start making picks to climb the leaderboard.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Rank Legend */}
      <div className="flex flex-wrap gap-3 mb-10">
        {(["hall_of_fame", "champion", "contender", "rookie"] as const).map(
          (rank) => {
            const style = RANK_STYLES[rank]
            return (
              <div
                key={rank}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.border} ${style.bg}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${style.text.replace("text-", "bg-")}`}
                />
                <span className={`text-xs font-semibold ${style.text}`}>
                  {RANK_LABELS[rank]}
                </span>
              </div>
            )
          }
        )}
      </div>

      {/* Table */}
      <div className="border border-white/8 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white/3 border-b border-white/8">
          <div className="col-span-1 text-white/40 text-[10px] font-bold tracking-widest uppercase">
            #
          </div>
          <div className="col-span-5 text-white/40 text-[10px] font-bold tracking-widest uppercase">
            User
          </div>
          <div className="col-span-3 text-white/40 text-[10px] font-bold tracking-widest uppercase">
            Rank
          </div>
          <div className="col-span-3 text-right text-white/40 text-[10px] font-bold tracking-widest uppercase">
            Skill Points
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {entries.map((entry, i) => {
            const position = i + 1
            const style = RANK_STYLES[entry.rank] || RANK_STYLES.rookie

            return (
              <div
                key={entry.uid}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors ${
                  position <= 3 ? "bg-white/2" : ""
                }`}
              >
                {/* Position */}
                <div className="col-span-2 sm:col-span-1">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      position === 1
                        ? "text-amber-400"
                        : position === 2
                          ? "text-white/70"
                          : position === 3
                            ? "text-amber-600"
                            : "text-white/30"
                    }`}
                  >
                    {position}
                  </span>
                </div>

                {/* User */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {entry.photoURL ? (
                      <img
                        src={entry.photoURL}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-white/30 text-xs font-bold">
                        {(entry.displayName || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold leading-snug truncate">
                    {entry.displayName || "Anonymous"}
                  </p>
                </div>

                {/* Rank */}
                <div className="col-span-4 sm:col-span-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${style.border} ${style.bg} ${style.text}`}
                  >
                    {RANK_LABELS[entry.rank] || "Rookie"}
                  </span>
                </div>

                {/* SP */}
                <div className="col-span-12 sm:col-span-3 text-right sm:text-right">
                  <p className="text-white/80 text-sm font-bold tabular-nums leading-6">
                    {formatSP(entry.skillPoints)}{" "}
                    <span className="text-white/30 text-xs font-medium">
                      SP
                    </span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Soft upsell for free users */}
      {!isBlackCard && (
        <div className="mt-6">
          <UpsellBanner
            compact
            headline="Want to climb the ranks?"
            message="Make Prop Picks to earn Skill Points and compete on the leaderboard."
          />
        </div>
      )}
    </>
  )
}
