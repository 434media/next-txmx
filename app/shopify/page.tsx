"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { Newsletter } from "../components/newsletter"

export default function ShopifyTeaserPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const backLinkRef = useRef<HTMLDivElement>(null)
  const audioButtonRef = useRef<HTMLButtonElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoTime, setVideoTime] = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  // Track if CTA has been shown
  const ctaShownRef = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Immediate presentation of video
      gsap.set(videoRef.current, {
        opacity: 0,
        scale: 1.05,
      })

      // Hide CTA and back link initially
      gsap.set([ctaRef.current, backLinkRef.current], {
        opacity: 0,
        y: 20,
      })

      // Show audio button immediately but with fade in
      gsap.set(audioButtonRef.current, {
        opacity: 0,
      })

      // Video entrance animation
      gsap.to(videoRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: "power2.out",
      })

      // Audio button entrance
      gsap.to(audioButtonRef.current, {
        opacity: 0.7,
        duration: 1,
        delay: 2,
        ease: "power2.out",
      })

      // Subtle floating animation for CTA
      gsap.to(ctaRef.current, {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 18, // Start floating animation when it appears
      })

      // Enhanced parallax effects
      const handleMouseMove = (e: MouseEvent) => {
        if (!videoLoaded) return

        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window

        const xPercent = (clientX / innerWidth - 0.5) * 2
        const yPercent = (clientY / innerHeight - 0.5) * 2

        // Subtle video parallax
        gsap.to(videoRef.current, {
          x: xPercent * 15,
          y: yPercent * 15,
          duration: 2.5,
          ease: "power2.out",
        })

        // Counter-parallax for CTA when visible
        if (showCTA) {
          gsap.to(ctaRef.current, {
            x: xPercent * -8,
            y: yPercent * -8,
            duration: 2,
            ease: "power2.out",
          })
        }
      }

      // Scroll effects
      const handleScroll = () => {
        const scrollY = window.scrollY

        // Detect any scroll
        if (scrollY > 10 && !hasScrolled) {
          setHasScrolled(true)
        }

        // Parallax effects on scroll
        const scrollPercent = Math.min(scrollY / window.innerHeight, 1)
        gsap.to(videoRef.current, {
          scale: 1 + scrollPercent * 0.1,
          filter: `brightness(${0.85 - scrollPercent * 0.3}) contrast(${1.15 + scrollPercent * 0.2}) blur(${scrollPercent * 2}px)`,
          duration: 0.3,
          ease: "none",
        })

        if (showCTA) {
          gsap.to(ctaRef.current, {
            y: scrollPercent * -80 - 6, // Account for the floating animation
            opacity: 1 - scrollPercent * 0.8,
            duration: 0.3,
            ease: "none",
          })
        }
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("scroll", handleScroll)
      }
    }, heroRef)

    return () => ctx.revert()
  }, [videoLoaded, hasScrolled, showCTA])

  // Effect to show CTA based on video time or scroll
  useEffect(() => {
    // Show CTA if video reaches 18 seconds or user scrolls
    if ((videoTime >= 18 || hasScrolled) && !ctaShownRef.current) {
      ctaShownRef.current = true
      setShowCTA(true)

      // Animate in the CTA and back link
      gsap.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      })

      gsap.to(backLinkRef.current, {
        opacity: 0.7,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.3,
      })
    }
  }, [videoTime, hasScrolled])

  // Track video time
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setVideoTime(Math.floor(video.currentTime))
    }

    video.addEventListener("timeupdate", updateTime)
    return () => {
      video.removeEventListener("timeupdate", updateTime)
    }
  }, [])

  const handleVideoLoaded = () => {
    setVideoLoaded(true)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)

      // Animate the button
      gsap.to(audioButtonRef.current, {
        scale: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      })
    }
  }

  const handleNewsletterSuccess = () => {
    // Add success feedback animation
    gsap.to(ctaRef.current, {
      scale: 1.03,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    })
  }

  return (
    <main className="relative min-h-screen bg-black overflow-hidden font-sans">
      {/* Hero Section with Teaser Video */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Desktop Video Container */}
        <div className="absolute inset-0 hidden md:block">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={handleVideoLoaded}
            className="w-full h-full object-cover"
            style={{
              filter: "brightness(0.85) contrast(1.15) saturate(1.1)",
              objectPosition: "center center",
            }}
          >
            <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+DROP+TEASER.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Mobile Video Container - 1080x1350 Aspect Ratio */}
        <div className="absolute inset-0 md:hidden flex items-center justify-center">
          <div
            className="relative w-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={handleVideoLoaded}
              className="w-full h-full object-cover md:hidden aspect-square"
              style={{
                filter: "brightness(0.85) contrast(1.15) saturate(1.1)",
                objectPosition: "center center",
              }}
            >
              <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+DROP+TEASER.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)`,
          }}
        />

        {/* Audio Control Button */}
        <button
          ref={audioButtonRef}
          onClick={toggleMute}
          className="absolute top-20 right-6 z-20 p-3 rounded-full transition-all duration-300 hover:opacity-100 focus:opacity-100"
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeOffIcon className="w-5 h-5 text-white/90" />
          ) : (
            <VolumeOnIcon className="w-5 h-5 text-white/90" />
          )}
        </button>

        {/* Content Overlay */}
        <div
          ref={ctaRef}
          className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-20 px-4 opacity-0 mt-32 md:mt-0"
          style={{ transform: "translateY(20px)" }}
        >
          {/* Newsletter Signup Form */}
          <div className="w-full max-w-md">
            <div
              className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-md"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(0,0,0,0.6) 0%, 
                    rgba(0,0,0,0.4) 100%
                  )
                `,
                boxShadow: `
                  0 8px 32px rgba(0,0,0,0.4),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
              }}
            >
              <div className="text-center mb-5">
                <h2 className="text-white text-xl font-semibold mb-2">Coming July 19th</h2>
                <p className="text-white/80 text-sm">Sign up for early access and exclusive drops</p>
              </div>

              <Newsletter onSuccess={handleNewsletterSuccess} className="w-full" />
            </div>
          </div>

          {/* Back to Home Link */}
          <div ref={backLinkRef} className="mt-6 opacity-0" style={{ transform: "translateY(20px)" }}>
            <a
              href="/"
              className="inline-flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-300 text-sm backdrop-blur-sm px-3 py-2 rounded-full"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        /* Video optimizations */
        video {
          will-change: transform, opacity;
        }
        
        /* Mobile-specific video styling */
        @media (max-width: 768px) {
          /* Ensure mobile video container is properly centered */
          .mobile-video-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          
          /* Override any conflicting styles for mobile video */
          video {
            object-position: center center !important;
            object-fit: cover !important;
          }
        }
        
        /* Portrait orientation optimization */
        @media (max-width: 768px) and (orientation: portrait) {
          /* Ensure the aspect ratio container works well in portrait */
          .mobile-video-container > div {
            width: 100vw;
            max-width: 100vw;
          }
        }
        
        /* Landscape orientation for mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          /* In landscape, we might want to adjust the aspect ratio container */
          .mobile-video-container > div {
            height: 100vh;
            width: auto;
            aspect-ratio: 1080 / 1350;
          }
        }
        
        /* Very small screens */
        @media (max-width: 480px) {
          video {
            object-position: center center !important;
          }
        }
      `}</style>
    </main>
  )
}

// Volume Icons
const VolumeOffIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)

const VolumeOnIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
)
