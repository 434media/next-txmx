"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* TXMX Logo - Larger on mobile, visible on desktop */}
          <a
            href="/"
            className="flex items-center p-2 transition-transform duration-300 hover:scale-105"
            aria-label="TXMX Boxing Home"
          >
            <Image
              src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/TXMXDistressedTransparent.png"
              alt="TXMX Logo"
              width={160}
              height={44}
              className="h-12! md:h-16! w-auto"
              priority
              style={{ display: "block" }}
            />
          </a>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/riseofachampion"
              className="text-white text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              RISE OF A CHAMPION
            </a>
            <a
              href="https://434media.com/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              SHOP FOUNDERS TEE
            </a>
            <a
              href="/admin"
              className="text-white/50 text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              ADMIN
            </a>

            {/* @TXMXBOXING Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-white text-sm font-bold tracking-widest hover:text-white/80 transition-all duration-300 flex items-center gap-1.5 leading-tight"
              >
                @TXMXBOXING
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-black border-2 border-white shadow-2xl">
                  <div className="py-2">
                    <a
                      href="https://www.instagram.com/txmxboxing/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/10 transition-colors duration-200 group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <div>
                        <p className="text-white text-sm font-bold tracking-wide leading-snug">INSTAGRAM</p>
                        <p className="text-white/50 text-xs font-medium tracking-wide leading-snug">@txmxboxing</p>
                      </div>
                    </a>
                    <a
                      href="https://www.youtube.com/@txmxboxing/shorts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/10 transition-colors duration-200 group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <div>
                        <p className="text-white text-sm font-bold tracking-wide leading-snug">YOUTUBE</p>
                        <p className="text-white/50 text-xs font-medium tracking-wide leading-snug">@txmxboxing</p>
                      </div>
                    </a>
                    <a
                      href="https://www.tiktok.com/@txmxboxing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/10 transition-colors duration-200 group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
                      </svg>
                      <div>
                        <p className="text-white text-sm font-bold tracking-wide leading-snug">TIKTOK</p>
                        <p className="text-white/50 text-xs font-medium tracking-wide leading-snug">@txmxboxing</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Equal padding with logo */}
          <button
            onClick={onMenuClick}
            className="md:hidden flex items-center p-2 text-white hover:bg-white/5 rounded transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}