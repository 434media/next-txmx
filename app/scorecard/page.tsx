import type { Metadata } from "next"
import ScorecardVideo from "./scorecard-video"

export const metadata: Metadata = {
  title: "Scorecard | Fighter & Event Data",
  description:
    "The Scorecard — fighter records, event results, and data from the TXMX Boxing universe. Search bouts, stats, and results from San Antonio and beyond.",
  keywords: [
    'TXMX Scorecard',
    'boxing scorecard',
    'fighter records',
    'boxing event results',
    'fight stats',
    'San Antonio boxing data',
    'TXMX Boxing',
    'bout results',
    'boxing database',
  ],
  authors: [{ name: 'TXMX Boxing' }],
  creator: 'TXMX Boxing',
  openGraph: {
    title: "Scorecard — Fighter & Event Data | TXMX Boxing",
    description:
      "Fighter records, event results, and data from the TXMX Boxing universe. All the numbers — organized and searchable.",
    url: "https://www.txmxboxing.com/scorecard",
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Scorecard | TXMX Boxing",
    description:
      "Fighter records, event results, and data from the TXMX Boxing universe.",
    creator: '@txmx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/scorecard",
  },
}

export default function ScorecardPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans">
      {/* Hero Section */}
      <section className="relative h-dvh flex items-stretch overflow-hidden">
        {/* Left Side — Text Content */}
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
            <p className="text-white/60 text-sm sm:text-base font-medium leading-relaxed max-w-md mb-8">
              Your league pass to the action. Pick winners, stack points, and
              climb the leaderboard — a new way to experience TXMX Boxing.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-white/20" />
              <p className="text-white/30 text-xs font-medium tracking-widest leading-relaxed uppercase">
                Coming Soon
              </p>
            </div>
          </div>
        </div>

        {/* Right Side — Video */}
        <ScorecardVideo />
      </section>
    </main>
  )
}
