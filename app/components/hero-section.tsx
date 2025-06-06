"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import Image from "next/image"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const logoGlowRef = useRef<HTMLDivElement>(null)
  const cinematicOverlayRef = useRef<HTMLDivElement>(null)
  const lightRaysRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const filmGrainRef = useRef<HTMLDivElement>(null)

  // Fix hydration by generating particles client-side only
  const [particles, setParticles] = useState<
    Array<{
      id: number
      left: number
      top: number
      delay: number
      blur: number
    }>
  >([])

  // Generate particles only on client side to prevent hydration mismatch
  useEffect(() => {
    const generatedParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 100 + Math.random() * 20,
      delay: Math.random() * 8,
      blur: Math.random() * 1.5,
    }))
    setParticles(generatedParticles)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Performance-optimized video presentation
      gsap.set(videoRef.current, {
        opacity: 1,
        scale: 1.01,
        filter: "brightness(0.75) contrast(1.2) saturate(1.1)",
      })

      // Immediate logo presentation
      gsap.set(logoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
      })

      // Optimized breathing animation for logo
      gsap.to(logoRef.current, {
        y: -8,
        scale: 1.01,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Simplified glow breathing
      gsap.to(logoGlowRef.current, {
        opacity: 0.85,
        scale: 1.05,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Optimized light rays animation (slower for performance)
      gsap.to(lightRaysRef.current, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
      })

      // Simplified film grain (less frequent updates)
      gsap.to(filmGrainRef.current, {
        opacity: 0.02,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "none",
      })

      // Optimized particle animation (only when particles are loaded)
      if (particles.length > 0) {
        gsap.to(".particle", {
          y: -80,
          opacity: 0,
          duration: 10,
          repeat: -1,
          stagger: {
            each: 1,
            repeat: -1,
          },
          ease: "none",
        })
      }

      // Throttled mouse movement for performance
      let mouseTimeout: NodeJS.Timeout
      const handleMouseMove = (e: MouseEvent) => {
        clearTimeout(mouseTimeout)
        mouseTimeout = setTimeout(() => {
          const { clientX, clientY } = e
          const { innerWidth, innerHeight } = window

          const xPercent = (clientX / innerWidth - 0.5) * 2
          const yPercent = (clientY / innerHeight - 0.5) * 2

          // Simplified video parallax
          gsap.to(videoRef.current, {
            x: xPercent * 15,
            y: yPercent * 15,
            duration: 1.5,
            ease: "power2.out",
          })

          // Simplified logo counter-parallax
          gsap.to(logoRef.current, {
            x: xPercent * -10,
            y: yPercent * -10,
            duration: 1.2,
            ease: "power2.out",
          })

          // Simplified glow response
          gsap.to(logoGlowRef.current, {
            x: xPercent * 8,
            y: yPercent * 8,
            scale: 1.05 + Math.abs(xPercent) * 0.08,
            duration: 1.2,
            ease: "power2.out",
          })
        }, 16) // ~60fps throttling
      }

      // Optimized scroll effects
      let scrollTimeout: NodeJS.Timeout
      const handleScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          const scrollY = window.scrollY
          const scrollPercent = Math.min(scrollY / window.innerHeight, 1)

          // Simplified video scroll effects
          gsap.to(videoRef.current, {
            scale: 1.01 + scrollPercent * 0.1,
            filter: `brightness(${0.75 - scrollPercent * 0.3}) contrast(${1.2 + scrollPercent * 0.2}) blur(${scrollPercent * 2}px)`,
            duration: 0.2,
            ease: "none",
          })

          // Simplified logo scroll effects
          gsap.to(logoRef.current, {
            y: scrollPercent * -100,
            scale: 1 - scrollPercent * 0.2,
            opacity: 1 - scrollPercent * 1,
            duration: 0.2,
            ease: "none",
          })

          // Simplified glow fade
          gsap.to(logoGlowRef.current, {
            opacity: 0.85 - scrollPercent * 0.85,
            scale: 1.05 + scrollPercent * 0.3,
            duration: 0.2,
            ease: "none",
          })
        }, 8) // ~120fps throttling for scroll
      }

      // Simplified logo hover
      const handleLogoHover = () => {
        gsap.to(logoRef.current, {
          scale: 1.04,
          duration: 0.4,
          ease: "power2.out",
        })

        gsap.to(logoGlowRef.current, {
          opacity: 1,
          scale: 1.15,
          duration: 0.4,
          ease: "power2.out",
        })
      }

      const handleLogoLeave = () => {
        gsap.to(logoRef.current, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        })

        gsap.to(logoGlowRef.current, {
          opacity: 0.85,
          scale: 1.05,
          duration: 0.4,
          ease: "power2.out",
        })
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove, { passive: true })
      window.addEventListener("scroll", handleScroll, { passive: true })

      if (logoRef.current) {
        logoRef.current.addEventListener("mouseenter", handleLogoHover)
        logoRef.current.addEventListener("mouseleave", handleLogoLeave)
      }

      return () => {
        clearTimeout(mouseTimeout)
        clearTimeout(scrollTimeout)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("scroll", handleScroll)
        if (logoRef.current) {
          logoRef.current.removeEventListener("mouseenter", handleLogoHover)
          logoRef.current.removeEventListener("mouseleave", handleLogoLeave)
        }
      }
    }, heroRef)

    return () => ctx.revert()
  }, [particles]) // Re-run when particles are loaded

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Optimized Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "brightness(0.75) contrast(1.2) saturate(1.1)",
          transform: "scale(1.01)",
          minWidth: "100%",
          minHeight: "100%",
          objectPosition: "center center",
        }}
      >
        <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+Hero+Banner.mp4" type="video/mp4" />
      </video>

      {/* Simplified Film Grain Overlay */}
      <div
        ref={filmGrainRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Simplified Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      {/* Dynamic Cinematic Overlay */}
      <div
        ref={cinematicOverlayRef}
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.7) 100%)`,
        }}
      />

      {/* Simplified Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.6) 100%)`,
        }}
      />

      {/* Optimized Light Rays */}
      <div
        ref={lightRaysRef}
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `
            conic-gradient(from 0deg at center, 
              transparent 0deg, 
              rgba(255,255,255,0.1) 60deg, 
              transparent 120deg,
              rgba(255,255,255,0.05) 180deg,
              transparent 240deg,
              rgba(255,255,255,0.1) 300deg,
              transparent 360deg
            )
          `,
          transformOrigin: "center center",
        }}
      />

      {/* Client-side Particles (fixes hydration) */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute w-1 h-1 bg-white/15 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              filter: `blur(${particle.blur}px)`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      {/* TXMX Logo with Optimized Treatment */}
      <div ref={logoRef} className="relative z-10 flex items-center justify-center px-4 cursor-pointer">
        <div className="relative">
          {/* Simplified Primary Glow */}
          <div
            ref={logoGlowRef}
            className="absolute inset-0 blur-3xl opacity-85"
            style={{
              background: `
                radial-gradient(ellipse at center, 
                  rgba(255,255,255,0.15) 0%, 
                  rgba(255,255,255,0.08) 40%, 
                  rgba(255,255,255,0.03) 70%,
                  transparent 100%
                )
              `,
              transform: "scale(1.2)",
            }}
          />

          {/* Simplified Secondary Glow */}
          <div
            className="absolute inset-0 blur-xl opacity-60"
            style={{
              background: `
                radial-gradient(ellipse at center, 
                  rgba(255,255,255,0.12) 0%, 
                  rgba(255,255,255,0.06) 50%, 
                  transparent 80%
                )
              `,
              transform: "scale(1.1)",
            }}
          />

          {/* Optimized Logo */}
          <div className="relative">
            <Image
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Boxing"
              width={600}
              height={300}
              className="relative w-[300px] h-[150px] sm:w-[400px] sm:h-[200px] md:w-[500px] md:h-[250px] lg:w-[600px] lg:h-[300px] object-contain"
              style={{
                filter: `
                  brightness(1.2) 
                  contrast(1.1) 
                  drop-shadow(0 0 40px rgba(255,255,255,0.3))
                  drop-shadow(0 0 80px rgba(255,255,255,0.15))
                  drop-shadow(0 10px 30px rgba(0,0,0,0.5))
                `,
              }}
              priority
            />
          </div>

          {/* Simplified Accent Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 opacity-30"
              style={{
                height: "20%",
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "fadeInOut 5s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 opacity-30"
              style={{
                height: "20%",
                background: "linear-gradient(to top, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "fadeInOut 5s ease-in-out infinite 2.5s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Optimized CSS animations */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { 
            opacity: 0; 
            transform: translateX(-50%) scaleY(0.5); 
          }
          50% { 
            opacity: 0.6; 
            transform: translateX(-50%) scaleY(1); 
          }
        }

        /* Performance optimizations */
        .particle {
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          video {
            object-position: center center !important;
            transform: scale(1.02) !important;
          }
          
          /* Reduce effects on mobile for performance */
          .particle {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          video {
            object-position: center center !important;
            transform: scale(1.03) !important;
          }
        }

        /* Reduce motion for better performance */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  )
}
