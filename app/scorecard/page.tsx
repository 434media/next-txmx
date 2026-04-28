import type { Metadata } from "next"
import Link from "next/link"
import ScorecardVideo from "./scorecard-video"
import ScorecardCta from "./scorecard-cta"
import BlackCardCta from "./blackcard-cta"

export const metadata: Metadata = {
  title: "Scorecard | Pick Winners. Stack Points. Climb the Ranks.",
  description:
    "The Scorecard — TXMX's skill-based engagement platform. Pick winners, earn TX-Credits, climb the leaderboard, and unlock rewards. The legal way to have skin in the game.",
  keywords: [
    "TXMX Scorecard",
    "boxing predictions",
    "skill-based boxing",
    "Texas boxing platform",
    "boxing leaderboard",
    "boxing rewards",
    "TX-Credits",
    "fighter records",
    "boxing event results",
    "San Antonio boxing",
    "TXMX Boxing",
    "boxing engagement",
    "Black Card",
  ],
  authors: [{ name: "TXMX Boxing" }],
  creator: "TXMX Boxing",
  openGraph: {
    title: "Scorecard — Pick Winners. Stack Points. Climb the Ranks.",
    description:
      "TXMX's skill-based engagement platform. Earn points, climb ranks, and unlock rewards — the legal way to have skin in the game in Texas.",
    url: "https://www.txmxboxing.com/scorecard",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scorecard | TXMX Boxing",
    description:
      "Pick winners, stack points, and climb the ranks. The legal way to have skin in the game.",
    creator: "@txmx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/scorecard",
  },
}

const RANKS = [
  { name: "Rookie", threshold: "0 SP" },
  { name: "Contender", threshold: "5,000 SP" },
  { name: "Champion", threshold: "25,000 SP" },
  { name: "Hall of Fame", threshold: "100,000+ SP" },
]

const SP_ACTIONS = [
  { action: "Match Winner (Open)", points: "100 SP" },
  { action: "Match Winner (League)", points: "250 SP" },
  { action: "Prop Pick (Standard)", points: "500 SP" },
  { action: "Prop Pick (Underdog)", points: "1,250 SP" },
]

const TC_ACTIONS = [
  { action: "Daily Web Login", points: "5 TC" },
  { action: "Complete Fan Poll", points: "10 TC" },
  { action: "Social Share (X/FB)", points: "20 TC" },
  { action: "Correct League Prediction", points: "100 TC" },
]

const LP_ACTIONS = [
  { action: "Gym Roster Win", points: "+10,000 LP" },
  { action: "Fan Multiplier", points: "1.1x per 1K fans" },
]

export default async function ScorecardPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans">
      {/* ============================================================
          1. HERO — Hook without price, scroll CTA
          ============================================================ */}
      <section className="relative h-dvh flex items-stretch overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-12 lg:px-20">
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.1) 40%, transparent 55%)",
            }}
          />
          <div className="relative z-10 max-w-lg">
            <p className="text-amber-500 text-xs font-bold tracking-[0.3em] leading-relaxed uppercase mb-4">
              TXMX Boxing
            </p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6 uppercase">
              This isn&apos;t a{" "}
              <span className="text-white/45">spectator sport</span>
            </h1>
            <p className="text-white/70 text-sm sm:text-base font-semibold leading-7 max-w-md mb-4">
              Pledge a gym. Call rounds. Stack points. The Scorecard is where you prove it. The Pledge is how you win a season.
            </p>
            <p className="text-white/55 text-xs font-semibold leading-relaxed max-w-md mb-8">
              Free to play &middot; Black Card unlocks the full economy
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="#how-it-works"
                className="inline-flex items-center px-5 py-2.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
              >
                How It Works
              </a>
              <a
                href="#the-pledge"
                className="inline-flex items-center px-5 py-2.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors"
              >
                The Pledge
              </a>
            </div>
          </div>
        </div>
        <ScorecardVideo />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none bg-linear-to-b from-transparent to-black" />
      </section>

      {/* ============================================================
          2. HOW IT WORKS — 4-step visual
          ============================================================ */}
      <section id="how-it-works" className="relative border-t border-white/10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 py-20 lg:py-28">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-2 h-2 bg-amber-500" />
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
              How It Works
            </p>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-4 max-w-xl">
            Four steps to<br /><span className="text-white/50">skin in the game</span>
          </h2>
          <p className="text-white/65 text-sm font-semibold leading-7 mb-14 max-w-lg">
            The Scorecard turns every fight card into a competition. Research the matchups, make your calls, and prove you know the game.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {[
              { step: "01", title: "Pledge a Gym", desc: "Franchise a Texas gym for 16 weeks. Pick 3 fighters from the roster — their wins earn bonus LP multipliers.", color: "text-amber-500" },
              { step: "02", title: "Pick Winners", desc: "Predict bout outcomes — match winners, method of victory, over/under rounds.", color: "text-blue-400" },
              { step: "03", title: "Earn Points", desc: "Correct picks earn Skill Points. Daily logins, polls, and shares earn TX-Credits.", color: "text-emerald-400" },
              { step: "04", title: "Climb Ranks", desc: "Stack points to rank up from Rookie to Hall of Fame. Spend credits in the store.", color: "text-purple-400" },
            ].map((item) => (
              <div key={item.step} className="bg-black p-8 sm:p-10">
                <p className={`${item.color} text-[10px] font-bold tracking-[0.3em] uppercase mb-4 opacity-80`}>
                  Step {item.step}
                </p>
                <h3 className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-6">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. FREE TO PLAY — Polls, Compare
          ============================================================ */}
      <section className="relative border-t border-white/10">
        {/* Free to Play eyebrow */}
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 pt-10 pb-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-emerald-500" />
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase">
              Also free — no account needed
            </p>
          </div>
        </div>

        {/* Free Features Grid — Polls, Compare */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10">
            {/* Polls */}
            <Link
              href="/polls"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-[0.2em] uppercase">
                    Free
                  </span>
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Polls
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Fan Polls
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Vote on live matchups and trending questions. Every poll earns
                  you TX-Credits.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  Cast Vote
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Head to Head */}
            <Link
              href="/compare"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-[0.2em] uppercase">
                    Free
                  </span>
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Head to Head
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Compare
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Stack any two fighters side-by-side. Records, win streaks, KO
                  rates — all visualized.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  Compare
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. THE ECONOMY (conceptual intro — moved up)
          ============================================================ */}
      <section className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 py-20 lg:py-28">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-2 h-2 bg-amber-500" />
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
              Three Currencies
            </p>
          </div>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-4 max-w-xl">
            Earn it. Spend it.<br /><span className="text-white/55">Climb.</span>
          </h2>
          <p className="text-white/65 text-sm font-semibold leading-7 mb-14 max-w-lg">
            Knowledge, loyalty, and consistency each have their own currency. Stack them to rank up, unlock rewards, and prove your status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10">
            <div className="bg-black p-8 sm:p-10">
              <span className="text-blue-400 text-xs font-bold tracking-wider">SP</span>
              <h3 className="text-white text-xl font-black uppercase tracking-tight leading-tight mt-2 mb-3">
                Skill Points
              </h3>
              <p className="text-white/70 text-sm font-semibold leading-6 mb-3">
                Earned from correct predictions. Non-spendable — your SP total determines your rank.
              </p>
              <p className="text-white/55 text-[10px] font-bold tracking-[0.25em] uppercase">
                Rank Currency
              </p>
            </div>
            <div className="bg-black p-8 sm:p-10">
              <span className="text-emerald-400 text-xs font-bold tracking-wider">TC</span>
              <h3 className="text-white text-xl font-black uppercase tracking-tight leading-tight mt-2 mb-3">
                TX-Credits
              </h3>
              <p className="text-white/70 text-sm font-semibold leading-6 mb-3">
                Earned from logins, polls, shares, and correct picks. Spend them in the Rewards Store.
              </p>
              <p className="text-white/55 text-[10px] font-bold tracking-[0.25em] uppercase">
                100 TC = $1.00 USD
              </p>
            </div>
            <div className="bg-black p-8 sm:p-10">
              <span className="text-purple-400 text-xs font-bold tracking-wider">LP</span>
              <h3 className="text-white text-xl font-black uppercase tracking-tight leading-tight mt-2 mb-3">
                Loyalty Points
              </h3>
              <p className="text-white/70 text-sm font-semibold leading-6 mb-3">
                Earned when your pledged gym wins. Tracks your franchise loyalty across seasons.
              </p>
              <p className="text-white/55 text-[10px] font-bold tracking-[0.25em] uppercase">
                Season Standings
              </p>
            </div>
          </div>

          {/* Rank Progression Ladder */}
          <div className="mt-14 border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase mb-6 relative">
              Rank Progression
            </p>
            <div className="relative">
              {/* Track background */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 rounded-full" />
              {/* Filled progress (demo: ~35% = early Contender) */}
              <div className="absolute top-5 left-0 h-0.5 bg-linear-to-r from-amber-500 to-amber-500/40 rounded-full" style={{ width: "35%" }} />

              <div className="grid grid-cols-4 relative">
                {[
                  { name: "Rookie", sp: "0", pct: "0%", active: true },
                  { name: "Contender", sp: "5K", pct: "33%", active: true },
                  { name: "Champion", sp: "25K", pct: "66%", active: false },
                  { name: "Hall of Fame", sp: "100K+", pct: "100%", active: false },
                ].map((rank, i) => (
                  <div key={rank.name} className={`flex flex-col ${i === 3 ? "items-end" : i === 0 ? "items-start" : "items-center"}`}>
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 mb-3 ${
                        rank.active
                          ? "bg-amber-500 border-amber-500/50"
                          : "bg-zinc-800 border-white/15"
                      }`}
                    />
                    <p className={`text-sm sm:text-base font-black uppercase tracking-tight leading-none mb-1 ${
                      rank.active ? "text-white" : "text-white/45"
                    }`}>
                      {rank.name}
                    </p>
                    <p className={`text-[10px] font-bold tabular-nums tracking-wider ${
                      rank.active ? "text-amber-500" : "text-white/40"
                    }`}>
                      {rank.sp} SP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 py-20 lg:py-28">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                Choose Your Level
              </p>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-4">
              Free vs. Black Card
            </h2>
            <p className="text-white/65 text-sm font-semibold leading-7 max-w-lg mx-auto">
              Start free. Upgrade when you&apos;re ready to compete.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10">
            {/* Free Column */}
            <div className="bg-black p-8 sm:p-12">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Free
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mb-3">
                The Foundation
              </h3>
              <p className="text-white/65 text-sm font-semibold leading-7 mb-8">
                Everything you need to research, follow, and start engaging.
              </p>
              <ul className="space-y-4">
                {[
                  "Browse the full fighter database",
                  "View event schedules and results",
                  "Compare fighters head-to-head",
                  "Vote in fan polls (earns TC)",
                  "Daily login rewards (earns TC)",
                  "Share to social media (earns TC)",
                  "View the leaderboard",
                  "View your Fan Card",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-white/70 text-sm font-semibold"
                  >
                    <span className="text-emerald-400 mt-0.5 shrink-0">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ScorecardCta />
              </div>
            </div>

            {/* Black Card Column */}
            <div className="bg-black p-8 sm:p-12 border-t lg:border-t-0 lg:border-l border-white/10 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-amber-500/30 lg:hidden" />
              <div className="absolute top-0 left-0 bottom-0 w-px bg-amber-500/30 hidden lg:block" />
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Black Card
                </span>
                <span className="text-white/65 text-[10px] font-bold tracking-wider">
                  $14.99/mo
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mb-3">
                The Full Economy
              </h3>
              <p className="text-white/65 text-sm font-semibold leading-7 mb-8">
                Everything free, plus predictions, franchise mode, and rewards.
              </p>
              <ul className="space-y-4">
                {[
                  "Everything in Free",
                  "Prop Picks — predict bout outcomes (earns SP)",
                  "The Pledge — franchise a gym for 16 weeks (earns LP)",
                  "Community Feed — post, reply, hype fighters",
                  "Rewards Store — spend TC and LP on merch and collectibles",
                  "Locker — equip avatar frames, titles, and flair",
                  "Quests — exclusive Black Card challenges",
                  "Seasonal leaderboard competition",
                ].map((item, i) => (
                  <li
                    key={item}
                    className={`flex items-start gap-3 text-sm font-semibold ${i === 0 ? "text-white/65" : "text-white/70"}`}
                  >
                    <span className="text-amber-500 mt-0.5 shrink-0">&#9654;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <BlackCardCta />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tier Divider: Free → Black Card ── */}
      <div className="h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* ============================================================
          6. BLACK CARD FEATURES — The Pledge (engine), Prop Picks, Community
          ============================================================ */}
      <section className="relative bg-zinc-950 overflow-hidden">
        {/* The Pledge — LEAD feature, Split Layout */}
        <div id="the-pledge" className="relative border-t border-b border-white/10 scroll-mt-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24 order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                  Black Card
                </span>
                <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Game Engine
                </p>
              </div>
              <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-5">
                The Pledge
              </h3>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-4">
                The Pledge is the engine the Scorecard runs on. Franchise a Texas gym for 16 weeks — you get the gym and every fighter on their roster. Their wins are your wins.
              </p>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-4">
                After pledging, pick your top 3 fighters from that gym&apos;s roster. When your picks win, you earn a bonus LP multiplier on top of your base gym points.
              </p>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-8">
                One gym. One roster. Three fighters. Sixteen weeks.
              </p>
              <Link
                href="/pledge"
                className="inline-flex items-center w-fit px-5 py-2.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors"
              >
                Choose Your Gym
              </Link>
            </div>
            {/* Mock Franchise Card visual */}
            <div className="relative min-h-[360px] lg:min-h-[480px] order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10 bg-zinc-950 flex items-center justify-center p-6 sm:p-10 lg:p-12">
              <div className="w-full max-w-sm flex flex-col space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">Your franchise card</p>
                </div>

                {/* Franchise Card */}
                <div className="border border-amber-500/20 rounded-2xl p-5 bg-amber-500/3 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Pledged Gym</p>
                      <h4 className="text-white text-base font-black uppercase tracking-tight leading-snug">
                        Martinez Boxing Gym
                      </h4>
                      <p className="text-white/60 text-xs font-semibold">San Antonio, TX</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-white/60 text-[9px] font-bold tracking-wider uppercase mb-1">Season</p>
                      <p className="text-white text-sm font-black">2026 S1</p>
                    </div>
                  </div>

                  {/* Week progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-white/60 text-[9px] font-bold tracking-wider uppercase">Week Progress</p>
                      <p className="text-amber-500 text-[9px] font-bold tracking-wider">Week 7 / 16</p>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/80 rounded-full" style={{ width: "43%" }} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/40 rounded-lg p-2.5 text-center">
                      <p className="text-purple-400 text-base font-black tabular-nums">47.2K</p>
                      <p className="text-white/55 text-[9px] font-bold tracking-wider uppercase">LP</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2.5 text-center">
                      <p className="text-white text-base font-black tabular-nums">5</p>
                      <p className="text-white/55 text-[9px] font-bold tracking-wider uppercase">Wins</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-2.5 text-center">
                      <p className="text-emerald-400 text-base font-black tabular-nums">1.2x</p>
                      <p className="text-white/55 text-[9px] font-bold tracking-wider uppercase">Multiplier</p>
                    </div>
                  </div>

                  {/* Fighter picks row */}
                  <div className="mb-4">
                    <p className="text-white/55 text-[9px] font-bold tracking-wider uppercase mb-2">Your 3 Picks</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 rounded-lg px-2.5 py-2 flex items-center justify-between">
                        <p className="text-white text-[10px] font-bold">R. Martinez</p>
                        <p className="text-emerald-400 text-[9px] font-bold">2W</p>
                      </div>
                      <div className="flex-1 bg-black/40 rounded-lg px-2.5 py-2 flex items-center justify-between">
                        <p className="text-white text-[10px] font-bold">J. Reyes</p>
                        <p className="text-emerald-400 text-[9px] font-bold">1W</p>
                      </div>
                      <div className="flex-1 bg-black/40 rounded-lg px-2.5 py-2 flex items-center justify-between">
                        <p className="text-white text-[10px] font-bold">L. Cruz</p>
                        <p className="text-white/40 text-[9px] font-bold">0W</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-emerald-400/70 text-[10px] font-bold tracking-wider uppercase">Active pledge · 9 weeks remaining</p>
                  </div>
                </div>

                {/* Leaderboard position */}
                <div className="border border-white/8 rounded-xl p-4 bg-white/2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                      <p className="text-amber-500 text-xs font-black">#</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-black tabular-nums">#14</p>
                      <p className="text-white/55 text-[10px] font-semibold">Season Leaderboard</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-xs font-bold">↑ 3</p>
                    <p className="text-white/55 text-[10px] font-semibold">this week</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <p className="text-white/55 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Martinez Boxing Gym
                  </p>
                  <p className="text-purple-400/50 text-[10px] font-bold tracking-[0.2em] uppercase">
                    47,200 LP earned
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prop Picks — Split Layout */}
        <div className="relative border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[360px] lg:min-h-[480px] border-b lg:border-b-0 lg:border-r border-white/10 bg-zinc-950 flex items-center justify-center p-6 sm:p-10 lg:p-12">
              {/* Mock Pick Card UI */}
              <div className="w-full max-w-sm flex flex-col space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">What picks look like</p>
                </div>
                {/* Card 1 — Match Winner (selected state) */}
                <div className="border border-white/10 rounded-xl p-5 bg-white/2">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-white text-sm font-bold leading-snug">
                      Garcia vs. Morales
                    </h4>
                    <span className="text-white/55 text-[10px] font-semibold tracking-wider uppercase shrink-0">
                      Match Winner
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-blue-400 text-xs font-semibold">250 SP</span>
                    <span className="text-emerald-400 text-xs font-semibold">100 TC</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="px-3 py-2.5 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-semibold text-center">
                      Garcia
                    </div>
                    <div className="px-3 py-2.5 rounded-lg border border-white/8 bg-white/2 text-white/50 text-sm font-semibold text-center">
                      Morales
                    </div>
                  </div>
                  <div className="text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-lg bg-amber-500/90 text-black text-center">
                    Lock In Pick
                  </div>
                </div>

                {/* Card 2 — Over/Under with Underdog badge */}
                <div className="border border-white/10 rounded-xl p-5 bg-white/2">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-white text-sm font-bold leading-snug">
                      Reyes vs. Tran — Total Rounds
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        Underdog
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-blue-400 text-xs font-semibold">1,250 SP</span>
                    <span className="text-emerald-400 text-xs font-semibold">100 TC</span>
                    <span className="text-amber-400/70 text-xs font-medium">1.25x</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2.5 rounded-lg border border-white/8 bg-white/2 text-white/50 text-sm font-semibold text-center">
                      Over 4.5
                    </div>
                    <div className="px-3 py-2.5 rounded-lg border border-white/8 bg-white/2 text-white/50 text-sm font-semibold text-center">
                      Under 4.5
                    </div>
                  </div>
                </div>

                {/* Card 3 — Locked pick (submitted state) */}
                <div className="border border-emerald-500/20 rounded-xl p-5 bg-emerald-500/3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-white text-sm font-bold leading-snug">
                      Salazar vs. Kim
                    </h4>
                    <span className="text-white/55 text-[10px] font-semibold tracking-wider uppercase shrink-0">
                      Method
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-emerald-400 text-sm font-semibold">
                      Pick locked: <span className="text-white/80">Salazar by KO/TKO</span>
                    </p>
                  </div>
                </div>

                {/* Summary strip */}
                <div className="flex items-center justify-between px-1 pt-2">
                  <p className="text-white/55 text-[10px] font-bold tracking-[0.2em] uppercase">
                    3 picks &middot; 1 locked
                  </p>
                  <p className="text-amber-500/50 text-[10px] font-bold tracking-[0.2em] uppercase">
                    1,750 SP potential
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                  Black Card
                </span>
                <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Predictions
                </p>
              </div>
              <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-5">
                Prop Picks
              </h3>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-8">
                Over/Under, method of victory, round calls — put your boxing
                IQ on the line. Correct picks earn Skill Points. Underdog picks pay 1.25x.
              </p>
              <Link
                href="/picks"
                className="inline-flex items-center w-fit px-5 py-2.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
              >
                Make Picks
              </Link>
            </div>
          </div>
        </div>

        {/* Community — Card */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/community"
              className="group relative bg-black px-8 sm:px-12 lg:px-20 py-12 lg:py-16 flex flex-col hover:bg-zinc-900 transition-colors duration-300"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                  Black Card
                </span>
                <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Community
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none mb-4 group-hover:text-amber-500 transition-colors">
                    The Feed
                  </h3>
                  <p className="text-white/60 text-sm font-semibold leading-7 max-w-md">
                    Share predictions, hype fighters, and connect with fans who
                    study the game.
                  </p>
                </div>
                <svg className="w-6 h-6 text-white/60 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300 shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. IDENTITY — Fan Card, Locker, Quests
          ============================================================ */}
      <section className="relative border-t border-white/5">
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10">
            {/* Fan Card */}
            <Link
              href="/fan-card"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Profile
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Fan Card
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Your rank, badges, and stats — one shareable card that proves
                  you study the game.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  View Card
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Locker */}
            <Link
              href="/locker"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="hidden lg:inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                    Black Card
                  </span>
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Collectibles
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Locker
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Equip avatar frames, titles, card skins, and flair. Customize
                  how you show up.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  Open Locker
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Quests */}
            <Link
              href="/fan-card"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Challenges
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Quests
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Complete challenges to earn badges, TX-Credits, and exclusive
                  locker items. Some quests require Black Card.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  View Quests
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. COMPETE — Leaderboard & Seasons
          ============================================================ */}
      <section className="relative border-t border-white/5">
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10">
            {/* Leaderboard */}
            <Link
              href="/leaderboard"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold tracking-[0.2em] uppercase">
                    Free to View
                  </span>
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Rankings
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Leaderboard
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  See who&apos;s stacking Skill Points. Black Card holders compete
                  for status-gated rewards.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  View Rankings
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Seasons */}
            <Link
              href="/seasons"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                    Black Card
                  </span>
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Competition
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Seasons
                </h3>
                <p className="text-white/70 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  16-week competitive windows with exclusive rewards and
                  leaderboards for top performers.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/65 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  View Seasons
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          9. REWARDS STORE
          ============================================================ */}
      <section className="relative border-t border-white/5 bg-zinc-950 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24 order-2 lg:order-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-bold tracking-[0.2em] uppercase">
                Black Card
              </span>
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                Spend Loop
              </p>
            </div>
            <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-5">
              Rewards Store
            </h3>
            <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-8">
              Spend TX-Credits and Loyalty Points on exclusive rewards — merch,
              collectibles, premium drops, and status-gated items.
            </p>
            <Link
              href="/rewards"
              className="inline-flex items-center w-fit px-5 py-2.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
            >
              Browse Store
            </Link>
          </div>
          <div className="relative min-h-[360px] lg:min-h-[480px] order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10">
            <div
              className="absolute inset-0 bg-zinc-900"
              style={{
                backgroundImage:
                  "url(https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/bam2.jpg?alt=media)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%)",
              }}
            />
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          10. EARNING DETAILS — Full economy tables + video
          ============================================================ */}
      <section className="relative border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Video */}
          <div className="relative hidden lg:block lg:min-h-[600px] lg:border-r border-white/10">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src="https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FTXMX%20Ethan%20Commerical.mp4?alt=media"
            />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%)",
              }}
            />
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
          </div>

          {/* Earning Details */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                Earning Details
              </p>
            </div>
            <h3 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-4">
              What every action earns
            </h3>
            <p className="text-white/60 text-sm font-semibold leading-7 mb-10 max-w-md">
              Full breakdown of how points are earned across the platform.
            </p>

            {/* Rank Tiers */}
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
              Rank Progression
            </p>
            <div className="grid grid-cols-2 gap-px bg-white/10 mb-10">
              {RANKS.map((rank, i) => (
                <div key={rank.name} className="relative bg-black p-4 sm:p-5">
                  <p className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                    Tier {i + 1}
                  </p>
                  <p className="text-white text-sm sm:text-base font-black uppercase tracking-tight leading-none mb-1">
                    {rank.name}
                  </p>
                  <p className="text-white/65 text-[11px] font-bold tabular-nums tracking-wider">
                    {rank.threshold}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                  <div
                    className="absolute bottom-0 left-0 h-px"
                    style={{ width: `${25 * (i + 1)}%`, background: "#f59e0b", opacity: 0.3 + i * 0.15 }}
                  />
                </div>
              ))}
            </div>

            {/* Earning Tables */}
            <p className="text-blue-400/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
              Earn Skill Points
            </p>
            <div className="border-t border-white/10 mb-8">
              {SP_ACTIONS.map((row) => (
                <div key={row.action} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <p className="text-white/50 text-xs font-semibold">{row.action}</p>
                  <p className="text-blue-400/80 text-xs font-bold tabular-nums tracking-wider">{row.points}</p>
                </div>
              ))}
            </div>

            <p className="text-emerald-400/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
              Earn TX-Credits
            </p>
            <div className="border-t border-white/10 mb-8">
              {TC_ACTIONS.map((row) => (
                <div key={row.action} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <p className="text-white/50 text-xs font-semibold">{row.action}</p>
                  <p className="text-emerald-400/80 text-xs font-bold tabular-nums tracking-wider">{row.points}</p>
                </div>
              ))}
            </div>

            <p className="text-purple-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
              Earn Loyalty Points
            </p>
            <p className="text-white/60 text-[10px] font-semibold leading-relaxed mb-3 max-w-sm">
              LP requires an active Pledge — you must have a franchised gym to earn them.
            </p>
            <div className="border-t border-white/10">
              {LP_ACTIONS.map((row) => (
                <div key={row.action} className="flex items-center justify-between py-2.5 border-b border-white/5">
                  <p className="text-white/50 text-xs font-semibold">{row.action}</p>
                  <p className="text-purple-400 text-xs font-bold tabular-nums tracking-wider">{row.points}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          11. CLOSING — CTA + Levantamos Los Puños
          ============================================================ */}
      <section className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 py-32 md:py-40 lg:py-52 text-center">
          <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
            TXMX Boxing
          </p>
          <h2 className="text-white text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1.10] mb-10">
            Levantamos
            <br />
            <span className="text-white/45">Los Puños</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ScorecardCta />
          </div>
        </div>
      </section>
    </main>
  )
}
