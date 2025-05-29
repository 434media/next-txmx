"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

  // Email validation regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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
      setError("Please enter your email address")
      inputRef.current?.focus()
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
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

      if (!response.ok) {
        let errorMessage = "Newsletter subscription failed"
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

      setTimeout(() => setIsSuccess(false), 5000)

      if (!isDevelopment && turnstileWidget && window.turnstile) {
        window.turnstile.reset(turnstileWidget)
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.")
      } else if (error instanceof SyntaxError) {
        setError("Server error. Please try again later.")
      } else {
        setError(`${error instanceof Error ? error.message : "An unexpected error occurred"}. Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`${className}`}>
        <div
          className="relative p-5 rounded-xl border border-white/20 backdrop-blur-sm"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(255,255,255,0.08) 0%, 
                rgba(255,255,255,0.04) 100%
              )
            `,
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.15),
              0 0 0 1px rgba(255,255,255,0.1)
            `,
          }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div
              className="p-3 rounded-lg backdrop-blur-sm"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              <MailIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">¡Gracias!</div>
              <div className="text-white/60 text-sm">Successfully subscribed</div>
            </div>
          </div>
          <div className="text-white/80 text-sm text-center" role="status" aria-live="polite">
            Thanks for subscribing! We&apos;ll be in touch soon.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div
        className="relative p-5 rounded-xl border border-white/10 backdrop-blur-sm"
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
        <div className="flex items-center space-x-4 mb-5">
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
            <div className="text-white font-semibold">Stay Connected</div>
            <div className="text-white/60 text-sm">Join our community</div>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" aria-label="Newsletter subscription form">
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
              placeholder="Enter your email address"
              className="w-full pr-16 pl-4 py-3 text-white placeholder:text-white/50 focus:outline-none rounded-lg transition-all duration-300 text-sm backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(255,255,255,0.12)"
                e.target.style.borderColor = "rgba(255,255,255,0.25)"
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(255,255,255,0.08)"
                e.target.style.borderColor = "rgba(255,255,255,0.15)"
              }}
              aria-describedby={error ? "newsletter-error" : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 backdrop-blur-sm"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
              aria-label="Subscribe to newsletter"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ArrowIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {!isDevelopment && (
            <div ref={turnstileRef} data-size="flexible" className="w-full" aria-label="Security verification" />
          )}

          {error && (
            <div id="newsletter-error" className="text-red-400 text-sm px-2" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// Custom arrow icon
const ArrowIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
