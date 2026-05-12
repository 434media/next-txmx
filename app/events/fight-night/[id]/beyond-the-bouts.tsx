"use client"

import { useState } from "react"
import PropsSection from "./props-section"
import PollsSection from "./polls-section"

interface BeyondTheBoutsProps {
  fightNightId: string
  propsEnabled: boolean
  pollsEnabled: boolean
}

type Tab = "props" | "polls" | "recap"

/**
 * Combined surface for "extra picks" — props, polls, and the night recap
 * — under one section heading. All three tabs render as horizontal
 * carousels so the page footprint stays consistent across surfaces.
 * Tabs stay mounted (hidden via CSS) so their Firestore listeners don't
 * churn on every switch.
 *
 * Recap is a filtered view of the same polls collection (`night-*` ids),
 * separated so the post-event recap polls don't compete with in-event
 * vibes/opening polls for attention.
 */
export default function BeyondTheBouts({
  fightNightId,
  propsEnabled,
  pollsEnabled,
}: BeyondTheBoutsProps) {
  // Default: Props if enabled, else Polls, else Recap (only meaningful
  // when polls are enabled since Recap is a poll subset).
  const defaultTab: Tab = propsEnabled ? "props" : pollsEnabled ? "polls" : "recap"
  const [tab, setTab] = useState<Tab>(defaultTab)

  if (!propsEnabled && !pollsEnabled) return null

  // Tab bar shows whenever 2+ tabs are renderable. Recap tab only renders
  // when polls are enabled (Recap is a poll subset).
  const visibleTabs: Tab[] = [
    ...(propsEnabled ? ["props" as Tab] : []),
    ...(pollsEnabled ? ["polls" as Tab, "recap" as Tab] : []),
  ]
  const showTabs = visibleTabs.length > 1

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-lg font-bold uppercase tracking-tight">
          Beyond the Bouts
        </h3>
        <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">
          Extra picks · earn more
        </span>
      </div>

      {showTabs && (
        <div className="flex items-center gap-1 mb-6 border-b border-white/10 overflow-x-auto">
          {visibleTabs.includes("props") && (
            <TabButton
              active={tab === "props"}
              onClick={() => setTab("props")}
            >
              Props
            </TabButton>
          )}
          {visibleTabs.includes("polls") && (
            <TabButton
              active={tab === "polls"}
              onClick={() => setTab("polls")}
            >
              Polls
            </TabButton>
          )}
          {visibleTabs.includes("recap") && (
            <TabButton
              active={tab === "recap"}
              onClick={() => setTab("recap")}
            >
              Recap
            </TabButton>
          )}
        </div>
      )}

      {propsEnabled && (
        <div className={showTabs && tab !== "props" ? "hidden" : ""}>
          <PropsSection fightNightId={fightNightId} />
        </div>
      )}
      {pollsEnabled && (
        <div className={showTabs && tab !== "polls" ? "hidden" : ""}>
          <PollsSection fightNightId={fightNightId} filter="main" />
        </div>
      )}
      {pollsEnabled && (
        <div className={showTabs && tab !== "recap" ? "hidden" : ""}>
          <PollsSection fightNightId={fightNightId} filter="recap" />
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-bold tracking-tight transition-colors shrink-0 ${
        active ? "text-white" : "text-white/45 hover:text-white/75"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-t-full" />
      )}
    </button>
  )
}
