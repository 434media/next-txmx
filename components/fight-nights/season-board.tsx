import Link from "next/link"
import type { SeasonStanding } from "../../app/actions/season-standings"
import { Section, Eyebrow } from "./section"

function rankColor(pos: number): string {
  if (pos === 1) return "text-neutral-900"
  if (pos === 2) return "text-neutral-500"
  if (pos === 3) return "text-neutral-400"
  return "text-neutral-300"
}

function Avatar({ entry }: { entry: SeasonStanding }) {
  return (
    <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
      {entry.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
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
  )
}

/**
 * All-time season board for the hub — avatars + top-3 emphasis so it reads as a
 * living competition rather than a data dump.
 */
export default function SeasonBoard({ leaders }: { leaders: SeasonStanding[] }) {
  return (
    <Section>
      <div className="flex items-end justify-between mb-5">
        <Eyebrow tone="neutral" mb="mb-0">
          All-Time Leaderboard
        </Eyebrow>
        <Link
          href="/leaderboard"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          View all →
        </Link>
      </div>

      {leaders.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-xl px-6 py-10 text-center">
          <p className="text-neutral-500 text-sm font-medium">
            The all-time board fills up as fans play. Be the first.
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-neutral-200 divide-y divide-neutral-200">
          {leaders.map((p, i) => {
            const pos = i + 1
            return (
              <div
                key={p.userId}
                className={`flex items-center gap-4 px-4 sm:px-6 py-3.5 ${
                  pos === 1 ? "bg-neutral-100" : pos <= 3 ? "bg-neutral-50" : "bg-white"
                }`}
              >
                <span className={`w-6 text-sm font-black tabular-nums ${rankColor(pos)}`}>
                  {pos}
                </span>
                <Avatar entry={p} />
                <div className="min-w-0 flex-1">
                  <p className="text-neutral-900 text-sm font-semibold truncate">
                    {p.displayName?.trim() || "Fan"}
                  </p>
                  <p className="text-neutral-400 text-xs font-medium">
                    {p.eventsPlayed || 0} {(p.eventsPlayed || 0) === 1 ? "night" : "nights"}
                  </p>
                </div>
                <p className="text-neutral-900 text-sm font-bold tabular-nums">
                  {(p.points || 0).toLocaleString()}
                  <span className="text-neutral-400 text-xs font-medium"> pts</span>
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}
