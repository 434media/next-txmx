import Link from "next/link"
import type { FightNight, FightNightBout } from "../../actions/fightnight"
import type { FightNightStanding } from "../../actions/fightnight-standings"
import type { FightNightPrize } from "../../actions/fightnight-prizes"

function formatFullDate(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function standingName(s: FightNightStanding): string {
  return s.displayName?.trim() || "Fan"
}

/**
 * Read-only recap for a completed fight night. All data is passed in from the
 * server page (admin SDK), so this renders for signed-out visitors too — no
 * client listeners, nothing auth-gated.
 */
export default function RecapView({
  fightNight,
  bouts,
  standings,
  prizes,
}: {
  fightNight: FightNight
  bouts: FightNightBout[]
  standings: FightNightStanding[]
  prizes: FightNightPrize[]
}) {
  const champion = standings[0] || null
  const where = [fightNight.venue, fightNight.city].filter(Boolean).join(" · ")

  return (
    <main className="relative min-h-dvh bg-white font-sans">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-20">
        {/* Back link */}
        <Link
          href="/fight-nights"
          className="inline-flex items-center gap-2 text-neutral-500 text-[11px] font-semibold tracking-widest uppercase hover:text-neutral-900 transition-colors mb-8 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Fight Nights
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-2 bg-emerald-500" />
            <p className="text-emerald-600 text-[10px] font-bold tracking-[0.25em] uppercase">
              Final Results
            </p>
          </div>
          {fightNight.subtitle && (
            <p className="text-amber-600 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">
              {fightNight.subtitle}
            </p>
          )}
          <h1 className="text-neutral-900 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] uppercase mb-4">
            {fightNight.title || "Fight Night"}
          </h1>
          <p className="text-neutral-500 text-sm font-medium">
            {[formatFullDate(fightNight.date), where].filter(Boolean).join(" · ")}
          </p>
        </header>

        {/* Champion callout */}
        {champion && (
          <div className="mb-12 border border-amber-200 bg-amber-50 rounded-xl p-6 sm:p-8">
            <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
              Night Champion
            </p>
            <div className="flex items-end justify-between gap-4">
              <p className="text-neutral-900 text-2xl sm:text-3xl font-black tracking-tight leading-none">
                {standingName(champion)}
              </p>
              <p className="text-amber-600 text-xl sm:text-2xl font-black tabular-nums leading-none">
                {champion.points.toLocaleString()}
                <span className="text-neutral-400 text-xs font-bold ml-1.5">PTS</span>
              </p>
            </div>
          </div>
        )}

        {/* Bout results */}
        {bouts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-neutral-900 text-lg font-bold uppercase tracking-tight mb-5">
              Card Results
            </h2>
            <div className="space-y-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
              {bouts.map((b) => (
                <BoutResultRow key={b.boutNumber} bout={b} />
              ))}
            </div>
          </section>
        )}

        {/* Prize winners */}
        {prizes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-neutral-900 text-lg font-bold uppercase tracking-tight mb-5">
              Prize Winners
            </h2>
            <div className="space-y-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
              {prizes.map((p) => (
                <div
                  key={p.id}
                  className="bg-white px-4 py-3 flex items-center gap-4"
                >
                  <span className="text-amber-600 text-xs font-black tabular-nums w-6 shrink-0">
                    #{p.position}
                  </span>
                  <span className="text-neutral-900 text-sm font-semibold truncate flex-1">
                    {p.displayName?.trim() || "Fan"}
                  </span>
                  <span className="text-neutral-500 text-xs font-medium truncate text-right">
                    {p.prizeLabel}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final leaderboard */}
        <section className="mb-12">
          <h2 className="text-neutral-900 text-lg font-bold uppercase tracking-tight mb-5">
            Final Leaderboard
          </h2>
          {standings.length === 0 ? (
            <div className="border border-dashed border-neutral-300 rounded-xl px-6 py-10 text-center">
              <p className="text-neutral-400 text-sm font-medium">
                No participants on this card.
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-neutral-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 text-[10px] font-bold tracking-[0.15em] uppercase">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right w-20">Picks</th>
                    <th className="px-4 py-3 text-right w-24">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr
                      key={s.userId}
                      className={`border-t border-neutral-200 ${
                        i === 0 ? "bg-amber-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-neutral-500 text-sm font-bold tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-neutral-900 text-sm font-semibold truncate">
                        {standingName(s)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500 text-xs font-medium tabular-nums">
                        {s.picksWon}/{s.picksMade}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-900 text-sm font-bold tabular-nums">
                        {s.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/fight-nights"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md"
          >
            All Fight Nights
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-100 transition-colors rounded-md"
          >
            Global Leaderboard
          </Link>
        </div>
      </div>
    </main>
  )
}

function BoutResultRow({ bout }: { bout: FightNightBout }) {
  const winner =
    bout.winnerCorner === "fighter1"
      ? "fighter1"
      : bout.winnerCorner === "fighter2"
        ? "fighter2"
        : null
  const isDraw = bout.winnerCorner === "draw"
  const decided = bout.status === "completed" && (winner || isDraw)

  return (
    <div className="bg-white px-4 py-3.5">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-neutral-400 text-[10px] font-bold tabular-nums shrink-0">
          {bout.boutNumber}
        </span>
        {bout.weightClass && (
          <span className="text-neutral-400 text-[10px] font-medium uppercase tracking-wide">
            {bout.weightClass}
          </span>
        )}
        {bout.isMainEvent && (
          <span className="text-amber-600 text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200">
            Main
          </span>
        )}
        {!decided && (
          <span className="text-neutral-400 text-[9px] font-bold tracking-[0.2em] uppercase ml-auto">
            No result
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <FighterName
          name={bout.fighter1Name || "TBA"}
          won={winner === "fighter1"}
          dim={!!winner && winner !== "fighter1"}
        />
        <span className="text-neutral-300 text-[11px] font-medium shrink-0">
          {isDraw ? "draw" : "vs"}
        </span>
        <FighterName
          name={bout.fighter2Name || "TBA"}
          won={winner === "fighter2"}
          dim={!!winner && winner !== "fighter2"}
          alignRight
        />
      </div>
    </div>
  )
}

function FighterName({
  name,
  won,
  dim,
  alignRight,
}: {
  name: string
  won: boolean
  dim: boolean
  alignRight?: boolean
}) {
  return (
    <span
      className={`flex-1 min-w-0 inline-flex items-center gap-1.5 ${
        alignRight ? "justify-end" : ""
      }`}
    >
      <span
        className={`text-sm font-bold truncate ${
          won ? "text-emerald-600" : dim ? "text-neutral-400" : "text-neutral-900"
        }`}
      >
        {name}
      </span>
      {won && (
        <span className="text-emerald-600 text-[9px] font-bold tracking-[0.2em] uppercase shrink-0">
          W
        </span>
      )}
    </span>
  )
}
