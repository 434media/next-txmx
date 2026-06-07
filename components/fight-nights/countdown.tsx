"use client"

import { useEffect, useState } from "react"

/**
 * Live countdown to a fight night's first bell. Renders nothing for an invalid
 * target, and a "go time" flash once the bell has rung. Client-only timing
 * (mounts to null first) to avoid hydration mismatch.
 */
export default function Countdown({
  target,
  tone = "light",
}: {
  /** ISO datetime of first bell. */
  target: string
  /** "light" = white digits (over hero imagery); "dark" = neutral-900 digits. */
  tone?: "light" | "dark"
}) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const t = target ? new Date(target).getTime() : NaN
  if (!target || Number.isNaN(t)) return null

  const digit = tone === "light" ? "text-white" : "text-neutral-900"
  const unit = tone === "light" ? "text-white/55" : "text-neutral-500"
  const box =
    tone === "light"
      ? "bg-white/10 border-white/15"
      : "bg-neutral-100 border-neutral-200"

  // Pre-mount + post-bell states.
  if (now === null) {
    return (
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`w-14 h-16 rounded-lg border ${box} animate-pulse`} />
        ))}
      </div>
    )
  }

  const diff = t - now
  if (diff <= 0) {
    return (
      <span className={`text-sm font-black uppercase tracking-[0.2em] ${digit}`}>
        It&apos;s go time — picks are live.
      </span>
    )
  }

  const d = Math.floor(diff / 86_400_000)
  const h = Math.floor((diff % 86_400_000) / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  const units = [
    { v: d, l: "Days" },
    { v: h, l: "Hrs" },
    { v: m, l: "Min" },
    { v: s, l: "Sec" },
  ]

  return (
    <div className="flex gap-2">
      {units.map((u) => (
        <div
          key={u.l}
          className={`w-14 rounded-lg border ${box} px-2 py-2 text-center`}
        >
          <p className={`text-2xl font-black tabular-nums leading-none ${digit}`}>
            {String(u.v).padStart(2, "0")}
          </p>
          <p className={`text-[9px] font-bold uppercase tracking-[0.15em] mt-1 ${unit}`}>
            {u.l}
          </p>
        </div>
      ))}
    </div>
  )
}
