"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Update year on component mount and set up yearly updates
    const updateYear = () => {
      setCurrentYear(new Date().getFullYear())
    }

    // Update immediately
    updateYear()

    // Set up interval to check for year change (check every hour)
    const yearInterval = setInterval(() => {
      const newYear = new Date().getFullYear()
      if (newYear !== currentYear) {
        updateYear()
      }
    }, 3600000) // Check every hour

    return () => clearInterval(yearInterval)
  }, [currentYear])

  useEffect(() => {
    // Skip animations on mobile for better performance
    const isMobile = window.innerWidth <= 768
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (isMobile || prefersReducedMotion) {
      // Immediate presentation without animations
      gsap.set(footerRef.current, { opacity: 1, y: 0 })
      gsap.set(".footer-element", { opacity: 1, y: 0 })
      setHasAnimated(true)
      return
    }

    const ctx = gsap.context(() => {
      // Set initial state for desktop only
      gsap.set(footerRef.current, {
        opacity: 0,
        y: 20,
      })

      // Optimized Intersection Observer with better mobile handling
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              setHasAnimated(true)

              // Simplified animation for better performance
              gsap.to(footerRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
              })

              // Simplified stagger animation
              gsap.fromTo(
                ".footer-element",
                { opacity: 0, y: 10 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  stagger: 0.1,
                  ease: "power2.out",
                  delay: 0.2,
                },
              )

              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.2, // Reduced threshold for earlier trigger
          rootMargin: "0px 0px -20px 0px", // Reduced margin
        },
      )

      if (footerRef.current) {
        observer.observe(footerRef.current)
      }

      return () => {
        observer.disconnect()
      }
    }, footerRef)

    return () => ctx.revert()
  }, [hasAnimated])

  // Simplified hover animations with mobile detection
  const handleLinkHover = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth <= 768
    if (isMobile) return // Skip hover effects on mobile

    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const handleLinkLeave = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth <= 768
    if (isMobile) return // Skip hover effects on mobile

    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  return (
    <footer
      ref={footerRef}
      className="relative mt-auto border-t border-white/10"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(0,0,0,0.4) 0%, 
            rgba(0,0,0,0.6) 50%, 
            rgba(0,0,0,0.4) 100%
          )
        `,
        backdropFilter: "blur(15px)", // Reduced blur for mobile performance
        WebkitBackdropFilter: "blur(15px)",
      }}
    >
      {/* Simplified overlay for better mobile performance */}
      <div
        className="absolute inset-0"
        style={{
          background: `rgba(255,255,255,0.03)`, // Simplified gradient
        }}
      />

      <div ref={contentRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Main Copyright */}
          <div className="footer-element text-center">
            <p className="text-white/80 text-sm font-medium tracking-wide">
              © {currentYear}{" "}
              <span
                className="text-white font-bold tracking-widest cursor-pointer transition-colors duration-200 hover:text-white/90"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}
              >
                434 MEDIA
              </span>
            </p>
          </div>

          {/* Divider Line */}
          <div className="footer-element w-12 sm:w-16 h-px bg-white/20"></div>

          {/* Brand Tagline */}
          <div className="footer-element text-center">
            <p className="text-white/60 text-xs font-medium tracking-widest">TXMX • BOXING</p>
          </div>
        </div>
      </div>

      {/* Simplified bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "rgba(255,255,255,0.1)",
        }}
      />

      {/* Optimized CSS for mobile performance */}
      <style jsx>{`
        /* Mobile-first optimizations */
        @media (max-width: 768px) {
          footer {
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
          }
          
          /* Disable hover effects on touch devices */
          .footer-element * {
            transition: none !important;
          }
          
          /* Optimize for touch scrolling */
          footer {
            -webkit-overflow-scrolling: touch;
            transform: translateZ(0);
            will-change: auto;
          }
        }

        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
          footer {
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
        }

        /* Desktop optimizations */
        @media (min-width: 1025px) {
          footer {
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
          }
          
          /* Enable smooth transitions only on desktop */
          .footer-element * {
            transition-property: color, transform, opacity;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 0.2s;
          }
        }

        /* Enhanced backdrop blur support with mobile fallbacks */
        @supports (backdrop-filter: blur(10px)) {
          footer {
            backdrop-filter: blur(10px);
          }
        }

        @supports not (backdrop-filter: blur(10px)) {
          footer {
            background: rgba(0, 0, 0, 0.85) !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          footer {
            border-top: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(0, 0, 0, 0.95) !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }

        /* Performance optimizations */
        footer {
          contain: layout style paint;
          transform: translateZ(0);
        }

        /* iOS Safari specific optimizations */
        @supports (-webkit-touch-callout: none) {
          footer {
            -webkit-transform: translateZ(0);
            -webkit-backface-visibility: hidden;
          }
        }
      `}</style>
    </footer>
  )
}
