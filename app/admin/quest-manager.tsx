'use client'

import { useState, useEffect } from 'react'
import {
  getQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  type QuestDefinition,
  type QuestObjective,
  type QuestStatus,
  type BadgeDefinition,
} from '@/app/actions/quests'
import { getSeasons, type Season } from '@/app/actions/seasons'

const OBJECTIVES: { value: QuestObjective; label: string }[] = [
  { value: 'daily_login', label: 'Daily Login' },
  { value: 'poll_vote', label: 'Poll Vote' },
  { value: 'prediction_placed', label: 'Prediction Placed' },
  { value: 'prediction_won', label: 'Prediction Won' },
  { value: 'share', label: 'Social Share' },
  { value: 'login_streak', label: 'Login Streak' },
  { value: 'props_settled', label: 'Props Settled' },
  { value: 'custom', label: 'Custom' },
]

const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const
const BADGE_CATEGORIES = ['quest', 'achievement', 'event', 'seasonal', 'manual'] as const

/* ─── Quest Form ─── */
function QuestForm({
  initial,
  badges,
  onSave,
  onCancel,
}: {
  initial?: QuestDefinition
  badges: BadgeDefinition[]
  onSave: (q: QuestDefinition) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [objective, setObjective] = useState<QuestObjective>(initial?.objective ?? 'daily_login')
  const [target, setTarget] = useState(initial?.target ?? 1)
  const [spReward, setSpReward] = useState(initial?.reward.sp ?? 0)
  const [tcReward, setTcReward] = useState(initial?.reward.tc ?? 0)
  const [lpReward, setLpReward] = useState(initial?.reward.lp ?? 0)
  const [badgeId, setBadgeId] = useState(initial?.reward.badgeId ?? '')
  const [status, setStatus] = useState<QuestStatus>(initial?.status ?? 'active')
  const [blackCardOnly, setBlackCardOnly] = useState(initial?.blackCardOnly ?? false)
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [startsAt, setStartsAt] = useState(initial?.startsAt?.slice(0, 16) ?? '')
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt?.slice(0, 16) ?? '')
  const [seasonId, setSeasonId] = useState(initial?.seasonId ?? '')
  const [seasons, setSeasons] = useState<Season[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSeasons().then(setSeasons)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const questData = {
      title: title.trim(),
      description: description.trim(),
      objective,
      target,
      reward: { sp: spReward, tc: tcReward, lp: lpReward, badgeId: badgeId || null },
      status,
      blackCardOnly,
      sortOrder,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      seasonId: seasonId || null,
    }

    let result: QuestDefinition
    if (initial) {
      await updateQuest(initial.id, questData)
      result = { ...initial, ...questData, updatedAt: new Date().toISOString() }
    } else {
      result = await createQuest(questData)
    }

    onSave(result)
    setSaving(false)
  }

  const inputClass = 'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Objective</label>
          <select value={objective} onChange={e => setObjective(e.target.value as QuestObjective)} className={inputClass}>
            {OBJECTIVES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Target</label>
          <input type="number" min={1} value={target} onChange={e => setTarget(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SP Reward</label>
          <input type="number" min={0} value={spReward} onChange={e => setSpReward(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>TC Reward</label>
          <input type="number" min={0} value={tcReward} onChange={e => setTcReward(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>LP Reward</label>
          <input type="number" min={0} value={lpReward} onChange={e => setLpReward(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as QuestStatus)} className={inputClass}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Badge Reward</label>
          <select value={badgeId} onChange={e => setBadgeId(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {badges.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={blackCardOnly} onChange={e => setBlackCardOnly(e.target.checked)} className="rounded border-gray-300 text-[#FFB800] focus:ring-[#FFB800]/40" />
            <span className="font-medium">Black Card Only</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Starts At (optional)</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Expires At (optional)</label>
          <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Season (optional)</label>
          <select value={seasonId} onChange={e => setSeasonId(e.target.value)} className={inputClass}>
            <option value="">No Season (always available)</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !title.trim()} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Update Quest' : 'Create Quest'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ─── Badge Form ─── */
function BadgeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BadgeDefinition
  onSave: (b: BadgeDefinition) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '🏅')
  const [rarity, setRarity] = useState<BadgeDefinition['rarity']>(initial?.rarity ?? 'common')
  const [category, setCategory] = useState<BadgeDefinition['category']>(initial?.category ?? 'quest')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)

    let result: BadgeDefinition
    if (initial) {
      await updateBadge(initial.id, { name: name.trim(), description: description.trim(), icon, rarity, category })
      result = { ...initial, name: name.trim(), description: description.trim(), icon, rarity, category }
    } else {
      result = await createBadge({ name: name.trim(), description: description.trim(), icon, rarity, category })
    }

    onSave(result)
    setSaving(false)
  }

  const inputClass = 'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
          <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rarity</label>
          <select value={rarity} onChange={e => setRarity(e.target.value as BadgeDefinition['rarity'])} className={inputClass}>
            {RARITIES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as BadgeDefinition['category'])} className={inputClass}>
            {BADGE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !name.trim()} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Update Badge' : 'Create Badge'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ─── Main Manager ─── */
export default function QuestManager() {
  const [quests, setQuests] = useState<QuestDefinition[]>([])
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState<QuestDefinition | null>(null)
  const [showBadgeForm, setShowBadgeForm] = useState(false)
  const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null)
  const [tab, setTab] = useState<'quests' | 'badges'>('quests')

  useEffect(() => {
    Promise.all([getQuests(), getBadges()]).then(([q, b]) => {
      setQuests(q)
      setBadges(b)
    })
  }, [])

  /* quest handlers */
  const handleQuestSaved = (q: QuestDefinition) => {
    setQuests(prev => {
      const exists = prev.find(p => p.id === q.id)
      if (exists) return prev.map(p => p.id === q.id ? q : p)
      return [...prev, q]
    })
    setShowQuestForm(false)
    setEditingQuest(null)
  }

  const handleDeleteQuest = async (id: string) => {
    if (!confirm('Delete this quest?')) return
    await deleteQuest(id)
    setQuests(prev => prev.filter(q => q.id !== id))
  }

  const handleToggleQuestStatus = async (quest: QuestDefinition) => {
    const newStatus: QuestStatus = quest.status === 'active' ? 'paused' : 'active'
    await updateQuest(quest.id, { status: newStatus })
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: newStatus } : q))
  }

  /* badge handlers */
  const handleBadgeSaved = (b: BadgeDefinition) => {
    setBadges(prev => {
      const exists = prev.find(p => p.id === b.id)
      if (exists) return prev.map(p => p.id === b.id ? b : p)
      return [...prev, b]
    })
    setShowBadgeForm(false)
    setEditingBadge(null)
  }

  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Delete this badge?')) return
    await deleteBadge(id)
    setBadges(prev => prev.filter(b => b.id !== id))
  }

  const STATUS_DOT: Record<QuestStatus, string> = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    expired: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab('quests')}
          className={`text-xs font-semibold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${
            tab === 'quests' ? 'border-[#FFB800] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Quests ({quests.length})
        </button>
        <button
          onClick={() => setTab('badges')}
          className={`text-xs font-semibold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${
            tab === 'badges' ? 'border-[#FFB800] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Badges ({badges.length})
        </button>
      </div>

      {/* ─── Quests Tab ─── */}
      {tab === 'quests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Create and manage quests. Users progress automatically as they engage.</p>
            <button
              onClick={() => { setShowQuestForm(true); setEditingQuest(null) }}
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors"
            >
              + Add Quest
            </button>
          </div>

          {(showQuestForm || editingQuest) && (
            <QuestForm
              initial={editingQuest ?? undefined}
              badges={badges}
              onSave={handleQuestSaved}
              onCancel={() => { setShowQuestForm(false); setEditingQuest(null) }}
            />
          )}

          <div className="space-y-2">
            {quests.map(quest => (
              <div key={quest.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[quest.status]}`} />
                      <span className="text-sm font-semibold text-gray-800">{quest.title}</span>
                      {quest.blackCardOnly && (
                        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">BC</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{quest.description}</p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      {quest.objective} × {quest.target} → {quest.reward.sp > 0 ? `${quest.reward.sp} SP ` : ''}{quest.reward.tc > 0 ? `${quest.reward.tc} TC ` : ''}{quest.reward.lp > 0 ? `${quest.reward.lp} LP ` : ''}{quest.reward.badgeId ? '🏅' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggleQuestStatus(quest)} className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors">
                      {quest.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => { setEditingQuest(quest); setShowQuestForm(false) }} className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-600 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteQuest(quest.id)} className="text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {quests.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No quests yet. Create one to get started.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Badges Tab ─── */}
      {tab === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Define badges that can be awarded via quests or manually.</p>
            <button
              onClick={() => { setShowBadgeForm(true); setEditingBadge(null) }}
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors"
            >
              + Add Badge
            </button>
          </div>

          {(showBadgeForm || editingBadge) && (
            <BadgeForm
              initial={editingBadge ?? undefined}
              onSave={handleBadgeSaved}
              onCancel={() => { setShowBadgeForm(false); setEditingBadge(null) }}
            />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map(badge => {
              const rarityColor: Record<string, string> = {
                common: 'border-gray-300',
                rare: 'border-blue-400',
                epic: 'border-purple-400',
                legendary: 'border-amber-400',
              }
              return (
                <div key={badge.id} className={`border-2 rounded-lg p-3 bg-white text-center ${rarityColor[badge.rarity] || 'border-gray-200'}`}>
                  <span className="text-3xl block">{badge.icon}</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{badge.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{badge.rarity} · {badge.category}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-2">{badge.description}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button onClick={() => { setEditingBadge(badge); setShowBadgeForm(false) }} className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-600 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteBadge(badge.id)} className="text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {badges.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No badges yet. Create one to get started.</p>
          )}
        </div>
      )}
    </div>
  )
}
