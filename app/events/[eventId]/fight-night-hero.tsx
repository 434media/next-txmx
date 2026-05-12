import type { TXMXEvent } from "../../actions/events"

interface FightNightHeroProps {
  event: TXMXEvent
  boutCount: number
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBD"
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export default function FightNightHero({ event, boutCount }: FightNightHeroProps) {
  const title = event.eventTitle || "Fight Night"
  const subtitle = event.promoter || event.venue || "TXMX Boxing"

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Background: flyer if provided, else gradient */}
      {event.flyerUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${event.flyerUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-amber-950/40 via-black to-black" />
      )}

      {/* Vignette + readability gradients */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 60%, #000 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-32 flex flex-col justify-end min-h-[68dvh]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
            </span>
            <p className="text-red-400 text-[10px] font-bold tracking-[0.3em] uppercase">
              Live · Free Tonight
            </p>
          </div>

          <p className="text-amber-500 text-xs font-bold tracking-[0.3em] leading-relaxed uppercase mb-3">
            {subtitle}
          </p>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-5 uppercase">
            {title}
          </h1>
          <p className="text-white/65 text-base sm:text-lg font-semibold leading-7 max-w-xl mb-6">
            {boutCount} bouts · {formatDate(event.date)} · {event.venue || event.city}
          </p>
          <p className="text-white/50 text-sm font-semibold leading-7 max-w-md mb-8">
            Sign up. Check in. Pick winners. The top of the leaderboard tonight wins a prize from the venue. No Black Card required.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <a
              href="#playbook"
              className="inline-flex items-center px-5 py-2.5 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all"
            >
              How It Works
            </a>
            <a
              href="#fight-card"
              className="inline-flex items-center px-5 py-2.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors"
            >
              Make Picks
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-linear-to-b from-transparent to-black" />
    </section>
  )
}
