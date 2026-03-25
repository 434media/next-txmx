import type { Metadata } from "next"
import { getFighters } from "../actions/fighters"
import FightersClient from "./fighters-client"

export const metadata: Metadata = {
  title: "Fighter Directory | TDLR-Licensed Texas Boxers",
  description:
    "Searchable directory of TDLR-licensed boxers in Texas and Mexico. Fighter records, stats, and profiles — the most complete database in Texas boxing.",
  openGraph: {
    title: "Fighter Directory | TXMX Boxing",
    description:
      "Searchable directory of TDLR-licensed boxers. Records, stats, and profiles.",
    url: "https://www.txmxboxing.com/fighters",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fighter Directory | TXMX Boxing",
    description:
      "Searchable directory of TDLR-licensed boxers. Records, stats, and profiles.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/fighters",
  },
}

export default async function FightersPage() {
  const fighters = await getFighters()

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Fighter Directory
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Every TDLR-licensed boxer in Texas — searchable, sortable, and
            always up to date.
          </p>
        </div>
        <FightersClient fighters={fighters} />
      </div>
    </main>
  )
}
