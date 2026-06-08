"use client"

import { useState } from "react"
import PropsSection from "./props-section"
import PollsSection from "./polls-section"

interface BeyondTheBoutsProps {
  fightNightId: string
  propsEnabled: boolean
  pollsEnabled: boolean
}

type Tab = "props" | "polls"

/**
 * Combined surface for "extra picks" — props and polls — under one section
 * heading. Tabs render as horizontal carousels so the page footprint stays
 * consistent. Tabs stay mounted (hidden via CSS) so their Firestore
 * listeners don't churn on every switch.
 */
export default function BeyondTheBouts({
  fightNightId,
  propsEnabled,
  pollsEnabled,
}: BeyondTheBoutsProps) {
  const defaultTab: Tab = propsEnabled ? "props" : "polls"
  const [tab, setTab] = useState<Tab>(defaultTab)

  if (!propsEnabled && !pollsEnabled) return null

  const visibleTabs: Tab[] = [
    ...(propsEnabled ? ["props" as Tab] : []),
    ...(pollsEnabled ? ["polls" as Tab] : []),
  ]
  const showTabs = visibleTabs.length > 1

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-neutral-900 text-lg font-bold uppercase tracking-tight">
          Beyond the Bouts
        </h3>
        <span className="text-neutral-400 text-[10px] font-bold tracking-[0.2em] uppercase">
          Extra picks · earn more
        </span>
      </div>

      {showTabs && (
        <div className="flex items-center gap-1 mb-6 border-b border-neutral-200 overflow-x-auto">
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
        </div>
      )}

      {propsEnabled && (
        <div className={showTabs && tab !== "props" ? "hidden" : ""}>
          <PropsSection fightNightId={fightNightId} />
        </div>
      )}
      {pollsEnabled && (
        <div className={showTabs && tab !== "polls" ? "hidden" : ""}>
          <PollsSection fightNightId={fightNightId} />
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
        active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-t-full" />
      )}
    </button>
  )
}
