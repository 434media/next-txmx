"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { XIcon } from "../components/icons/x-icon"
import { ArrowLeftIcon } from "../components/icons/arrow-left-icon"
import { Newsletter } from "./newsletter"
import Image from "next/image"
import { useAuth } from "../lib/auth-context"
import { FAN_ACCOUNTS_ENABLED } from "../lib/feature-flags"
import NotificationBell from "./notification-bell"
import type { FightNight } from "../app/actions/fightnight"

interface SlideOutModalProps {
  isOpen: boolean
  onClose: () => void
  /** Opens the sign-in modal. Omitted while fan accounts are off — nothing
   *  mounts AuthModal, so the menu renders no sign-in button. Pass it again
   *  (from app/client-layout.tsx) when FAN_ACCOUNTS_ENABLED goes back to true. */
  onAuthClick?: () => void
  activeFightNight?: FightNight | null
}

type ModalState = "main" | "contact"

export default function SlideOutModal({ isOpen, onClose, onAuthClick, activeFightNight = null }: SlideOutModalProps) {
  const [modalState, setModalState] = useState<ModalState>("main")
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setModalState("main")
      setIsVisible(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true))
      })
    } else {
      setIsAnimating(false)
      const timeout = setTimeout(() => setIsVisible(false), 350)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  const handleContactClick = () => setModalState("contact")
  const handleBackClick = () => setModalState("main")

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={`absolute inset-0 backdrop-blur-sm bg-black/70 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`absolute inset-0 overflow-y-auto bg-black transition-transform duration-350 ease-out ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Main Content */}
        {modalState === "main" && (
          <div className="flex flex-col min-h-full px-6 py-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <Image
                src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg"
                alt="TXMX Boxing Logo"
                width={100}
                height={50}
                className="brightness-0 invert"
                priority
              />
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-4 w-full">
              {/* Fight Nights */}
              <Link
                href="/fight-nights"
                onClick={onClose}
                className="group block w-full py-4 text-left border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <span className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">
                  FIGHT NIGHTS
                </span>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">
                  Play live · pick winners · climb the board
                </div>
              </Link>

              {/* Icon Talks Dropdown */}
              <div>
                <button
                  onClick={() => setEventsOpen(!eventsOpen)}
                  aria-expanded={eventsOpen}
                  className="group block w-full py-4 text-left border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">
                      ICON TALKS
                    </span>
                    <svg
                      className={`w-3 h-3 shrink-0 text-white/60 transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">
                    The TXMX Iconic Series
                  </div>
                </button>

                {eventsOpen && (
                  <div className="pt-2 pb-1 space-y-1">
                    <Link
                      href="/icon-talks/rise-of-a-champion"
                      onClick={onClose}
                      className="block px-4 py-3 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <p className="text-white text-xs font-semibold tracking-wide leading-relaxed mb-1">RISE OF A CHAMPION</p>
                      <p className="text-white/45 text-[11px] font-medium leading-relaxed">ICONTALKS x TXMX BOXING</p>
                    </Link>
                  </div>
                )}
              </div>

              {/* Shop (external) */}
              <a
                href="https://434media.com/shop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shop (opens in new tab)"
                onClick={onClose}
                className="group block py-4 border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">SHOP</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80 transition-colors" strokeWidth={2.25} />
                </div>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">434media.com</div>
              </a>

              {/* FOLLOW US Dropdown */}
              <div>
                <button
                  onClick={() => setSocialOpen(!socialOpen)}
                  aria-expanded={socialOpen}
                  className="group block w-full py-4 text-left border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">FOLLOW US</span>
                    <svg
                      className={`w-3 h-3 shrink-0 text-white/60 transition-transform duration-200 ${socialOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">Instagram, YouTube, TikTok</div>
                </button>

                {socialOpen && (
                  <div className="pt-2 pb-1 space-y-1">
                    {[
                      { label: "INSTAGRAM", href: "https://www.instagram.com/txmxboxing/" },
                      { label: "YOUTUBE", href: "https://www.youtube.com/@txmxboxing/shorts" },
                      { label: "TIKTOK", href: "https://www.tiktok.com/@txmxboxing" },
                    ].map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-white/5 transition-colors duration-200 group"
                      >
                        <div>
                          <p className="text-white text-xs font-semibold tracking-wide leading-relaxed">{item.label}</p>
                          <p className="text-white/45 text-[11px] font-medium leading-relaxed mt-0.5">@txmxboxing</p>
                        </div>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:-translate-y-px group-hover:translate-x-px transition-all duration-200"
                          strokeWidth={2.25}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Section. Hidden entirely while fan accounts are off —
                  no sign-in button, and no account panel for a stale session. */}
              {!FAN_ACCOUNTS_ENABLED ? null : user ? (
                <div className="py-4 space-y-4">
                  {/* User info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold tracking-widest">{user.displayName?.split(" ")[0]?.toUpperCase() || "ACCOUNT"}</p>
                      <p className="text-white/30 text-xs font-medium tracking-wide mt-0.5">{user.email}</p>
                    </div>
                    {profile?.subscriptionStatus === "active" && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-amber-500 text-[11px] font-semibold tracking-wider uppercase">Black Card</span>
                      </div>
                    )}
                  </div>

                  {/* Currency stats */}
                  {profile && (
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/5">
                      <div className="text-center">
                        <p className="text-blue-400 text-xs font-bold tabular-nums">{profile.skillPoints}</p>
                        <p className="text-white/30 text-[9px] tracking-wider">SP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-400 text-xs font-bold tabular-nums">{profile.txCredits}</p>
                        <p className="text-white/30 text-[9px] tracking-wider">TC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-400 text-xs font-bold tabular-nums">{profile.loyaltyPoints}</p>
                        <p className="text-white/30 text-[9px] tracking-wider">LP</p>
                      </div>
                    </div>
                  )}

                  {/* Black Card CTA (non-subscribers) */}
                  {profile?.subscriptionStatus !== "active" && (
                    <Link
                      href="/checkout"
                      className="flex items-center justify-between py-3 group"
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-500 transition-colors" />
                        <p className="text-white/60 text-[11px] font-semibold tracking-wider uppercase group-hover:text-white transition-colors">Get the Black Card</p>
                      </div>
                      <p className="text-amber-500 text-[11px] font-semibold tracking-wide">$14.99/mo</p>
                    </Link>
                  )}

                  {/* Notifications */}
                  <div className="flex items-center justify-between py-3 border-t border-white/5">
                    <p className="text-white/40 text-[11px] font-medium tracking-wider uppercase">Notifications</p>
                    <NotificationBell />
                  </div>

                  {/* Sign out */}
                  <button
                    onClick={() => { signOut(); onClose() }}
                    className="w-full text-left text-white/40 text-[11px] font-medium tracking-wider uppercase hover:text-white/60 transition-colors py-3 border-t border-white/5"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                onAuthClick && (
                  <div className="py-6">
                    <button
                      onClick={onAuthClick}
                      className="w-full text-center text-black text-[11px] font-semibold tracking-widest uppercase bg-amber-500 hover:bg-amber-400 px-5 py-3 transition-colors"
                    >
                      SIGN IN
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Contact Content */}
        {modalState === "contact" && (
          <div className="flex flex-col h-full px-6 py-8 text-white">
            {/* Header - Back Button */}
            <div className="flex justify-start mb-10">
              <button
                onClick={handleBackClick}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Newsletter Form - Centered */}
            <div className="flex-1 flex flex-col justify-center space-y-6 max-w-xs mx-auto w-full">
              <Newsletter className="form-element" slideoutModal={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
