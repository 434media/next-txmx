import Link from "next/link"
import type { FightNight } from "../../app/actions/fightnight"
import type { FightNightStanding } from "../../app/actions/fightnight-standings"
import { Section, Eyebrow } from "./section"

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
    <Section>
      <Eyebrow tone="emerald">How It Played Out</Eyebrow>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
        {/* Winner spotlight. The champion's photo is a small profile avatar
            (often ~96px from Google), so we render it at avatar size instead of
            a large panel — upscaling that source into a hero image looked
            blurry. No photo → a crisp monogram. The card is filled out with the
            night's stats instead of imagery. */}
        <div className="md:col-span-3 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 flex flex-col justify-center">
          <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
            Champion of the Night
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
              {winner?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={winner.photoURL}
                  alt={winner.displayName || "Champion"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-neutral-400 text-xl font-black">
                  {(winner?.displayName?.trim() || "TXMX")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-neutral-900 text-2xl font-black uppercase tracking-tight leading-tight truncate">
                {winner?.displayName?.trim() || "A TXMX Fan"}
              </p>
              {event.prizeLabel && (
                <p className="text-neutral-500 text-sm font-semibold mt-1 truncate">
                  Won {event.prizeLabel}
                </p>
              )}
            </div>
          </div>

          {winner && (
            <div className="mt-6 grid grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
              <Stat value={(winner.points || 0).toLocaleString()} label="Points" />
              <Stat value={`${winner.picksWon || 0}/${winner.picksMade || 0}`} label="Picks won" />
              <Stat
                value={
                  (winner.picksMade || 0) > 0
                    ? `${Math.round(((winner.picksWon || 0) / winner.picksMade) * 100)}%`
                    : "—"
                }
                label="Accuracy"
              />
            </div>
          )}
        </div>

        {/* Event recap card */}
        <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 flex flex-col justify-between">
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
    </Section>
  )
}

/** One stat cell in the champion card — mirrors the hub's gap-px stat strips. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <p className="text-neutral-900 text-xl sm:text-2xl font-black tabular-nums leading-none">
        {value}
      </p>
      <p className="text-neutral-500 text-[11px] font-medium leading-4 mt-1.5">
        {label}
      </p>
    </div>
  )
}
