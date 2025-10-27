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
      scale: 1.1,
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright - Left */}
          <div className="footer-element">
            <p className="text-white/80 text-sm font-medium tracking-wide text-center sm:text-left">
              © {currentYear} <span className="text-white font-bold tracking-widest">434 MEDIA</span>
              {" | "}
              <span className="text-white font-bold tracking-widest">TXMX BOXING</span>
            </p>
          </div>

          {/* Social Icons - Right */}
          <div className="footer-element flex items-center gap-0 md:gap-4">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/txmxboxing/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
              className="text-white/80 hover:text-white transition-colors duration-200"
              aria-label="Follow us on Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/434media"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleLinkHover}
              onMouseLeave={handleLinkLeave}
              className="text-white/80 hover:text-white transition-colors duration-200"
              aria-label="Follow us on LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
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
