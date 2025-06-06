"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { MailIcon } from "./icons/mail-icon"

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
  compact?: boolean
  mobile?: boolean
  slideoutModal?: boolean
}

export function Newsletter({
  onSuccess,
  className = "",
  compact = false,
  mobile = false,
  slideoutModal = false,
}: NewsletterFormProps) {
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

  // Email validation regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Enhanced entrance animation
  useEffect(() => {
    if (containerRef.current && logoRef.current) {
      const tl = gsap.timeline()

      // Set initial states
      gsap.set([containerRef.current, logoRef.current], {
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
      }).to(
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

      // Add floating animation to logo (reduced on mobile)
      gsap.to(logoRef.current, {
        y: mobile ? -2 : -3,
        duration: mobile ? 3 : 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      })
    }
  }, [mobile])

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

      // Error shake animation (reduced on mobile)
      if (inputRef.current) {
        const tl = gsap.timeline()
        const shakeAmount = mobile ? 6 : 10
        const duration = mobile ? 0.06 : 0.08

        tl.to(inputRef.current, { x: -shakeAmount, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount, duration, ease: "power2.out" })
          .to(inputRef.current, { x: -shakeAmount * 0.8, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount * 0.8, duration, ease: "power2.out" })
          .to(inputRef.current, { x: -shakeAmount * 0.6, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount * 0.6, duration, ease: "power2.out" })
          .to(inputRef.current, { x: 0, duration, ease: "power2.out" })
      }
      return
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address")
      inputRef.current?.focus()

      // Error shake animation (reduced on mobile)
      if (inputRef.current) {
        const tl = gsap.timeline()
        const shakeAmount = mobile ? 6 : 10
        const duration = mobile ? 0.06 : 0.08

        tl.to(inputRef.current, { x: -shakeAmount, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount, duration, ease: "power2.out" })
          .to(inputRef.current, { x: -shakeAmount * 0.8, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount * 0.8, duration, ease: "power2.out" })
          .to(inputRef.current, { x: -shakeAmount * 0.6, duration, ease: "power2.out" })
          .to(inputRef.current, { x: shakeAmount * 0.6, duration, ease: "power2.out" })
          .to(inputRef.current, { x: 0, duration, ease: "power2.out" })
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

  // Enhanced input focus animations (reduced on mobile)
  const handleInputFocus = () => {
    if (inputRef.current && !mobile) {
      gsap.to(inputRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  const handleInputBlur = () => {
    if (inputRef.current && !mobile) {
      gsap.to(inputRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })
    }
  }

  // Enhanced button hover animations (disabled on mobile)
  const handleButtonHover = () => {
    if (buttonRef.current && !isSubmitting && !mobile) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
    }
  }

  const handleButtonLeave = () => {
    if (buttonRef.current && !isSubmitting && !mobile) {
      gsap.to(buttonRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
    }
  }

  // Mobile-specific sizing
  const logoSize = mobile
    ? { width: 80, height: 40 }
    : compact
      ? { width: 100, height: 50 }
      : { width: 120, height: 60 }
  const padding = mobile ? "p-4 py-3" : compact ? "p-6 py-4" : "p-8"

  if (slideoutModal && isSuccess) {
    return (
      <div className={`${className}`}>
        <div ref={successRef} className="space-y-6">
          {/* Success Header - Matching Modal Style */}
          <div className="text-center">
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
            <p className="text-lg font-bold text-black italic">Welcome to the fight!</p>
          </div>

          {/* Success Message - Matching Modal Button Style */}
          <div className="relative p-6 bg-black text-white border-2 border-black">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white">
                <CheckIcon className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-base tracking-wide mb-2">SUCCESS!</div>
                <div className="text-gray-300 text-sm font-medium">
                  You're now part of the TXMX family. Get ready for exclusive drops and insider access.
                </div>
              </div>
            </div>
          </div>

          {/* Success Footer - Matching Modal Style */}
          <div className="text-center pt-6 border-t-2 border-black">
            <p className="text-sm text-gray-600 font-medium tracking-wide">SOMOS BOXEO</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={`${className}`}>
        <div ref={successRef} className={`relative ${padding} border-4 border-white bg-white text-black`}>
          {/* Header with Logo - No Spacer */}
          <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
            <div className={`flex justify-center ${mobile ? "mb-3" : "mb-4"}`}>
              <Image
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={logoSize.width}
                height={logoSize.height}
                className="filter invert"
                priority
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <div className={mobile ? "mb-2" : "mb-3"}>
              <div
                className={`${mobile ? "w-10 h-10" : "w-12 h-12"} bg-black flex items-center justify-center mx-auto ${mobile ? "mb-2" : "mb-3"}`}
              >
                <CheckIcon className={`${mobile ? "h-5 w-5" : "h-6 w-6"} text-white`} />
              </div>
              <h3 className={`${mobile ? "text-base" : "text-lg"} font-bold text-black mb-2 tracking-wide`}>
                WELCOME TO THE FIGHT!
              </h3>
              <p className={`text-gray-700 ${mobile ? "text-xs" : "text-xs"} font-medium`}>
                You're now part of the TXMX family. Get ready for exclusive drops and insider access to the ring.
              </p>
            </div>
          </div>

          {/* Success Footer */}
          <div className={`text-center ${mobile ? "mt-3 pt-2" : "mt-4 pt-3"} border-t-2 border-black`}>
            <p className={`${mobile ? "text-xs" : "text-xs"} text-gray-600 font-bold tracking-widest`}>SOMOS BOXEO</p>
          </div>
        </div>
      </div>
    )
  }

  if (slideoutModal && !isSuccess) {
    return (
      <div className={`${className}`}>
        <div ref={containerRef} className="space-y-6">
          {/* Header Section - Matching Modal Style */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                ref={logoRef}
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={140}
                height={70}
                className="filter invert"
                priority
              />
            </div>
            <p className="text-lg font-bold text-black italic">Join the fight</p>
          </div>

          {/* Form Section - Matching Modal Button Style */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="TXMX Newsletter subscription form"
          >
            {/* Email Input - Styled like Modal Button */}
            <div className="relative p-6 bg-white border-2 border-black">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-black">
                  <MailIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label htmlFor="slideout-email" className="block text-black font-bold text-base tracking-wide mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="slideout-email"
                    ref={inputRef}
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Enter your email"
                    className="w-full px-0 py-1 border-0 border-b-2 border-gray-300 bg-transparent text-black placeholder-gray-500 focus:outline-none focus:border-black transition-all duration-300 font-medium text-sm"
                    aria-describedby={error ? "slideout-error" : undefined}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button - Matching Modal Button Style */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={isSubmitting}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="w-full relative p-6 bg-black text-white border-2 border-black hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Submit newsletter subscription"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white">
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRightIcon className="w-6 h-6 text-black" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold text-base tracking-wide">
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                  </div>
                  <div className="text-gray-300 text-sm font-medium">
                    {isSubmitting ? "Processing your request" : "Join the TXMX family"}
                  </div>
                </div>
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
                id="slideout-error"
                className="text-red-600 text-sm text-center font-bold tracking-wide p-4 bg-red-50 border-2 border-red-200"
                role="alert"
              >
                {error}
              </div>
            )}
          </form>

          {/* Footer - Matching Modal Style */}
          <div className="text-center pt-6 border-t-2 border-black">
            <p className="text-sm text-gray-600 font-medium tracking-wide">TXMX • BOXING</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div ref={containerRef} className={`relative ${padding} border-4 border-white bg-white text-black`}>
        {/* Header with Logo - No Spacer or Tagline */}
        <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
          <div className={`flex justify-center ${mobile ? "mb-3" : "mb-4"}`}>
            <Image
              ref={logoRef}
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
              alt="TXMX Boxing Logo"
              width={logoSize.width}
              height={logoSize.height}
              className="filter invert"
              priority
            />
          </div>
        </div>

        {/* Enhanced Value Proposition */}
        <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
          <h3 className={`${mobile ? "text-xs" : "text-sm"} font-bold text-black mb-2 tracking-wide`}>
            JOIN THE FIGHT
          </h3>
          <p className={`${mobile ? "text-xs" : "text-xs"} text-gray-700 leading-relaxed font-medium`}>
            Get exclusive drops, insider access, and be first in the ring for limited releases.
          </p>
        </div>

        {/* Enhanced Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`space-y-${mobile ? "2" : "3"}`}
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
              className={`w-full ${mobile ? "px-2 py-2" : "px-3 py-2"} border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all duration-300 font-medium ${mobile ? "text-sm" : "text-sm"}`}
              style={{ fontSize: mobile ? "16px" : "14px" }} // Prevent iOS zoom
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
            className={`w-full bg-black text-white ${mobile ? "py-2 px-3" : "py-2 px-4"} font-bold ${mobile ? "text-xs" : "text-sm"} tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center`}
            style={{ minHeight: mobile ? "44px" : "auto" }} // iOS touch target
            aria-label="Join TXMX newsletter"
          >
            <div className="flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <div
                    className={`${mobile ? "w-3 h-3" : "w-4 h-4"} border-2 border-white/30 border-t-white rounded-full animate-spin mr-2`}
                  ></div>
                  {mobile ? "SENDING..." : "SUBMITTING..."}
                </>
              ) : (
                <>
                  <span className="mr-1">SUBMIT</span>
                  <ArrowRightIcon className={`${mobile ? "h-3 w-3" : "h-4 w-4"}`} />
                </>
              )}
            </div>
          </button>

          {!isDevelopment && !mobile && (
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
              className={`text-red-600 ${mobile ? "text-xs" : "text-xs"} text-center font-bold tracking-wide`}
              role="alert"
            >
              {error}
            </div>
          )}
        </form>

        {/* Enhanced Footer */}
        <div className={`text-center ${mobile ? "mt-3 pt-2" : "mt-4 pt-3"} border-t-2 border-black`}>
          <p className={`${mobile ? "text-xs" : "text-xs"} text-gray-600 font-bold tracking-widest`}>
            TXMX • BOXING
          </p>
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

// Arrow right icon for submit button
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)
