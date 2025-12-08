"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import type { GalleryImage } from "../../lib/gallery-images"

interface ImageModalProps {
  image: GalleryImage | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function ImageModal({ image, onClose, onPrevious, onNext }: ImageModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrevious()
      if (e.key === "ArrowRight") onNext()
    },
    [onClose, onPrevious, onNext],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  if (!image) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rise-of-a-champion-${image.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShare = async () => {
    const currentUrl = window.location.href
    
    try {
      await navigator.clipboard.writeText(currentUrl)
      
      // Create notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 z-[70] bg-black/90 backdrop-blur-md border border-[#FFB800] rounded-sm p-4 flex items-center gap-3 animate-slide-in'
      notification.innerHTML = `
        <svg class="w-5 h-5 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="text-white font-semibold">Link copied to clipboard!</span>
      `
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.opacity = '0'
        notification.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => notification.remove(), 300)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onPrevious()
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
        aria-label="Previous image"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50"
        aria-label="Next image"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.src || "/placeholder.svg"}
          alt={image.alt}
          width={1200}
          height={800}
          className="max-w-full max-h-[80vh] object-contain"
          priority
        />
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleShare()
          }}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}
