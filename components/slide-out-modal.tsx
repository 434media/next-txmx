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
import Image from "next/image"

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

  const handleContactClick = () => {
    if (!mainContentRef.current) return

    const tl = gsap.timeline()

    tl.to(".modal-element", {
      x: -50,
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.in",
    })
      .call(() => setModalState("contact"))
      .call(() => {
        if (contactContentRef.current) {
          gsap.fromTo(
            contactContentRef.current,
            { x: 50, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.3)" },
          )

          const formElements = document.querySelectorAll(".form-element")
          if (formElements.length > 0) {
            gsap.fromTo(
              formElements,
              { y: 30, opacity: 0, scale: 0.9 },
              { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.4)", delay: 0.2 },
            )
          }
        }
      })
  }

  const handleBackClick = () => {
    if (!contactContentRef.current) return

    const tl = gsap.timeline()

    tl.to(".form-element", {
      x: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.in",
    })
      .call(() => {
        setModalState("main")
      })
      .call(() => {
        if (mainContentRef.current) {
          gsap.fromTo(
            mainContentRef.current,
            { x: -50, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.3)" },
          )

          const modalElements = document.querySelectorAll(".modal-element")
          if (modalElements.length > 0) {
            gsap.fromTo(
              modalElements,
              { y: 20, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.4)", delay: 0.2 },
            )
          }
        }
      })
  }

  const handleNewsletterSuccess = () => {
    const formElements = document.querySelectorAll(".form-element")
    if (formElements.length > 0) {
      gsap.to(formElements, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "back.out(1.7)",
      })
    }
  }

  // Enhanced hover handlers with spring animations
  const handleItemHover = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      y: -4,
      duration: 0.4,
      ease: "back.out(1.7)",
    })
  }

  const handleItemLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "back.out(1.7)",
    })
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 hidden">
      {/* Enhanced Overlay */}
      <div ref={overlayRef} className="absolute inset-0 backdrop-blur-md bg-black/80" onClick={onClose} />

      {/* Modal Content - Black Background Design */}
      <div
        ref={modalContentRef}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-black border-l-4 border-white"
        style={{
          boxShadow: "-20px 0 60px rgba(255,255,255,0.1)",
        }}
      >
        {/* Main Content */}
        {modalState === "main" && (
          <div ref={mainContentRef} className="flex flex-col h-full p-8 text-white">
            {/* Header - Close Button */}
            <div className="modal-element flex justify-end mb-8">
              <button
                onClick={onClose}
                className="p-3 bg-white text-black hover:bg-gray-200 transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* TXMX Logo with Streamlined Presentation */}
            <div className="modal-element text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Boxing Logo"
                  width={140}
                  height={70}
                  className="brightness-0 invert"
                  priority
                />
              </div>
              <p className="text-lg font-bold text-white">Made from blood, sweat, and tears</p>
            </div>

            {/* Typography-Focused Link Buttons */}
            <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xs mx-auto w-full">
              {/* Rise of a Champion Link */}
              <a
                href="/riseofachampion"
                className="modal-element group relative block"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div className="relative p-6 bg-black border-2 border-white hover:bg-white hover:border-white transition-colors">
                  <div className="text-center">
                    <div className="text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-1">RISE OF A CHAMPION</div>
                    <div className="text-gray-400 group-hover:text-gray-800 text-sm font-medium tracking-wide transition-colors">Relive the Moments</div>
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
                <div className="relative p-6 bg-black border-2 border-white hover:bg-white hover:border-white transition-colors">
                  <div className="text-center">
                    <div className="text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-1">FOLLOW US</div>
                    <div className="text-gray-400 group-hover:text-gray-800 text-sm font-medium tracking-wide transition-colors">@txmxboxing</div>
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
                <div className="relative p-6 bg-black border-2 border-white hover:bg-white hover:border-white transition-colors">
                  <div className="text-center">
                    <div className="text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-1">SHOP TXMX BOXING</div>
                    <div className="text-gray-400 group-hover:text-gray-800 text-sm font-medium tracking-wide transition-colors">Founders Tee Now Available</div>
                  </div>
                </div>
              </a>

              {/* Contact Button */}
              <button
                onClick={handleContactClick}
                className="modal-element group relative block w-full text-left"
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div className="relative p-6 bg-black border-2 border-white hover:bg-white hover:border-white transition-colors">
                  <div className="text-center">
                    <div className="text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-1">JOIN THE 8 COUNT</div>
                    <div className="text-gray-400 group-hover:text-gray-800 text-sm font-medium tracking-wide transition-colors">A FEED FOR FIGHT FANS</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer Message */}
            <div className="modal-element text-center mt-8 pt-6 border-t-2 border-white">
              <p className="text-sm text-gray-400 font-medium tracking-wide">TXMX • BOXING</p>
            </div>
          </div>
        )}

        {/* Contact Content */}
        {modalState === "contact" && (
          <div ref={contactContentRef} className="flex flex-col h-full p-8 text-white">
            {/* Header - Back Button */}
            <div className="flex justify-start mb-8">
              <button
                onClick={handleBackClick}
                className="p-3 bg-white text-black hover:bg-gray-200 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Newsletter Form - Centered */}
            <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xs mx-auto w-full">
              <Newsletter onSuccess={handleNewsletterSuccess} className="form-element" slideoutModal={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
