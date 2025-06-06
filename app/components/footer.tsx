"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

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
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(footerRef.current, {
        opacity: 0,
        y: 20,
      })

      // Intersection Observer for scroll-triggered animation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Animate footer entrance
              gsap.to(footerRef.current, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
              })

              // Animate content with stagger
              gsap.fromTo(
                ".footer-element",
                { opacity: 0, y: 15 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: 0.2,
                  ease: "power2.out",
                  delay: 0.3,
                },
              )

              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.3,
          rootMargin: "0px 0px -50px 0px",
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
  }, [])

  // Enhanced hover animations
  const handleLinkHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    })
  }

  const handleLinkLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
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
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Subtle overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, 
              rgba(255,255,255,0.02) 0%, 
              rgba(255,255,255,0.05) 50%, 
              rgba(255,255,255,0.02) 100%
            )
          `,
        }}
      />

      <div ref={contentRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Main Copyright */}
          <div className="footer-element text-center">
            <p className="text-white/80 text-sm font-medium tracking-wide">
              © {currentYear}{" "}
              <span
                className="text-white font-bold tracking-widest cursor-pointer transition-colors duration-300 hover:text-white/90"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}
              >
                434 MEDIA
              </span>
            </p>
          </div>

          {/* Divider Line */}
          <div className="footer-element w-16 h-px bg-white/20"></div>

          {/* Brand Tagline */}
          <div className="footer-element text-center">
            <p className="text-white/60 text-xs font-medium tracking-widest italic">LEVANTAMOS LOS PUÑOS</p>
          </div>

          {/* Secondary Info */}
          <div className="footer-element text-center">
            <p className="text-white/40 text-xs tracking-wide">TXMX • BOXING</p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />

      {/* Enhanced CSS for premium effects */}
      <style jsx>{`
        /* Smooth transitions */
        * {
          transition-property: color, transform, opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced backdrop blur support */
        @supports (backdrop-filter: blur(20px)) {
          footer {
            backdrop-filter: blur(20px);
          }
        }

        @supports not (backdrop-filter: blur(20px)) {
          footer {
            background: rgba(0, 0, 0, 0.8) !important;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          footer {
            backdrop-filter: blur(15px);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          footer {
            border-top: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(0, 0, 0, 0.9) !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </footer>
  )
}
