"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import { db } from "../lib/firebase-client"
import { useAuth } from "../lib/auth-context"
import type { FightNight, FightNightBout } from "../app/actions/fightnight"
import type { FightNightPick } from "../app/actions/fightnight-picks"

interface LiveRibbonProps {
  activeFightNight: FightNight | null
}

/**
 * Persistent strip below the navbar that appears when a bout is live.
 * Subscribes to the active fight night's bouts and (if signed in) to the
 * user's pick for the live bout, so attendees see live state and the
 * status of their own pick from any page in the app.
 */
export default function LiveRibbon({ activeFightNight }: LiveRibbonProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [bouts, setBouts] = useState<FightNightBout[]>([])
  const [pick, setPick] = useState<FightNightPick | null>(null)

  useEffect(() => {
    if (!activeFightNight) {
      setBouts([])
      return
    }
    const q = query(
      collection(db, "fightNights", activeFightNight.id, "bouts"),
      orderBy("boutNumber", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setBouts(
        snap.docs
          .map((d) => d.data() as FightNightBout)
          .sort((a, b) => (a.order ?? a.boutNumber) - (b.order ?? b.boutNumber))
      )
    })
    return () => unsub()
  }, [activeFightNight])

  const liveBout = bouts.find((b) => b.status === "live") || null

  // Subscribe to the user's pick for the currently live bout (single doc).
  useEffect(() => {
    if (!user || !activeFightNight || !liveBout) {
      setPick(null)
      return
    }
    const ref = doc(
      db,
      "fightNights",
      activeFightNight.id,
      "picks",
      `${user.uid}_${liveBout.boutNumber}`
    )
    const unsub = onSnapshot(ref, (snap) => {
      setPick(snap.exists() ? (snap.data() as FightNightPick) : null)
    })
    return () => unsub()
  }, [user, activeFightNight, liveBout])

  // Track ribbon visibility on the body so pages can shift their top
  // padding to clear it (see globals.css `--live-ribbon-h`).
  useEffect(() => {
    if (typeof document === "undefined") return
    if (!liveBout) return
    document.body.classList.add("has-live-ribbon")
    return () => document.body.classList.remove("has-live-ribbon")
  }, [liveBout])

  if (!activeFightNight || !liveBout) return null

  const totalBouts = bouts.length
  const pickedFighterName =
    pick?.pickedCorner === "fighter1"
      ? liveBout.fighter1Name
      : pick?.pickedCorner === "fighter2"
        ? liveBout.fighter2Name
        : null

  const fnPath = `/fight-nights/${activeFightNight.slug || activeFightNight.id}`
  const onFightNightPage = pathname === fnPath
  const jumpHref = onFightNightPage
    ? `#bout-${liveBout.boutNumber}`
    : `${fnPath}#bout-${liveBout.boutNumber}`

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-0 right-0 z-30 bg-red-950/95 backdrop-blur-md border-b border-red-500/30 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-11">
          <div className="flex items-center gap-3 min-w-0">
            {/* LIVE beacon */}
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-red-400" />
              </span>
              <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase leading-none">
                Live
              </span>
            </span>

            {/* Bout position — desktop only */}
            <span className="hidden sm:inline text-white/45 text-[11px] font-medium leading-none shrink-0">
              Bout {liveBout.boutNumber} of {totalBouts}
            </span>

            {/* Fighters */}
            <span className="text-white text-[12px] sm:text-[13px] font-bold leading-tight truncate min-w-0">
              {liveBout.fighter1Name || "TBA"}
              <span className="text-white/40 font-normal mx-1.5">vs</span>
              {liveBout.fighter2Name || "TBA"}
            </span>

            {/* Pick info — md+ to keep mobile uncluttered */}
            {user && pickedFighterName && (
              <span className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-amber-300 text-[11px] font-bold tracking-wide leading-none px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                Your pick: {pickedFighterName} · locked
              </span>
            )}
            {user && !pickedFighterName && (
              <span className="hidden md:inline text-white/45 text-[11px] font-medium leading-none shrink-0">
                No pick on this one
              </span>
            )}
            {!user && (
              <span className="hidden md:inline text-white/45 text-[11px] font-medium leading-none shrink-0">
                Picks locked
              </span>
            )}
          </div>

          {/* Jump CTA */}
          <Link
            href={jumpHref}
            scroll={false}
            className="shrink-0 inline-flex items-center gap-1 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors leading-none"
          >
            Jump
            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
