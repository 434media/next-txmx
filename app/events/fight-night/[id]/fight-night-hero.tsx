import type { FightNight } from "../../../actions/fightnight"

interface FightNightHeroProps {
  fightNight: FightNight
  boutCount: number
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA"
  const date = new Date(dateStr + "T12:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export default function FightNightHero({ fightNight, boutCount }: FightNightHeroProps) {
  const isLive = fightNight.status === "live" || fightNight.status === "doors_open"
  const isCompleted = fightNight.status === "completed"

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {fightNight.flyerUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fightNight.flyerUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-black to-black" />
      )}

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
            {isLive ? (
              <>
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
                </span>
                <p className="text-red-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                  {fightNight.status === "live" ? "Live Now" : "Doors Open · Free to Play"}
                </p>
              </>
            ) : isCompleted ? (
              <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                Completed
              </p>
            ) : (
              <p className="text-blue-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                Coming Up
              </p>
            )}
          </div>

          {fightNight.subtitle && (
            <p className="text-amber-500 text-xs font-bold tracking-[0.3em] leading-relaxed uppercase mb-3">
              {fightNight.subtitle}
            </p>
          )}
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-5 uppercase">
            {fightNight.title || "Fight Night"}
          </h1>
          <p className="text-white/65 text-base sm:text-lg font-semibold leading-7 max-w-xl mb-6">
            {boutCount > 0 ? `${boutCount} bouts · ` : ""}
            {formatDate(fightNight.date)} · {fightNight.venue || fightNight.city}
          </p>

          {fightNight.promoCopy && (
            <p className="text-white/55 text-sm font-medium leading-7 max-w-lg mb-6 whitespace-pre-line">
              {fightNight.promoCopy}
            </p>
          )}

          {fightNight.prizeLabel && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full mb-8">
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase">
                Prize
              </span>
              <span className="text-white/80 text-sm font-semibold">
                {fightNight.prizeLabel}
              </span>
            </div>
          )}

          {!isCompleted && (
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="#fight-card"
                className="inline-flex items-center px-5 py-3 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md"
              >
                Make Picks
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center px-5 py-3 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase hover:border-white/60 hover:bg-white/5 transition-all rounded-md"
              >
                How It Works
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none bg-gradient-to-b from-transparent to-black" />
    </section>
  )
}
