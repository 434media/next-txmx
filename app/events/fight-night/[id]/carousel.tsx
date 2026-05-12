"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps {
  /** Accessible label, e.g. "Props" or "Fight Card" */
  ariaLabel: string
  /** Mobile-only hint string, e.g. "Swipe → for all 8 bouts" */
  swipeHint?: string
  /** Pixels to scroll per arrow click (defaults to ~one card width) */
  scrollStep?: number
  children: React.ReactNode
}

/**
 * Horizontal snap-scroll carousel with desktop arrow buttons and a mobile swipe hint.
 * The container itself is the scroll viewport; children are expected to be
 * snap-aligned cards with explicit widths (e.g. `w-[85vw] sm:w-[340px]`).
 */
export default function Carousel({
  ariaLabel,
  swipeHint,
  scrollStep = 360,
  children,
}: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateButtons()
    el.addEventListener("scroll", updateButtons, { passive: true })
    const ro = new ResizeObserver(updateButtons)
    ro.observe(el)
    window.addEventListener("resize", updateButtons)
    return () => {
      el.removeEventListener("scroll", updateButtons)
      ro.disconnect()
      window.removeEventListener("resize", updateButtons)
    }
  }, [updateButtons])

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Prev — desktop only, hidden when at left edge */}
      <button
        type="button"
        onClick={() => scrollBy(-scrollStep)}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
        className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/85 backdrop-blur-sm border border-white/15 text-white shadow-lg hover:bg-black hover:border-white/30 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Next — desktop only, hidden when at right edge */}
      <button
        type="button"
        onClick={() => scrollBy(scrollStep)}
        disabled={!canScrollRight}
        aria-label="Scroll right"
        className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/85 backdrop-blur-sm border border-white/15 text-white shadow-lg hover:bg-black hover:border-white/30 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Right-edge fade — only when more content to the right */}
      {canScrollRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-linear-to-l from-black to-transparent z-10"
        />
      )}

      {/* Scroller */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {children}
      </div>

      {/* Mobile-only swipe hint */}
      {swipeHint && (
        <p className="lg:hidden text-white/45 text-[10px] font-bold tracking-[0.25em] uppercase mt-2 px-1">
          {swipeHint}
        </p>
      )}
    </div>
  )
}
