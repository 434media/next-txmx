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
  const orbitRef = useRef<HTMLDivElement>(null)

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
      y: -4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    // Enhanced glow pulse animation
    gsap.to(glowRef.current, {
      opacity: 0.9,
      scale: 1.15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    // Orbital ring animation
    gsap.to(orbitRef.current, {
      rotation: 360,
      duration: 12,
      repeat: -1,
      ease: "none",
    })
  }, [])

  // Enhanced punching bag hover animation with premium effects
  const handleBagHover = () => {
    if (bagImageRef.current && punchingBagRef.current && rippleRef.current) {
      // Create punch impact animation with enhanced physics
      const tl = gsap.timeline()

      // Button scale for impact feedback
      gsap.to(punchingBagRef.current, {
        scale: 1.08,
        duration: 0.15,
        ease: "power2.out",
      })

      // Enhanced ripple effect
      gsap.set(rippleRef.current, { scale: 0, opacity: 1 })
      gsap.to(rippleRef.current, {
        scale: 2.5,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      })

      // Enhanced bag physics simulation
      tl.to(bagImageRef.current, {
        rotation: 18,
        x: 8,
        scale: 0.85,
        duration: 0.1,
        ease: "power3.out",
      })
        // Enhanced swing back with more realistic physics
        .to(bagImageRef.current, {
          rotation: -10,
          x: -4,
          scale: 1.08,
          duration: 0.35,
          ease: "power2.out",
        })
        // Secondary bounce
        .to(bagImageRef.current, {
          rotation: 4,
          x: 2,
          scale: 0.96,
          duration: 0.45,
          ease: "power2.out",
        })
        // Final settle with elastic overshoot
        .to(bagImageRef.current, {
          rotation: 0,
          x: 0,
          scale: 1,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)",
        })

      // Enhanced glow effect on hover
      gsap.to(glowRef.current, {
        opacity: 1,
        scale: 1.4,
        duration: 0.4,
        ease: "power2.out",
      })

      // Orbital ring speed up on hover
      gsap.to(orbitRef.current, {
        rotation: "+=60",
        duration: 0.8,
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
        duration: 0.8,
        ease: "power2.out",
      })

      // Return glow to normal
      gsap.to(glowRef.current, {
        opacity: 0.9,
        scale: 1.15,
        duration: 0.6,
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
        scale: 0.85,
        duration: 0.12,
        ease: "power2.out",
      })
        .to(punchingBagRef.current, {
          scale: 1.15,
          duration: 0.18,
          ease: "back.out(1.7)",
        })
        .to(punchingBagRef.current, {
          scale: 1,
          duration: 0.15,
          ease: "power2.out",
          onComplete: onMenuClick,
        })

      // Dramatic bag swing on click
      gsap.to(bagImageRef.current, {
        rotation: 25,
        x: 12,
        duration: 0.25,
        ease: "power3.out",
        yoyo: true,
        repeat: 1,
      })

      // Multiple ripple effects for impact
      gsap.set(rippleRef.current, { scale: 0, opacity: 1 })
      gsap.to(rippleRef.current, {
        scale: 4,
        opacity: 0,
        duration: 1,
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

          {/* Enhanced Punching Bag Menu Button - Pure Monochrome */}
          <button
            ref={punchingBagRef}
            onClick={handleBagClick}
            onMouseEnter={handleBagHover}
            onMouseLeave={handleBagLeave}
            className="group relative p-3 rounded-full transition-all duration-500 overflow-hidden"
            aria-label="Open menu - Click the punching bag"
            style={{
              background: `
                radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
                linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%)
              `,
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: `
                0 0 25px rgba(255,255,255,0.1),
                0 0 50px rgba(255,255,255,0.05),
                inset 0 1px 0 rgba(255,255,255,0.2),
                inset 0 -1px 0 rgba(0,0,0,0.2)
              `,
            }}
          >
            {/* Animated glow background - Pure white */}
            <div
              ref={glowRef}
              className="absolute inset-0 rounded-full opacity-90"
              style={{
                background: `
                  radial-gradient(circle at center, 
                    rgba(255,255,255,0.15) 0%, 
                    rgba(255,255,255,0.08) 40%, 
                    rgba(255,255,255,0.03) 70%,
                    transparent 100%
                  )
                `,
                filter: "blur(12px)",
              }}
            />

            {/* Orbital ring effect */}
            <div
              ref={orbitRef}
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: `
                  conic-gradient(from 0deg, 
                    transparent, 
                    rgba(255,255,255,0.4), 
                    rgba(255,255,255,0.8), 
                    rgba(255,255,255,0.4), 
                    transparent
                  )
                `,
                mask: "radial-gradient(circle at center, transparent 75%, black 80%, black 85%, transparent 90%)",
                WebkitMask: "radial-gradient(circle at center, transparent 75%, black 80%, black 85%, transparent 90%)",
              }}
            />

            {/* Ripple effect */}
            <div
              ref={rippleRef}
              className="absolute inset-0 rounded-full border-2 border-white/40 opacity-0"
              style={{ transformOrigin: "center" }}
            />

            {/* Enhanced traveling light effect */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `conic-gradient(from 0deg, transparent, rgba(255,255,255,0.6), rgba(255,255,255,0.9), rgba(255,255,255,0.6), transparent)`,
                animation: "rotateBorder 3s linear infinite",
                mask: "radial-gradient(circle at center, transparent 70%, black 75%, black 100%)",
                WebkitMask: "radial-gradient(circle at center, transparent 70%, black 75%, black 100%)",
              }}
            />

            {/* Punching Bag Image */}
            <div className="relative z-10 w-14 h-14 flex items-center justify-center">
              <Image
                ref={bagImageRef}
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/flyers-38-bag.png"
                alt="Punching Bag Menu"
                width={44}
                height={44}
                className="w-11 h-11 object-contain"
                style={{
                  transformOrigin: "center top",
                  filter: `
                    drop-shadow(0 4px 12px rgba(0,0,0,0.4)) 
                    drop-shadow(0 0 20px rgba(255,255,255,0.2))
                    brightness(1.1) 
                    contrast(1.2)
                  `,
                }}
                priority
              />
            </div>

            {/* Enhanced hover instruction tooltip */}
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div
                className="text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm border border-white/20"
                style={{
                  background: "rgba(0,0,0,0.8)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                Click to open menu
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 border-l border-t border-white/20 rotate-45"></div>
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
          transform: translateY(-2px);
        }
        
        /* Smooth transitions for all elements */
        * {
          transition-property: transform, opacity, filter, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </nav>
  )
}
