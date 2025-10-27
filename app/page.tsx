"use client"

import { useState, useEffect } from "react"
import HeroSection from "../components/hero-section"
import TXMXNewsletter from "../components/txmx-newsletter"

const NEWSLETTER_SESSION_KEY = "txmx_newsletter_shown"

export default function TXMXLanding() {
  const [showTXMXNewsletter, setShowTXMXNewsletter] = useState(false)

  // Show newsletter after 4 seconds, but only once per session
  useEffect(() => {
    // Check if newsletter was already shown in this session
    const wasShown = sessionStorage.getItem(NEWSLETTER_SESSION_KEY)

    if (!wasShown) {
      const timer = setTimeout(() => {
        setShowTXMXNewsletter(true)
        // Mark as shown in session storage
        sessionStorage.setItem(NEWSLETTER_SESSION_KEY, "true")
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleTXMXNewsletterClose = () => {
    setShowTXMXNewsletter(false)
  }

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <HeroSection />

      {/* TXMX Newsletter Modal - Only shows once per session */}
      <TXMXNewsletter showModal={showTXMXNewsletter} onClose={handleTXMXNewsletterClose} mode="modal" context="hero" />
    </main>
  )
}
