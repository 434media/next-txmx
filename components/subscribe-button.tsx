"use client"

import { useAuth } from "../lib/auth-context"
import { useState } from "react"

interface SubscribeButtonProps {
  onAuthClick: () => void
}

export default function SubscribeButton({ onAuthClick }: SubscribeButtonProps) {
  const { user, profile, loading } = useAuth()
  const [subscribing, setSubscribing] = useState(false)

  if (loading) return null

  // Not signed in
  if (!user) {
    return (
      <button
        onClick={onAuthClick}
        className="bg-amber-500 text-black font-semibold text-sm tracking-wide px-8 py-3 rounded-lg hover:bg-amber-400 transition-colors"
      >
        Sign Up to Get Started
      </button>
    )
  }

  // Already subscribed
  if (profile?.subscriptionStatus === "active") {
    return (
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <p className="text-amber-500 text-sm font-semibold tracking-wider uppercase">
          Black Card Active
        </p>
      </div>
    )
  }

  // Signed in but not subscribed
  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Subscribe error:", error)
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={subscribing}
      className="bg-amber-500 text-black font-semibold text-sm tracking-wide px-8 py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {subscribing ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
          Loading...
        </span>
      ) : (
        "Get the Black Card — $14.99/mo"
      )}
    </button>
  )
}
