"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"

interface GalleryUnlockFormProps {
  onUnlock: () => void
}

export default function GalleryUnlockForm({ onUnlock }: GalleryUnlockFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subscribeToNewsletter: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/gallery-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong")
      }

      // Store in sessionStorage to persist unlock state
      sessionStorage.setItem("galleryUnlocked", "true")
      onUnlock()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
              First Name <span className="text-[#FFB800]">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#FFB800] transition-colors"
              placeholder="First"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-2">
              Last Name <span className="text-[#FFB800]">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#FFB800] transition-colors"
              placeholder="Last"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Email <span className="text-[#FFB800]">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#FFB800] transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="subscribeToNewsletter"
            checked={formData.subscribeToNewsletter}
            onChange={(e) => setFormData({ ...formData, subscribeToNewsletter: e.target.checked })}
            className="mt-1 w-4 h-4 accent-[#FFB800] bg-white/5 border-white/20"
          />
          <label htmlFor="subscribeToNewsletter" className="text-sm text-white/70 leading-relaxed">
            Subscribe to <span className="text-[#FFB800] font-semibold">The 8 Count</span> — the weekly newsletter from
            TXMX Boxing with exclusive updates, behind-the-scenes content, and more.
          </label>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FFB800] text-black hover:bg-[#FFB800]/90 font-bold py-4 text-base tracking-wide disabled:opacity-50"
        >
          {isSubmitting ? "Unlocking..." : "Unlock Gallery"}
        </Button>
      </form>

      <p className="text-white/40 text-xs text-center mt-4">
        By submitting, you agree to receive communications from TXMX Boxing.
      </p>
    </div>
  )
}
