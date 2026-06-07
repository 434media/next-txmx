import Link from "next/link"
import type { FightNight } from "../../app/actions/fightnight"
import { PLACEHOLDER } from "../../lib/placeholder-media"

function formatDate(dateStr: string): string {
  if (!dateStr) return "Date TBA"
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

const HERO_META: Record<
  FightNight["status"],
  { eyebrow: string; cta: string; dot: string; eyebrowText: string; live: boolean }
> = {
  announced: { eyebrow: "Happening Next", cta: "Enter Fight Night", dot: "bg-amber-500", eyebrowText: "text-amber-600", live: false },
  doors_open: { eyebrow: "Doors Open", cta: "Enter Fight Night", dot: "bg-amber-500", eyebrowText: "text-amber-600", live: false },
  live: { eyebrow: "Live Now", cta: "Watch Live · Play", dot: "bg-red-500", eyebrowText: "text-red-600", live: true },
  completed: { eyebrow: "Latest Event", cta: "View Recap", dot: "bg-emerald-500", eyebrowText: "text-emerald-600", live: false },
}

/**
 * "Happening Next" — the featured event in a left/right split: event details on
 * the left, the promoter-supplied poster in its own panel on the right. We never
 * overlay copy on the poster because we can't control what promoters send, so
 * the artwork is shown cleanly (object-cover) beside our text instead.
 */
export default function HeroFeatured({
  featured,
}: {
  featured: FightNight | null
}) {
  if (!featured) return <NoEventBand />

  const meta = HERO_META[featured.status]
  const href = `/fight-nights/${featured.slug || featured.id}`
  const where = [featured.venue, featured.city].filter(Boolean).join(" · ")
  const poster = featured.flyerUrl || PLACEHOLDER.heroPoster

  return (
    <section
      id="happening-next"
      className="scroll-mt-24 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 md:min-h-[460px]">
        {/* Details — left */}
        <div className="order-2 md:order-1 md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block w-2 h-2 ${meta.dot} ${meta.live ? "animate-pulse" : ""}`} />
            <p className={`${meta.eyebrowText} text-[10px] font-bold tracking-[0.3em] uppercase`}>
              {meta.eyebrow}
            </p>
          </div>

          {featured.subtitle && (
            <p className="text-amber-600 text-xs font-bold tracking-[0.25em] uppercase mb-2">
              {featured.subtitle}
            </p>
          )}
          <h2 className="text-neutral-900 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[0.95] uppercase">
            {featured.title || "Fight Night"}
          </h2>

          <p className="mt-4 text-neutral-600 text-sm sm:text-base font-semibold">
            {formatDate(featured.date)}
            {where && <span className="text-neutral-300"> · </span>}
            {where}
          </p>

          {featured.prizeLabel?.trim() && (
            <p className="mt-6 inline-flex items-center gap-2 text-neutral-800 text-sm font-semibold">
              <span className="text-amber-600 text-[10px] font-bold tracking-[0.2em] uppercase">
                Play for
              </span>
              {featured.prizeLabel}
            </p>
          )}

          <div className="mt-8">
            <Link
              href={href}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors"
            >
              {meta.cta}
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Promoter poster — right. object-cover fills the panel (cropping as
            needed); the panel always has height from grid stretch / min-h so it
            can't collapse and leave empty space. */}
        <div className="relative order-1 md:order-2 md:col-span-2 min-h-[340px] md:min-h-0 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* Inline styles override the global `img { height:auto }` rule in
              components/global-styles.tsx, which otherwise wins (unlayered) over
              Tailwind utilities and stops the image from filling the panel. */}
          <img
            src={poster}
            alt={`${featured.title || "Fight Night"} poster`}
            className="absolute inset-0"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  )
}

/** Compact light-theme band shown when no event is featured. */
function NoEventBand() {
  return (
    <section
      id="happening-next"
      className="scroll-mt-24 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20"
    >
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 bg-amber-500" />
          <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase">
            Happening Next
          </p>
        </div>
        <p className="text-neutral-600 text-sm font-semibold">
          No fight night announced yet — follow TXMX for the next drop.
        </p>
        <p className="text-neutral-400 text-xs font-medium mt-2">
          Real prizes every fight night. Create your account and be ready.
        </p>
      </div>
    </section>
  )
}
