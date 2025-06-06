"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Immediate video presentation - no complex filters
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

      // Simple scroll fade for logo
      const handleScroll = () => {
        const scrollY = window.scrollY
        const scrollPercent = Math.min(scrollY / (window.innerHeight * 0.8), 1)

        gsap.to(logoRef.current, {
          opacity: 1 - scrollPercent,
          y: scrollPercent * -50,
          duration: 0.1,
          ease: "none",
        })
      }

      // Add event listeners
      window.addEventListener("scroll", handleScroll, { passive: true })

      if (logoRef.current) {
        logoRef.current.addEventListener("mouseenter", handleLogoHover)
        logoRef.current.addEventListener("mouseleave", handleLogoLeave)
      }

      return () => {
        window.removeEventListener("scroll", handleScroll)
        if (logoRef.current) {
          logoRef.current.removeEventListener("mouseenter", handleLogoHover)
          logoRef.current.removeEventListener("mouseleave", handleLogoLeave)
        }
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

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

      {/* Performance-Optimized CSS */}
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

        /* Mobile video optimizations */
        @media (max-width: 768px) {
          video {
            object-position: center center;
            height: 100vh;
            height: 100dvh; /* Dynamic viewport height for mobile */
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

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          video {
            filter: brightness(0.95);
          }
        }

        /* Print styles */
        @media print {
          video {
            display: none;
          }
        }

        /* Focus styles for accessibility */
        [tabindex]:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 4px;
        }
      `}</style>
    </section>
  )
}
