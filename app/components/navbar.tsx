"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null)
  const punchingBagRef = useRef<HTMLButtonElement>(null)
  const bagSvgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Navbar entrance animation
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
        delay: 1, // Delay to let video start first
      },
    )
  }, [])

  // Enhanced punching bag hover animation with chain reaction
  const handleBagHover = () => {
    if (bagSvgRef.current && punchingBagRef.current) {
      // Create punch impact animation with enhanced physics
      const tl = gsap.timeline()

      // Button scale for impact feedback
      gsap.to(punchingBagRef.current, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out",
      })

      // Bag physics simulation
      tl.to(bagSvgRef.current, {
        rotation: 12,
        x: 4,
        scale: 0.92,
        duration: 0.08,
        ease: "power3.out",
      })
        // Enhanced swing back with more realistic physics
        .to(bagSvgRef.current, {
          rotation: -6,
          x: -2,
          scale: 1.02,
          duration: 0.25,
          ease: "power2.out",
        })
        // Secondary bounce
        .to(bagSvgRef.current, {
          rotation: 2,
          x: 1,
          scale: 0.98,
          duration: 0.35,
          ease: "power2.out",
        })
        // Final settle with slight overshoot
        .to(bagSvgRef.current, {
          rotation: 0,
          x: 0,
          scale: 1,
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        })
    }
  }

  const handleBagLeave = () => {
    if (bagSvgRef.current && punchingBagRef.current) {
      // Gentle return to rest position
      gsap.to([bagSvgRef.current, punchingBagRef.current], {
        rotation: 0,
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      })
    }
  }

  // Enhanced click animation
  const handleBagClick = () => {
    if (punchingBagRef.current) {
      // Quick punch feedback before opening modal
      gsap.to(punchingBagRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        onComplete: onMenuClick,
      })
    } else {
      onMenuClick()
    }
  }

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-40 bg-black/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Hidden Logo for SEO */}
          <div className="sr-only">
            <Image
              src="/txmx-logo.svg"
              alt="TXMX Logo - Premium Boxing and Fitness Brand"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Enhanced Punching Bag Menu */}
          <button
            ref={punchingBagRef}
            onClick={handleBagClick}
            onMouseEnter={handleBagHover}
            onMouseLeave={handleBagLeave}
            className="group relative p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all duration-500 overflow-hidden hover:shadow-2xl"
            aria-label="Open menu"
            style={{
              background: `
                radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%),
                linear-gradient(45deg, transparent 30%, rgba(0,104,71,0.3) 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, rgba(206,17,38,0.3) 50%, transparent 70%)
              `,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `
                0 0 20px rgba(0,104,71,0.2),
                0 0 40px rgba(206,17,38,0.1),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              animation: "glowPulse 3s ease-in-out infinite",
            }}
          >
            {/* Enhanced traveling light effect */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `conic-gradient(from 0deg, transparent, rgba(0,104,71,0.8), rgba(255,255,255,0.3), rgba(206,17,38,0.8), transparent)`,
                animation: "rotateBorder 2s linear infinite",
                mask: "radial-gradient(circle at center, transparent 65%, black 70%, black 100%)",
                WebkitMask: "radial-gradient(circle at center, transparent 65%, black 70%, black 100%)",
              }}
            />

            {/* Enhanced Punching Bag SVG with more detail */}
            <svg
              ref={bagSvgRef}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="relative z-10 text-white/90 group-hover:text-white transition-colors duration-300"
              style={{ transformOrigin: "center top" }}
            >
              {/* Chain/Rope with links */}
              <line x1="12" y1="1" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="2" r="0.8" fill="currentColor" opacity="0.8" />
              <circle cx="12" cy="3.5" r="0.6" fill="currentColor" opacity="0.6" />
              <circle cx="12" cy="5" r="0.4" fill="currentColor" opacity="0.4" />

              {/* Main Bag Body with enhanced shape */}
              <path
                d="M8 6h8c1.1 0 2 0.9 2 2v8c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4V8c0-1.1 0.9-2 2-2z"
                fill="currentColor"
                opacity="0.9"
              />

              {/* Bag Top Ring with metallic effect */}
              <rect x="7.5" y="6" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.8" />
              <rect x="8" y="6.2" width="8" height="0.6" rx="0.3" fill="rgba(255,255,255,0.3)" />

              {/* Bag Bottom with weight */}
              <ellipse cx="12" cy="20" rx="4" ry="1.2" fill="currentColor" opacity="0.6" />

              {/* Enhanced highlight with multiple layers */}
              <path
                d="M10 8c0-0.5 0.5-1 1-1h2c0.5 0 1 0.5 1 1v6c0 1-0.5 2-1 2h-2c-0.5 0-1-1-1-2V8z"
                fill="rgba(255,255,255,0.25)"
              />
              <path
                d="M10.5 8.5c0-0.3 0.3-0.5 0.5-0.5h1c0.3 0 0.5 0.2 0.5 0.5v4c0 0.5-0.2 1-0.5 1h-1c-0.3 0-0.5-0.5-0.5-1V8.5z"
                fill="rgba(255,255,255,0.15)"
              />

              {/* Bag texture lines */}
              <line x1="9" y1="10" x2="15" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="9" y1="13" x2="15" y2="13" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="9" y1="16" x2="15" y2="16" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
