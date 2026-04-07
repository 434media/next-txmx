"use client"

import { useState } from "react"
import type { Prop } from "../actions/props"
import { placePick } from "../actions/props"
import { useAuth } from "../../lib/auth-context"
import UpsellBanner from "../../components/upsell-banner"

interface PicksClientProps {
  props: Prop[]
}

export default function PicksClient({ props }: PicksClientProps) {
  const { user, profile } = useAuth()
  const isBlackCard = profile?.subscriptionStatus === "active"

  if (!user) {
    return (
      <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/50 text-sm font-medium leading-6 mb-2">
          Sign in to make your picks.
        </p>
        <p className="text-white/30 text-xs leading-5">
          Prop Picks is a Black Card feature.
        </p>
      </div>
    )
  }

  if (!isBlackCard) {
    return (
      <UpsellBanner
        headline="Black Card Required"
        message="Prop Picks is a Black Card feature. Subscribe for $14.99/mo to start earning Skill Points through predictions."
      />
    )
  }

  if (props.length === 0) {
    return (
      <div className="text-center py-24 border border-white/8 rounded-xl bg-white/2">
        <p className="text-white/40 text-sm font-medium leading-6 mb-2">
          No open props right now.
        </p>
        <p className="text-white/30 text-xs leading-5">
          Check back before the next fight card for new predictions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {props.map((prop) => (
        <PropPickCard key={prop.id} prop={prop} userId={user.uid} />
      ))}
    </div>
  )
}

function PropPickCard({
  prop,
  userId,
}: {
  prop: Prop
  userId: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!selected) return
    setSubmitting(true)
    setError("")
    try {
      await placePick(prop.id, userId, selected)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place pick")
    } finally {
      setSubmitting(false)
    }
  }

  const typeLabel: Record<string, string> = {
    match_winner: "Match Winner",
    method: "Method",
    round: "Round",
    over_under: "Over/Under",
  }

  return (
    <div
      className={`border rounded-xl p-6 transition-all duration-200 ${
        submitted
          ? "border-green-500/20 bg-green-500/3"
          : "border-white/8 bg-white/2"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-white text-[15px] font-bold leading-snug">
            {prop.title}
          </h3>
          {prop.description && (
            <p className="text-white/40 text-xs font-medium leading-5 mt-1">
              {prop.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {prop.isUnderdog && (
            <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Underdog
            </span>
          )}
          <span className="text-white/25 text-[10px] font-semibold tracking-wider uppercase">
            {typeLabel[prop.type] || prop.type}
          </span>
        </div>
      </div>

      {/* Reward info */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-blue-400 text-xs font-semibold">
          {prop.spReward} SP
        </span>
        <span className="text-emerald-400 text-xs font-semibold">
          {prop.tcReward} TC
        </span>
        {prop.isUnderdog && (
          <span className="text-amber-400/60 text-xs font-medium">
            1.25x multiplier
          </span>
        )}
      </div>

      {/* Options */}
      {submitted ? (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-green-400 text-sm font-semibold">
            Pick locked in:{" "}
            <span className="text-white/80">
              {prop.options.find((o) => o.id === selected)?.label}
            </span>
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {prop.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`text-left px-4 py-3 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                  selected === opt.id
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/8 bg-white/2 text-white/60 hover:border-white/15 hover:bg-white/4 hover:text-white/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded-lg bg-white/10 text-white border border-white/15 hover:bg-white/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Lock In Pick"}
          </button>
        </>
      )}
    </div>
  )
}
