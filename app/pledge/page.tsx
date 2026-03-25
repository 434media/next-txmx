import type { Metadata } from "next"
import { getGyms } from "../actions/gyms"
import PledgeClient from "./pledge-client"

export const metadata: Metadata = {
  title: "Gym Pledge | Choose Your Franchise",
  description:
    "Pledge to a Texas boxing gym for the 16-week season. Earn Loyalty Points when your gym's fighters win — the franchise system for Texas boxing fans.",
  openGraph: {
    title: "Gym Pledge | TXMX Boxing",
    description:
      "Choose your gym. Earn LP when your fighters win. The franchise system for Texas boxing.",
    url: "https://www.txmxboxing.com/pledge",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gym Pledge | TXMX Boxing",
    description:
      "Choose your gym. Earn LP when your fighters win. The franchise system for Texas boxing.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/pledge",
  },
}

export default async function PledgePage() {
  const gyms = await getGyms()

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            Black Card &middot; The Pledge
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Gym Franchise
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Choose a gym for the 16-week season. When your gym&apos;s fighters
            win, you earn Loyalty Points. Locked once pledged — choose wisely.
          </p>
        </div>
        <PledgeClient gyms={gyms} />
      </div>
    </main>
  )
}
