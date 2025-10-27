"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple fade-in animation for the image
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
        )
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden h-screen">
      {/* Full Screen Hero Image with Distortion */}
      <div 
        ref={imageRef} 
        className="absolute inset-0 w-full h-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          const y = (e.clientY - rect.top) / rect.height
          
          // Apply CSS distortion directly to the image
          const img = e.currentTarget.querySelector('img')
          if (img) {
            const centerX = x - 0.5
            const centerY = y - 0.5
            const distance = Math.sqrt(centerX * centerX + centerY * centerY)
            const maxDistance = 0.15 // Distortion radius
            
            if (distance < maxDistance) {
              const intensity = (maxDistance - distance) / maxDistance
              const angle = Math.atan2(centerY, centerX)
              
              // Create displacement effect
              const displaceX = Math.cos(angle) * intensity * 20
              const displaceY = Math.sin(angle) * intensity * 20
              
              // Apply CSS filter and transform
              img.style.filter = `
                blur(${intensity * 2}px) 
                contrast(${1 + intensity * 0.5}) 
                brightness(${1 - intensity * 0.3})
                hue-rotate(${intensity * 30}deg)
              `
              img.style.transform = `
                translate(${displaceX}px, ${displaceY}px) 
                scale(${1 + intensity * 0.1})
              `
            } else {
              // Reset when mouse is outside distortion area
              img.style.filter = 'brightness(0.75) contrast(1.25) saturate(0.9)'
              img.style.transform = 'translate(0px, 0px) scale(1)'
            }
          }
        }}
        onMouseLeave={(e) => {
          // Reset distortion when mouse leaves
          const img = e.currentTarget.querySelector('img')
          if (img) {
            img.style.filter = 'brightness(0.75) contrast(1.25) saturate(0.9)'
            img.style.transform = 'translate(0px, 0px) scale(1)'
          }
        }}
      >
        <Image
          src="https://ampd-asset.s3.us-east-2.amazonaws.com/txmx/TXMX-Refresh-V1.png"
          alt="TXMX Boxing"
          fill
          className="object-cover object-center brightness-75 contrast-125 saturate-90 transition-all duration-75 ease-out"
          priority
          quality={100}
          sizes="100vw"
        />
        {/* Dark gritty overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50 mix-blend-multiply" />
        {/* Film grain texture */}
        <div className="absolute inset-0 bg-black/10 opacity-40" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.01) 21%, rgba(255,255,255,0.01) 34%, transparent 35%, transparent),
                           linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.02) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02) 76%, transparent 77%, transparent)`,
          backgroundSize: '15px 15px, 8px 8px'
        }} />
      </div>

      {/* Enhanced CSS for Performance */}
      <style jsx>{`
        /* Image optimization */
        img {
          will-change: transform;
          transform: translateZ(0);
        }

        /* Canvas optimization */
        canvas {
          will-change: transform;
          transform: translateZ(0);
        }

        /* High refresh rate display optimization */
        @media (min-resolution: 120dpi) {
          img {
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
          canvas {
            display: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          img {
            filter: brightness(1.2) contrast(1.3) !important;
          }
          canvas {
            display: none;
          }
        }

        /* Focus styles for accessibility */
        [tabindex]:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 4px;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          section {
            height: 100vh;
            height: 100dvh;
            min-height: 100vh;
            min-height: 100dvh;
          }
          
          /* Maximize image area on mobile */
          section > div:first-child {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
          }
          
          /* Adjust image positioning to show billboard text */
          section img {
            object-position: center 30% !important;
          }
          
          canvas {
            opacity: 0.15;
          }
        }

        /* iOS Safari specific optimizations */
        @supports (-webkit-touch-callout: none) {
          img,
          canvas {
            -webkit-transform: translateZ(0);
            -webkit-backface-visibility: hidden;
          }
        }
      `}</style>
    </section>
  )
}
