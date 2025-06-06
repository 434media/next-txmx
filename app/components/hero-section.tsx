"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { Newsletter } from "./newsletter"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)
  const [showNewsletter, setShowNewsletter] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Immediate video presentation
      gsap.set(videoRef.current, {
        opacity: 1,
        scale: 1,
      })

      // Immediate logo presentation
      gsap.set(logoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
      })

      // Simple, subtle logo breathing animation
      gsap.to(logoRef.current, {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Newsletter entrance sequence after delay
      const newsletterTimer = setTimeout(() => {
        setShowNewsletter(true)

        // Wait for React to render the newsletter, then animate
        requestAnimationFrame(() => {
          if (newsletterRef.current) {
            // Set initial state
            gsap.set(newsletterRef.current, {
              opacity: 0,
              scale: 0.8,
              y: 50,
              rotationX: -15,
            })

            // Dramatic entrance animation
            const tl = gsap.timeline()

            tl.to(newsletterRef.current, {
              opacity: 1,
              scale: 1,
              y: 0,
              rotationX: 0,
              duration: 1.2,
              ease: "back.out(1.4)",
            })
              .to(
                newsletterRef.current,
                {
                  scale: 1.02,
                  duration: 0.3,
                  ease: "power2.out",
                  yoyo: true,
                  repeat: 1,
                },
                "-=0.3",
              )
              .to(
                newsletterRef.current,
                {
                  boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
                  duration: 0.5,
                  ease: "power2.out",
                },
                "-=0.6",
              )
          }
        })
      }, 4000) // Show newsletter after 4 seconds

      // Simple logo hover enhancement
      const handleLogoHover = () => {
        gsap.to(logoRef.current, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      const handleLogoLeave = () => {
        gsap.to(logoRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      // Simple scroll fade for logo and newsletter
      const handleScroll = () => {
        const scrollY = window.scrollY
        const scrollPercent = Math.min(scrollY / (window.innerHeight * 0.8), 1)

        gsap.to(logoRef.current, {
          opacity: 1 - scrollPercent,
          y: scrollPercent * -50,
          duration: 0.1,
          ease: "none",
        })

        if (newsletterRef.current) {
          gsap.to(newsletterRef.current, {
            opacity: 1 - scrollPercent * 1.2,
            y: scrollPercent * -30,
            scale: 1 - scrollPercent * 0.1,
            duration: 0.1,
            ease: "none",
          })
        }
      }

      // Add event listeners
      window.addEventListener("scroll", handleScroll, { passive: true })

      if (logoRef.current) {
        logoRef.current.addEventListener("mouseenter", handleLogoHover)
        logoRef.current.addEventListener("mouseleave", handleLogoLeave)
      }

      return () => {
        clearTimeout(newsletterTimer)
        window.removeEventListener("scroll", handleScroll)
        if (logoRef.current) {
          logoRef.current.removeEventListener("mouseenter", handleLogoHover)
          logoRef.current.removeEventListener("mouseleave", handleLogoLeave)
        }
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleNewsletterSuccess = () => {
    // Celebration animation on success
    if (newsletterRef.current) {
      gsap.to(newsletterRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 1,
      })
    }
  }

  const handleNewsletterClose = () => {
    // Smooth exit animation
    if (newsletterRef.current) {
      gsap.to(newsletterRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 30,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => setShowNewsletter(false),
      })
    }
  }

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Video - The Star */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: "center center",
        }}
      >
        <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+Hero+Banner.mp4" type="video/mp4" />
        <track kind="captions" />
      </video>

      {/* Minimal Overlay for Logo Readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at center, 
              rgba(0,0,0,0.1) 0%, 
              rgba(0,0,0,0.3) 70%, 
              rgba(0,0,0,0.5) 100%
            )
          `,
        }}
      />

      {/* TXMX Logo Overlay - Minimal & Clean */}
      <div ref={logoRef} className="relative z-10 flex items-center justify-center px-4 cursor-pointer">
        <div className="relative">
          {/* Minimal Shadow for Depth */}
          <div
            className="absolute inset-0 blur-xl opacity-60"
            style={{
              background: `
                radial-gradient(ellipse at center, 
                  rgba(0,0,0,0.4) 0%, 
                  rgba(0,0,0,0.2) 50%, 
                  transparent 80%
                )
              `,
              transform: "scale(1.1) translateY(8px)",
            }}
          />

          {/* Subtle Glow for Logo Enhancement */}
          <div
            className="absolute inset-0 blur-2xl opacity-40"
            style={{
              background: `
                radial-gradient(ellipse at center, 
                  rgba(255,255,255,0.15) 0%, 
                  rgba(255,255,255,0.08) 40%, 
                  transparent 70%
                )
              `,
              transform: "scale(1.2)",
            }}
          />

          {/* Clean Logo Presentation */}
          <Image
            src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
            alt="TXMX Boxing"
            width={600}
            height={300}
            className="relative w-[280px] h-[140px] sm:w-[360px] sm:h-[180px] md:w-[480px] md:h-[240px] lg:w-[600px] lg:h-[300px] object-contain"
            style={{
              filter: `
                brightness(1.1) 
                contrast(1.05) 
                drop-shadow(0 4px 20px rgba(0,0,0,0.3))
                drop-shadow(0 0 40px rgba(255,255,255,0.2))
              `,
            }}
            priority
            loading="eager"
          />
        </div>
      </div>

      {/* Newsletter Pop-in - Adjusted Height */}
      {showNewsletter && (
        <div
          ref={newsletterRef}
          className="absolute bottom-24 sm:bottom-32 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-sm px-4"
          style={{
            perspective: "1000px",
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleNewsletterClose}
            className="absolute -top-3 -right-3 z-30 w-8 h-8 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors duration-300 flex items-center justify-center text-sm font-bold"
            aria-label="Close newsletter"
          >
            ×
          </button>

          {/* Newsletter Form with Enhanced Styling */}
          <div
            className="compact-newsletter"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "4px solid white",
              boxShadow: `
                0 20px 60px rgba(0,0,0,0.4),
                0 0 0 1px rgba(255,255,255,0.2),
                inset 0 1px 0 rgba(255,255,255,0.3)
              `,
            }}
          >
            <Newsletter onSuccess={handleNewsletterSuccess} compact={true} />
          </div>

          {/* Animated Attention Indicators */}
          <div className="absolute -inset-4 pointer-events-none">
            {/* Pulsing Ring */}
            <div
              className="absolute inset-0 border-2 border-white/30 animate-pulse"
              style={{
                animation: "pulseRing 3s ease-in-out infinite",
              }}
            />

            {/* Corner Accents */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-white/60"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-white/60"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-white/60"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-white/60"></div>
          </div>
        </div>
      )}

      {/* Enhanced CSS for Newsletter Animations */}
      <style jsx>{`
        /* Hardware acceleration for smooth performance */
        video {
          will-change: auto;
          transform: translateZ(0);
        }

        /* Logo optimization */
        img {
          will-change: transform;
          transform: translateZ(0);
        }

        /* Newsletter animations */
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.3;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          video {
            object-position: center center;
            height: 100vh;
            height: 100dvh;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          video {
            object-fit: cover;
            width: 100vw;
            height: 100vh;
          }
        }

        /* High refresh rate display optimization */
        @media (min-resolution: 120dpi) {
          video {
            image-rendering: optimizeQuality;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          img {
            filter: brightness(1.2) contrast(1.3) !important;
          }
        }

        /* Focus styles for accessibility */
        [tabindex]:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 4px;
        }

        /* Newsletter close button hover effect */
        button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </section>
  )
}
