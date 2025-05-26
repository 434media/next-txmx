"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { InstagramIcon } from "../components/icons/instagram-icon"
import { ShopifyIcon } from "../components/icons/shopify-icon"
import { MailIcon } from "../components/icons/mail-icon"
import { XIcon } from "../components/icons/x-icon"
import { ArrowLeftIcon } from "../components/icons/arrow-left-icon"
import { ExternalLinkIcon } from "../components/icons/external-link-icon"
import { Newsletter } from "./newsletter"

interface SlideOutModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalState = "main" | "contact"

export default function SlideOutModal({ isOpen, onClose }: SlideOutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const contactContentRef = useRef<HTMLDivElement>(null)

  const [modalState, setModalState] = useState<ModalState>("main")

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setModalState("main")

      // Optimized entrance animation - single timeline
      const tl = gsap.timeline()

      gsap.set(modalRef.current, { display: "flex" })

      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
        .fromTo(modalContentRef.current, { x: "100%" }, { x: "0%", duration: 0.4, ease: "power3.out" }, "-=0.1")
        .fromTo(
          ".modal-element",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" },
          "-=0.2",
        )
    } else {
      // Optimized exit animation
      const tl = gsap.timeline()

      tl.to(modalContentRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power3.in",
      })
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          "-=0.1",
        )
        .set(modalRef.current, { display: "none" })
    }
  }, [isOpen])

  const handleContactClick = () => {
    // Only animate if the main content exists
    if (!mainContentRef.current) return

    const tl = gsap.timeline()

    tl.to(mainContentRef.current, {
      x: -30,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    })
      .call(() => setModalState("contact"))
      .call(() => {
        // Wait for contact content to be rendered before animating
        if (contactContentRef.current) {
          gsap.fromTo(
            contactContentRef.current,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          )

          // Only animate form elements if they exist
          const formElements = document.querySelectorAll(".form-element")
          if (formElements.length > 0) {
            gsap.fromTo(
              formElements,
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.2, stagger: 0.05, ease: "power2.out", delay: 0.1 },
            )
          }
        }
      })
  }

  const handleBackClick = () => {
    // Only animate if the contact content exists
    if (!contactContentRef.current) return

    const tl = gsap.timeline()

    tl.to(contactContentRef.current, {
      x: 30,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    })
      .call(() => {
        setModalState("main")
      })
      .call(() => {
        // Wait for main content to be rendered before animating
        if (mainContentRef.current) {
          gsap.fromTo(
            mainContentRef.current,
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          )

          // Only animate modal elements if they exist
          const modalElements = document.querySelectorAll(".modal-element")
          if (modalElements.length > 0) {
            gsap.fromTo(
              modalElements,
              { y: 10, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.2, stagger: 0.03, ease: "power2.out", delay: 0.1 },
            )
          }
        }
      })
  }

  const handleNewsletterSuccess = () => {
    // Only animate if form elements exist
    const formElements = document.querySelectorAll(".form-element")
    if (formElements.length > 0) {
      gsap.to(formElements, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      })
    }
  }

  // Optimized hover handlers with simple effects
  const handleItemHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const handleItemLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 hidden">
      {/* Simplified Overlay */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content - Simplified Background */}
      <div
        ref={modalContentRef}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-black/95 backdrop-blur-xl border-l border-white/20 overflow-y-auto"
      >
        {/* Main Content */}
        {modalState === "main" && (
          <div ref={mainContentRef} className="flex flex-col h-full p-6">
            {/* Header - Close Button */}
            <div className="modal-element flex justify-end mb-6">
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all duration-300 group"
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5 text-white group-hover:text-red-400 transition-colors duration-300" />
              </button>
            </div>

            {/* TXMX Logo */}
            <div className="modal-element flex justify-center mb-6">
              <div className="relative p-4 rounded-xl bg-white/5 border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Logo"
                  className="h-12 w-auto object-contain"
                  style={{
                    maxWidth: "140px",
                    height: "48px",
                    display: "block",
                  }}
                  onLoad={() => console.log("Logo loaded successfully")}
                  onError={(e) => {
                    console.error("Logo failed to load:", e)
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.parentElement?.querySelector(".logo-fallback") as HTMLElement
                    if (fallback) fallback.style.display = "block"
                  }}
                />
                <div className="logo-fallback hidden text-white font-bold text-xl text-center">TXMX</div>
              </div>
            </div>

            {/* Title and Description */}
            <div className="modal-element text-center space-y-3 mb-8">
              <h1 className="text-white text-xl font-bold">
                <span className="bg-gradient-to-r from-green-400 via-white to-red-400 bg-clip-text text-transparent">
                  Levantamos Los Puños
                </span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed px-2">
                TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience.
              </p>
            </div>

            {/* Link Tree Style Links */}
            <div className="flex-1 flex flex-col justify-center space-y-4 max-w-xs mx-auto w-full">
              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/txmxboxing/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-element group relative block"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div className="relative p-4 rounded-xl bg-white/5 border border-white/20 hover:border-green-400/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-green-600/30">
                      <InstagramIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-green-400 transition-colors duration-300">
                        Instagram
                      </div>
                      <div className="text-white/60 text-sm">@txmxboxing</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-white/40 group-hover:text-green-400 transition-colors duration-300" />
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
                <div className="relative p-4 rounded-xl bg-white/5 border border-white/20 hover:border-red-400/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-red-600/30">
                      <ShopifyIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-red-400 transition-colors duration-300">
                        Shop
                      </div>
                      <div className="text-white/60 text-sm">Official Store</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors duration-300" />
                  </div>
                </div>
              </a>

              {/* Contact Button - Now matches link tree style */}
              <button
                onClick={handleContactClick}
                className="modal-element group relative block w-full text-left"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div className="relative p-4 rounded-xl bg-white/5 border border-white/20 hover:border-white/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-600/30 to-red-600/30">
                      <MailIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-green-400 transition-colors duration-300">
                        Contact Us
                      </div>
                      <div className="text-white/60 text-sm">Get in touch & stay updated</div>
                    </div>
                    <div className="w-4 h-4 text-white/40 group-hover:text-white transition-colors duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Contact Content - Now with Link Tree Design */}
        {modalState === "contact" && (
          <div ref={contactContentRef} className="flex flex-col h-full p-6">
            {/* Header - Back Button */}
            <div className="flex justify-start mb-6">
              <button
                onClick={handleBackClick}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white group-hover:text-green-400 transition-colors duration-300" />
              </button>
            </div>

            {/* TXMX Logo - Same as main modal */}
            <div className="form-element flex justify-center mb-6">
              <div className="relative p-4 rounded-xl bg-white/5 border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Logo"
                  className="h-12 w-auto object-contain"
                  style={{
                    maxWidth: "140px",
                    height: "48px",
                    display: "block",
                  }}
                  onLoad={() => console.log("Logo loaded successfully")}
                  onError={(e) => {
                    console.error("Logo failed to load:", e)
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const fallback = target.parentElement?.querySelector(".logo-fallback") as HTMLElement
                    if (fallback) fallback.style.display = "block"
                  }}
                />
                <div className="logo-fallback hidden text-white font-bold text-xl text-center">TXMX</div>
              </div>
            </div>

            {/* Title and Description - Same as main modal */}
            <div className="form-element text-center space-y-3 mb-8">
              <h1 className="text-white text-xl font-bold">
                <span className="bg-gradient-to-r from-green-400 via-white to-red-400 bg-clip-text text-transparent">
                  Levantamos Los Puños
                </span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed px-2">
                TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.
              </p>
            </div>

            {/* Newsletter Form - Standalone Component */}
            <div className="flex-1 flex flex-col justify-center space-y-4 max-w-xs mx-auto w-full">
              <Newsletter onSuccess={handleNewsletterSuccess} className="form-element" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
