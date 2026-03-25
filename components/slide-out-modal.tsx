"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { XIcon } from "../components/icons/x-icon"
import { ArrowLeftIcon } from "../components/icons/arrow-left-icon"
import { Newsletter } from "./newsletter"
import Image from "next/image"
import { useAuth } from "../lib/auth-context"
import NotificationBell from "./notification-bell"

interface SlideOutModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthClick: () => void
}

type ModalState = "main" | "contact"

export default function SlideOutModal({ isOpen, onClose, onAuthClick }: SlideOutModalProps) {
  const [modalState, setModalState] = useState<ModalState>("main")
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)
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
              {/* Scorecard */}
              <Link
                href="/scorecard"
                className="group block py-4 border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
                onClick={onClose}
              >
                <div className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">SCORECARD</div>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">Fighter & Event Data</div>
              </Link>
              {/* 8 Count */}
              <Link
                href="/8count"
                className="group block py-4 border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
                onClick={onClose}
              >
                <div className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">THE 8 COUNT</div>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">A Feed for Fight Fans</div>
              </Link>
              {/* Rise of a Champion */}
              <Link
                href="/riseofachampion"
                className="group block py-4 border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
                onClick={onClose}
              >
                <div className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">RISE OF A CHAMPION</div>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">Relive the Moments</div>
              </Link>

              {/* @TXMXBOXING Dropdown */}
              <div className="border-b border-white/10">
                <button
                  onClick={() => setSocialOpen(!socialOpen)}
                  className="group flex items-center justify-between w-full py-4 hover:-translate-y-0.5 transition-transform duration-200"
                >
                  <div>
                    <div className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">@TXMXBOXING</div>
                    <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">Social Links</div>
                  </div>
                  <svg
                    className={`w-3 h-3 text-white/60 transition-transform duration-200 ${socialOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {socialOpen && (
                  <div className="pb-3 space-y-1">
                    <a
                      href="https://www.instagram.com/txmxboxing/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/10 transition-colors duration-200 group"
                    >
                      <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <div>
                        <p className="text-white text-xs font-semibold tracking-wide leading-relaxed">INSTAGRAM</p>
                        <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed">@txmxboxing</p>
                      </div>
                    </a>
                    <a
                      href="https://www.youtube.com/@txmxboxing/shorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/10 transition-colors duration-200 group"
                    >
                      <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <div>
                        <p className="text-white text-xs font-semibold tracking-wide leading-relaxed">YOUTUBE</p>
                        <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed">@txmxboxing</p>
                      </div>
                    </a>
                    <a
                      href="https://www.tiktok.com/@txmxboxing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/10 transition-colors duration-200 group"
                    >
                      <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
                      </svg>
                      <div>
                        <p className="text-white text-xs font-semibold tracking-wide leading-relaxed">TIKTOK</p>
                        <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed">@txmxboxing</p>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* Shop */}
              <a
                href="https://434media.com/shop"
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-4 border-b border-white/10 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div className="text-white text-sm font-semibold tracking-widest leading-relaxed group-hover:text-white/70 transition-colors">SHOP FOUNDERS TEE</div>
                <div className="text-white/30 text-xs font-medium tracking-wide leading-relaxed mt-0.5">434media.com</div>
              </a>

              {/* Auth Section */}
              {user ? (
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
                <div className="py-6">
                  <button
                    onClick={onAuthClick}
                    className="w-full text-center text-black text-[11px] font-semibold tracking-widest uppercase bg-amber-500 hover:bg-amber-400 px-5 py-3 transition-colors"
                  >
                    SIGN IN
                  </button>
                </div>
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
