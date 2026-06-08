import Link from "next/link"
import type { FightNight, FightNightBout } from "../../app/actions/fightnight"
import { PLACEHOLDER } from "../../lib/placeholder-media"
import { Section, Eyebrow, type EyebrowTone } from "./section"

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
  { eyebrow: string; cta: string; tone: EyebrowTone; live: boolean }
> = {
  announced: { eyebrow: "Happening Next", cta: "Enter Fight Night", tone: "amber", live: false },
  doors_open: { eyebrow: "Doors Open", cta: "Enter Fight Night", tone: "amber", live: false },
  live: { eyebrow: "Live Now", cta: "Watch Live · Play", tone: "red", live: true },
  completed: { eyebrow: "Latest Event", cta: "View Recap", tone: "emerald", live: false },
}

/** A bout has something worth showing once at least one fighter is named. */
function isNamed(b: FightNightBout): boolean {
  return !!(b.fighter1Name?.trim() || b.fighter2Name?.trim())
}

/**
 * "Happening Next" — the featured event as a full-bleed band: the promoter's
 * poster fills the left half, event details sit on the right. We never overlay
 * copy on the poster because we can't control what promoters send, so the
 * artwork is shown cleanly (object-cover) beside our text instead.
 *
 * The details column pulls the real event data the admin pipeline collects so
 * the hub reads as an event page, not just a fan-game explainer: the card's main
 * event + undercard, doors/first-bell times, the promoter's promo copy, and the
 * prize (label + details).
 */
export default function HeroFeatured({
  featured,
  bouts = [],
}: {
  featured: FightNight | null
  bouts?: FightNightBout[]
}) {
  if (!featured) return <NoEventBand />

  const meta = HERO_META[featured.status]
  const href = `/fight-nights/${featured.slug || featured.id}`
  const where = [featured.venue, featured.city].filter(Boolean).join(" · ")
  const poster = featured.flyerUrl || PLACEHOLDER.heroPoster

  // The card: main event first (or the first named bout as a fallback), then up
  // to two undercard matchups, with a "+N more" tail. Skipped entirely until at
  // least one fighter is named so we never render a wall of "TBA vs TBA".
  const named = [...bouts]
    .filter(isNamed)
    .sort((a, b) => (a.order ?? a.boutNumber) - (b.order ?? b.boutNumber))
  const main = named.find((b) => b.isMainEvent) || named[0] || null
  const undercard = main ? named.filter((b) => b !== main).slice(0, 2) : []
  const moreCount = Math.max(0, bouts.length - (main ? 1 : 0) - undercard.length)

  return (
    <section id="happening-next" className="scroll-mt-24">
      {/* Full-bleed band — flush to the viewport edges and to the hero above
          (no top margin/border) so the hero's bottom gradient blends straight
          into this neutral-50 band as the user scrolls. */}
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden border-b border-neutral-200 bg-neutral-50 md:min-h-[70vh]">
        {/* Promoter poster — left. object-cover fills the panel (cropping as
            needed); the panel always has height from grid stretch / min-h so it
            can't collapse and leave empty space. */}
        <div className="relative order-1 min-h-[360px] md:min-h-0 bg-neutral-100">
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

        {/* Details — right */}
        <div className="order-2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="max-w-xl">
            <Eyebrow tone={meta.tone} pulse={meta.live} mb="mb-4">
              {meta.eyebrow}
            </Eyebrow>

            {featured.subtitle && (
              <p className="text-neutral-500 text-xs font-bold tracking-[0.25em] uppercase mb-2">
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

            {featured.promoCopy?.trim() && (
              <p className="mt-4 text-neutral-600 text-sm font-medium leading-6 line-clamp-2 max-w-prose">
                {featured.promoCopy}
              </p>
            )}

            {main && (
              <div className="mt-6 border-t border-neutral-200 pt-5">
                <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                  {main.isMainEvent ? "Main Event" : "On the Card"}
                </p>
                <Matchup bout={main} emphasis />
                {undercard.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {undercard.map((b) => (
                      <li key={b.boutNumber}>
                        <Matchup bout={b} />
                      </li>
                    ))}
                  </ul>
                )}
                {moreCount > 0 && (
                  <p className="mt-2.5 text-neutral-400 text-xs font-medium">
                    +{moreCount} more bout{moreCount === 1 ? "" : "s"} on the card
                  </p>
                )}
              </div>
            )}

            {featured.prizeLabel?.trim() && (
              <div className="mt-6">
                <p className="inline-flex items-center gap-2 text-neutral-800 text-sm font-semibold">
                  <span className="text-amber-600 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Play for
                  </span>
                  {featured.prizeLabel}
                </p>
                {featured.prizeDetails?.trim() && (
                  <p className="mt-1.5 text-neutral-600 text-sm font-medium leading-6 whitespace-pre-line">
                    {featured.prizeDetails}
                  </p>
                )}
              </div>
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
        </div>
      </div>
    </section>
  )
}

/** A single matchup line: "Fighter A vs Fighter B · weight". */
function Matchup({ bout, emphasis = false }: { bout: FightNightBout; emphasis?: boolean }) {
  const f1 = bout.fighter1Name?.trim() || "TBA"
  const f2 = bout.fighter2Name?.trim() || "TBA"
  return (
    <p
      className={
        emphasis
          ? "text-neutral-900 text-base font-bold tracking-tight leading-snug"
          : "text-neutral-600 text-sm font-medium leading-snug"
      }
    >
      {f1} <span className="text-neutral-400 font-medium">vs</span> {f2}
      {bout.weightClass?.trim() && (
        <span className="text-neutral-400 font-medium">
          {" · "}
          {bout.weightClass}
        </span>
      )}
    </p>
  )
}

/** Compact light-theme band shown when no event is featured. */
function NoEventBand() {
  return (
    <Section id="happening-next">
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
        <Eyebrow tone="amber" mb="mb-3" className="justify-center">
          Happening Next
        </Eyebrow>
        <p className="text-neutral-600 text-sm font-semibold">
          No fight night announced yet — follow TXMX for the next drop.
        </p>
        <p className="text-neutral-400 text-xs font-medium mt-2">
          Real prizes every fight night. Create your account and be ready.
        </p>
      </div>
    </Section>
  )
}
