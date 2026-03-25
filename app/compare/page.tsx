import type { Metadata } from "next"
import { getFighters } from "../actions/fighters"
import CompareClient from "./compare-client"

export const metadata: Metadata = {
  title: "Fighter Comparison | TXMX Boxing",
  description:
    "Compare two TDLR-licensed boxers side by side — records, physical stats, KO percentages, and fight history.",
  openGraph: {
    title: "Fighter Comparison | TXMX Boxing",
    description:
      "Side-by-side fighter comparison tool for Texas and Mexico boxers.",
    url: "https://www.txmxboxing.com/compare",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fighter Comparison | TXMX Boxing",
    description:
      "Side-by-side fighter comparison tool for Texas and Mexico boxers.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/compare",
  },
}

export default async function ComparePage() {
  const fighters = await getFighters()

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-10">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Fighter Comparison
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Select two fighters to compare records, physical attributes, and
            career stats side by side.
          </p>
        </div>
        <CompareClient fighters={fighters} />
      </div>
    </main>
  )
}
