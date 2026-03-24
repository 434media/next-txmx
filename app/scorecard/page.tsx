import type { Metadata } from "next"
import ScorecardVideo from "./scorecard-video"
import ScorecardCta from "./scorecard-cta"

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
  {
    name: "Rookie",
    threshold: "0 SP",
    color: "from-zinc-600 to-zinc-800",
    border: "border-zinc-600",
    glow: "",
  },
  {
    name: "Contender",
    threshold: "5,000 SP",
    color: "from-blue-600 to-blue-800",
    border: "border-blue-500",
    glow: "shadow-blue-500/20",
  },
  {
    name: "Champion",
    threshold: "25,000 SP",
    color: "from-amber-500 to-amber-700",
    border: "border-amber-500",
    glow: "shadow-amber-500/30",
  },
  {
    name: "Hall of Fame",
    threshold: "100,000+ SP",
    color: "from-purple-500 to-pink-600",
    border: "border-purple-400",
    glow: "shadow-purple-500/40",
  },
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

export default function ScorecardPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans">
      {/* Hero Section */}
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
            <p className="text-white/40 text-xs font-semibold tracking-[0.3em] leading-relaxed uppercase mb-4">
              TXMX Boxing
            </p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wide leading-none mb-6 uppercase">
              Scorecard
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-medium leading-relaxed max-w-md mb-4">
              The legal way to have skin in the game. Pick winners, earn
              TX-Credits, climb the leaderboard, and unlock real rewards — all
              through skill, not chance.
            </p>
            <p className="text-white/30 text-xs font-medium leading-relaxed max-w-md mb-8">
              $14.99/mo &middot; Zero app store tax &middot; 100% web
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-white/20" />
              <p className="text-white/30 text-xs font-medium tracking-widest leading-relaxed uppercase">
                Launching 2026
              </p>
            </div>
          </div>
        </div>
        <ScorecardVideo />
      </section>

      {/* The Thesis */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            The Opportunity
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 max-w-3xl">
            Sports betting is illegal in Texas.{" "}
            <span className="text-white/40">We built something better.</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-2xl mb-12">
            TXMX captures the &ldquo;Gambling Vacuum&rdquo; through a legal,
            skill-based engagement platform and NIL-sponsorship engine — giving
            Texas boxing fans a way to compete, earn, and rep their gym without
            crossing a legal line.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                label: "Zero App Store Tax",
                desc: "100% of your $14.99/mo stays in the TXMX ecosystem. No middlemen.",
              },
              {
                label: "SEO-Powered",
                desc: "Every Texas fighter and gym gets a unique, indexable URL to capture fan search traffic.",
              },
              {
                label: "Real-Time Updates",
                desc: "No review periods. New props, results, and features deploy instantly to all users.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-white/10 rounded-lg p-6 bg-white/2"
              >
                <p className="text-white text-sm font-semibold mb-2">
                  {item.label}
                </p>
                <p className="text-white/40 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Funnel */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            The Platform
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-16">
            Two layers. One ecosystem.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Public Layer */}
            <div className="border border-white/10 rounded-xl p-8 bg-white/2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase">
                  Public — Free
                </p>
              </div>
              <h3 className="text-white text-xl font-bold mb-4">
                The Data Layer
              </h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                The hook. SEO-optimized pages that capture organic search
                traffic and convert visitors into subscribers.
              </p>
              <ul className="space-y-3">
                {[
                  "Fighter Directory — searchable index of TDLR-licensed boxers",
                  "The Pulse Feed — interactive polls on the homepage",
                  "Live Schedule — curated calendar with Web Push reminders",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-white/50 text-sm"
                  >
                    <span className="text-green-500 mt-0.5 shrink-0">&#9654;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Black Card */}
            <div className="border border-amber-500/30 rounded-xl p-8 bg-amber-500/3 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background:
                    "radial-gradient(ellipse at top right, rgba(245,158,11,0.4), transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <p className="text-amber-500/60 text-xs font-semibold tracking-[0.2em] uppercase">
                    Black Card — $14.99/mo
                  </p>
                </div>
                <h3 className="text-white text-xl font-bold mb-4">
                  The Subscription Portal
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  Powered by Stripe. Premium UI theme, persistent TC &amp; SP
                  balances, and access to the full economy.
                </p>
                <ul className="space-y-3">
                  {[
                    "Prop Picks — predict bout outcomes for Skill Points",
                    "The Pledge — choose your Gym Franchise for the 16-week season",
                    "Rewards Store — spend TX-Credits on real merch and access",
                    "Leaderboard — compete for rank and status-gated rewards",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-white/50 text-sm"
                    >
                      <span className="text-amber-500 mt-0.5 shrink-0">&#9654;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Economy */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            The Economy
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Three currencies. One ledger.
          </h2>
          <p className="text-white/40 text-sm mb-16 max-w-xl">
            100 TX-Credits = $1.00 USD in redemption value. Target 3:1
            value-to-cost ratio for sustainable engagement.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skill Points */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-linear-to-r from-blue-600/20 to-blue-800/10 px-6 py-4 border-b border-white/5">
                <p className="text-blue-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  Skill Points (SP)
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Non-spendable &middot; Determines Rank
                </p>
              </div>
              <div className="p-6 space-y-3">
                {SP_ACTIONS.map((row) => (
                  <div key={row.action} className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{row.action}</span>
                    <span className="text-blue-400 text-sm font-semibold tabular-nums">
                      {row.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TX-Credits */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-linear-to-r from-emerald-600/20 to-emerald-800/10 px-6 py-4 border-b border-white/5">
                <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  TX-Credits (TC)
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Spendable &middot; Rewards Store currency
                </p>
              </div>
              <div className="p-6 space-y-3">
                {TC_ACTIONS.map((row) => (
                  <div key={row.action} className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{row.action}</span>
                    <span className="text-emerald-400 text-sm font-semibold tabular-nums">
                      {row.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-linear-to-r from-purple-600/20 to-purple-800/10 px-6 py-4 border-b border-white/5">
                <p className="text-purple-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  Loyalty Points (LP)
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Gym Tribe &middot; Season standings
                </p>
              </div>
              <div className="p-6 space-y-3">
                {LP_ACTIONS.map((row) => (
                  <div key={row.action} className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">{row.action}</span>
                    <span className="text-purple-400 text-sm font-semibold tabular-nums">
                      {row.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rank Progression */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            Progression
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-16">
            Climb the ranks. Unlock rewards.
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RANKS.map((rank, i) => (
              <div
                key={rank.name}
                className={`relative border ${rank.border} rounded-xl p-6 bg-linear-to-b ${rank.color} bg-opacity-10 ${rank.glow} shadow-lg`}
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))`,
                }}
              >
                <div
                  className={`absolute inset-0 rounded-xl bg-linear-to-b ${rank.color} opacity-10`}
                />
                <div className="relative z-10">
                  <p className="text-white/30 text-xs font-semibold tracking-wider uppercase mb-3">
                    Tier {i + 1}
                  </p>
                  <p className="text-white text-lg sm:text-xl font-bold mb-2">
                    {rank.name}
                  </p>
                  <p className="text-white/40 text-xs font-medium tabular-nums">
                    {rank.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            Under the Hood
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-16">
            Built for speed, built for Texas.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Triple-Ledger Database",
                desc: "Three distinct, immutable point balances per user — Skill Points (Rank), Loyalty Points (Gym), TX-Credits (Wallet).",
              },
              {
                title: "TDLR Ingest Engine",
                desc: "Automated scraper for tdlr.texas.gov — event schedules, fighter licensing, and official results synced in real-time.",
              },
              {
                title: "Web Push Notifications",
                desc: "Browser notifications for 'Main Event Starting' to drive users back to the site during live bouts.",
              },
              {
                title: "Admin Dashboard",
                desc: "Prop creator for Over/Under and custom bout questions. Economy governor to adjust TC rewards and prevent point inflation.",
              },
              {
                title: "Stripe Billing",
                desc: "Webhook-driven subscription management. Black Card features unlock instantly — no page refresh required.",
              },
              {
                title: "Status-Gated Rewards",
                desc: "TC-priced storefront with SP rank validation. Fulfillment via dropshipping APIs and automated NIL access.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-white/5 rounded-lg p-6 bg-white/1 hover:bg-white/3 transition-colors"
              >
                <p className="text-white text-sm font-semibold mb-2">
                  {item.title}
                </p>
                <p className="text-white/30 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            Roadmap
          </p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight mb-16">
            Two sprints to MVP.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    The Foundation
                  </p>
                  <p className="text-white/30 text-xs">Days 1–14</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Database schema & triple-ledger architecture",
                  "TDLR scraper — automated event & fighter sync",
                  "Responsive Fighter Profile UI (SEO optimized)",
                  "User authentication & session management",
                ].map((item) => (
                  <li
                    key={item}
                    className="text-white/40 text-sm flex items-start gap-2"
                  >
                    <span className="text-white/20 mt-0.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    The Economy
                  </p>
                  <p className="text-white/30 text-xs">Days 15–28</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Stripe integration & Black Card subscription flow",
                  "Admin CMS — Prop/Poll creator & economy governor",
                  "Points ledger — SP, TC, LP tracking & display",
                  "Rewards storefront with status gating",
                ].map((item) => (
                  <li
                    key={item}
                    className="text-white/40 text-sm flex items-start gap-2"
                  >
                    <span className="text-white/20 mt-0.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 px-8 sm:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/30 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
            Stay in the Loop
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            The future of Texas boxing is skill-based.
          </h2>
          <p className="text-white/40 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            No luck. No chance. Just knowledge. TXMX Scorecard rewards the fans
            who study the game.
          </p>
          <ScorecardCta />
        </div>
      </section>
    </main>
  )
}
