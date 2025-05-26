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
      // Enhanced hero entrance animation
      const tl = gsap.timeline()

      // Video entrance with cinematic effect
      tl.fromTo(
        videoRef.current,
        {
          opacity: 0,
          scale: 1.15,
          filter: "blur(15px) brightness(0.3)",
        },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px) brightness(0.7)",
          duration: 5,
          ease: "power3.out",
        },
      )

      // Logo entrance with dramatic effect
      tl.fromTo(
        logoRef.current,
        {
          opacity: 0,
          scale: 0.6,
          y: 50,
          rotationX: -15,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 2.5,
          ease: "back.out(1.7)",
        },
        "-=2.5",
      )

      // Enhanced logo glow animation
      gsap.to(logoRef.current, {
        filter:
          "drop-shadow(0 0 60px rgba(255,255,255,0.4)) drop-shadow(0 0 30px rgba(0,104,71,0.3)) drop-shadow(0 0 30px rgba(206,17,38,0.3))",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Enhanced video parallax with depth
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window

        const xPercent = (clientX / innerWidth - 0.5) * 2
        const yPercent = (clientY / innerHeight - 0.5) * 2

        // Video parallax
        gsap.to(videoRef.current, {
          x: xPercent * 20,
          y: yPercent * 20,
          rotationX: yPercent * 3,
          rotationY: xPercent * 3,
          duration: 2.5,
          ease: "power2.out",
        })

        // Logo counter-parallax for depth
        gsap.to(logoRef.current, {
          x: xPercent * -5,
          y: yPercent * -5,
          duration: 1.5,
          ease: "power2.out",
        })
      }

      // Enhanced scroll-based animations
      const handleScroll = () => {
        const scrollY = window.scrollY
        const scrollPercent = Math.min(scrollY / window.innerHeight, 1)

        gsap.to(videoRef.current, {
          scale: 1 + scrollPercent * 0.1,
          filter: `blur(${scrollPercent * 5}px) brightness(${0.7 - scrollPercent * 0.3})`,
          duration: 0.3,
          ease: "none",
        })

        gsap.to(logoRef.current, {
          y: scrollPercent * -100,
          opacity: 1 - scrollPercent * 0.8,
          duration: 0.3,
          ease: "none",
        })
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("scroll", handleScroll)
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background Video with Mobile Optimization */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "brightness(0.7) contrast(1.3) saturate(1.2)",
          transform: "scale(1.02)",
          // Ensure video covers viewport on all devices
          minWidth: "100%",
          minHeight: "100%",
          // Center the video for better mobile coverage
          objectPosition: "center center",
        }}
      >
        <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+Hero+Banner.mp4" type="video/mp4" />
      </video>

      {/* Mobile-specific video overlay for better coverage */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.1) 0%,
              transparent 20%,
              transparent 80%,
              rgba(0,0,0,0.1) 100%
            )
          `,
        }}
      />

      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-transparent to-red-900/10" />

      {/* TXMX Logo with enhanced presentation and mobile optimization */}
      <div ref={logoRef} className="relative z-10 flex items-center justify-center px-4">
        <div className="relative">
          {/* Logo glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-red-600/20 blur-3xl scale-110" />

          <Image
            src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
            alt="TXMX Boxing"
            width={600}
            height={300}
            className="relative w-[300px] h-[150px] sm:w-[400px] sm:h-[200px] md:w-[500px] md:h-[250px] lg:w-[600px] lg:h-[300px] object-contain"
            priority
          />
        </div>
      </div>

      {/* Subtle animated elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-30">
        <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-red-400 rounded-full animate-pulse" />
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
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
        
        /* Ensure video covers viewport on very tall mobile screens */
        @media (max-width: 768px) and (min-aspect-ratio: 9/16) {
          video {
            object-fit: cover !important;
            width: 100vw !important;
            height: 100vh !important;
          }
        }
        
        /* Handle landscape mobile orientation */
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
