"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../lib/auth-context"
import { awardShareCredits } from "../app/actions/sharing"

interface ShareButtonProps {
  url: string
  title: string
  text: string
  variant?: "default" | "compact"
}

export default function ShareButton({ url, title, text, variant = "default" }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const awardTC = async (platform: string) => {
    if (!user) return
    try {
      const result = await awardShareCredits(user.uid, platform, url)
      if (result.awarded) {
        showToast(`+20 TC earned for sharing!`)
      }
    } catch {
      // Silently fail — sharing itself is the primary action
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      showToast("Link copied!")
      awardTC("copy")
      setOpen(false)
    } catch {
      showToast("Couldn't copy link")
    }
  }

  const handlePlatformShare = (platform: string) => {
    let shareUrl = ""
    switch (platform) {
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer")
      awardTC(platform)
      setOpen(false)
    }
  }

  const handleNativeShare = async () => {
    if (!navigator.share) return
    try {
      await navigator.share({ title, text, url })
      awardTC("native")
      setOpen(false)
    } catch {
      // User cancelled
    }
  }

  const isCompact = variant === "compact"

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => {
          if (typeof navigator !== "undefined" && "share" in navigator) {
            handleNativeShare()
          } else {
            setOpen(!open)
          }
        }}
        className={
          isCompact
            ? "flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors p-1.5"
            : "flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all"
        }
        aria-label="Share"
      >
        <svg className={isCompact ? "w-4 h-4" : "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {!isCompact && "Share"}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-52 bg-black/95 backdrop-blur-md border border-white/15 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="p-1.5 space-y-0.5">
            <button onClick={() => handlePlatformShare("x")} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 text-white/70 hover:text-white transition-colors rounded text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              X (Twitter)
            </button>
            <button onClick={() => handlePlatformShare("facebook")} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 text-white/70 hover:text-white transition-colors rounded text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
            <button onClick={() => handlePlatformShare("linkedin")} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 text-white/70 hover:text-white transition-colors rounded text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </button>

            <div className="border-t border-white/10 my-1" />

            <button onClick={handleCopyUrl} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 text-white/70 hover:text-white transition-colors rounded text-sm font-medium">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy Link
            </button>
          </div>

          {user && (
            <div className="border-t border-white/10 px-3 py-2">
              <p className="text-emerald-400/70 text-[10px] font-semibold tracking-wider">
                +20 TC PER SHARE
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-60 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-white text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}
