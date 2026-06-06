"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, ArrowUpRight, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { db } from "../lib/firebase-client"
import { useAuth } from "../lib/auth-context"
import NotificationBell from "./notification-bell"
import type { FightNight } from "../app/actions/fightnight"
import type { FightNightStanding } from "../app/actions/fightnight-standings"

interface NavbarProps {
  onMenuClick: () => void
  onAuthClick: () => void
  activeFightNight?: FightNight | null
}

function StatusPill({ status }: { status: "announced" | "doors_open" | "live" | "completed" }) {
  const label =
    status === "live"
      ? "Live Now"
      : status === "doors_open"
        ? "Doors Open"
        : status === "completed"
          ? "Past"
          : "Coming Up"
  return (
    <span className="inline-flex items-center text-amber-400 text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 leading-none whitespace-nowrap">
      {label}
    </span>
  )
}

export default function Navbar({ onMenuClick, activeFightNight = null }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isEventsOpen, setIsEventsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef<HTMLDivElement>(null)
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (eventsRef.current && !eventsRef.current.contains(event.target as Node)) {
        setIsEventsOpen(false)
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
          <Link
            href="/"
            className="flex items-center p-1.5 transition-transform duration-300 hover:scale-105"
            aria-label="TXMX Boxing Home"
          >
            <Image
              src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/TXMXDistressedTransparent.png"
              alt="TXMX Logo"
              width={160}
              height={44}
              className="h-10! md:h-12! w-auto"
              priority
              style={{ display: "block" }}
            />
          </Link>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            {/* FIGHT NIGHTS */}
            <Link
              href="/fight-nights"
              className="text-white text-xs font-semibold tracking-widest leading-relaxed hover:text-white/70 transition-colors duration-200"
            >
              FIGHT NIGHTS
            </Link>

            {/* ICON TALKS Dropdown */}
            <div ref={eventsRef} className="relative">
              <button
                onClick={() => setIsEventsOpen(!isEventsOpen)}
                className="text-white text-xs font-semibold tracking-widest leading-relaxed hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5"
              >
                ICON TALKS
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isEventsOpen ? "rotate-180" : ""}`}
                  strokeWidth={2.25}
                />
              </button>

              {isEventsOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                  <div className="py-1">
                    <Link
                      href="/icon-talks/rise-of-a-champion"
                      onClick={() => setIsEventsOpen(false)}
                      className="block px-4 py-3 hover:bg-white/5 transition-colors duration-200"
                    >
                      <p className="text-white text-xs font-semibold tracking-wide leading-relaxed mb-1">
                        RISE OF A CHAMPION
                      </p>
                      <p className="text-white/45 text-[11px] font-medium leading-relaxed">
                        ICONTALKS x TXMX BOXING
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <a
              href="https://434media.com/shop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shop (opens in new tab)"
              className="text-white text-xs font-semibold tracking-widest leading-relaxed hover:text-white/70 transition-colors duration-200 inline-flex items-center gap-1.5 group"
            >
              SHOP
              <ArrowUpRight
                className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80 group-hover:-translate-y-px group-hover:translate-x-px transition-all duration-200"
                strokeWidth={2.25}
              />
            </a>

            {/* FOLLOW US Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-white text-xs font-semibold tracking-widest leading-relaxed hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5"
              >
                FOLLOW US
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  strokeWidth={2.25}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                  <div className="py-1">
                    {[
                      { label: "INSTAGRAM", href: "https://www.instagram.com/txmxboxing/" },
                      { label: "YOUTUBE", href: "https://www.youtube.com/@txmxboxing/shorts" },
                      { label: "TIKTOK", href: "https://www.tiktok.com/@txmxboxing" },
                    ].map((item, i) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors duration-200 group ${i > 0 ? "border-t border-white/5" : ""}`}
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
                </div>
              )}
            </div>

            {/* Auth */}
            {!loading && user && (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-white text-xs font-semibold tracking-widest leading-relaxed hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5 uppercase"
                >
                  {user.displayName?.split(" ")[0] || "Account"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    strokeWidth={2.25}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                    {/* User identity */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white text-xs font-semibold tracking-wide leading-relaxed truncate">
                          {user.displayName || "Account"}
                        </p>
                        {profile?.subscriptionStatus === "active" && (
                          <span className="inline-flex items-center text-amber-400 text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 leading-none whitespace-nowrap">
                            Black Card
                          </span>
                        )}
                      </div>
                      <p className="text-white/45 text-[11px] font-medium leading-relaxed truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Tonight — only when an event is active */}
                    {activeFightNight && (
                      <TonightPanel
                        fightNight={activeFightNight}
                        userId={user.uid}
                        onNavigate={() => setIsUserMenuOpen(false)}
                      />
                    )}

                    {/* Notifications */}
                    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                      <p className="text-white/45 text-[11px] font-medium leading-relaxed">Notifications</p>
                      <NotificationBell />
                    </div>

                    {/* Sign out */}
                    <button
                      onClick={() => { signOut(); setIsUserMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-white/55 text-[11px] font-medium leading-relaxed hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
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

// Live per-event standing for the signed-in user. Mounts only while the
// user dropdown is open, so the listeners spin up on open and tear down
// on close.
function TonightPanel({
  fightNight,
  userId,
  onNavigate,
}: {
  fightNight: FightNight
  userId: string
  onNavigate: () => void
}) {
  const [entry, setEntry] = useState<FightNightStanding | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [rank, setRank] = useState<{ position: number; total: number } | null>(null)

  useEffect(() => {
    const ref = doc(db, "fightNights", fightNight.id, "standings", userId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setEntry(snap.exists() ? (snap.data() as FightNightStanding) : null)
        setLoaded(true)
      },
      () => setLoaded(true)
    )
    return () => unsub()
  }, [fightNight.id, userId])

  useEffect(() => {
    if (!entry || entry.points === 0) {
      setRank(null)
      return
    }
    const q = query(
      collection(db, "fightNights", fightNight.id, "standings"),
      orderBy("points", "desc"),
      limit(500)
    )
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => d.data() as FightNightStanding)
      const i = docs.findIndex((d) => d.userId === userId)
      setRank(i === -1 ? null : { position: i + 1, total: docs.length })
    })
    return () => unsub()
  }, [fightNight.id, userId, entry])

  const hasPoints = !!entry && entry.points > 0
  const cta = entry ? "Open card" : "Join the game"

  return (
    <div className="px-4 py-3 border-b border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-400 text-[9px] font-bold tracking-[0.25em] uppercase">
          Tonight
        </span>
        <span className="text-white/55 text-[11px] font-medium truncate">
          {fightNight.title}
        </span>
      </div>

      {!loaded ? (
        <p className="text-white/30 text-[11px] font-medium mb-3">Loading…</p>
      ) : !entry ? (
        <p className="text-white/55 text-[11px] font-medium leading-relaxed mb-3">
          You haven&apos;t joined tonight&apos;s game yet.
        </p>
      ) : !hasPoints ? (
        <p className="text-white/55 text-[11px] font-medium leading-relaxed mb-3">
          Make your first pick to land on the board.
        </p>
      ) : (
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-white text-lg font-black tabular-nums leading-none">
              {entry.points.toLocaleString()}
              <span className="text-white/40 text-xs font-medium ml-1">pts</span>
            </p>
            <p className="text-white/45 text-[10px] font-medium mt-1 tabular-nums">
              {entry.picksWon}/{entry.picksMade} picks
            </p>
          </div>
          {rank && (
            <div className="text-right">
              <p className="text-white text-sm font-bold tabular-nums leading-none">
                #{rank.position}
              </p>
              <p className="text-white/40 text-[10px] font-medium mt-1">
                of {rank.total}
              </p>
            </div>
          )}
        </div>
      )}

      <Link
        href="/fight-nights"
        onClick={onNavigate}
        className="inline-flex items-center gap-1 text-white/75 text-[11px] font-semibold tracking-wide hover:text-amber-400 transition-colors"
      >
        {cta}
        <ArrowUpRight className="w-3 h-3" strokeWidth={2.25} />
      </Link>
    </div>
  )
}