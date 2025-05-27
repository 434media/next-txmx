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
  const bagImageRef = useRef<HTMLImageElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

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
        delay: 1,
      },
    )

    // Continuous floating animation for the punching bag
    gsap.to(bagImageRef.current, {
      y: -3,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    // Subtle glow pulse animation
    gsap.to(glowRef.current, {
      opacity: 0.8,
      scale: 1.1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })
  }, [])

  // Enhanced punching bag hover animation with realistic physics
  const handleBagHover = () => {
    if (bagImageRef.current && punchingBagRef.current && rippleRef.current) {
      // Create punch impact animation with enhanced physics
      const tl = gsap.timeline()

      // Button scale for impact feedback
      gsap.to(punchingBagRef.current, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out",
      })

      // Ripple effect
      gsap.set(rippleRef.current, { scale: 0, opacity: 1 })
      gsap.to(rippleRef.current, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      })

      // Enhanced bag physics simulation
      tl.to(bagImageRef.current, {
        rotation: 15,
        x: 6,
        scale: 0.9,
        duration: 0.08,
        ease: "power3.out",
      })
        // Enhanced swing back with more realistic physics
        .to(bagImageRef.current, {
          rotation: -8,
          x: -3,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        })
        // Secondary bounce
        .to(bagImageRef.current, {
          rotation: 3,
          x: 1,
          scale: 0.98,
          duration: 0.4,
          ease: "power2.out",
        })
        // Final settle with elastic overshoot
        .to(bagImageRef.current, {
          rotation: 0,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        })

      // Enhanced glow effect on hover
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.3,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const handleBagLeave = () => {
    if (bagImageRef.current && punchingBagRef.current && glowRef.current) {
      // Gentle return to rest position
      gsap.to([bagImageRef.current, punchingBagRef.current], {
        rotation: 0,
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      })

      // Return glow to normal
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.1,
        duration: 0.4,
        ease: "power2.out",
      })
    }
  }

  // Enhanced click animation with satisfying feedback
  const handleBagClick = () => {
    if (punchingBagRef.current && bagImageRef.current && rippleRef.current) {
      // Quick punch feedback before opening modal
      const tl = gsap.timeline()

      // Impact effect
      tl.to(punchingBagRef.current, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
      })
        .to(punchingBagRef.current, {
          scale: 1.1,
          duration: 0.15,
          ease: "back.out(1.7)",
        })
        .to(punchingBagRef.current, {
          scale: 1,
          duration: 0.1,
          ease: "power2.out",
          onComplete: onMenuClick,
        })

      // Dramatic bag swing on click
      gsap.to(bagImageRef.current, {
        rotation: 20,
        x: 8,
        duration: 0.2,
        ease: "power3.out",
        yoyo: true,
        repeat: 1,
      })

      // Multiple ripple effects for impact
      gsap.set(rippleRef.current, { scale: 0, opacity: 1 })
      gsap.to(rippleRef.current, {
        scale: 3,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
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
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Logo"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Enhanced Punching Bag Menu Button */}
          <button
            ref={punchingBagRef}
            onClick={handleBagClick}
            onMouseEnter={handleBagHover}
            onMouseLeave={handleBagLeave}
            className="group relative p-1 md:p-2 rounded-full transition-all duration-500 overflow-hidden"
            aria-label="Open menu - Click the punching bag"
            style={{
              background: `
                radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%),
                linear-gradient(45deg, transparent 30%, rgba(0,104,71,0.2) 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, rgba(206,17,38,0.2) 50%, transparent 70%)
              `,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `
                0 0 20px rgba(0,104,71,0.3),
                0 0 40px rgba(206,17,38,0.2),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
            }}
          >
            {/* Animated glow background */}
            <div
              ref={glowRef}
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: `
                  radial-gradient(circle at center, 
                    rgba(0,104,71,0.4) 0%, 
                    rgba(206,17,38,0.3) 50%, 
                    transparent 70%
                  )
                `,
                filter: "blur(8px)",
              }}
            />

            {/* Ripple effect */}
            <div
              ref={rippleRef}
              className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0"
              style={{ transformOrigin: "center" }}
            />

            {/* Enhanced traveling light effect */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `conic-gradient(from 0deg, transparent, rgba(0,104,71,0.8), rgba(255,255,255,0.3), rgba(206,17,38,0.8), transparent)`,
                animation: "rotateBorder 2s linear infinite",
                mask: "radial-gradient(circle at center, transparent 70%, black 75%, black 100%)",
                WebkitMask: "radial-gradient(circle at center, transparent 70%, black 75%, black 100%)",
              }}
            />

            {/* Punching Bag Image */}
            <div className="relative z-10 w-12 h-12 flex items-center justify-center">
              <Image
                ref={bagImageRef}
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/flyers-38-bag.png"
                alt="Punching Bag Menu"
                width={40}
                height={40}
                className="w-10 h-10 object-contain filter drop-shadow-lg"
                style={{
                  transformOrigin: "center top",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3)) brightness(1.1) contrast(1.1)",
                }}
                priority
              />
            </div>

            {/* Hover instruction tooltip */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Click to open menu
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced CSS for additional animations */}
      <style jsx>{`
        @keyframes rotateBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Enhanced button hover effects */
        button:hover {
          transform: translateY(-1px);
        }
        
        /* Smooth transitions for all elements */
        * {
          transition-property: transform, opacity, filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </nav>
  )
}
