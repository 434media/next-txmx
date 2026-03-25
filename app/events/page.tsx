import type { Metadata } from "next"
import { getEvents } from "../actions/events"
import EventsClient from "./events-client"

export const metadata: Metadata = {
  title: "Event Schedule | Texas Boxing Events",
  description:
    "Complete schedule of TDLR-sanctioned boxing events across Texas and the border. Past results and upcoming fight cards — the most complete calendar in Texas boxing.",
  openGraph: {
    title: "Event Schedule | TXMX Boxing",
    description:
      "TDLR-sanctioned boxing events across Texas. Past results and upcoming fight cards.",
    url: "https://www.txmxboxing.com/events",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Schedule | TXMX Boxing",
    description:
      "TDLR-sanctioned boxing events across Texas. Past results and upcoming fight cards.",
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/events",
  },
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="text-white/50 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-4 uppercase">
            Event Schedule
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            Every TDLR-sanctioned boxing event in Texas — past results and
            upcoming fight cards.
          </p>
        </div>
        <EventsClient events={events} />
      </div>
    </main>
  )
}
