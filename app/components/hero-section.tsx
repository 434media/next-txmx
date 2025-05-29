"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const logoGlowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Immediate presentation - no intro animations
      gsap.set(videoRef.current, {
        opacity: 1,
        scale: 1,
        filter: "brightness(0.6) contrast(1.4) saturate(1.1)",
      })

      gsap.set(logoRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
      })

      // Enhanced continuous logo effects without color
      gsap.to(logoGlowRef.current, {
        opacity: 0.8,
        scale: 1.05,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Subtle logo floating animation
      gsap.to(logoRef.current, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Enhanced parallax with more dramatic effects
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window

        const xPercent = (clientX / innerWidth - 0.5) * 2
        const yPercent = (clientY / innerHeight - 0.5) * 2

        // More dramatic video parallax
        gsap.to(videoRef.current, {
          x: xPercent * 30,
          y: yPercent * 30,
          rotationX: yPercent * 2,
          rotationY: xPercent * 2,
          duration: 2,
          ease: "power2.out",
        })

        // Enhanced logo counter-parallax with rotation
        gsap.to(logoRef.current, {
          x: xPercent * -15,
          y: yPercent * -15,
          rotationX: yPercent * -1,
          rotationY: xPercent * -1,
          duration: 1.5,
          ease: "power2.out",
        })

        // Dynamic glow response to mouse movement
        gsap.to(logoGlowRef.current, {
          x: xPercent * 10,
          y: yPercent * 10,
          scale: 1.1 + Math.abs(xPercent) * 0.1,
          duration: 1.5,
          ease: "power2.out",
        })
      }

      // Enhanced scroll-based effects
      const handleScroll = () => {
        const scrollY = window.scrollY
        const scrollPercent = Math.min(scrollY / window.innerHeight, 1)

        // More dramatic video scaling and effects
        gsap.to(videoRef.current, {
          scale: 1 + scrollPercent * 0.15,
          filter: `brightness(${0.6 - scrollPercent * 0.4}) contrast(${1.4 + scrollPercent * 0.3}) blur(${scrollPercent * 3}px)`,
          duration: 0.3,
          ease: "none",
        })

        // Enhanced logo scroll effects
        gsap.to(logoRef.current, {
          y: scrollPercent * -120,
          scale: 1 - scrollPercent * 0.2,
          opacity: 1 - scrollPercent * 0.9,
          rotationX: scrollPercent * 15,
          duration: 0.3,
          ease: "none",
        })

        // Glow effects on scroll
        gsap.to(logoGlowRef.current, {
          opacity: 0.8 - scrollPercent * 0.6,
          scale: 1.05 + scrollPercent * 0.3,
          duration: 0.3,
          ease: "none",
        })
      }

      // Enhanced logo hover effects
      const handleLogoHover = () => {
        gsap.to(logoRef.current, {
          scale: 1.05,
          duration: 0.4,
          ease: "power2.out",
        })

        gsap.to(logoGlowRef.current, {
          opacity: 1,
          scale: 1.2,
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
          opacity: 0.8,
          scale: 1.05,
          duration: 0.4,
          ease: "power2.out",
        })
      }

      // Add event listeners
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("scroll", handleScroll)

      if (logoRef.current) {
        logoRef.current.addEventListener("mouseenter", handleLogoHover)
        logoRef.current.addEventListener("mouseleave", handleLogoLeave)
      }

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
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
      {/* Enhanced Background Video with Immediate Presentation */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "brightness(0.6) contrast(1.4) saturate(1.1)",
          transform: "scale(1.02)",
          minWidth: "100%",
          minHeight: "100%",
          objectPosition: "center center",
        }}
      >
        <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+Hero+Banner.mp4" type="video/mp4" />
      </video>

      {/* Enhanced gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.3) 100%)`,
        }}
      />

      {/* TXMX Logo with Premium Black & White Treatment */}
      <div ref={logoRef} className="relative z-10 flex items-center justify-center px-4 cursor-pointer">
        <div className="relative">
          {/* Enhanced Multi-layered Glow Background - No Colors */}
          <div
            ref={logoGlowRef}
            className="absolute inset-0 blur-3xl opacity-80"
            style={{
              background: `
                radial-gradient(circle at center, 
                  rgba(255,255,255,0.15) 0%, 
                  rgba(255,255,255,0.08) 30%, 
                  rgba(255,255,255,0.04) 60%,
                  transparent 100%
                )
              `,
              transform: "scale(1.2)",
            }}
          />

          {/* Secondary glow layer for depth */}
          <div
            className="absolute inset-0 blur-2xl opacity-60"
            style={{
              background: `
                radial-gradient(circle at center, 
                  rgba(255,255,255,0.2) 0%, 
                  rgba(255,255,255,0.1) 50%, 
                  transparent 70%
                )
              `,
              transform: "scale(1.1)",
            }}
          />

          {/* Premium border glow */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: `
                conic-gradient(from 0deg, 
                  transparent, 
                  rgba(255,255,255,0.3), 
                  rgba(255,255,255,0.6), 
                  rgba(255,255,255,0.3), 
                  transparent
                )
              `,
              mask: "radial-gradient(circle at center, transparent 85%, black 90%, black 95%, transparent 100%)",
              WebkitMask: "radial-gradient(circle at center, transparent 85%, black 90%, black 95%, transparent 100%)",
              animation: "rotateBorder 8s linear infinite",
            }}
          />

          {/* Logo with enhanced presentation */}
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

          {/* Subtle animated accent lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 opacity-30"
              style={{
                height: "20%",
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "fadeInOut 4s ease-in-out infinite",
              }}
            />
            <div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 opacity-30"
              style={{
                height: "20%",
                background: "linear-gradient(to top, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "fadeInOut 4s ease-in-out infinite 2s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes rotateBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateX(-50%) scaleY(0); }
          50% { opacity: 0.6; transform: translateX(-50%) scaleY(1); }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          video {
            object-position: center center !important;
            transform: scale(1.1) !important;
          }
        }
        
        @media (max-width: 480px) {
          video {
            object-position: center center !important;
            transform: scale(1.15) !important;
          }
        }
        
        @media (max-width: 768px) and (min-aspect-ratio: 9/16) {
          video {
            object-fit: cover !important;
            width: 100vw !important;
            height: 100vh !important;
          }
        }
        
        @media (max-width: 768px) and (orientation: landscape) {
          video {
            object-position: center center !important;
            transform: scale(1.05) !important;
          }
        }
      `}</style>
    </section>
  )
}
