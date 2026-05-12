"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, ArrowRight } from "lucide-react"

const FLYER_URL =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffightnight.PNG?alt=media"

/** localStorage key + dismissal window */
const DISMISS_KEY = "fightnight-popup-dismissed-at"
const DISMISS_DAYS = 7
/** Delay before the popup appears on a fresh page load */
const APPEAR_DELAY_MS = 3500

function recentlyDismissed(): boolean {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const ts = parseInt(raw, 10)
  if (!Number.isFinite(ts)) return false
  const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24)
  return daysSince < DISMISS_DAYS
}

export default function FightNightPopup() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (recentlyDismissed()) return
    setMounted(true)
    const showTimer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS)
    return () => clearTimeout(showTimer)
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {
      // localStorage may be unavailable (private browsing) — non-critical
    }
    // Unmount after the close animation
    setTimeout(() => setMounted(false), 300)
  }

  if (!mounted) return null

  return (
    <div
      role="complementary"
      aria-label="Upcoming Fight Night"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-[88vw] max-w-[320px] transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative bg-black border border-white/15 rounded-xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-white/70 hover:text-white hover:bg-black/80 transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>

        {/* Flyer — natural aspect so the entire poster is visible (top isn't cropped) */}
        <Link
          href="/events/fight-night"
          onClick={dismiss}
          className="block relative bg-black overflow-hidden group"
          aria-label="View Fight Night details"
        >
          <Image
            src={FLYER_URL}
            alt="BOXR Station Members Only Fight Night flyer"
            width={640}
            height={960}
            sizes="320px"
            className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
            priority={false}
          />
        </Link>

        {/* Body + CTA */}
        <div className="px-4 py-3.5 border-t border-white/8">
          <p className="text-amber-500 text-[9px] font-bold tracking-[0.25em] uppercase mb-1">
            Members Only Fight Night
          </p>
          <p className="text-white text-sm font-semibold leading-snug mb-3">
            Pick winners. Stack points. Climb the leaderboard live.
          </p>
          <Link
            href="/events/fight-night"
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:text-amber-400 transition-colors group"
          >
            See the Card
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
