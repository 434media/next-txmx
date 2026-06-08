import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getFightNightBySlug,
  getBouts,
  type FightNight,
  type FightNightBout,
} from "../../actions/fightnight"
import { getStandings } from "../../actions/fightnight-standings"
import { getPrizes } from "../../actions/fightnight-prizes"
import { generateFightNightJsonLd } from "../../../lib/json-ld"
import FightNightClient from "./fight-night-client"
import HeroCta from "./hero-cta"
import RecapView from "./recap-view"
import HowItWorks from "../../../components/fight-nights/how-it-works"
import Countdown from "../../../components/fight-nights/countdown"

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
            <div className="fn-page-marketing">
              <HeroIntro fightNight={fightNight} bouts={bouts} />
            </div>

            {/* Action first — the sign-up form / live game sits right under the
                hero so a visitor (especially at the venue) can act without
                scrolling past the explainer. */}
            <FightNightClient fightNight={fightNight} bouts={bouts} flyerUrl={flyerUrl} />

            {/* How it works moved below the game — reference, not a gate. Still
                tagged fn-page-marketing so it hides once the user is engaged. */}
            <div className="fn-page-marketing">
              <HowItWorks variant="event" id="how-it-works" />
            </div>
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

/** A bout is worth showing once at least one fighter is named. */
function isNamed(b: FightNightBout): boolean {
  return !!(b.fighter1Name?.trim() || b.fighter2Name?.trim())
}

function HeroIntro({
  fightNight,
  bouts,
}: {
  fightNight: FightNight
  bouts: FightNightBout[]
}) {
  const subtitle = fightNight.subtitle || "BOXR Station Presents"
  const title = fightNight.title || "Members Only Fight Night"
  const showCountdown = !!fightNight.firstBellAt

  // The card: main event (or first named bout) + up to two undercard matchups.
  const named = [...bouts]
    .filter(isNamed)
    .sort((a, b) => (a.order ?? a.boutNumber) - (b.order ?? b.boutNumber))
  const main = named.find((b) => b.isMainEvent) || named[0] || null
  const undercard = main ? named.filter((b) => b !== main).slice(0, 2) : []
  const moreCount = Math.max(0, bouts.length - (main ? 1 : 0) - undercard.length)

  return (
    <section className="pt-4 pb-6">
      <p className="text-amber-600 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">
        {subtitle}
      </p>
      <h1 className="text-neutral-900 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase mb-5">
        {title}
      </h1>

      <p className="text-neutral-700 text-base sm:text-lg font-semibold leading-7 max-w-xl mb-8">
        A free fan game for tonight&apos;s card — pick the winners, climb the
        leaderboard, and win a prize from the venue.
      </p>

      {/* Countdown to first bell */}
      {showCountdown && (
        <div className="mb-6">
          <p className="text-neutral-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2.5">
            First bell in
          </p>
          <Countdown target={fightNight.firstBellAt} tone="dark" />
        </div>
      )}

      {/* Tonight's prize */}
      <div className="mb-6 max-w-xl">
        <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
          Tonight&apos;s Prize
        </p>
        <p className="text-neutral-900 text-lg sm:text-xl font-black uppercase tracking-tight leading-tight">
          {fightNight.prizeLabel?.trim() || "Top of the leaderboard wins"}
        </p>
        {fightNight.prizeDetails?.trim() && (
          <p className="text-neutral-600 text-sm font-medium leading-6 mt-1.5 whitespace-pre-line">
            {fightNight.prizeDetails}
          </p>
        )}
      </div>

      {/* On the card */}
      {main && (
        <div className="mb-8 max-w-xl border-t border-neutral-200 pt-5">
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

      <HeroCta hasActiveEvent />

      <p className="text-neutral-500 text-xs font-medium leading-6 mt-6">
        Free to play · No subscription · No app to download
      </p>
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
    // object-cover fills the panel (like the hub's "Happening Next" image). On
    // desktop the panel is a tall, near-viewport-height block so the flyer keeps
    // presence as the left column scrolls past it (the aside is sticky).
    <div className="relative rounded-xl overflow-hidden border border-neutral-200 shadow-xl bg-neutral-100 aspect-3/4 lg:aspect-auto lg:h-[calc(100dvh-9rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flyerUrl}
        alt={`${title} flyer`}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Caption overlay — the cover crop leaves no room for a panel below, so
          the title/date sit over a bottom scrim like a poster. */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent px-4 pt-12 pb-4">
        <p className="text-white text-sm font-bold leading-snug truncate">
          {title}
        </p>
        {(date || venue) && (
          <p className="text-white/70 text-[11px] font-medium leading-relaxed mt-0.5">
            {[date ? formatDate(date) : null, venue].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}
