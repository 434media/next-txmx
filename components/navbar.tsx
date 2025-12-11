"use client"

import Image from "next/image"
import { Menu } from "lucide-react"

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
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
              src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/TXMXDistressedTransparent.png"
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
            {/* <a
              href="/the8count"
              className="text-white text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              THE 8 COUNT
            </a> */}
            <a
              href="https://434media.com/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              SHOP FOUNDERS TEE
            </a>
            <a
              href="https://www.instagram.com/txmxboxing/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm font-bold tracking-widest hover:text-white/80 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
            >
              @TXMXBOXING
            </a>
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