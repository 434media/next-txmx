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

      {/* Modal Content - Bold Box Design */}
      <div
        ref={modalContentRef}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white border-l-4 border-black"
        style={{
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Main Content */}
        {modalState === "main" && (
          <div ref={mainContentRef} className="flex flex-col h-full p-8 text-black">
            {/* Header - Close Button */}
            <div className="modal-element flex justify-end mb-8">
              <button
                onClick={onClose}
                className="p-3 bg-black text-white hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* TXMX Logo with Bold Presentation */}
            <div className="modal-element text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                  alt="TXMX Boxing Logo"
                  width={140}
                  height={70}
                  className="filter invert"
                  priority
                />
              </div>
              <div className="h-1 w-20 bg-black mx-auto mb-4"></div>
              <p className="text-xl font-bold text-black italic">Levantamos Los Puños</p>
            </div>

            {/* Mission Statement */}
            <div className="modal-element text-center mb-8">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                Made with blood, sweat, and tears.
              </p>
            </div>

            {/* Bold Link Buttons */}
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
                <div className="relative p-5 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-black">
                      <InstagramIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-black font-bold text-sm tracking-wide">FOLLOW THE FIGHT</div>
                      <div className="text-gray-600 text-xs font-medium">@txmxboxing</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
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
                <div className="relative p-5 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-black">
                      <ShopifyIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-black font-bold text-sm tracking-wide">GEAR UP</div>
                      <div className="text-gray-600 text-xs font-medium">Official Store</div>
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
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
                <div className="relative p-5 bg-white border-2 border-black hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-black">
                      <MailIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-black font-bold text-sm tracking-wide">JOIN THE FIGHT</div>
                      <div className="text-gray-600 text-xs font-medium">
                        Exclusive drops, insider access, and more
                      </div>
                    </div>
                    <div className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors flex items-center justify-center">
                      <div className="w-2 h-2 bg-current"></div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer Message */}
            <div className="modal-element text-center mt-8 pt-6 border-t-2 border-black">
              <p className="text-xs text-gray-600 font-medium tracking-wide">TXMX • BOXING</p>
            </div>
          </div>
        )}

        {/* Contact Content */}
        {modalState === "contact" && (
          <div ref={contactContentRef} className="flex flex-col h-full p-8 text-black">
            {/* Header - Back Button */}
            <div className="flex justify-start mb-8">
              <button
                onClick={handleBackClick}
                className="p-3 bg-black text-white hover:bg-gray-800 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Newsletter Form - Centered */}
            <div className="flex-1 flex flex-col justify-center space-y-4 max-w-xs mx-auto w-full">
              <Newsletter onSuccess={handleNewsletterSuccess} className="form-element" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
