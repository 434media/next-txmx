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
            <p className="text-amber-500 text-xs font-bold tracking-[0.3em] leading-relaxed uppercase mb-4">
              TXMX Boxing
            </p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6 uppercase">
              This isn&apos;t a{" "}
              <span className="text-white/30">spectator sport</span>
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-semibold leading-7 max-w-md mb-4">
              Pick fighters. Call rounds. Stack points. The Scorecard rewards
              the fans who actually study the game — not the ones who guess.
            </p>
            <p className="text-white/30 text-xs font-semibold leading-relaxed max-w-md mb-8">
              $14.99/mo &middot; Zero app store tax &middot; 100% web
            </p>
            <ScorecardCta />
          </div>
        </div>
        <ScorecardVideo />
        {/* Bottom fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none bg-linear-to-b from-transparent to-black" />
      </section>

      {/* Feature Hub */}
      <section className="relative py-24 overflow-hidden">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Fighters — Split Layout */}
        <div className="relative border-t border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24 order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block w-2 h-2 bg-amber-500" />
                <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Live Database
                </p>
              </div>
              <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-5">
                Fighters
              </h3>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-8">
                Every TDLR-licensed boxer in Texas. Records, stats, fight
                history — the most complete database in the state.
              </p>
              <Link
                href="/fighters"
                className="group inline-flex items-center gap-3 text-white text-xs font-bold tracking-[0.2em] uppercase hover:text-white/60 transition-colors w-fit"
              >
                <span className="inline-block w-8 h-px bg-white group-hover:w-12 transition-all duration-300" />
                Browse Roster
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="relative min-h-[360px] lg:min-h-[480px] order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-white/10">
              <div
                className="absolute inset-0 bg-zinc-900"
                style={{
                  backgroundImage:
                    "url(https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fjune15th-9.jpg?alt=media)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Gritty overlay on image */}
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
        </div>

        {/* Events — Split Layout (reversed) */}
        <div className="relative border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[360px] lg:min-h-[480px] border-b lg:border-b-0 lg:border-r border-white/10">
              <div
                className="absolute inset-0 bg-zinc-900"
                style={{
                  backgroundImage:
                    "url(https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffeb28-29.jpg?alt=media)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
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
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 lg:py-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-block w-2 h-2 bg-amber-500" />
                <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">
                  Schedule
                </p>
              </div>
              <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-5">
                Events
              </h3>
              <p className="text-white/60 text-sm font-semibold leading-7 max-w-sm mb-8">
                Upcoming bouts, past results, and push notifications so you
                never miss a main event.
              </p>
              <Link
                href="/events"
                className="group inline-flex items-center gap-3 text-white text-xs font-bold tracking-[0.2em] uppercase hover:text-white/60 transition-colors w-fit"
              >
                <span className="inline-block w-8 h-px bg-white group-hover:w-12 transition-all duration-300" />
                View Schedule
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Predictions, Rankings, Community, Head to Head */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-px bg-white/10">
            {/* Predictions */}
            <Link
              href="/picks"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500/80 lg:text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Predictions
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Prop Picks
                </h3>
                <p className="text-white/60 lg:text-white/50 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Over/Under, method of victory, round calls — put your boxing
                  IQ on the line.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/40 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  Make Picks
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Rankings */}
            <Link
              href="/leaderboard"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500/80 lg:text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Rankings
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Leaderboard
                </h3>
                <p className="text-white/60 lg:text-white/50 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  See who&apos;s stacking Skill Points. Compete for rank and
                  status-gated rewards.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/40 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
                <span className="inline-block w-8 h-px bg-white lg:hidden group-hover:w-12 transition-all duration-300" />
                <span className="text-xs lg:text-[10px] font-bold tracking-[0.2em] uppercase">
                  View Rankings
                </span>
                <svg className="w-4 h-4 lg:w-3 lg:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            {/* Community */}
            <Link
              href="/polls"
              className="group relative bg-black px-8 sm:px-12 lg:p-10 py-12 lg:py-10 flex flex-col justify-between lg:min-h-[280px] hover:bg-zinc-950 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-2 mb-5 lg:mb-4">
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500/80 lg:text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Community
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Fan Polls
                </h3>
                <p className="text-white/60 lg:text-white/50 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Vote on live matchups and trending questions. Every poll earns
                  you TX-Credits.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/40 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
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
                  <span className="inline-block w-2 h-2 bg-amber-500 lg:hidden" />
                  <p className="text-amber-500/80 lg:text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase">
                    Head to Head
                  </p>
                </div>
                <h3 className="text-white text-3xl lg:text-xl font-black uppercase tracking-tight leading-none lg:leading-tight mb-4 lg:mb-3 group-hover:text-amber-500 transition-colors">
                  Compare
                </h3>
                <p className="text-white/60 lg:text-white/50 text-sm font-semibold leading-7 lg:leading-6 max-w-sm">
                  Stack any two fighters side-by-side. Records, win streaks, KO
                  rates — all visualized.
                </p>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 text-white/40 group-hover:text-amber-500 transition-colors mt-8 lg:mt-6">
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

      {/* Black Card Highlight */}
      <section className="-mt-10 relative border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-20 lg:py-28 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                Black Card — $14.99/mo
              </p>
            </div>
            <h3 className="text-white text-3xl sm:text-4xl font-black leading-[0.95] mb-5 uppercase tracking-tight">
              Unlock the full economy.
            </h3>
            <p className="text-white/60 text-sm font-semibold leading-7 mb-8 max-w-md">
              Prop Picks, The Pledge, Rewards Store, and full Leaderboard
              access. Powered by Stripe — zero app store tax.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Predict bout outcomes for Skill Points",
                "Choose your Gym Franchise for the 16-week season",
                "Spend TX-Credits on real merch and access",
                "Compete for rank and status-gated rewards",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-white/50 text-sm font-semibold"
                >
                  <span className="text-amber-500 mt-0.5 shrink-0">&#9654;</span>
                  {item}
                </li>
              ))}
            </ul>
            <BlackCardCta />
          </div>
          <div className="relative min-h-[400px] lg:min-h-[560px] order-1 lg:order-2 border-t lg:border-t-0 lg:border-l border-white/10">
            <div
              className="absolute inset-0 bg-zinc-900"
              style={{
                backgroundImage:
                  "url(https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FDay2-21.jpg?alt=media)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.05) 100%)",
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
        </div>
      </section>

      {/* Economy + Progression */}
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

          {/* Economy Content */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 lg:py-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">
                The Economy
              </p>
            </div>
            <h3 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-4">
              Earn it. Spend it. Climb.
            </h3>
            <p className="text-white/60 text-sm font-semibold leading-7 mb-10 max-w-md">
              Three currencies reward knowledge, loyalty, and consistency.
              Stack points to rank up. Spend credits in the rewards store.
            </p>

            {/* Currencies */}
            <div className="space-y-0 border-t border-white/10 mb-10">
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="text-white text-sm font-black tracking-wide uppercase">
                    Skill Points
                  </p>
                  <p className="text-white/30 text-xs font-semibold mt-0.5">
                    Non-spendable &middot; Determines Rank
                  </p>
                </div>
                <span className="text-white/20 text-xs font-bold tracking-wider">SP</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="text-white text-sm font-black tracking-wide uppercase">
                    TX-Credits
                  </p>
                  <p className="text-white/30 text-xs font-semibold mt-0.5">
                    Spendable &middot; 100 TC = $1.00 USD
                  </p>
                </div>
                <span className="text-white/20 text-xs font-bold tracking-wider">TC</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="text-white text-sm font-black tracking-wide uppercase">
                    Loyalty Points
                  </p>
                  <p className="text-white/30 text-xs font-semibold mt-0.5">
                    Gym Tribe &middot; Season standings
                  </p>
                </div>
                <span className="text-white/20 text-xs font-bold tracking-wider">LP</span>
              </div>
            </div>

            {/* Rank Tiers */}
            <p className="text-amber-500/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
              Rank Progression
            </p>
            <div className="grid grid-cols-2 gap-px bg-white/10">
              {RANKS.map((rank, i) => (
                <div key={rank.name} className="relative bg-black p-4 sm:p-5">
                  <p className="text-amber-500/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                    Tier {i + 1}
                  </p>
                  <p className="text-white text-sm sm:text-base font-black uppercase tracking-tight leading-none mb-1">
                    {rank.name}
                  </p>
                  <p className="text-white/40 text-[11px] font-bold tabular-nums tracking-wider">
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
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-20 py-32 md:py-40 lg:py-52 text-center">
          <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
            TXMX Boxing
          </p>
          <h2 className="text-white text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[1.10]">
            Levantamos
            <br />
            <span className="text-white/20">Los Puños</span>
          </h2>
        </div>
      </section>
    </main>
  )
}
