import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Events | TXMX Boxing",
  description:
    "Two ways to live the fight. Fight Night — the skill-based fan game played live at local Texas fight cards. Or Rise of a Champion, the TXMX Iconic Series.",
  openGraph: {
    title: "Events | TXMX Boxing",
    description:
      "Two ways to live the fight. Fight Night with local gyms or Rise of a Champion, the TXMX Iconic Series.",
    url: "https://www.txmxboxing.com/events",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FDay2-21.jpg?alt=media",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | TXMX Boxing",
    description: "Two ways to live the fight. Pick yours.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/events",
  },
}

const HERO_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FDay1-1.jpg?alt=media"

export default function EventsPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Background image */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />

        {/* Readability gradients */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 60%, #000 100%)",
          }}
        />

        {/* Subtle film grain */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 sm:pt-36 lg:pt-44 pb-20 sm:pb-24 lg:pb-28 flex flex-col justify-end min-h-dvh">
          <div className="max-w-2xl">
            <p className="text-amber-500 text-xs font-bold tracking-[0.3em] leading-relaxed uppercase mb-5">
              TXMX Events
            </p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase mb-6">
              Two ways
              <br />
              <span className="text-white/40">to live the fight.</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg font-semibold leading-7 max-w-lg mb-10">
              Pick winners. Stack points. Climb the leaderboard 
              <span className="md:block">— or explore the TXMX Iconic Series.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/events/fight-night"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md group"
              >
                Fight Night
                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                href="/events/rise-of-a-champion"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all rounded-md group"
              >
                Rise of a Champion
                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-linear-to-b from-transparent to-black"
        />
      </section>

      {/* TWO PRODUCT CARDS */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-2 h-2 bg-amber-500" />
            <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
              What's Live
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10">
            {/* Fight Night card */}
            <Link
              href="/events/fight-night"
              className="group relative bg-black p-8 sm:p-10 lg:p-12 hover:bg-zinc-950 transition-colors duration-300"
            >
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                The Fan Game
              </p>
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-5">
                Fight Night
              </h2>
              <p className="text-white/65 text-sm sm:text-base font-medium leading-7 mb-8 max-w-md">
                The skill-based fan game played live at local Texas fight cards.
                Pick winners, call props, vote on polls, climb the leaderboard.
                In-person or online. Free to play.
              </p>
              <div className="space-y-2.5 mb-10">
                {[
                  "Pick every bout · earn Skill Points",
                  "On-site check-in for the venue prize",
                  "Real-time leaderboard moves after every fight",
                  "Built with local Texas gyms",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <span className="text-amber-500/70 text-xs leading-6 shrink-0">
                      ▸
                    </span>
                    <p className="text-white/55 text-[13px] font-medium leading-6">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 text-white text-xs font-bold tracking-[0.2em] uppercase group-hover:text-amber-400 transition-colors">
                Open Fight Night
                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>

            {/* Rise of a Champion card */}
            <Link
              href="/events/rise-of-a-champion"
              className="group relative bg-black p-8 sm:p-10 lg:p-12 hover:bg-zinc-950 transition-colors duration-300"
            >
              <p className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
                The Iconic Series
              </p>
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-5">
                Rise of a Champion
              </h2>
              <p className="text-white/65 text-sm sm:text-base font-medium leading-7 mb-8 max-w-md">
                TXMX's signature event experience — the showcase that
                celebrates the rise of Texas talent. Relive the moments,
                browse the gallery, and RSVP for what's next.
              </p>
              <div className="space-y-2.5 mb-10">
                {[
                  "Curated TXMX-produced fight cards",
                  "Photo & video archive of past events",
                  "RSVP for upcoming nights",
                  "The brand's flagship moment",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <span className="text-amber-500/70 text-xs leading-6 shrink-0">
                      ▸
                    </span>
                    <p className="text-white/55 text-[13px] font-medium leading-6">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 text-white text-xs font-bold tracking-[0.2em] uppercase group-hover:text-amber-400 transition-colors">
                Open Rise of a Champion
                <svg
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
