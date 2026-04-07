'use client'

import { useState, useEffect } from 'react'
import {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  getLockerItemDefs,
  createLockerItem,
  updateLockerItem,
  deleteLockerItem,
  type RewardItem,
  type RewardCategory,
  type RewardCurrency,
  type RewardStatus,
  type RewardLane,
  type LockerItemDef,
  type LockerItemType,
} from '@/app/actions/rewards-store'
import { getBadges, type BadgeDefinition } from '@/app/actions/quests'

const CATEGORIES: RewardCategory[] = ['avatar', 'title', 'badge', 'booster', 'physical', 'experience']
const CURRENCIES: RewardCurrency[] = ['tc', 'lp']
const STATUSES: RewardStatus[] = ['available', 'sold_out', 'hidden']
const LANES: RewardLane[] = ['standard', 'premium']
const LOCKER_TYPES: LockerItemType[] = ['avatar_frame', 'title', 'card_skin', 'flair']
const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const

/* ─── Reward Form ─── */
function RewardForm({
  initial,
  badges,
  lockerItems,
  onSave,
  onCancel,
}: {
  initial?: RewardItem
  badges: BadgeDefinition[]
  lockerItems: LockerItemDef[]
  onSave: (r: RewardItem) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '🎁')
  const [category, setCategory] = useState<RewardCategory>(initial?.category ?? 'badge')
  const [currency, setCurrency] = useState<RewardCurrency>(initial?.currency ?? 'tc')
  const [price, setPrice] = useState(initial?.price ?? 100)
  const [stock, setStock] = useState(initial?.stock ?? 0)
  const [status, setStatus] = useState<RewardStatus>(initial?.status ?? 'available')
  const [blackCardOnly, setBlackCardOnly] = useState(initial?.blackCardOnly ?? false)
  const [lane, setLane] = useState<RewardLane>(initial?.lane ?? 'standard')
  const [badgeId, setBadgeId] = useState(initial?.badgeId ?? '')
  const [lockerItemId, setLockerItemId] = useState(initial?.lockerItemId ?? '')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [availableFrom, setAvailableFrom] = useState(initial?.availableFrom ?? '')
  const [availableUntil, setAvailableUntil] = useState(initial?.availableUntil ?? '')
  const [saving, setSaving] = useState(false)

  const inputClass = 'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)

    const data = {
      name: name.trim(),
      description: description.trim(),
      icon,
      category,
      currency,
      price,
      stock,
      status,
      blackCardOnly,
      lane,
      badgeId: badgeId || null,
      lockerItemId: lockerItemId || null,
      availableFrom: availableFrom || null,
      availableUntil: availableUntil || null,
      sortOrder,
    }

    let result: RewardItem
    if (initial) {
      await updateReward(initial.id, data)
      result = { ...initial, ...data, updatedAt: new Date().toISOString() }
    } else {
      result = await createReward(data)
    }

    onSave(result)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
          <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as RewardCategory)} className={inputClass}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value as RewardCurrency)} className={inputClass}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c === 'tc' ? 'TX-Credits' : 'Loyalty Points'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
          <input type="number" min={1} value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock (0=∞)</label>
          <input type="number" min={0} value={stock} onChange={e => setStock(Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as RewardStatus)} className={inputClass}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
          <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Badge (optional)</label>
          <select value={badgeId} onChange={e => setBadgeId(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {badges.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Locker Item (optional)</label>
          <select value={lockerItemId} onChange={e => setLockerItemId(e.target.value)} className={inputClass}>
            <option value="">None</option>
            {lockerItems.map(l => <option key={l.id} value={l.id}>{l.icon} {l.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" checked={blackCardOnly} onChange={e => setBlackCardOnly(e.target.checked)} className="rounded border-gray-300 text-[#FFB800] focus:ring-[#FFB800]/40" />
            <span className="font-medium">Black Card Only</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Store Lane</label>
          <select value={lane} onChange={e => setLane(e.target.value as RewardLane)} className={inputClass}>
            {LANES.map(l => <option key={l} value={l}>{l === 'standard' ? 'Standard' : '⭐ Premium'}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Available From (optional)</label>
          <input type="datetime-local" value={availableFrom ? availableFrom.slice(0, 16) : ''} onChange={e => setAvailableFrom(e.target.value ? new Date(e.target.value).toISOString() : '')} className={inputClass} />
          <p className="text-[10px] text-gray-400 mt-0.5">Leave blank = immediately available</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Available Until (optional)</label>
          <input type="datetime-local" value={availableUntil ? availableUntil.slice(0, 16) : ''} onChange={e => setAvailableUntil(e.target.value ? new Date(e.target.value).toISOString() : '')} className={inputClass} />
          <p className="text-[10px] text-gray-400 mt-0.5">Leave blank = no expiry</p>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !name.trim()} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Update' : 'Create Reward'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ─── Locker Item Form ─── */
function LockerItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: LockerItemDef
  onSave: (l: LockerItemDef) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '✨')
  const [type, setType] = useState<LockerItemType>(initial?.type ?? 'avatar_frame')
  const [rarity, setRarity] = useState<LockerItemDef['rarity']>(initial?.rarity ?? 'common')
  const [expiryDays, setExpiryDays] = useState(initial?.expiryDays ?? 0)
  const [saving, setSaving] = useState(false)

  const inputClass = 'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    let result: LockerItemDef
    if (initial) {
      await updateLockerItem(initial.id, { name: name.trim(), description: description.trim(), icon, type, rarity, expiryDays })
      result = { ...initial, name: name.trim(), description: description.trim(), icon, type, rarity, expiryDays }
    } else {
      result = await createLockerItem({ name: name.trim(), description: description.trim(), icon, type, rarity, expiryDays })
    }
    onSave(result)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
          <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value as LockerItemType)} className={inputClass}>
            {LOCKER_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Rarity</label>
          <select value={rarity} onChange={e => setRarity(e.target.value as LockerItemDef['rarity'])} className={inputClass}>
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Days (0 = never)</label>
        <input type="number" min={0} value={expiryDays} onChange={e => setExpiryDays(Number(e.target.value))} className={inputClass} />
        <p className="text-[10px] text-gray-400 mt-0.5">Days after unlock until item expires. 0 = permanent.</p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || !name.trim()} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : initial ? 'Update' : 'Create Item'}
        </button>
        <button type="button" onClick={onCancel} className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ─── Main Manager ─── */
export default function RewardsManager() {
  const [tab, setTab] = useState<'rewards' | 'locker'>('rewards')
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [lockerItems, setLockerItems] = useState<LockerItemDef[]>([])
  const [badges, setBadges] = useState<BadgeDefinition[]>([])

  const [showRewardForm, setShowRewardForm] = useState(false)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null)
  const [showLockerForm, setShowLockerForm] = useState(false)
  const [editingLocker, setEditingLocker] = useState<LockerItemDef | null>(null)

  useEffect(() => {
    Promise.all([getRewards(), getLockerItemDefs(), getBadges()]).then(([r, l, b]) => {
      setRewards(r)
      setLockerItems(l)
      setBadges(b)
    })
  }, [])

  /* reward handlers */
  const handleRewardSaved = (r: RewardItem) => {
    setRewards(prev => {
      const exists = prev.find(p => p.id === r.id)
      if (exists) return prev.map(p => p.id === r.id ? r : p)
      return [...prev, r]
    })
    setShowRewardForm(false)
    setEditingReward(null)
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Delete this reward?')) return
    await deleteReward(id)
    setRewards(prev => prev.filter(r => r.id !== id))
  }

  /* locker handlers */
  const handleLockerSaved = (l: LockerItemDef) => {
    setLockerItems(prev => {
      const exists = prev.find(p => p.id === l.id)
      if (exists) return prev.map(p => p.id === l.id ? l : p)
      return [...prev, l]
    })
    setShowLockerForm(false)
    setEditingLocker(null)
  }

  const handleDeleteLocker = async (id: string) => {
    if (!confirm('Delete this locker item?')) return
    await deleteLockerItem(id)
    setLockerItems(prev => prev.filter(l => l.id !== id))
  }

  const STATUS_DOT: Record<RewardStatus, string> = {
    available: 'bg-green-500',
    sold_out: 'bg-red-500',
    hidden: 'bg-gray-400',
  }

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
        <button onClick={() => setTab('rewards')} className={`text-xs font-semibold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${tab === 'rewards' ? 'border-[#FFB800] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          Rewards ({rewards.length})
        </button>
        <button onClick={() => setTab('locker')} className={`text-xs font-semibold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${tab === 'locker' ? 'border-[#FFB800] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
          Locker Items ({lockerItems.length})
        </button>
      </div>

      {/* ─── Rewards Tab ─── */}
      {tab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Create rewards that users can purchase with TC or LP.</p>
            <button onClick={() => { setShowRewardForm(true); setEditingReward(null) }} className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors">
              + Add Reward
            </button>
          </div>

          {(showRewardForm || editingReward) && (
            <RewardForm
              initial={editingReward ?? undefined}
              badges={badges}
              lockerItems={lockerItems}
              onSave={handleRewardSaved}
              onCancel={() => { setShowRewardForm(false); setEditingReward(null) }}
            />
          )}

          <div className="space-y-2">
            {rewards.map(r => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[r.status]}`} />
                        <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                        {r.blackCardOnly && <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">BC</span>}
                      </div>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {r.price} {r.currency === 'tc' ? 'TC' : 'LP'} · {r.category}
                        {r.stock > 0 ? ` · ${r.redeemed}/${r.stock} redeemed` : ` · ${r.redeemed} redeemed`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditingReward(r); setShowRewardForm(false) }} className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-600 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteReward(r.id)} className="text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No rewards yet.</p>}
          </div>
        </div>
      )}

      {/* ─── Locker Items Tab ─── */}
      {tab === 'locker' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Define avatar frames, titles, card skins, and flair that users can unlock.</p>
            <button onClick={() => { setShowLockerForm(true); setEditingLocker(null) }} className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors">
              + Add Item
            </button>
          </div>

          {(showLockerForm || editingLocker) && (
            <LockerItemForm
              initial={editingLocker ?? undefined}
              onSave={handleLockerSaved}
              onCancel={() => { setShowLockerForm(false); setEditingLocker(null) }}
            />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {lockerItems.map(item => {
              const rarityColor: Record<string, string> = { common: 'border-gray-300', rare: 'border-blue-400', epic: 'border-purple-400', legendary: 'border-amber-400' }
              return (
                <div key={item.id} className={`border-2 rounded-lg p-3 bg-white text-center ${rarityColor[item.rarity] || 'border-gray-200'}`}>
                  <span className="text-3xl block">{item.icon}</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{item.rarity} · {item.type.replace('_', ' ')}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button onClick={() => { setEditingLocker(item); setShowLockerForm(false) }} className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-600 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteLocker(item.id)} className="text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
          {lockerItems.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No locker items yet.</p>}
        </div>
      )}
    </div>
  )
}
