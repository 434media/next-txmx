"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isMobile
}

interface DeckNavProps {
  totalSlides: number
  currentSlide: number
  onNavigate: (index: number) => void
  slideLabels: string[]
}

export default function DeckNav({ totalSlides, currentSlide, onNavigate, slideLabels }: DeckNavProps) {
  const [showLabels, setShowLabels] = useState(false)

  return (
    <>
      {/* Slide counter — top right */}
      <div className="fixed top-6 right-8 z-50 flex items-center gap-3">
        <span className="text-white/20 text-[10px] font-bold tracking-wider tabular-nums">
          {String(currentSlide + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </span>
      </div>

      {/* FanOS logo — top left */}
      <div className="fixed top-6 left-8 z-50">
        <span className="text-[#00d4ff] text-sm font-black tracking-tight" style={{ textShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
          FanOS
        </span>
      </div>

      {/* Dot navigation — bottom on mobile, right edge on desktop */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:right-6 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-row md:flex-col gap-2 items-center md:items-end"
        onMouseEnter={() => setShowLabels(true)}
        onMouseLeave={() => setShowLabels(false)}
      >
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className="group flex items-center gap-2 cursor-pointer"
            aria-label={`Go to slide ${i + 1}: ${slideLabels[i]}`}
          >
            <AnimatePresence>
              {showLabels && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  className="hidden md:block text-[9px] font-bold tracking-wider text-white/30 uppercase whitespace-nowrap"
                >
                  {slideLabels[i]}
                </motion.span>
              )}
            </AnimatePresence>
            <div
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? "w-2 h-2 bg-[#00d4ff]"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              }`}
              style={i === currentSlide ? { boxShadow: "0 0 8px rgba(0,212,255,0.4)" } : undefined}
            />
          </button>
        ))}
      </div>

      {/* Keyboard hint — bottom center (only on first slide) */}
      <AnimatePresence>
        {currentSlide === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-14 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-white/15 text-[10px] font-semibold tracking-wider"
          >
            <span className="md:hidden">SWIPE TO NAVIGATE</span>
            <span className="hidden md:inline">SCROLL OR ↓ TO NAVIGATE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function useDeckNavigation(totalSlides: number, isMobile: boolean) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const navigateTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(totalSlides - 1, index))
    setCurrentSlide(clamped)
    if (isMobile && containerRef.current) {
      containerRef.current.scrollTo({ left: clamped * window.innerWidth, behavior: "smooth" })
    } else {
      const el = document.getElementById(`slide-${clamped}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [totalSlides, isMobile])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        navigateTo(currentSlide + 1)
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        navigateTo(currentSlide - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSlide, navigateTo])

  // Track current slide — horizontal scroll listener on mobile, IntersectionObserver on desktop
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current
      let ticking = false
      const onScroll = () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(() => {
            const idx = Math.round(container.scrollLeft / window.innerWidth)
            setCurrentSlide(Math.max(0, Math.min(totalSlides - 1, idx)))
            ticking = false
          })
        }
      }
      container.addEventListener("scroll", onScroll, { passive: true })
      return () => container.removeEventListener("scroll", onScroll)
    } else {
      const observers: IntersectionObserver[] = []
      for (let i = 0; i < totalSlides; i++) {
        const el = document.getElementById(`slide-${i}`)
        if (!el) continue
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                setCurrentSlide(i)
              }
            })
          },
          { threshold: 0.5 }
        )
        observer.observe(el)
        observers.push(observer)
      }
      return () => observers.forEach((o) => o.disconnect())
    }
  }, [totalSlides, isMobile])

  return { currentSlide, navigateTo, containerRef }
}
