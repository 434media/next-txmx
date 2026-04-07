'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import {
  getUserLocker,
  getLockerItemDefs,
  equipLockerItem,
  unequipLockerItem,
  type LockerItemDef,
  type UserLockerItem,
  type LockerItemType,
} from '@/app/actions/rewards-store'
import { getUserBadges, getBadges, type BadgeDefinition, type UserBadge } from '@/app/actions/quests'
import Link from 'next/link'

const TYPE_LABELS: Record<LockerItemType, string> = {
  avatar_frame: 'Avatar Frames',
  title: 'Titles',
  card_skin: 'Card Skins',
  flair: 'Flair',
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500/40 text-gray-400',
  rare: 'border-blue-500/40 text-blue-400',
  epic: 'border-purple-500/40 text-purple-400',
  legendary: 'border-amber-500/40 text-amber-400',
}

function formatTimeLeft(isoDate: string): string | null {
  const ms = new Date(isoDate).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 48) return `${Math.floor(hours / 24)}d left`
  if (hours >= 1) return `${hours}h left`
  return `${Math.floor(ms / 60_000)}m left`
}

export default function LockerClient() {
  const { user, profile } = useAuth()
  const lockerEnabled = useFeatureFlag('locker', {
    isBlackCard: profile?.subscriptionStatus === 'active',
    userId: user?.uid,
  })

  const [defs, setDefs] = useState<LockerItemDef[]>([])
  const [userItems, setUserItems] = useState<UserLockerItem[]>([])
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [equipping, setEquipping] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    Promise.all([
      getLockerItemDefs(),
      getUserLocker(user.uid),
      getBadges(),
      getUserBadges(user.uid),
    ]).then(([d, u, b, ub]) => {
      setDefs(d)
      setUserItems(u)
      setBadges(b)
      setUserBadges(ub)
      setLoading(false)
    })
  }, [user])

  const handleEquip = async (itemId: string, itemType: LockerItemType) => {
    if (!user) return
    setEquipping(itemId)
    await equipLockerItem(user.uid, itemId, itemType)
    // Update local state
    const def = defs.find(d => d.id === itemId)
    setUserItems(prev =>
      prev.map(ui => {
        if (ui.itemId === itemId) return { ...ui, equipped: true }
        const uiDef = defs.find(d => d.id === ui.itemId)
        if (uiDef && uiDef.type === def?.type && ui.equipped) return { ...ui, equipped: false }
        return ui
      })
    )
    setEquipping(null)
  }

  const handleUnequip = async (itemId: string) => {
    if (!user) return
    setEquipping(itemId)
    await unequipLockerItem(user.uid, itemId)
    setUserItems(prev => prev.map(ui => ui.itemId === itemId ? { ...ui, equipped: false } : ui))
    setEquipping(null)
  }

  if (!lockerEnabled) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Locker</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Coming Soon</h2>
          <p className="text-white/40 text-sm">Your locker is not yet available.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Locker</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sign In Required</h2>
          <p className="text-white/40 text-sm">Sign in to view your locker.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/30 text-sm animate-pulse">Loading locker…</p>
      </div>
    )
  }

  const ownedItemIds = new Set(userItems.map(ui => ui.itemId))
  const ownedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))
  const badgeMap = new Map(badges.map(b => [b.id, b]))

  // Group locker items by type
  const groupedItems = Object.entries(TYPE_LABELS).map(([type, label]) => {
    const typeDefs = defs.filter(d => d.type === type)
    const owned = typeDefs.filter(d => ownedItemIds.has(d.id))
    const locked = typeDefs.filter(d => !ownedItemIds.has(d.id))
    return { type: type as LockerItemType, label, owned, locked }
  }).filter(g => g.owned.length > 0 || g.locked.length > 0)

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Your Locker</p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Collectibles & Gear</h1>
          <p className="text-white/40 text-sm mt-2">Equip avatar frames, titles, card skins, and flair earned from quests and the rewards store.</p>
        </div>

        {/* Badges Section */}
        {userBadges.length > 0 && (
          <div className="mb-10">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">
              Badges ({userBadges.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {userBadges.map(ub => {
                const def = badgeMap.get(ub.badgeId)
                const colors = RARITY_COLORS[def?.rarity || 'common']
                return (
                  <div
                    key={ub.badgeId}
                    className={`border rounded-lg px-4 py-3 text-center ${colors}`}
                    title={def ? `${def.name}\n${def.description}\n${def.rarity.toUpperCase()}\nEarned: ${new Date(ub.awardedAt).toLocaleDateString()}` : ub.badgeId}
                  >
                    <span className="text-3xl block">{def?.icon || '🏅'}</span>
                    <span className="text-[10px] font-semibold block mt-1.5 truncate max-w-20">
                      {def?.name || ub.badgeId}
                    </span>
                    <span className="text-[9px] text-white/20 block capitalize">{def?.rarity}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Locker Items by Type */}
        {groupedItems.map(group => (
          <div key={group.type} className="mb-10">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">
              {group.label} ({group.owned.length} owned)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Owned items */}
              {group.owned.map(def => {
                const ui = userItems.find(u => u.itemId === def.id)
                const isEquipped = ui?.equipped ?? false
                const isExpired = ui?.expiresAt ? new Date(ui.expiresAt).getTime() < Date.now() : false
                const timeLeft = ui?.expiresAt ? formatTimeLeft(ui.expiresAt) : null
                const colors = RARITY_COLORS[def.rarity]
                return (
                  <div key={def.id} className={`border-2 rounded-xl p-4 text-center transition-colors ${colors} ${isEquipped ? 'bg-white/5' : ''} ${isExpired ? 'opacity-40' : ''}`}>
                    <span className="text-3xl block">{def.icon}</span>
                    <p className="text-xs font-bold text-white mt-2">{def.name}</p>
                    <p className="text-[9px] text-white/20 capitalize mb-1">{def.rarity}</p>
                    {timeLeft && (
                      <p className={`text-[9px] font-bold tracking-wider uppercase mb-2 ${isExpired ? 'text-red-400' : 'text-amber-400/70'}`}>
                        {timeLeft}
                      </p>
                    )}
                    {isExpired ? (
                      <span className="text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded bg-red-500/10 text-red-400/50 border border-red-500/20 inline-block">
                        Expired
                      </span>
                    ) : (
                      <button
                        onClick={() => isEquipped ? handleUnequip(def.id) : handleEquip(def.id, def.type)}
                        disabled={equipping === def.id}
                        className={`text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded transition-colors ${
                          isEquipped
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70'
                        }`}
                      >
                        {equipping === def.id ? '…' : isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    )}
                  </div>
                )
              })}
              {/* Locked items */}
              {group.locked.map(def => (
                <div key={def.id} className="border border-white/5 rounded-xl p-4 text-center opacity-30">
                  <span className="text-3xl block grayscale">🔒</span>
                  <p className="text-xs font-bold text-white/40 mt-2">{def.name}</p>
                  <p className="text-[9px] text-white/10 capitalize">{def.rarity}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedItems.length === 0 && userBadges.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm mb-4">Your locker is empty.</p>
            <Link
              href="/rewards"
              className="text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500/60 hover:text-amber-500 transition-colors"
            >
              Visit the Rewards Store →
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <Link href="/rewards" className="text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500/60 hover:text-amber-500 transition-colors">
            Rewards Store →
          </Link>
          <Link href="/fan-card" className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/30 hover:text-white/50 transition-colors">
            Fan Card →
          </Link>
        </div>
      </div>
    </div>
  )
}
