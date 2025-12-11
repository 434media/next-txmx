"use client"

import { useEffect, useCallback, useState } from "react"
import Image from "next/image"
import type { GalleryImage } from "../../lib/gallery-images"

interface ImageModalProps {
  image: GalleryImage | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function ImageModal({ image, onClose, onPrevious, onNext }: ImageModalProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  
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
    const shareUrl = 'https://www.txmxboxing.com/riseofachampion/gallery'
    const shareTitle = 'Rise of a Champion Event Gallery | TXMX Boxing'
    const shareText = 'Check out exclusive photos from the Rise of a Champion celebration honoring San Antonio\'s boxing legends! 🥊✨'
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      
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
      
      setShowShareMenu(false)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleSocialShare = (platform: string) => {
    const shareUrl = 'https://www.txmxboxing.com/riseofachampion/gallery'
    const shareTitle = 'Rise of a Champion Event Gallery | TXMX Boxing'
    const shareText = 'Check out exclusive photos from the Rise of a Champion celebration honoring San Antonio\'s boxing legends! 🥊✨'
    
    let url = ''
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'x':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'instagram':
        // Instagram doesn't support web sharing, so copy URL and show instruction
        handleShare()
        return
      case 'tiktok':
        // TikTok doesn't have a direct web share URL, so copy URL
        handleShare()
        return
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
      setShowShareMenu(false)
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
          className="flex items-center gap-2 bg-white/10 hover:bg-[#FFB800]/20 border border-white/20 hover:border-[#FFB800]/50 text-white hover:text-[#FFB800] px-5 py-2.5 transition-all duration-300 text-sm font-medium rounded"
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
        
        {/* Share Button with Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowShareMenu(!showShareMenu)
            }}
            className="flex items-center gap-2 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/50 hover:border-[#FFB800] text-[#FFB800] px-5 py-2.5 transition-all duration-300 text-sm font-medium rounded"
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
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showShareMenu ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Share Menu Dropdown */}
          {showShareMenu && (
            <div 
              className="absolute bottom-full mb-2 right-0 w-56 bg-black/95 backdrop-blur-md border border-[#FFB800]/30 rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 space-y-1">
                {/* Facebook */}
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                
                {/* X (Twitter) */}
                <button
                  onClick={() => handleSocialShare('x')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-sm font-medium">X (Twitter)</span>
                </button>
                
                {/* LinkedIn */}
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </button>
                
                {/* Instagram */}
                <button
                  onClick={() => handleSocialShare('instagram')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </button>
                
                {/* TikTok */}
                <button
                  onClick={() => handleSocialShare('tiktok')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="text-sm font-medium">TikTok</span>
                </button>
                
                {/* Copy URL */}
                <div className="border-t border-[#FFB800]/20 mt-1 pt-1">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFB800]/10 text-white hover:text-[#FFB800] transition-colors rounded group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Copy URL</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
