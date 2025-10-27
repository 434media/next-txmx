"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
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

interface TXMXNewsletterProps {
  showModal: boolean
  onClose: () => void
  mode?: "modal" | "inline" // New prop to control rendering mode
  context?: "hero" | "8count" // Optional context for customization
}

export default function TXMXNewsletter({ showModal, onClose, mode = "modal", context = "hero" }: TXMXNewsletterProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const [turnstileWidget, setTurnstileWidget] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Email validation regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Load Turnstile script only when needed
  useEffect(() => {
    if (isDevelopment || turnstileWidget) return
    if (mode === "modal" && !showModal) return // Only check showModal for modal mode

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
      // Clean up widget when component unmounts
      if (turnstileWidget && window.turnstile) {
        try {
          window.turnstile.reset(turnstileWidget)
        } catch (error) {
          console.error("Error resetting Turnstile widget:", error)
        }
      }
    }
  }, [turnstileWidget, showModal, mode])

  const validateEmail = (email: string): boolean => {
    return emailPattern.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset previous states
    setError(null)

    // Validate email
    if (!email.trim()) {
      setError("Enter your email to join the fight")
      inputRef.current?.focus()
      return
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address")
      inputRef.current?.focus()
      return
    }

    setIsSubmitting(true)

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

      const responseData = await response.json()

      if (response.ok) {
        setEmail("")
        setIsSuccess(true)
        // Reset form
        formRef.current?.reset()

        // Different behavior based on mode
        if (mode === "modal") {
          // Original modal behavior: auto-close after 3 seconds
          setTimeout(() => {
            setIsSuccess(false)
            onClose()
          }, 3000)
        } else {
          // Inline behavior: just reset success state after 5 seconds
          setTimeout(() => {
            setIsSuccess(false)
          }, 5000)
        }

        // Reset Turnstile if needed
        if (!isDevelopment && turnstileWidget && window.turnstile) {
          window.turnstile.reset(turnstileWidget)
        }
      } else {
        throw new Error(responseData.error || "Failed to join the fight")
      }
    } catch (error) {
      console.error("Error subscribing to TXMX newsletter:", error)
      setError(`${error instanceof Error ? error.message : "An unexpected error occurred"}. Try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Context-specific content
  const content = {
    hero: {
      image: "https://ampd-asset.s3.us-east-2.amazonaws.com/txmx/8C.png",
      imageAlt: "TXMX Boxing Fighter",
      headline: "Made from Blood, Sweat, and Tears",
      description: "Get exclusive drops, insider access, and be first in the ring for limited releases.",
      buttonText: "JOIN THE FIGHT",
      successHeadline: "SOMOS BOXEO",
      successMessage: "Exclusive drops and insider access.",
      emailId: "txmx-email",
      formLabel: "TXMX Newsletter subscription form",
    },
    "8count": {
      image: "https://ampd-asset.s3.us-east-2.amazonaws.com/txmx/8C.png",
      imageAlt: "TXMX Boxing - The 8 Count",
      headline: "Made from Blood, Sweat, and Tears",
      description: "Get exclusive fight analysis, training tips, and stories delivered straight to your corner.",
      buttonText: "JOIN THE 8 COUNT",
      successHeadline: "WELCOME TO THE 8 COUNT",
      successMessage: "You're in the ring with us now. Check your email for exclusive fight content.",
      emailId: "txmx-email",
      formLabel: "The 8 Count Newsletter subscription form",
    },
  }

  const ctx = content[context]

  // Don't render modal mode if showModal is false
  if (mode === "modal" && !showModal) return null

  // Shared content component
  const NewsletterContent = (
    <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
      {/* Left Side - Image */}
      <div className="lg:w-1/2 relative overflow-hidden min-h-[300px] lg:min-h-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 z-10" />
        <Image src={ctx.image || "/placeholder.svg"} alt={ctx.imageAlt} fill className="object-cover" priority />
      </div>

      {/* Right Side - Newsletter Form */}
      <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden group">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

        <div className="relative z-10">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/TXMXBack.svg"
                    alt="TXMX Boxing Logo"
                    width={160}
                    height={80}
                    className="filter brightness-0 invert group-hover:brightness-100 group-hover:invert transition-all duration-500"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "block"
                    }}
                  />
                  <div className="hidden text-4xl lg:text-5xl font-black text-white group-hover:text-black tracking-wider uppercase transition-colors duration-500">
                    TXMX BOXING
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-2xl lg:text-3xl font-black text-white group-hover:text-black tracking-wider uppercase transition-colors duration-500">
                {ctx.headline}
              </h2>
            </motion.div>

            {/* Value Proposition */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-lg text-white group-hover:text-black leading-relaxed font-bold tracking-wide transition-colors duration-500">
                {ctx.description}
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                ref={formRef}
                key="subscribe-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
                aria-label={ctx.formLabel}
              >
                <div className="relative">
                  <label htmlFor={ctx.emailId} className="sr-only">
                    Email address
                  </label>
                  <input
                    id={ctx.emailId}
                    ref={inputRef}
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full px-6 py-4 border-2 border-white bg-transparent text-white placeholder-white/70 focus:outline-none focus:border-white transition-all duration-500 text-lg font-bold tracking-wider uppercase group-hover:border-black group-hover:text-black group-hover:placeholder-black/70"
                    aria-describedby={error ? "newsletter-error" : undefined}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>

                <div className="relative overflow-hidden group/button">
                  <div className="absolute inset-0 bg-white transform -translate-x-full group-hover/button:translate-x-0 transition-transform duration-500 ease-out" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full bg-transparent border-2 border-white text-white py-4 px-8 font-black text-xl tracking-wider uppercase transition-colors duration-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98] transform group-hover:border-black group-hover:text-black group-hover/button:border-black group-hover/button:text-black"
                    aria-label={`Join ${context === "8count" ? "The 8 Count" : "TXMX"} newsletter`}
                  >
                    <motion.div
                      animate={isSubmitting ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                      transition={isSubmitting ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY } : {}}
                      className="flex items-center justify-center"
                    >
                      {isSubmitting ? "JOINING..." : ctx.buttonText}
                    </motion.div>
                  </button>
                </div>

                {!isDevelopment && (
                  <div
                    ref={turnstileRef}
                    data-theme="dark"
                    data-size="flexible"
                    className="w-full flex justify-center mt-6"
                    aria-label="Security verification"
                  />
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="newsletter-error"
                    className="text-red-400 text-sm text-center font-bold bg-red-900/20 border border-red-400 p-3 tracking-wide uppercase"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
                role="status"
                aria-live="polite"
              >
                <div className="mb-4">
                  <div className="w-16 h-16 bg-transparent border-2 border-white flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:border-black transition-all duration-500">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                    >
                      <CheckIcon className="h-8 w-8 text-white group-hover:text-black transition-colors duration-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-black mb-3 tracking-wider uppercase transition-colors duration-500">
                    {ctx.successHeadline}
                  </h3>
                  <p className="text-white group-hover:text-black text-base leading-relaxed font-bold tracking-wide transition-colors duration-500">
                    {ctx.successMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  // Render based on mode
  if (mode === "inline") {
    // Inline mode: Just the content card without overlay
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full bg-black border-2 border-white shadow-2xl overflow-hidden"
      >
        {NewsletterContent}
      </motion.div>
    )
  }

  // Modal mode: Original popup with overlay and backdrop
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-black border-2 border-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 px-4 py-2 md:py-3 bg-black border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Close newsletter signup"
          >
            <X className="h-4 w-4" />
          </button>
          {NewsletterContent}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
