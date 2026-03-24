"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"

interface NewsletterProps {
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
}: NewsletterProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  const validateEmail = (email: string): boolean => {
    return emailPattern.test(email)
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Enter your email to join the 8 Count")
      inputRef.current?.focus()
      triggerShake()
      return
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address")
      inputRef.current?.focus()
      triggerShake()
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to join the 8 Count"
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
      setTimeout(() => setIsSuccess(false), 6000)
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

  const logoSize = mobile
    ? { width: 80, height: 40 }
    : compact
      ? { width: 100, height: 50 }
      : { width: 120, height: 60 }
  const padding = mobile ? "p-4 py-3" : compact ? "p-6 py-4" : "p-8"

  if (slideoutModal && isSuccess) {
    return (
      <div className={className}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={140}
                height={70}
                className="brightness-0 invert"
                priority
              />
            </div>
            <p className="text-lg font-bold text-white">Welcome to the fight!</p>
          </div>
          <div className="relative p-6 bg-black text-white border-2 border-white">
            <div className="text-center">
              <div className="text-white font-bold text-xl tracking-wider mb-3">SUCCESS!</div>
              <div className="text-gray-300 text-sm font-medium leading-relaxed">
                You're now part of the TXMX family. Get ready for exclusive drops and insider access.
              </div>
            </div>
          </div>
          <div className="text-center pt-6 border-t-2 border-white">
            <p className="text-sm text-gray-400 font-medium tracking-wide">SOMOS BOXEO</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={className}>
        <div className={`relative ${padding} border-4 border-white bg-white text-black`}>
          <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
            <div className={`flex justify-center ${mobile ? "mb-3" : "mb-4"}`}>
              <Image
                src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={logoSize.width}
                height={logoSize.height}
                className="filter invert"
                priority
              />
            </div>
          </div>
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
              <p className={`text-gray-700 text-xs font-medium`}>
                Get ready for exclusive drops and insider access to the ring.
              </p>
            </div>
          </div>
          <div className={`text-center ${mobile ? "mt-3 pt-2" : "mt-4 pt-3"} border-t-2 border-black`}>
            <p className="text-xs text-gray-600 font-bold tracking-widest">SOMOS BOXEO</p>
          </div>
        </div>
      </div>
    )
  }

  if (slideoutModal && !isSuccess) {
    return (
      <div className={className}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={140}
                height={70}
                className="brightness-0 invert"
                priority
              />
            </div>
            <p className="text-lg font-bold text-white">Join the 8 Count</p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-label="TXMX Newsletter subscription form"
          >
            <div className="relative p-6 bg-black border-2 border-white hover:bg-white hover:border-white transition-colors group">
              <div className="text-center">
                <label htmlFor="slideout-email" className="block text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-3">
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
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2 border-2 border-white/30 bg-transparent text-white group-hover:text-black group-hover:border-black/30 placeholder-gray-400 group-hover:placeholder-gray-600 focus:outline-none focus:border-white group-hover:focus:border-black transition-all duration-300 font-medium text-sm text-center ${shake ? "animate-shake" : ""}`}
                  aria-describedby={error ? "slideout-error" : undefined}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative p-6 bg-black text-white border-2 border-white hover:bg-white hover:border-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black group"
              aria-label="Submit newsletter subscription"
            >
              <div className="text-center">
                <div className="text-white group-hover:text-black font-bold text-xl tracking-wider transition-colors mb-1">
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                </div>
                <div className="text-gray-400 group-hover:text-gray-800 text-sm font-medium tracking-wide transition-colors">
                  {isSubmitting ? "Processing your request" : "Join the TXMX family"}
                </div>
              </div>
            </button>

            {error && (
              <div
                id="slideout-error"
                className="text-red-400 text-sm text-center font-bold tracking-wide p-4 bg-red-900/20 border-2 border-red-400"
                role="alert"
              >
                {error}
              </div>
            )}
          </form>

          <div className="text-center pt-6 border-t-2 border-white">
            <p className="text-sm text-gray-400 font-medium tracking-wide">TXMX • BOXING</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={`relative ${padding} border-4 border-white bg-white text-black`}>
        <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
          <div className={`flex justify-center ${mobile ? "mb-3" : "mb-4"}`}>
            <Image
              src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
              alt="TXMX Boxing Logo"
              width={logoSize.width}
              height={logoSize.height}
              className="filter invert"
              priority
            />
          </div>
        </div>

        <div className={`text-center ${mobile ? "mb-3" : "mb-4"}`}>
          <h3 className={`${mobile ? "text-xs" : "text-sm"} font-bold text-black mb-2 tracking-wide`}>
            JOIN THE 8 COUNT
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            Get exclusive drops, insider access, and be first in the ring for limited releases.
          </p>
        </div>

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
              placeholder="Enter your email to join the 8 Count"
              className={`w-full ${mobile ? "px-2 py-2" : "px-3 py-2"} border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all duration-300 font-medium text-sm ${shake ? "animate-shake" : ""}`}
              style={{ fontSize: mobile ? "16px" : "14px" }}
              aria-describedby={error ? "newsletter-error" : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-black text-white ${mobile ? "py-2 px-3" : "py-2 px-4"} font-bold ${mobile ? "text-xs" : "text-sm"} tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center`}
            style={{ minHeight: mobile ? "44px" : "auto" }}
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

          {error && (
            <div
              id="newsletter-error"
              className="text-red-600 text-xs text-center font-bold tracking-wide"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>

        <div className={`text-center ${mobile ? "mt-3 pt-2" : "mt-4 pt-3"} border-t-2 border-black`}>
          <p className="text-xs text-gray-600 font-bold tracking-widest">TXMX BOXING</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-6px); }
          30%, 70% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

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
