"use client"

import type { SeasonStanding } from "../actions/season-standings"

function formatPoints(pts: number): string {
  if (pts >= 1_000_000) return `${(pts / 1_000_000).toFixed(1)}M`
  if (pts >= 1_000) return `${(pts / 1_000).toFixed(1)}K`
  return pts.toLocaleString()
}

interface LeaderboardClientProps {
  entries: SeasonStanding[]
}

export default function LeaderboardClient({
  entries,
}: LeaderboardClientProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium leading-6 mb-2">
          No ranked players yet.
        </p>
        <p className="text-white/30 text-xs leading-5">
          Join a fight night and start making picks to climb the leaderboard.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white/3 border-b border-white/8">
        <div className="col-span-1 text-white/40 text-[10px] font-bold tracking-widest uppercase">
          #
        </div>
        <div className="col-span-6 text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Player
        </div>
        <div className="col-span-2 text-right text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Nights
        </div>
        <div className="col-span-3 text-right text-white/40 text-[10px] font-bold tracking-widest uppercase">
          Points
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {entries.map((entry, i) => {
          const position = i + 1

          return (
            <div
              key={entry.userId}
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

              {/* Player */}
              <div className="col-span-10 sm:col-span-6 flex items-center gap-3 min-w-0">
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
                  {entry.displayName?.trim() || "Fan"}
                </p>
              </div>

              {/* Nights played */}
              <div className="col-span-6 sm:col-span-2 text-left sm:text-right">
                <p className="text-white/60 text-sm font-semibold tabular-nums leading-6">
                  {entry.eventsPlayed || 0}
                </p>
              </div>

              {/* Points */}
              <div className="col-span-6 sm:col-span-3 text-right">
                <p className="text-white/80 text-sm font-bold tabular-nums leading-6">
                  {formatPoints(entry.points || 0)}{" "}
                  <span className="text-white/30 text-xs font-medium">PTS</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
