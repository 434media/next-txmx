import type { Metadata } from "next"
import Image from "next/image"
import { getActiveFightNight, getBouts } from "../../actions/fightnight"
import FightNightClient from "./fight-night-client"
import HeroCta from "./hero-cta"

const FLYER_URL =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffightnight.PNG?alt=media"

export const metadata: Metadata = {
  title: "Fight Night | BOXR Station Presents",
  description:
    "BOXR Station presents Members Only Fight Night — powered by TXMX Boxing. Pick winners, stack points, climb the leaderboard live. In-person or online. Free to play.",
  openGraph: {
    title: "Fight Night | BOXR Station Presents",
    description:
      "BOXR Station presents Members Only Fight Night. Powered by TXMX Boxing. Pick winners. Stack points. Climb the leaderboard.",
    url: "https://www.txmxboxing.com/events/fight-night",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
    images: [{ url: FLYER_URL }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fight Night | BOXR Station Presents",
    description: "Pick winners. Stack points. Climb the leaderboard.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/events/fight-night",
  },
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

export default async function FightNightPage() {
  const fightNight = await getActiveFightNight()
  const bouts = fightNight ? await getBouts(fightNight.id) : []

  return (
    <main className="relative min-h-dvh bg-black font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-[calc(6rem+var(--live-ribbon-h,0px))] pb-20">
        <div className="fn-page-grid lg:grid lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_440px] lg:gap-12 xl:gap-16 lg:items-start">
          {/* ── LEFT / Mobile first — scrolling content
              Source-order first so mobile reads text → flyer.
              Desktop pins this in the left column. */}
          <div className="lg:order-1 space-y-16 lg:space-y-20">
            <div className="fn-page-marketing space-y-16 lg:space-y-20">
              <HeroIntro
                title={fightNight?.title || "Members Only Fight Night"}
                date={fightNight?.date}
                venue={fightNight?.venue || "BOXR Station"}
                city={fightNight?.city || "San Antonio"}
                hasActiveEvent={!!fightNight}
              />

              <HowItWorks />
            </div>

            <FightNightClient fightNight={fightNight} bouts={bouts} />
          </div>

          {/* ── RIGHT (desktop) / Mobile second — sticky flyer
              `lg:self-start` keeps the aside at its natural height instead
              of stretching to row height, so `position: sticky` anchors
              cleanly as the left column scrolls. */}
          <aside className="fn-flyer-aside lg:order-2 mt-10 lg:mt-0 lg:self-start lg:sticky lg:top-24">
            <FlyerCard
              title={fightNight?.title || "Members Only Fight Night"}
              date={fightNight?.date}
              venue={fightNight?.venue || "BOXR Station"}
            />
          </aside>
        </div>
      </div>
    </main>
  )

  function HeroIntro({
    title,
    hasActiveEvent,
  }: {
    title: string
    date?: string
    venue?: string
    city?: string
    hasActiveEvent: boolean
  }) {
    return (
      <section className="min-h-[80dvh] flex flex-col justify-center">
        <p className="text-amber-500 text-[11px] font-bold tracking-[0.3em] uppercase mb-3">
          BOXR Station Presents
        </p>
        <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase mb-6">
          {title}
        </h1>

        {/* Elevator pitch — what this is, not just what you do */}
        <p className="text-white text-base sm:text-lg font-semibold leading-7 max-w-xl mb-3">
          A free fan game for tonight's card. Pick the winners, climb the
          leaderboard, win a prize from the venue.
        </p>

        {/* Reinforcement — the brand voice line */}
        <p className="text-white/55 text-sm sm:text-base font-medium leading-7 max-w-xl mb-8">
          The skill-based fan experience powered by TXMX Boxing
        </p>

        {/* Prize callout — pulled from flat caption into an inline pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 bg-amber-500/10 border border-amber-500/30 rounded-full self-start">
          <span className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase leading-none">
            Tonight's Prize
          </span>
          <span className="w-px h-3 bg-amber-500/30" />
          <span className="text-white/85 text-xs font-semibold leading-none">
            Top of the leaderboard wins
          </span>
        </div>

        <HeroCta hasActiveEvent={hasActiveEvent} />

        <p className="text-white/55 text-xs font-medium leading-6 mt-6">
          Free to play · No subscription · No app to download
        </p>
      </section>
    )
  }
}

// ── Static sections ──────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Sign In or Sign Up",
      desc: "One tap with Google, or quick sign up with your name and email. Takes 15 seconds.",
    },
    {
      step: "02",
      title: "Pick Winners",
      desc: "Tap a fighter for each bout. Picks lock when the bell rings. Correct picks earn points.",
    },
    {
      step: "03",
      title: "Climb the Board",
      desc: "Watch the leaderboard move live after each fight. Top finisher tonight wins the venue prize.",
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-2 h-2 bg-amber-500" />
        <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
          How It Works
        </p>
      </div>
      <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
        Three steps to<br />
        <span className="text-white/45">a shot at the prize.</span>
      </h2>
      <p className="text-white/60 text-sm font-semibold leading-7 mb-10 max-w-lg">
        The whole crowd plays in real time. Online or in person — same leaderboard.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
        {steps.map((item) => (
          <div key={item.step} className="bg-black p-6 sm:p-7">
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2.5">
              Step {item.step}
            </p>
            <h3 className="text-white text-lg font-black uppercase tracking-tight leading-tight mb-2.5">
              {item.title}
            </h3>
            <p className="text-white/65 text-sm font-medium leading-6">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Sticky flyer card (right column) ─────────────────────────

function FlyerCard({
  title,
  date,
  venue,
}: {
  title: string
  date?: string
  venue?: string
}) {
  return (
    <div className="relative bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Flyer — natural aspect, no crop, no overlay pill */}
      <Image
        src={FLYER_URL}
        alt={`${title} flyer`}
        width={800}
        height={1200}
        sizes="(min-width: 1280px) 440px, (min-width: 1024px) 360px, 100vw"
        className="w-full h-auto block"
        priority
      />

      {/* Bottom strip — title + date/venue only */}
      <div className="px-4 py-3 border-t border-white/8">
        <p className="text-white text-sm font-bold leading-snug truncate">
          {title}
        </p>
        {(date || venue) && (
          <p className="text-white/45 text-[11px] font-medium leading-relaxed mt-0.5">
            {[date ? formatDate(date) : null, venue].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
}
