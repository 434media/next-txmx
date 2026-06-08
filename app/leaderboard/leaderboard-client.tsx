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
      <div className="text-center py-24 border border-neutral-200 rounded-xl bg-neutral-50">
        <p className="text-neutral-500 text-sm font-medium leading-6 mb-2">
          No ranked players yet.
        </p>
        <p className="text-neutral-400 text-xs leading-5">
          Join a fight night and start making picks to climb the leaderboard.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="col-span-1 text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          #
        </div>
        <div className="col-span-6 text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          Player
        </div>
        <div className="col-span-2 text-right text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          Nights
        </div>
        <div className="col-span-3 text-right text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
          Points
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-200">
        {entries.map((entry, i) => {
          const position = i + 1

          return (
            <div
              key={entry.userId}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-50 transition-colors ${
                position <= 3 ? "bg-neutral-50" : ""
              }`}
            >
              {/* Position */}
              <div className="col-span-2 sm:col-span-1">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    position === 1
                      ? "text-amber-500"
                      : position === 2
                        ? "text-neutral-400"
                        : position === 3
                          ? "text-amber-700"
                          : "text-neutral-300"
                  }`}
                >
                  {position}
                </span>
              </div>

              {/* Player */}
              <div className="col-span-10 sm:col-span-6 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {entry.photoURL ? (
                    <img
                      src={entry.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-neutral-400 text-xs font-bold">
                      {(entry.displayName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-neutral-900 text-sm font-semibold leading-snug truncate">
                  {entry.displayName?.trim() || "Fan"}
                </p>
              </div>

              {/* Nights played */}
              <div className="col-span-6 sm:col-span-2 text-left sm:text-right">
                <p className="text-neutral-600 text-sm font-semibold tabular-nums leading-6">
                  {entry.eventsPlayed || 0}
                </p>
              </div>

              {/* Points */}
              <div className="col-span-6 sm:col-span-3 text-right">
                <p className="text-neutral-900 text-sm font-bold tabular-nums leading-6">
                  {formatPoints(entry.points || 0)}{" "}
                  <span className="text-neutral-400 text-xs font-medium">PTS</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
