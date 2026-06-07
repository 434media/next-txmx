import Link from "next/link"
import type { FightNight } from "../../app/actions/fightnight"
import type { FightNightStanding } from "../../app/actions/fightnight-standings"
import { PLACEHOLDER } from "../../lib/placeholder-media"

/**
 * Social proof: a spotlight on the most recent completed event and its winner.
 * Proves the game is real and prizes get won. Renders nothing until there's a
 * completed event to show.
 */
export default function RecapSpotlight({
  event,
  winner,
}: {
  event: FightNight | null
  winner: FightNightStanding | null
}) {
  if (!event) return null
  const href = `/fight-nights/${event.slug || event.id}`
  const date = event.date
    ? new Date(event.date + "T12:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-block w-2 h-2 bg-emerald-500" />
        <p className="text-emerald-600 text-[10px] font-bold tracking-[0.3em] uppercase">
          How It Played Out
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
        {/* Winner spotlight */}
        <div className="md:col-span-3 rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden flex flex-col sm:flex-row">
          <div className="relative sm:w-2/5 aspect-square sm:aspect-auto bg-neutral-100">
            {/* Placeholder winner portrait — swap for the real champion photo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={winner?.photoURL || PLACEHOLDER.winnerImage}
              alt={winner?.displayName || "Champion"}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 p-6 sm:p-7 flex flex-col justify-center">
            <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
              Champion of the Night
            </p>
            <p className="text-neutral-900 text-2xl font-black uppercase tracking-tight leading-tight">
              {winner?.displayName?.trim() || "A TXMX Fan"}
            </p>
            <p className="text-neutral-500 text-sm font-semibold mt-1">
              {winner ? `${(winner.points || 0).toLocaleString()} pts` : "Top of the board"}
              {event.prizeLabel ? ` · won ${event.prizeLabel}` : ""}
            </p>
          </div>
        </div>

        {/* Event recap card */}
        <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <p className="text-neutral-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
              Last Fight Night
            </p>
            <h3 className="text-neutral-900 text-xl font-black uppercase tracking-tight leading-tight">
              {event.title || "Fight Night"}
            </h3>
            <p className="text-neutral-500 text-sm font-medium mt-1">
              {[date, event.venue].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Link
            href={href}
            className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 hover:text-amber-600 transition-colors"
          >
            See the Full Recap
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
