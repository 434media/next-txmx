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

      // Enhanced entrance animation with elegant timing
      const tl = gsap.timeline()

      gsap.set(modalRef.current, { display: "flex" })

      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(modalContentRef.current, { x: "100%" }, { x: "0%", duration: 0.6, ease: "power3.out" }, "-=0.2")
        .fromTo(
          ".modal-element",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
          "-=0.3",
        )
    } else {
      // Elegant exit animation
      const tl = gsap.timeline()

      tl.to(modalContentRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      })
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "-=0.2",
        )
        .set(modalRef.current, { display: "none" })
    }
  }, [isOpen])

  const handleContactClick = () => {
    if (!mainContentRef.current) return

    const tl = gsap.timeline()

    tl.to(mainContentRef.current, {
      x: -40,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    })
      .call(() => setModalState("contact"))
      .call(() => {
        if (contactContentRef.current) {
          gsap.fromTo(
            contactContentRef.current,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          )

          const formElements = document.querySelectorAll(".form-element")
          if (formElements.length > 0) {
            gsap.fromTo(
              formElements,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: "power2.out", delay: 0.2 },
            )
          }
        }
      })
  }

  const handleBackClick = () => {
    if (!contactContentRef.current) return

    const tl = gsap.timeline()

    tl.to(contactContentRef.current, {
      x: 40,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    })
      .call(() => {
        setModalState("main")
      })
      .call(() => {
        if (mainContentRef.current) {
          gsap.fromTo(
            mainContentRef.current,
            { x: -40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          )

          const modalElements = document.querySelectorAll(".modal-element")
          if (modalElements.length > 0) {
            gsap.fromTo(
              modalElements,
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.2 },
            )
          }
        }
      })
  }

  const handleNewsletterSuccess = () => {
    const formElements = document.querySelectorAll(".form-element")
    if (formElements.length > 0) {
      gsap.to(formElements, {
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      })
    }
  }

  // Enhanced hover handlers with elegant scaling
  const handleItemHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.03,
      y: -2,
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
      {/* Enhanced Overlay with subtle gradient */}
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background: `
            radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)
          `,
        }}
        onClick={onClose}
      />

      {/* Modal Content - Premium black design */}
      <div
        ref={modalContentRef}
        className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(0,0,0,0.98) 0%, 
              rgba(20,20,20,0.98) 50%, 
              rgba(0,0,0,0.98) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `
            -20px 0 60px rgba(0,0,0,0.5),
            inset 1px 0 0 rgba(255,255,255,0.05)
          `,
        }}
      >
        {/* Main Content */}
        {modalState === "main" && (
          <div ref={mainContentRef} className="flex flex-col h-full p-8">
            {/* Header - Close Button */}
            <div className="modal-element flex justify-end mb-8">
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
                style={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
              </button>
            </div>

            {/* TXMX Logo with elegant presentation */}
            <div className="modal-element flex justify-center mb-8">
              <div
                className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.05) 0%, 
                      rgba(255,255,255,0.02) 100%
                    )
                  `,
                  boxShadow: `
                    0 8px 32px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 -1px 0 rgba(255,255,255,0.05)
                  `,
                }}
              >
                <img
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Logo"
                  className="h-14 w-auto object-contain filter brightness-110"
                  style={{
                    maxWidth: "160px",
                    height: "56px",
                    display: "block",
                    filter: "brightness(1.1) contrast(1.1)",
                  }}
                />
                <div className="logo-fallback hidden text-white font-bold text-2xl text-center">TXMX</div>
              </div>
            </div>

            {/* Title and Description with premium typography - Fixed text styling */}
            <div className="modal-element text-center space-y-4 mb-10">
              <h1 className="text-white text-2xl font-bold tracking-wide">
                <span className="text-white drop-shadow-lg">Levantamos Los Puños</span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed px-4 font-light">
                TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience.
              </p>
            </div>

            {/* Enhanced Link Tree Style Links */}
            <div className="flex-1 flex flex-col justify-center space-y-5 max-w-xs mx-auto w-full">
              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/txmxboxing/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-element group relative block"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div
                  className="relative p-5 rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.05) 0%, 
                        rgba(255,255,255,0.02) 100%
                      )
                    `,
                    boxShadow: `
                      0 4px 20px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.1)
                    `,
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-lg backdrop-blur-sm"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      <InstagramIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-white transition-colors duration-300">
                        Instagram
                      </div>
                      <div className="text-white/60 text-sm">@txmxboxing</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors duration-300" />
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
                <div
                  className="relative p-5 rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.05) 0%, 
                        rgba(255,255,255,0.02) 100%
                      )
                    `,
                    boxShadow: `
                      0 4px 20px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.1)
                    `,
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-lg backdrop-blur-sm"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      <ShopifyIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-white transition-colors duration-300">
                        Shop
                      </div>
                      <div className="text-white/60 text-sm">Official Store</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors duration-300" />
                  </div>
                </div>
              </a>

              {/* Contact Button */}
              <button
                onClick={handleContactClick}
                className="modal-element group relative block w-full text-left mb-4 md:mb-6"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div
                  className="relative p-5 rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.05) 0%, 
                        rgba(255,255,255,0.02) 100%
                      )
                    `,
                    boxShadow: `
                      0 4px 20px rgba(0,0,0,0.2),
                      inset 0 1px 0 rgba(255,255,255,0.1)
                    `,
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-lg backdrop-blur-sm"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      <MailIcon className="w-5 h-5 text-white/90" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-white transition-colors duration-300">
                        Contact Us
                      </div>
                      <div className="text-white/60 text-sm">Get in touch & stay updated</div>
                    </div>
                    <div className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-current rounded-full"></div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Contact Content */}
        {modalState === "contact" && (
          <div ref={contactContentRef} className="flex flex-col h-full p-8">
            {/* Header - Back Button */}
            <div className="flex justify-start mb-8">
              <button
                onClick={handleBackClick}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
                style={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300" />
              </button>
            </div>

            {/* TXMX Logo */}
            <div className="form-element flex justify-center mb-8">
              <div
                className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-sm"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.05) 0%, 
                      rgba(255,255,255,0.02) 100%
                    )
                  `,
                  boxShadow: `
                    0 8px 32px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 -1px 0 rgba(255,255,255,0.05)
                  `,
                }}
              >
                <img
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Logo"
                  className="h-14 w-auto object-contain filter brightness-110"
                  style={{
                    maxWidth: "160px",
                    height: "56px",
                    display: "block",
                    filter: "brightness(1.1) contrast(1.1)",
                  }}
                />
                <div className="logo-fallback hidden text-white font-bold text-2xl text-center">TXMX</div>
              </div>
            </div>

            {/* Title and Description - Fixed text styling */}
            <div className="form-element text-center space-y-4 mb-10">
              <h1 className="text-white text-2xl font-bold tracking-wide">
                <span className="text-white drop-shadow-lg">Levantamos Los Puños</span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed px-4 font-light">
                TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience.
                By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities
                for brands to authentically engage with a community that is deeply rooted in both sport and culture.
              </p>
            </div>

            {/* Newsletter Form */}
            <div className="flex-1 flex flex-col justify-center space-y-4 max-w-xs mx-auto w-full">
              <Newsletter onSuccess={handleNewsletterSuccess} className="form-element" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
