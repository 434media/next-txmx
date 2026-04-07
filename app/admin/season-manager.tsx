'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
  activateSeason,
  completeSeason,
  distributeSeasonRewards,
  getSeasonalLeaderboard,
  type Season,
  type SeasonStatus,
  type SeasonRewardTier,
  type SeasonalEntry,
} from '@/app/actions/seasons'

const inputClass = 'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'

function SeasonForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Season
  onSave: (s: Season) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate?.slice(0, 10) ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) ?? '')
  const [tiers, setTiers] = useState<SeasonRewardTier[]>(initial?.rewardTiers ?? [
    { minPosition: 1, maxPosition: 1, label: 'Gold', tcReward: 500, lpReward: 200, badgeId: null },
    { minPosition: 2, maxPosition: 3, label: 'Silver', tcReward: 250, lpReward: 100, badgeId: null },
    { minPosition: 4, maxPosition: 10, label: 'Bronze', tcReward: 100, lpReward: 50, badgeId: null },
  ])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim() || !startDate || !endDate) return
    setSaving(true)

    const data = {
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: description.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: (initial?.status ?? 'upcoming') as SeasonStatus,
      rewardTiers: tiers,
    }

    let result: Season
    if (initial) {
      await updateSeason(initial.id, data)
      result = { ...initial, ...data, updatedAt: new Date().toISOString() }
    } else {
      result = await createSeason(data)
    }

    onSave(result)
    setSaving(false)
  }

  const updateTier = (index: number, field: keyof SeasonRewardTier, value: string | number) => {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const addTier = () => {
    setTiers(prev => [...prev, { minPosition: prev.length + 1, maxPosition: prev.length + 5, label: '', tcReward: 50, lpReward: 25, badgeId: null }])
  }

  const removeTier = (index: number) => {
    setTiers(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="Season 1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} required placeholder="season-1" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="16-week competitive season" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} required />
        </div>
      </div>

      {/* Reward Tiers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Reward Tiers</label>
          <button type="button" onClick={addTier} className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 hover:text-blue-700">+ Add Tier</button>
        </div>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-end">
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Label</label>
                <input type="text" value={tier.label} onChange={e => updateTier(i, 'label', e.target.value)} className={inputClass} placeholder="Gold" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">From #</label>
                <input type="number" min={1} value={tier.minPosition} onChange={e => updateTier(i, 'minPosition', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">To #</label>
                <input type="number" min={1} value={tier.maxPosition} onChange={e => updateTier(i, 'maxPosition', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">TC</label>
                <input type="number" min={0} value={tier.tcReward} onChange={e => updateTier(i, 'tcReward', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">LP</label>
                <input type="number" min={0} value={tier.lpReward} onChange={e => updateTier(i, 'lpReward', Number(e.target.value))} className={inputClass} />
              </div>
              <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 text-xs pb-2">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !name.trim()} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Update' : 'Create Season'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ─── Standings Preview ─── */
function StandingsPreview({ seasonId }: { seasonId: string }) {
  const [entries, setEntries] = useState<SeasonalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeasonalLeaderboard(seasonId, 20)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [seasonId])

  if (loading) return <p className="text-xs text-gray-400 animate-pulse py-2">Loading standings…</p>
  if (entries.length === 0) return <p className="text-xs text-gray-400 py-2">No participants yet.</p>

  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
        <div className="col-span-1">#</div>
        <div className="col-span-7">User</div>
        <div className="col-span-4 text-right">Season SP</div>
      </div>
      {entries.slice(0, 10).map((e, i) => (
        <div key={e.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-gray-100 items-center">
          <div className="col-span-1 text-xs font-bold text-gray-400">{i + 1}</div>
          <div className="col-span-7 text-xs text-gray-700 font-medium truncate">{e.displayName || 'Anonymous'}</div>
          <div className="col-span-4 text-right text-xs font-bold text-blue-600">{e.spEarned.toLocaleString()}</div>
        </div>
      ))}
      {entries.length > 10 && (
        <p className="text-[10px] text-gray-400 text-center py-2">+{entries.length - 10} more</p>
      )}
    </div>
  )
}

/* ─── Main Manager ─── */
export default function SeasonManager() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Season | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  useEffect(() => {
    getSeasons().then(setSeasons)
  }, [])

  const handleSaved = (s: Season) => {
    setSeasons(prev => {
      const exists = prev.find(p => p.id === s.id)
      if (exists) return prev.map(p => p.id === s.id ? s : p)
      return [s, ...prev]
    })
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this season? This cannot be undone.')) return
    await deleteSeason(id)
    setSeasons(prev => prev.filter(s => s.id !== id))
  }

  const handleActivate = useCallback(async (id: string) => {
    try {
      await activateSeason(id)
      setSeasons(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as SeasonStatus } : s))
      setActionMsg('Season activated!')
      setTimeout(() => setActionMsg(null), 3000)
    } catch (e) {
      setActionMsg((e as Error).message)
      setTimeout(() => setActionMsg(null), 5000)
    }
  }, [])

  const handleComplete = useCallback(async (id: string) => {
    if (!confirm('Complete this season? Final standings will be locked.')) return
    try {
      const result = await completeSeason(id)
      setSeasons(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' as SeasonStatus } : s))
      setActionMsg(`Season completed! ${result.totalParticipants} participants, ${result.topEntries.length} ranked.`)
      setTimeout(() => setActionMsg(null), 5000)
    } catch (e) {
      setActionMsg((e as Error).message)
      setTimeout(() => setActionMsg(null), 5000)
    }
  }, [])

  const handleDistribute = useCallback(async (id: string) => {
    if (!confirm('Distribute rewards to top finishers?')) return
    try {
      const result = await distributeSeasonRewards(id)
      setActionMsg(`Rewards distributed to ${result.rewarded} users!`)
      setTimeout(() => setActionMsg(null), 5000)
    } catch (e) {
      setActionMsg((e as Error).message)
      setTimeout(() => setActionMsg(null), 5000)
    }
  }, [])

  const STATUS_COLORS: Record<SeasonStatus, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          {actionMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Create and manage competitive seasons with leaderboards and rewards.</p>
        <button onClick={() => { setShowForm(true); setEditing(null) }} className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors">
          + New Season
        </button>
      </div>

      {(showForm || editing) && (
        <SeasonForm
          initial={editing ?? undefined}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="space-y-3">
        {seasons.map(s => (
          <div key={s.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                      <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${STATUS_COLORS[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      {s.rewardTiers?.length ? ` · ${s.rewardTiers.length} reward tiers` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {s.status === 'upcoming' && (
                    <button onClick={() => handleActivate(s.id)} className="text-[10px] font-semibold uppercase tracking-wider text-green-500 hover:text-green-700 transition-colors">Activate</button>
                  )}
                  {s.status === 'active' && (
                    <button onClick={() => handleComplete(s.id)} className="text-[10px] font-semibold uppercase tracking-wider text-orange-500 hover:text-orange-700 transition-colors">Complete</button>
                  )}
                  {s.status === 'completed' && (
                    <button onClick={() => handleDistribute(s.id)} className="text-[10px] font-semibold uppercase tracking-wider text-purple-500 hover:text-purple-700 transition-colors">Distribute</button>
                  )}
                  <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
                    {expanded === s.id ? 'Hide' : 'Standings'}
                  </button>
                  <button onClick={() => { setEditing(s); setShowForm(false) }} className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-600 transition-colors">Edit</button>
                  {s.status === 'upcoming' && (
                    <button onClick={() => handleDelete(s.id)} className="text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  )}
                </div>
              </div>
            </div>

            {expanded === s.id && (
              <div className="px-4 pb-4">
                <StandingsPreview seasonId={s.id} />
              </div>
            )}
          </div>
        ))}
        {seasons.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No seasons created yet.</p>}
      </div>
    </div>
  )
}
