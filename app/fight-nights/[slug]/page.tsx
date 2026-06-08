import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getFightNightBySlug, getBouts } from "../../actions/fightnight"
import { getStandings } from "../../actions/fightnight-standings"
import { getPrizes } from "../../actions/fightnight-prizes"
import { generateFightNightJsonLd } from "../../../lib/json-ld"
import FightNightClient from "./fight-night-client"
import HeroCta from "./hero-cta"
import RecapView from "./recap-view"
import HowItWorks from "../../../components/fight-nights/how-it-works"

const FALLBACK_FLYER =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffightnight.PNG?alt=media"

const SITE_URL = "https://www.txmxboxing.com"

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const fightNight = await getFightNightBySlug(slug)

  if (!fightNight) {
    return { title: "Fight Night Not Found | TXMX Boxing" }
  }

  const title = `${fightNight.title || "Fight Night"} | TXMX Boxing`
  const where = [fightNight.venue, fightNight.city].filter(Boolean).join(", ")
  const description =
    fightNight.promoCopy ||
    `${fightNight.title || "Fight Night"}${where ? ` at ${where}` : ""} — pick winners, stack points, climb the leaderboard live. Powered by TXMX Boxing.`
  const image = fightNight.flyerUrl || FALLBACK_FLYER
  const url = `${SITE_URL}/fight-nights/${fightNight.slug || slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "TXMX Boxing",
      locale: "en_US",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default async function FightNightSlugPage({ params }: PageProps) {
  const { slug } = await params
  const fightNight = await getFightNightBySlug(slug)
  if (!fightNight) notFound()

  const bouts = await getBouts(fightNight.id)

  const jsonLd = generateFightNightJsonLd(fightNight)
  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )

  // Completed nights render a static, server-rendered recap so the final
  // results + leaderboard are visible to everyone (standings/prizes are
  // auth-gated client-side, so we fetch them with the admin SDK here).
  if (fightNight.status === "completed") {
    const [standings, prizes] = await Promise.all([
      getStandings(fightNight.id, { limit: 50 }),
      getPrizes(fightNight.id),
    ])
    return (
      <>
        {jsonLdScript}
        <RecapView
          fightNight={fightNight}
          bouts={bouts}
          standings={standings}
          prizes={prizes}
        />
      </>
    )
  }

  // Announced / doors-open / live → the interactive game experience.
  const flyerUrl = fightNight.flyerUrl || FALLBACK_FLYER

  return (
    <main className="relative min-h-dvh bg-white font-sans">
      {jsonLdScript}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-[calc(6rem+var(--live-ribbon-h,0px))] pb-20">
        <div className="fn-page-grid lg:grid lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_440px] lg:gap-12 xl:gap-16 lg:items-start">
          {/* ── LEFT / Mobile first — scrolling content */}
          <div className="lg:order-1 space-y-16 lg:space-y-20">
            <div className="fn-page-marketing space-y-16 lg:space-y-20">
              <HeroIntro
                title={fightNight.title || "Members Only Fight Night"}
                subtitle={fightNight.subtitle || "BOXR Station Presents"}
                prizeLabel={fightNight.prizeLabel}
                hasActiveEvent
              />
              <HowItWorks variant="event" id="how-it-works" />
            </div>

            <FightNightClient fightNight={fightNight} bouts={bouts} />
          </div>

          {/* ── RIGHT (desktop) / Mobile second — sticky flyer */}
          <aside className="fn-flyer-aside lg:order-2 mt-10 lg:mt-0 lg:self-start lg:sticky lg:top-24">
            <FlyerCard
              flyerUrl={flyerUrl}
              title={fightNight.title || "Members Only Fight Night"}
              date={fightNight.date}
              venue={fightNight.venue || "BOXR Station"}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}

// ── Hero intro ───────────────────────────────────────────────

function HeroIntro({
  title,
  subtitle,
  prizeLabel,
  hasActiveEvent,
}: {
  title: string
  subtitle: string
  prizeLabel?: string
  hasActiveEvent: boolean
}) {
  return (
    <section className="min-h-[80dvh] flex flex-col justify-center">
      <p className="text-amber-600 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">
        {subtitle}
      </p>
      <h1 className="text-neutral-900 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase mb-6">
        {title}
      </h1>

      <p className="text-neutral-700 text-base sm:text-lg font-semibold leading-7 max-w-xl mb-3">
        A free fan game for tonight's card. Pick the winners, climb the
        leaderboard, win a prize from the venue.
      </p>

      <p className="text-neutral-500 text-sm sm:text-base font-medium leading-7 max-w-xl mb-8">
        The skill-based fan experience powered by TXMX Boxing
      </p>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-amber-50 border border-amber-200 rounded-full self-start">
        <span className="text-amber-600 text-[10px] font-bold tracking-[0.25em] uppercase leading-none">
          Tonight's Prize
        </span>
        <span className="w-px h-3 bg-amber-200" />
        <span className="text-neutral-800 text-xs font-semibold leading-none">
          {prizeLabel || "Top of the leaderboard wins"}
        </span>
      </div>

      <HeroCta hasActiveEvent={hasActiveEvent} />

      <p className="text-neutral-500 text-xs font-medium leading-6 mt-6">
        Free to play · No subscription · No app to download
      </p>
    </section>
  )
}

// ── Sticky flyer card (right column) ─────────────────────────

function FlyerCard({
  flyerUrl,
  title,
  date,
  venue,
}: {
  flyerUrl: string
  title: string
  date?: string
  venue?: string
}) {
  return (
    <div className="relative bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xl">
      <Image
        src={flyerUrl}
        alt={`${title} flyer`}
        width={800}
        height={1200}
        sizes="(min-width: 1280px) 440px, (min-width: 1024px) 360px, 100vw"
        className="w-full h-auto block"
        priority
      />

      <div className="px-4 py-3 border-t border-neutral-200">
        <p className="text-neutral-900 text-sm font-bold leading-snug truncate">
          {title}
        </p>
        {(date || venue) && (
          <p className="text-neutral-500 text-[11px] font-medium leading-relaxed mt-0.5">
            {[date ? formatDate(date) : null, venue].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}
