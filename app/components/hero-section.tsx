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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

      // Simple scroll fade for logo and newsletter (disabled on mobile for newsletter)
      const handleScroll = () => {
        const scrollY = window.scrollY
        const scrollPercent = Math.min(scrollY / (window.innerHeight * 0.8), 1)

        // Always fade logo on scroll
        gsap.to(logoRef.current, {
          opacity: 1 - scrollPercent,
          y: scrollPercent * -50,
          duration: 0.1,
          ease: "none",
        })

        // Only fade newsletter on desktop, keep it visible on mobile
        if (newsletterRef.current && !isMobile) {
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
  }, [isMobile])

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

      {/* Newsletter Pop-in - Enhanced Mobile Centering */}
      {showNewsletter && (
        <div className="fixed inset-0 z-20 pointer-events-none">
          <div className="relative h-full w-full flex items-end justify-center">
            <div
              ref={newsletterRef}
              className="newsletter-popup pointer-events-auto"
              style={{
                perspective: "1000px",
              }}
            >
              {/* Close Button - Perfectly Centered */}
              <button
                onClick={handleNewsletterClose}
                className="close-button absolute z-30 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors duration-300 shadow-lg"
                aria-label="Close newsletter"
              >
                <span className="close-icon">×</span>
              </button>

              {/* Newsletter Form - Clean Design */}
              <div
                className="newsletter-content"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "3px solid white",
                  boxShadow: `
                    0 15px 40px rgba(0,0,0,0.4),
                    0 0 0 1px rgba(255,255,255,0.2),
                    inset 0 1px 0 rgba(255,255,255,0.3)
                  `,
                }}
              >
                <Newsletter onSuccess={handleNewsletterSuccess} compact={true} mobile={isMobile} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS for Perfect Mobile Centering and Desktop Close Button */}
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

        /* Perfect Newsletter Centering - All Devices */
        .newsletter-popup {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          padding: 0 1rem;
          margin-bottom: 5rem;
          position: relative;
        }

        /* Perfect Close Button Centering - All Devices */
        .close-button {
          top: -12px;
          right: -12px;
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
          padding: 0;
          line-height: 1;
        }

        .close-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 18px;
          font-weight: bold;
          line-height: 1;
        }

        /* Desktop Close Button Optimization */
        @media (min-width: 769px) {
          .close-button {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
            top: -6px;
            right: -6px;
          }

          .close-icon {
            font-size: 20px;
          }

          .newsletter-popup {
            max-width: 380px;
            padding: 0 1.5rem;
            margin-bottom: 6rem;
          }
        }

        /* Mobile-first responsive design */
        @media (max-width: 480px) {
          .newsletter-popup {
            max-width: 280px;
            padding: 0 0.75rem;
            margin-bottom: 4rem;
          }

          .close-button {
            width: 36px;
            height: 36px;
            min-width: 44px;
            min-height: 44px;
            top: -8px;
            right: -8px;
          }

          .close-icon {
            font-size: 16px;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .newsletter-popup {
            max-width: 340px;
            padding: 0 1.25rem;
            margin-bottom: 5.5rem;
          }

          .close-button {
            width: 40px;
            height: 40px;
            min-width: 44px;
            min-height: 44px;
            top: -10px;
            right: -10px;
          }

          .close-icon {
            font-size: 18px;
          }
        }

        /* Newsletter content styling */
        .newsletter-content {
          width: 100%;
          border-radius: 0;
          overflow: hidden;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          video {
            object-position: center center;
            height: 100vh;
            height: 100dvh;
          }
          
          /* Ensure newsletter stays perfectly centered */
          .newsletter-popup {
            transform: none !important;
            left: auto !important;
            right: auto !important;
            position: relative !important;
          }

          /* Handle mobile keyboard appearance */
          @supports (-webkit-touch-callout: none) {
            /* iOS specific handling */
            .newsletter-popup {
              margin-bottom: calc(4rem + env(safe-area-inset-bottom));
            }
          }

          /* Android keyboard handling */
          @media screen and (max-height: 500px) {
            .newsletter-popup {
              margin-bottom: 2rem;
              transform: scale(0.9);
              transform-origin: center bottom;
            }
          }
        }

        /* Extra small mobile devices */
        @media (max-width: 360px) {
          .newsletter-popup {
            max-width: 260px;
            padding: 0 0.5rem;
            margin-bottom: 3.5rem;
          }
          
          .newsletter-content {
            border-width: 2px;
          }

          .close-button {
            width: 32px;
            height: 32px;
            min-width: 44px;
            min-height: 44px;
            top: -6px;
            right: -6px;
          }

          .close-icon {
            font-size: 14px;
          }
        }

        /* Large mobile devices */
        @media (min-width: 414px) and (max-width: 768px) {
          .newsletter-popup {
            max-width: 360px;
            padding: 0 1rem;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          video {
            object-fit: cover;
            width: 100vw;
            height: 100vh;
          }
          
          .newsletter-popup {
            margin-bottom: 2rem;
            transform: scale(0.85);
            transform-origin: center bottom;
          }
        }

        /* iOS Safari specific optimizations */
        @supports (-webkit-touch-callout: none) {
          /* Prevent zoom on input focus */
          input[type="email"] {
            font-size: 16px !important;
          }

          /* Handle iOS keyboard */
          @media screen and (max-height: 500px) {
            .newsletter-popup {
              margin-bottom: 1rem;
              transform: scale(0.8);
              transform-origin: center bottom;
            }
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
          
          .newsletter-content {
            border-width: 4px !important;
            background: white !important;
          }
        }

        /* Focus styles for accessibility */
        [tabindex]:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 4px;
        }

        /* Close button hover effect */
        .close-button:hover .close-icon {
          transform: scale(1.1);
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          /* Remove hover effects on touch devices */
          .close-button:hover .close-icon {
            transform: none;
          }
        }

        /* Viewport height changes (keyboard appearance) */
        @media (max-width: 768px) {
          /* When viewport height is reduced (keyboard visible) */
          @media (max-height: 600px) {
            .newsletter-popup {
              margin-bottom: 1.5rem;
              transform: scale(0.9);
              transform-origin: center bottom;
            }
          }

          @media (max-height: 450px) {
            .newsletter-popup {
              margin-bottom: 1rem;
              transform: scale(0.8);
              transform-origin: center bottom;
            }
          }
        }

        /* Ultra-wide mobile devices */
        @media (min-width: 390px) and (max-width: 768px) {
          .newsletter-popup {
            max-width: 340px;
          }
        }

        /* Tablet portrait mode */
        @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
          .newsletter-popup {
            max-width: 400px;
            margin-bottom: 6rem;
          }

          .close-button {
            width: 42px;
            height: 42px;
            min-width: 44px;
            min-height: 44px;
            top: -12px;
            right: -12px;
          }

          .close-icon {
            font-size: 19px;
          }
        }

        /* Performance optimizations */
        .newsletter-popup {
          contain: layout style paint;
          transform: translateZ(0);
          will-change: transform;
        }

        /* Smooth scrolling prevention during newsletter display */
        body:has(.newsletter-popup) {
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}
