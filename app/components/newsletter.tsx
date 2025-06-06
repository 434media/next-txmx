"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"

// Extend the Window interface to include the turnstile property
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "refresh-expired"?: "auto" | "manual"
        },
      ) => string
      getResponse: (widgetId: string) => string | null
      reset: (widgetId: string) => void
    }
  }
}

const isDevelopment = process.env.NODE_ENV === "development"

interface NewsletterFormProps {
  onSuccess?: () => void
  className?: string
}

export function Newsletter({ onSuccess, className = "" }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const [turnstileWidget, setTurnstileWidget] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)

  // Email validation regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Enhanced entrance animation
  useEffect(() => {
    if (containerRef.current && logoRef.current && titleRef.current) {
      const tl = gsap.timeline()

      // Set initial states
      gsap.set([containerRef.current, logoRef.current, titleRef.current], {
        opacity: 0,
        y: 30,
        scale: 0.95,
      })

      // Animate entrance with stagger
      tl.to(containerRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.4)",
      })
        .to(
          logoRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.4",
        )
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.5)",
          },
          "-=0.3",
        )

      // Add floating animation to logo
      gsap.to(logoRef.current, {
        y: -3,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      })
    }
  }, [])

  // Load Turnstile script only when needed
  useEffect(() => {
    if (isDevelopment || turnstileWidget) return

    const loadTurnstile = () => {
      if (document.getElementById("turnstile-script")) return

      const script = document.createElement("script")
      script.id = "turnstile-script"
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
      script.async = true
      script.defer = true
      document.body.appendChild(script)

      script.onload = () => {
        if (window.turnstile && turnstileRef.current) {
          const widgetId = window.turnstile.render(turnstileRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
            callback: () => {
              // Token received, no action needed here
            },
            "refresh-expired": "auto",
          })
          setTurnstileWidget(widgetId)
        }
      }
    }

    loadTurnstile()

    return () => {
      if (turnstileWidget && window.turnstile) {
        try {
          window.turnstile.reset(turnstileWidget)
        } catch (error) {
          console.error("Error resetting Turnstile widget:", error)
        }
      }
    }
  }, [turnstileWidget])

  const validateEmail = (email: string): boolean => {
    return emailPattern.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)

    if (!email.trim()) {
      setError("Enter your email to join the fight")
      inputRef.current?.focus()

      // Error shake animation
      if (inputRef.current) {
        gsap.to(inputRef.current, {
          keyframes: { x: [-10, 10, -8, 8, -6, 6, -4, 4, 0] },
          duration: 0.6,
          ease: "power2.out",
        })
      }
      return
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address")
      inputRef.current?.focus()

      // Error shake animation
      if (inputRef.current) {
        gsap.to(inputRef.current, {
          keyframes: { x: [-10, 10, -8, 8, -6, 6, -4, 4, 0] },
          duration: 0.6,
          ease: "power2.out",
        })
      }
      return
    }

    setIsSubmitting(true)

    // Enhanced button animation during submission
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      })
    }

    try {
      let turnstileResponse = undefined

      if (!isDevelopment) {
        if (!window.turnstile || !turnstileWidget) {
          throw new Error("Security verification not loaded. Please refresh and try again.")
        }

        turnstileResponse = window.turnstile.getResponse(turnstileWidget)
        if (!turnstileResponse) {
          throw new Error("Please complete the security verification")
        }
      }

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(turnstileResponse && { "cf-turnstile-response": turnstileResponse }),
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to join the fight"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      await response.json()

      setEmail("")
      setIsSuccess(true)
      formRef.current?.reset()
      onSuccess?.()

      // Enhanced success animation
      if (successRef.current) {
        gsap.fromTo(
          successRef.current,
          { scale: 0.8, opacity: 0, rotationY: -90 },
          { scale: 1, opacity: 1, rotationY: 0, duration: 0.8, ease: "back.out(1.7)" },
        )
      }

      setTimeout(() => setIsSuccess(false), 6000)

      if (!isDevelopment && turnstileWidget && window.turnstile) {
        window.turnstile.reset(turnstileWidget)
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Network error. Check your connection and try again.")
      } else if (error instanceof SyntaxError) {
        setError("Server error. Please try again later.")
      } else {
        setError(`${error instanceof Error ? error.message : "An unexpected error occurred"}. Try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhanced input focus animations
  const handleInputFocus = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const handleInputBlur = () => {
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  // Enhanced button hover animations
  const handleButtonHover = () => {
    if (buttonRef.current && !isSubmitting) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
    }
  }

  const handleButtonLeave = () => {
    if (buttonRef.current && !isSubmitting) {
      gsap.to(buttonRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
    }
  }

  if (isSuccess) {
    return (
      <div className={`${className}`}>
        <div ref={successRef} className="relative p-8 border-4 border-white bg-white text-black">
          {/* Header with Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={120}
                height={60}
                className="filter invert"
                priority
              />
            </div>
            <div className="h-1 w-16 bg-black mx-auto mb-4"></div>
            <p className="text-lg font-bold text-black italic">Levantamos Los Puños</p>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2 tracking-wide">WELCOME TO THE FIGHT!</h3>
              <p className="text-gray-700 text-sm font-medium">
                You're now part of the TXMX family. Get ready for exclusive drops and insider access to the ring.
              </p>
            </div>
          </div>

          {/* Success Footer */}
          <div className="text-center mt-6 pt-4 border-t-2 border-black">
            <p className="text-xs text-gray-600 font-bold tracking-widest">SOMOS BOXEO</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div ref={containerRef} className="relative p-8 border-4 border-white bg-white text-black">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              ref={logoRef}
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Boxing Logo"
              width={120}
              height={60}
              className="filter invert"
              priority
            />
          </div>
          <div className="h-1 w-16 bg-black mx-auto mb-4"></div>
          <p ref={titleRef} className="text-lg font-bold text-black italic">
            Levantamos Los Puños
          </p>
        </div>

        {/* Enhanced Value Proposition */}
        <div className="text-center mb-6">
          <h3 className="text-sm font-bold text-black mb-2 tracking-wide">JOIN THE FIGHT</h3>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            Get exclusive drops, insider access, and be first in the ring for limited releases.
          </p>
        </div>

        {/* Enhanced Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="TXMX Newsletter subscription form"
        >
          <div className="relative">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              ref={inputRef}
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your email to join the fight"
              className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all duration-300 font-medium"
              aria-describedby={error ? "newsletter-error" : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            className="w-full bg-black text-white py-3 px-6 font-bold text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Join TXMX newsletter"
          >
            <div className="flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  JOINING THE FIGHT...
                </>
              ) : (
                "STEP INTO THE RING"
              )}
            </div>
          </button>

          {!isDevelopment && (
            <div
              ref={turnstileRef}
              data-theme="light"
              data-size="flexible"
              className="w-full flex justify-center"
              aria-label="Security verification"
            />
          )}

          {error && (
            <div
              id="newsletter-error"
              className="text-red-600 text-sm text-center font-bold tracking-wide"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>

        {/* Enhanced Footer */}
        <div className="text-center mt-6 pt-4 border-t-2 border-black">
          <p className="text-xs text-gray-600 font-bold tracking-widest">TXMX • BOXING</p>
        </div>
      </div>
    </div>
  )
}

// Enhanced check icon with animation potential
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
