import type { FightNight } from "../../app/actions/fightnight"

/**
 * Surfaces the admin-authored marketing the hub previously ignored: the
 * featured night's promo copy + prize. Mirrors the slug page's PrizeChip
 * styling so the hub and event pages read as one system. Falls back to an
 * evergreen prize line when the event has no prize set, so fans always know
 * there's something to play for.
 */
export default function FeaturedPrizePromo({
  fightNight,
}: {
  fightNight: FightNight
}) {
  const { promoCopy, prizeLabel, prizeDetails } = fightNight

  return (
    <div className="mt-6">
      {promoCopy?.trim() && (
        <p className="text-neutral-700 text-sm sm:text-base font-medium leading-7 max-w-2xl whitespace-pre-line mb-5">
          {promoCopy}
        </p>
      )}

      {prizeLabel?.trim() ? (
        <div className="inline-flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 max-w-2xl">
          <TrophyIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-amber-600 text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5">
              Play for
            </p>
            <p className="text-neutral-900 text-sm font-bold leading-snug">
              {prizeLabel}
            </p>
            {prizeDetails?.trim() && (
              <p className="text-neutral-500 text-xs font-medium leading-5 mt-1 whitespace-pre-line">
                {prizeDetails}
              </p>
            )}
          </div>
        </div>
      ) : (
        <EvergreenPrizeLine />
      )}
    </div>
  )
}

/**
 * Standalone "there are always prizes" reassurance — used on the hub when no
 * event (or no prize) is set so the motivation is never invisible.
 */
export function EvergreenPrizeLine() {
  return (
    <p className="inline-flex items-center gap-2 text-neutral-500 text-xs font-semibold tracking-wide">
      <TrophyIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      Real prizes every fight night — top of the board takes it home.
    </p>
  )
}

function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21h8m-4-4v4m-5-17h10v5a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3m10-4h3v1a3 3 0 01-3 3"
      />
    </svg>
  )
}
