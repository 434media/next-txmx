import Link from "next/link"
import type { FightNight } from "../../app/actions/fightnight"

// Real TXMX brand image used as the prize-pack visual.
const PRIZE_IMAGE_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/bam2.jpg?alt=media"

/**
 * Bold, aspirational prize reveal — the page's #1 motivator, given real estate
 * instead of a tiny chip. Renders only when the featured event has a prize set.
 */
export default function PrizeReveal({
  featured,
}: {
  featured: FightNight
}) {
  if (!featured.prizeLabel?.trim()) return null
  const href = `/fight-nights/${featured.slug || featured.id}`

  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
      <div className="grid grid-cols-1 md:grid-cols-5 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 md:min-h-[460px]">
        {/* TXMX prize image — object-cover fills the panel (cropping as needed);
            the panel always has height so it can't collapse. */}
        <div className="relative md:col-span-2 min-h-[340px]  bg-neutral-100 order-1 md:order-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* Inline styles override the global `img { height:auto }` rule in
              components/global-styles.tsx, which otherwise wins (unlayered) over
              Tailwind utilities and stops the image from filling the panel. */}
          <img
            src={PRIZE_IMAGE_SRC}
            alt="TXMX prize pack"
            className="absolute inset-0"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
            The Prize
          </span>
        </div>

        {/* Copy */}
        <div className="order-2 md:order-1 md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
            Top of the board takes home
          </p>
          <h2 className="text-neutral-900 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95]">
            {featured.prizeLabel}
          </h2>
          {featured.prizeDetails?.trim() && (
            <p className="mt-4 text-neutral-600 text-sm sm:text-base font-medium leading-7 whitespace-pre-line">
              {featured.prizeDetails}
            </p>
          )}
          <div className="mt-7">
            <Link
              href={href}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-neutral-800 transition-colors"
            >
              Claim Your Shot
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
