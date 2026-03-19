"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import TXMXNewsletter from "./txmx-newsletter"

export default function HeroSection() {
  const [showTXMXNewsletter, setShowTXMXNewsletter] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowTXMXNewsletter(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative h-dvh flex items-center justify-center overflow-hidden">
      {/* Hero Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center center" }}
      >
        <source src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMX%20Hero%20Banner.mp4" type="video/mp4" />
        <track kind="captions" />
      </video>

      {/* Overlay for Logo Readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(0,0,0,0.4) 0%,
              rgba(0,0,0,0.15) 40%,
              rgba(0,0,0,0.15) 60%,
              rgba(0,0,0,0.5) 100%
            )
          `,
        }}
      />

      {/* TXMX Logo Overlay */}
      <div className="relative z-10 flex items-center justify-center px-4 animate-float">
        <div className="relative">
          {/* Soft shadow behind logo */}
          <div
            className="absolute inset-0 blur-2xl opacity-50"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
              transform: "scale(1.3) translateY(10px)",
            }}
          />

          {/* Logo */}
          <Image
            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
            alt="TXMX Boxing"
            width={600}
            height={300}
            className="relative w-[240px] h-[120px] sm:w-[320px] sm:h-[160px] md:w-[420px] md:h-[210px] lg:w-[520px] lg:h-[260px] object-contain"
            style={{
              filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.4))",
            }}
            priority
            loading="eager"
          />
        </div>
      </div>

      {/* TXMX Newsletter Modal */}
      <TXMXNewsletter showModal={showTXMXNewsletter} onClose={() => setShowTXMXNewsletter(false)} />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none;
          }
        }

        @media (max-width: 768px) {
          video {
            object-position: center center;
            height: 100dvh;
          }
        }
      `}</style>
    </section>
  )
}
