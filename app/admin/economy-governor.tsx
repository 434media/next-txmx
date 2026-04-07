"use client"

import { useState, useEffect } from "react"
import type { EconomyConfig, EconomySnapshot } from "../actions/economy"
import { getEconomyConfig, updateEconomyConfig, getEconomySnapshot } from "../actions/economy"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default function EconomyGovernor() {
  const [config, setConfig] = useState<EconomyConfig | null>(null)
  const [snapshot, setSnapshot] = useState<EconomySnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [cfg, snap] = await Promise.all([getEconomyConfig(), getEconomySnapshot()])
        setConfig(cfg)
        setSnapshot(snap)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await updateEconomyConfig(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof EconomyConfig, value: number) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
    setSaved(false)
  }

  if (loading) {
    return <p className="text-gray-400 text-sm animate-pulse">Loading economy data...</p>
  }

  return (
    <div className="space-y-8">
      {/* Economy Health Dashboard */}
      {snapshot && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Economy Health</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard label="Total Users" value={formatNumber(snapshot.totalUsers)} color="text-blue-600" />
            <MetricCard label="Active Subscribers" value={formatNumber(snapshot.activeSubscribers)} color="text-amber-600" />
            <MetricCard label="TC In Circulation" value={formatNumber(snapshot.totalTCInCirculation)} color="text-emerald-600" />
            <MetricCard label="TC Earned (Lifetime)" value={formatNumber(snapshot.totalTCEarned)} color="text-emerald-600" />
            <MetricCard label="TC Spent (Lifetime)" value={formatNumber(snapshot.totalTCSpent)} color="text-red-600" />
            <MetricCard label="SP Awarded (Total)" value={formatNumber(snapshot.totalSPAwarded)} color="text-blue-600" />
            <MetricCard label="LP Awarded (Total)" value={formatNumber(snapshot.totalLPAwarded)} color="text-violet-600" />
          </div>
          <p className="text-gray-400 text-[11px] mt-2">
            Snapshot: {new Date(snapshot.snapshotAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Rate Configuration */}
      {config && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">TC Reward Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <RateInput label="Social Share Reward" value={config.shareReward} unit="TC" onChange={(v) => updateField("shareReward", v)} />
            <RateInput label="Poll Vote Reward" value={config.pollVoteReward} unit="TC" onChange={(v) => updateField("pollVoteReward", v)} />
            <RateInput label="Daily Login Reward" value={config.dailyLoginReward} unit="TC" onChange={(v) => updateField("dailyLoginReward", v)} />
            <RateInput label="Correct Prediction" value={config.correctPredictionReward} unit="TC" onChange={(v) => updateField("correctPredictionReward", v)} />
          </div>

          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">SP Ranges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2">Match Winner SP</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.matchWinnerSPMin}
                  onChange={(e) => updateField("matchWinnerSPMin", Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="number"
                  value={config.matchWinnerSPMax}
                  onChange={(e) => updateField("matchWinnerSPMax", Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-gray-400 text-xs font-medium">SP</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2">Prop Pick SP</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.propPickSPMin}
                  onChange={(e) => updateField("propPickSPMin", Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="number"
                  value={config.propPickSPMax}
                  onChange={(e) => updateField("propPickSPMax", Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-gray-400 text-xs font-medium">SP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Rates"}
            </button>
            {saved && (
              <span className="text-emerald-600 text-sm font-medium">Saved!</span>
            )}
            {config.updatedAt && (
              <span className="text-gray-400 text-xs">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Earning Caps */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4 mt-8">Earning Caps</h3>
          <p className="text-xs text-gray-400 mb-4">Set to 0 for unlimited. Caps prevent over-earning and protect the economy.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <RateInput label="Daily TC Cap" value={config.dailyTCCap} unit="TC/day" onChange={(v) => updateField("dailyTCCap", v)} />
            <RateInput label="Weekly TC Cap" value={config.weeklyTCCap} unit="TC/week" onChange={(v) => updateField("weeklyTCCap", v)} />
            <RateInput label="Daily SP Cap" value={config.dailySPCap} unit="SP/day" onChange={(v) => updateField("dailySPCap", v)} />
            <RateInput label="Weekly SP Cap" value={config.weeklySPCap} unit="SP/week" onChange={(v) => updateField("weeklySPCap", v)} />
          </div>

          {/* Category Limits */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Daily Category Limits</h3>
          <p className="text-xs text-gray-400 mb-4">Max actions per category per day. 0 = unlimited.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <RateInput label="Predictions/day" value={config.dailyPredictionLimit} unit="picks" onChange={(v) => updateField("dailyPredictionLimit", v)} />
            <RateInput label="Poll Votes/day" value={config.dailyPollLimit} unit="votes" onChange={(v) => updateField("dailyPollLimit", v)} />
            <RateInput label="Shares/day" value={config.dailyShareLimit} unit="shares" onChange={(v) => updateField("dailyShareLimit", v)} />
          </div>

          {/* Cooldowns */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Cooldowns</h3>
          <p className="text-xs text-gray-400 mb-4">Minimum seconds between actions. 0 = no cooldown.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <RateInput label="Poll Vote Cooldown" value={config.pollCooldownSeconds} unit="sec" onChange={(v) => updateField("pollCooldownSeconds", v)} />
            <RateInput label="Prediction Cooldown" value={config.predictionCooldownSeconds} unit="sec" onChange={(v) => updateField("predictionCooldownSeconds", v)} />
          </div>

          {/* Diminishing Returns */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Diminishing Returns</h3>
          <p className="text-xs text-gray-400 mb-4">Factor applied per repeat action (e.g. 0.9 = 10% less each time). 0 = off.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Return Factor</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.diminishingReturnFactor}
                  onChange={(e) => updateField("diminishingReturnFactor", Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
                <span className="text-gray-400 text-xs font-medium">multiplier</span>
              </div>
              {config.diminishingReturnFactor > 0 && config.diminishingReturnFactor < 1 && (
                <p className="text-[11px] text-gray-400 mt-2">
                  5th repeat earns {Math.round(Math.pow(config.diminishingReturnFactor, 4) * 100)}% of base
                </p>
              )}
            </div>
          </div>

          {/* Abuse Prevention */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Abuse Prevention</h3>
          <p className="text-xs text-gray-400 mb-4">Rate limits and gates to prevent farming. Set 0 to disable.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <RateInput label="Account Age Gate" value={config.accountAgeGateDays} unit="days" onChange={v => updateField('accountAgeGateDays', v)} />
            <RateInput label="Velocity TC/Hour" value={config.velocityTCPerHour} unit="TC" onChange={v => updateField('velocityTCPerHour', v)} />
            <RateInput label="Community Posts/Day" value={config.communityPostsPerDay} unit="/day" onChange={v => updateField('communityPostsPerDay', v)} />
            <RateInput label="Community Replies/Day" value={config.communityRepliesPerDay} unit="/day" onChange={v => updateField('communityRepliesPerDay', v)} />
          </div>

          {/* Black Card Subscriber Multiplier */}
          <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-4">Black Card Multiplier</h3>
          <p className="text-xs text-gray-400 mb-4">Earning boost for Black Card subscribers. 1 = no boost, 1.5 = 50% bonus, 2 = double.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50/30">
              <label className="block text-xs font-semibold text-amber-700 mb-2">Subscriber Multiplier</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.subscriberMultiplier}
                  onChange={(e) => updateField("subscriberMultiplier", Number(e.target.value))}
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-24 border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-amber-500"
                />
                <span className="text-amber-600 text-xs font-medium">×</span>
              </div>
              {config.subscriberMultiplier > 1 && (
                <p className="text-[11px] text-amber-600 mt-2">
                  Black Card holders earn {Math.round((config.subscriberMultiplier - 1) * 100)}% bonus on all TC, SP &amp; LP rewards
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <p className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

function RateInput({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <label className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={0}
          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-amber-500"
        />
        <span className="text-gray-400 text-xs font-medium">{unit}</span>
      </div>
    </div>
  )
}
