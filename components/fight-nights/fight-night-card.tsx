import Link from "next/link"
import Image from "next/image"
import type { FightNight, FightNightStatus } from "../../app/actions/fightnight"

const FALLBACK_FLYER =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffightnight.PNG?alt=media"

const STATUS_META: Record<
  FightNightStatus,
  { label: string; cta: string; dot: string; pill: string }
> = {
  announced: {
    label: "Upcoming",
    cta: "View details",
    dot: "bg-sky-400",
    pill: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  },
  doors_open: {
    label: "Doors Open",
    cta: "Join now",
    dot: "bg-amber-400",
    pill: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  },
  live: {
    label: "Live Now",
    cta: "Watch live",
    dot: "bg-red-500",
    pill: "text-red-300 border-red-500/30 bg-red-500/10",
  },
  completed: {
    label: "Final",
    cta: "View recap",
    dot: "bg-emerald-500",
    pill: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  },
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Date TBA"
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Card for a single fight night, used across the hub (featured + calendar).
 * Links to the night's dedicated /fight-nights/[slug] page.
 */
export default function FightNightCard({
  fightNight,
  featured = false,
}: {
  fightNight: FightNight
  featured?: boolean
}) {
  const meta = STATUS_META[fightNight.status]
  const href = `/fight-nights/${fightNight.slug || fightNight.id}`
  const where = [fightNight.venue, fightNight.city].filter(Boolean).join(" · ")
  const flyer = fightNight.flyerUrl || FALLBACK_FLYER

  return (
    <Link
      href={href}
      className={`group relative flex overflow-hidden rounded-xl border border-white/10 bg-black transition-colors hover:border-white/25 ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      {/* Flyer */}
      <div
        className={`relative shrink-0 overflow-hidden bg-white/5 ${
          featured ? "sm:w-2/5 aspect-[16/10] sm:aspect-auto" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={flyer}
          alt={`${fightNight.title || "Fight Night"} flyer`}
          fill
          sizes={featured ? "(min-width: 640px) 40vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col p-5 ${featured ? "sm:p-7 sm:justify-center" : ""}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${meta.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <span className="text-[11px] font-medium text-white/40 tabular-nums">
            {formatDate(fightNight.date)}
          </span>
        </div>

        {fightNight.subtitle && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500/80">
            {fightNight.subtitle}
          </p>
        )}
        <h3
          className={`font-black uppercase leading-[0.95] tracking-tight text-white ${
            featured ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {fightNight.title || "Fight Night"}
        </h3>

        {where && (
          <p className="mt-2 text-sm font-medium text-white/55">{where}</p>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors group-hover:text-amber-400">
          {meta.cta}
          <svg
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
