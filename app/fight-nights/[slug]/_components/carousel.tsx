"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps {
  /** Accessible label, e.g. "Props" or "Fight Card" */
  ariaLabel: string
  /**
   * Mobile-only hint shown ABOVE the carousel — guides first-time users
   * to swipe. Pass clean text without an arrow ("for all 8 bouts");
   * the component renders an animated chevron on the leading edge.
   */
  swipeHint?: string
  /** Pixels to scroll per arrow click (defaults to ~one card width) */
  scrollStep?: number
  children: React.ReactNode
}

/**
 * Horizontal snap-scroll carousel with desktop arrow buttons and a mobile
 * swipe hint. The mobile hint sits above the scroller (where the user looks
 * first) with an amber accent + animated chevron, and auto-dismisses once
 * the user has scrolled.
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
  // Once the user scrolls (or the content fits), drop the swipe hint so it
  // doesn't nag returning users. A 4px threshold ignores momentum jitter.
  const [hasScrolled, setHasScrolled] = useState(false)

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const left = el.scrollLeft > 4
    setCanScrollLeft(left)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    if (left) setHasScrolled(true)
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

  // Show the hint only on mobile, only when there's actually more to swipe,
  // and only until the user has scrolled at least once.
  const showHint = !!swipeHint && canScrollRight && !hasScrolled

  return (
    <div className="relative">
      {/* Mobile-only swipe hint — sits above the scroller so first-time
          users see the affordance before they reach the cards. */}
      {showHint && (
        <p className="lg:hidden flex items-center gap-1.5 text-amber-600 text-[11px] font-semibold mb-2.5 px-1">
          <ChevronRight
            className="w-3.5 h-3.5 shrink-0 animate-[swipe-nudge_1.4s_ease-in-out_infinite]"
            strokeWidth={2.5}
          />
          <span>{swipeHint}</span>
        </p>
      )}

      {/* Local keyframes for the chevron nudge — keeps the animation
          self-contained so we don't have to touch globals.css. */}
      <style jsx>{`
        @keyframes swipe-nudge {
          0%,
          100% {
            transform: translateX(0);
            opacity: 0.7;
          }
          50% {
            transform: translateX(4px);
            opacity: 1;
          }
        }
      `}</style>

      {/* Prev — desktop only, hidden when at left edge */}
      <button
        type="button"
        onClick={() => scrollBy(-scrollStep)}
        disabled={!canScrollLeft}
        aria-label="Scroll left"
        className="hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-900 shadow-lg hover:bg-white hover:border-neutral-300 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Next — desktop only, hidden when at right edge */}
      <button
        type="button"
        onClick={() => scrollBy(scrollStep)}
        disabled={!canScrollRight}
        aria-label="Scroll right"
        className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-900 shadow-lg hover:bg-white hover:border-neutral-300 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Right-edge fade — only when more content to the right */}
      {canScrollRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-linear-to-l from-white to-transparent z-10"
        />
      )}

      {/* Scroller */}
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {children}
      </div>
    </div>
  )
}
