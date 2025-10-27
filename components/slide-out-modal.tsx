"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { InstagramIcon } from "../components/icons/instagram-icon"
import { ShopifyIcon } from "../components/icons/shopify-icon"
import { ExternalLinkIcon } from "../components/icons/external-link-icon"
import { XIcon } from "../components/icons/x-icon"
import Image from "next/image"

interface SlideOutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SlideOutModal({ isOpen, onClose }: SlideOutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Enhanced entrance animation with spring-like timing
      const tl = gsap.timeline()

      gsap.set(modalRef.current, { display: "flex" })

      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" })
        .fromTo(
          modalContentRef.current,
          { x: "100%", scale: 0.95 },
          { x: "0%", scale: 1, duration: 0.7, ease: "back.out(1.2)" },
          "-=0.3",
        )
        .fromTo(
          ".modal-element",
          { y: 40, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.4)" },
          "-=0.4",
        )
    } else {
      // Enhanced exit animation
      const tl = gsap.timeline()

      tl.to(".modal-element", {
        y: -20,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
      })
        .to(
          modalContentRef.current,
          {
            x: "100%",
            scale: 0.95,
            duration: 0.5,
            ease: "power3.in",
          },
          "-=0.2",
        )
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.3",
        )
        .set(modalRef.current, { display: "none" })
    }
  }, [isOpen])

  // Reduced hover handlers - minimal scale
  const handleItemHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.01,
      y: -1,
      duration: 0.3,
      ease: "power2.out",
    })
  }

  const handleItemLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    })
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 hidden">
      {/* Enhanced Overlay */}
      <div ref={overlayRef} className="absolute inset-0 backdrop-blur-md bg-black/80" onClick={onClose} />

      {/* Modal Content - Maximized Viewing Area */}
      <div
        ref={modalContentRef}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white border-l-4 border-black"
        style={{
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Compact Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <Image
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Boxing Logo"
              width={80}
              height={40}
              className="filter invert"
              priority
            />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 md:py-3  bg-black text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <XIcon className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Hero Video - Natural Size */}
        <div className="modal-element relative w-full bg-black border-b-2 border-black">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-auto object-cover"
            style={{
              objectPosition: "center center",
            }}
          >
            <source src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMX+Hero+Banner.mp4" type="video/mp4" />
            <track kind="captions" />
          </video>

          {/* Subtle overlay for text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Optional text overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-sm font-bold tracking-wider uppercase">Made from blood, sweat, and tears</p>
          </div>
        </div>

        {/* Main Content - Compact Spacing */}
        <div className="p-4 space-y-3">
          {/* 8 Count Link */}
          <a
            href="/the8count"
            className="modal-element group relative block"
            onMouseEnter={handleItemHover}
            onMouseLeave={handleItemLeave}
          >
            <div className="relative p-4 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-black flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-black font-bold text-sm tracking-wide">THE 8 COUNT</div>
                  <div className="text-gray-600 text-xs font-medium truncate">A Feed for Fight Fans</div>
                </div>
                <div className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-current"></div>
                </div>
              </div>
            </div>
          </a>

          {/* Shopify Link */}
          <a
            href="https://434media.com/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="modal-element group relative block"
            onMouseEnter={handleItemHover}
            onMouseLeave={handleItemLeave}
          >
            <div className="relative p-4 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-black flex-shrink-0">
                  <ShopifyIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-black font-bold text-sm tracking-wide">SHOP TXMX BOXING</div>
                  <div className="text-gray-600 text-xs font-medium truncate">Founders Tee Now Available</div>
                </div>
                <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
              </div>
            </div>
          </a>

          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/txmxboxing/"
            target="_blank"
            rel="noopener noreferrer"
            className="modal-element group relative block"
            onMouseEnter={handleItemHover}
            onMouseLeave={handleItemLeave}
          >
            <div className="relative p-4 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-black flex-shrink-0">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-black font-bold text-sm tracking-wide">FOLLOW US</div>
                  <div className="text-gray-600 text-xs font-medium truncate">@txmxboxing</div>
                </div>
                <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
              </div>
            </div>
          </a>
        </div>

        {/* Compact Footer */}
        <div className="modal-element text-center py-4 border-t-2 border-black">
          <p className="text-xs text-gray-600 font-medium tracking-wide">TXMX • BOXING</p>
        </div>
      </div>
    </div>
  )
}
