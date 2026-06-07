"use client"

import Link from "next/link"
import { useRef, useState } from "react"

// Real TXMX brand assets (same footage used by the retired Scorecard hero).
const VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fethanedit2.mp4?alt=media"
const POSTER_SRC =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fscorecard-poster.png?alt=media"

/**
 * Permanent intro hero for the Fight Nights hub — text left, video right, in
 * the TXMX brand style (modeled on the retired Scorecard hero). Always present
 * regardless of event state; it introduces the fan game. The live event lives
 * in the "Happening Next" section directly below.
 */
export default function IntroHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }

  return (
    <section className="relative flex items-stretch overflow-hidden bg-black min-h-dvh md:h-dvh">
      {/* Text — overlays video on mobile, left half on desktop */}
      <div className="relative z-10 flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-12 lg:px-20 py-32">
        {/* Mobile-only scrim so copy stays legible over the full-bleed video */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.2) 75%, transparent 100%)",
          }}
        />
        <div className="relative z-10 max-w-lg">
          <p className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            TXMX Boxing · The Fan Game
          </p>
          <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6 uppercase">
            Don&apos;t just watch.{" "}
            <span className="text-white/45">Get in the fight.</span>
          </h1>
          <p className="text-white/75 text-sm sm:text-base font-semibold leading-7 max-w-md mb-4">
            Pick winners, call props, and climb the leaderboard live at every
            TXMX fight night — in person or online.
          </p>
          <p className="text-white/55 text-xs font-semibold tracking-wide mb-8">
            Free to play · No experience needed
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="#join"
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors"
            >
              Create Free Account
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-6 py-3 border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:border-white/60 hover:bg-white/5 transition-all"
            >
              How It Works
            </a>
          </div>
        </div>
      </div>

      {/* Video — full-bleed background on mobile, right half on desktop */}
      <div className="absolute inset-0 md:relative md:w-1/2 bg-black">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          preload="metadata"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="w-full h-full object-cover object-center"
        />
        {/* Desktop seam gradient — blends the video into the text column */}
        <div
          className="absolute inset-0 hidden md:block pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 18%, transparent 40%)",
          }}
        />
        <button
          onClick={toggleAudio}
          className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </section>
  )
}
