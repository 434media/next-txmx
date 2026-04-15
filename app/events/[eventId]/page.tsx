import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEventById, getEventBouts } from "../../actions/events"
import EventPicksClient from "./event-picks-client"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params
  const event = await getEventById(eventId)

  if (!event) {
    return { title: "Event Not Found | TXMX Boxing" }
  }

  const title = `${event.promoter} — ${event.city} | TXMX Boxing`
  const description = `${event.boutCount} bouts at ${event.venue}, ${event.city}. Pick winners and earn Skill Points.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.txmxboxing.com/events/${eventId}`,
      siteName: "TXMX Boxing",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://www.txmxboxing.com/events/${eventId}`,
    },
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBD"
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function isUpcoming(dateStr: string): boolean {
  if (!dateStr) return true
  const today = new Date().toISOString().slice(0, 10)
  return dateStr >= today
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params
  const event = await getEventById(eventId)

  if (!event) notFound()

  const bouts = event.eventNumber
    ? await getEventBouts(event.eventNumber)
    : []

  const upcoming = isUpcoming(event.date)

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Back link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-white/30 text-[11px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors mb-8 group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Events
        </Link>

        {/* Event header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            {upcoming ? (
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/15 px-2.5 py-1 rounded-full border border-blue-500/20">
                Upcoming
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider uppercase text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                Past
              </span>
            )}
            {event.eventNumber && (
              <span className="text-white/25 text-[10px] font-medium tracking-wider tabular-nums">
                TDLR #{event.eventNumber}
              </span>
            )}
          </div>

          <h1 className="text-white text-3xl sm:text-4xl font-black tracking-tight leading-none mb-3 uppercase">
            {event.promoter || "TBA"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/50 text-sm font-medium">
            <span>{formatDate(event.date)}</span>
            <span>{event.venue}</span>
            <span>{event.city}</span>
          </div>

          {event.address && (
            <p className="text-white/30 text-xs font-medium mt-2">
              {event.address}
            </p>
          )}
        </div>

        {/* Fight card with picks */}
        {bouts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-white text-lg font-bold uppercase tracking-tight">
                  Fight Card
                </h2>
                <span className="text-white/30 text-xs font-medium tabular-nums">
                  {bouts.length} bout{bouts.length !== 1 ? "s" : ""}
                </span>
              </div>
              {upcoming && (
                <span className="text-amber-500/70 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Pick Winners → Earn SP
                </span>
              )}
            </div>

            <EventPicksClient
              eventId={event.id}
              eventNumber={event.eventNumber}
              bouts={bouts}
              upcoming={upcoming}
            />
          </div>
        ) : (
          <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
            <p className="text-white/40 text-sm font-medium leading-6">
              {upcoming
                ? "Fight card TBA — check back closer to the event."
                : "No fight card data available for this event."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
