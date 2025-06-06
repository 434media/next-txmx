"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { MenuIcon } from "lucide-react"

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const buttonTextRef = useRef<HTMLSpanElement>(null)
  const buttonIconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Navbar entrance animation
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.8,
      },
    )

    // Button entrance animation
    const buttonElements = [buttonTextRef.current, buttonIconRef.current]
    gsap.fromTo(
      buttonElements,
      { opacity: 0, y: -10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        delay: 1.2,
      },
    )
  }, [])

  // Enhanced button hover animation
  const handleButtonHover = () => {
    gsap.to(menuButtonRef.current, {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      duration: 0.3,
      ease: "power2.out",
    })

    gsap.to(buttonTextRef.current, {
      x: 5,
      duration: 0.4,
      ease: "power2.out",
    })

    gsap.to(buttonIconRef.current, {
      scale: 1.1,
      duration: 0.4,
      ease: "back.out(1.7)",
    })
  }

  const handleButtonLeave = () => {
    gsap.to(menuButtonRef.current, {
      backgroundColor: "rgba(0, 0, 0, 0)",
      duration: 0.3,
      ease: "power2.out",
    })

    gsap.to(buttonTextRef.current, {
      x: 0,
      duration: 0.4,
      ease: "power2.out",
    })

    gsap.to(buttonIconRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
    })
  }

  // Enhanced click animation
  const handleButtonClick = () => {
    // Quick feedback animation before opening modal
    const tl = gsap.timeline()

    tl.to(menuButtonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
    }).to(menuButtonRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "back.out(1.7)",
      onComplete: onMenuClick,
    })

    // Text and icon animation
    gsap.to(buttonTextRef.current, {
      x: 10,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      yoyo: true,
      repeat: 1,
    })

    gsap.to(buttonIconRef.current, {
      rotate: 90,
      duration: 0.2,
      ease: "power2.in",
      yoyo: true,
      repeat: 1,
    })
  }

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-40 bg-black/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hidden Logo for SEO */}
          <div className="sr-only">
            <Image
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Logo"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Clean Box-Style Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            className="group flex items-center border-2 border-white bg-transparent hover:bg-white/5 transition-colors duration-300"
            aria-label="Open menu"
          >
            {/* Button Content */}
            <div className="flex items-center px-4 py-2">
              {/* Button Text */}
              <span
                ref={buttonTextRef}
                className="text-white text-sm font-bold tracking-widest mr-3 transition-transform duration-300"
              >
                MENU
              </span>

              {/* Button Icon */}
              <div ref={buttonIconRef} className="relative transition-transform duration-300">
                <MenuIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced CSS for animations */}
      <style jsx>{`
        /* Button hover effects */
        button:hover {
          transform: translateY(-1px);
        }
        
        /* Smooth transitions for all elements */
        * {
          transition-property: transform, opacity, background-color, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </nav>
  )
}
