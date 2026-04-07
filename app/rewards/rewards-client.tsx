'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import {
  getAvailableRewards,
  redeemReward,
  reserveReward,
  confirmReservation,
  cancelReservation,
  getUserRedemptions,
  type RewardItem,
  type Redemption,
  type Reservation,
} from '@/app/actions/rewards-store'
import { getCreditAccount } from '@/app/actions/credits'
import { getLPAccount } from '@/app/actions/loyalty-points'
import Link from 'next/link'
import UpsellBanner from '@/components/upsell-banner'

const CATEGORY_ICONS: Record<string, string> = {
  avatar: '🎭',
  title: '🏷️',
  badge: '🏅',
  booster: '🚀',
  physical: '📦',
  experience: '🎟️',
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatTimeLeft(until: string): string | null {
  const ms = new Date(until).getTime() - Date.now()
  if (ms <= 0) return null
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 48) return `${Math.floor(hours / 24)}d left`
  if (hours >= 1) return `${hours}h left`
  const mins = Math.floor(ms / 60_000)
  return `${mins}m left`
}

export default function RewardsStoreClient() {
  const { user, profile } = useAuth()
  const storeEnabled = useFeatureFlag('rewardsStore', {
    isBlackCard: profile?.subscriptionStatus === 'active',
    userId: user?.uid,
  })

  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [tcBalance, setTcBalance] = useState(0)
  const [lpBalance, setLpBalance] = useState(0)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [activeHold, setActiveHold] = useState<Reservation | null>(null)
  const [holdCountdown, setHoldCountdown] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    Promise.all([
      getAvailableRewards(),
      getUserRedemptions(user.uid),
      getCreditAccount(user.uid),
      getLPAccount(user.uid),
    ]).then(([r, red, tc, lp]) => {
      setRewards(r)
      setRedemptions(red)
      setTcBalance(tc.balance)
      setLpBalance(lp.balance)
      setLoading(false)
    })
  }, [user])

  // Countdown timer for active hold
  useEffect(() => {
    if (!activeHold) return
    const tick = () => {
      const ms = new Date(activeHold.expiresAt).getTime() - Date.now()
      if (ms <= 0) {
        setActiveHold(null)
        setHoldCountdown('')
        return
      }
      const mins = Math.floor(ms / 60_000)
      const secs = Math.floor((ms % 60_000) / 1000)
      setHoldCountdown(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeHold])

  const handleRedeem = async (reward: RewardItem) => {
    if (!user) return
    const balance = reward.currency === 'tc' ? tcBalance : lpBalance
    const label = reward.currency === 'tc' ? 'TX-Credits' : 'Loyalty Points'
    if (balance < reward.price) {
      setMessage({ type: 'error', text: `Not enough ${label}` })
      return
    }

    const isLimitedStock = reward.stock > 0

    if (isLimitedStock) {
      // Reserve flow: hold the item, then show confirm modal
      setRedeeming(reward.id)
      setMessage(null)
      const result = await reserveReward(user.uid, reward.id, {
        isBlackCard: profile?.subscriptionStatus === 'active',
      })
      if (result.success && result.reservation) {
        setActiveHold(result.reservation)
      } else {
        setMessage({ type: 'error', text: result.error || 'Could not reserve item' })
      }
      setRedeeming(null)
    } else {
      // Unlimited stock: direct redeem
      if (!confirm(`Redeem "${reward.name}" for ${reward.price} ${label}?`)) return
      setRedeeming(reward.id)
      setMessage(null)
      const result = await redeemReward(user.uid, reward.id, {
        isBlackCard: profile?.subscriptionStatus === 'active',
      })
      if (result.success && result.redemption) {
        if (reward.currency === 'tc') setTcBalance(prev => prev - reward.price)
        else setLpBalance(prev => prev - reward.price)
        setRedemptions(prev => [result.redemption!, ...prev])
        setMessage({ type: 'success', text: `"${reward.name}" redeemed!` })
        setRewards(prev => prev.map(r =>
          r.id === reward.id ? { ...r, redeemed: r.redeemed + 1 } : r
        ))
      } else {
        setMessage({ type: 'error', text: result.error || 'Redemption failed' })
      }
      setRedeeming(null)
    }
  }

  const handleConfirmHold = async () => {
    if (!user || !activeHold) return
    setRedeeming(activeHold.rewardId)
    const result = await confirmReservation(user.uid, activeHold.id)
    if (result.success && result.redemption) {
      if (activeHold.currency === 'tc') setTcBalance(prev => prev - activeHold.price)
      else setLpBalance(prev => prev - activeHold.price)
      setRedemptions(prev => [result.redemption!, ...prev])
      setMessage({ type: 'success', text: `"${activeHold.rewardName}" redeemed!` })
      setRewards(prev => prev.map(r =>
        r.id === activeHold.rewardId ? { ...r, redeemed: r.redeemed + 1, reserved: Math.max(0, (r.reserved || 0) - 1) } : r
      ))
    } else {
      setMessage({ type: 'error', text: result.error || 'Confirmation failed' })
    }
    setActiveHold(null)
    setRedeeming(null)
  }

  const handleCancelHold = async () => {
    if (!user || !activeHold) return
    await cancelReservation(user.uid, activeHold.id)
    setRewards(prev => prev.map(r =>
      r.id === activeHold.rewardId ? { ...r, reserved: Math.max(0, (r.reserved || 0) - 1) } : r
    ))
    setActiveHold(null)
  }

  if (!storeEnabled) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Rewards Store</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Coming Soon</h2>
          <p className="text-white/40 text-sm">The Rewards Store is not yet available.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Rewards Store</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sign In Required</h2>
          <p className="text-white/40 text-sm">Sign in to browse and redeem rewards.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/30 text-sm animate-pulse">Loading store…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Rewards Store</p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Spend Your Earnings</h1>
          <p className="text-white/40 text-sm mt-2">Redeem TX-Credits and Loyalty Points for exclusive rewards.</p>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-px bg-white/5 rounded-lg overflow-hidden mb-8">
          <div className="bg-black px-5 py-4 text-center">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-1">💰 TX-Credits</p>
            <p className="text-2xl font-black tabular-nums text-emerald-400">{formatNum(tcBalance)}</p>
          </div>
          <div className="bg-black px-5 py-4 text-center">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-1">💎 Loyalty Points</p>
            <p className="text-2xl font-black tabular-nums text-purple-400">{formatNum(lpBalance)}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        {/* Reservation Hold Modal */}
        {activeHold && (
          <div className="mb-6 border border-amber-500/30 bg-amber-500/5 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] text-amber-400 font-bold tracking-[0.2em] uppercase mb-1">Item Reserved</p>
                <h3 className="text-lg font-bold text-white">{activeHold.rewardName}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Expires in</p>
                <p className="text-xl font-black tabular-nums text-amber-400">{holdCountdown}</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mb-4">
              This item is held for you. Confirm to complete the purchase or cancel to release it.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmHold}
                disabled={redeeming === activeHold.rewardId}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
              >
                {redeeming === activeHold.rewardId ? 'Confirming…' : `Confirm — ${formatNum(activeHold.price)} ${activeHold.currency === 'tc' ? 'TC' : 'LP'}`}
              </button>
              <button
                onClick={handleCancelHold}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Soft upsell for free users with Black Card items */}
        {profile?.subscriptionStatus !== 'active' && rewards.some(r => r.blackCardOnly) && (
          <div className="mb-4">
            <UpsellBanner
              compact
              headline="Exclusive rewards available"
              message="Some items require a Black Card to redeem."
            />
          </div>
        )}

        {/* Rewards Grid — split by lane */}
        {rewards.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-12">No rewards available right now. Check back soon!</p>
        ) : (
          <>
            {/* Standard Lane */}
            {rewards.filter(r => (r.lane ?? 'standard') === 'standard').length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">Rewards</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.filter(r => (r.lane ?? 'standard') === 'standard').map(reward => {
                    const canAfford = reward.currency === 'tc' ? tcBalance >= reward.price : lpBalance >= reward.price
                    const totalClaimed = reward.redeemed + (reward.reserved || 0)
                    const soldOut = reward.stock > 0 && totalClaimed >= reward.stock
                    const remaining = reward.stock > 0 ? reward.stock - totalClaimed : null
                    const timeLeft = reward.availableUntil ? formatTimeLeft(reward.availableUntil) : null
                    const hasActiveHold = activeHold?.rewardId === reward.id
                    return (
                      <div
                        key={reward.id}
                        className={`border rounded-xl p-5 transition-colors ${
                          soldOut ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">{reward.icon || CATEGORY_ICONS[reward.category] || '🎁'}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{reward.name}</h3>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">
                              {reward.category}
                              {reward.blackCardOnly && ' · Black Card'}
                            </p>
                          </div>
                          {timeLeft && (
                            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                              {timeLeft}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mb-4 line-clamp-2">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-lg font-black tabular-nums ${
                              reward.currency === 'tc' ? 'text-emerald-400' : 'text-purple-400'
                            }`}>
                              {formatNum(reward.price)}
                            </span>
                            <span className="text-[10px] text-white/30 ml-1 uppercase">
                              {reward.currency === 'tc' ? 'TC' : 'LP'}
                            </span>
                            {reward.stock > 0 && (
                              <span className="text-[10px] text-white/20 ml-2">
                                {remaining} left
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford || soldOut || redeeming === reward.id || hasActiveHold}
                            className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded transition-colors ${
                              soldOut || hasActiveHold
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                          >
                            {redeeming === reward.id ? 'Reserving…' : hasActiveHold ? 'Held' : soldOut ? 'Sold Out' : canAfford ? (reward.stock > 0 ? 'Reserve' : 'Redeem') : 'Need More'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Premium Lane */}
            {rewards.filter(r => r.lane === 'premium').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-[10px] text-amber-400 font-bold tracking-[0.2em] uppercase">⭐ Premium Collection</p>
                  {profile?.subscriptionStatus !== 'active' && (
                    <span className="text-[9px] font-bold tracking-wider uppercase text-white/20 bg-white/5 border border-white/10 px-2 py-0.5 rounded">🔒 Black Card</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.filter(r => r.lane === 'premium').map(reward => {
                    const canAfford = reward.currency === 'tc' ? tcBalance >= reward.price : lpBalance >= reward.price
                    const totalClaimed = reward.redeemed + (reward.reserved || 0)
                    const soldOut = reward.stock > 0 && totalClaimed >= reward.stock
                    const remaining = reward.stock > 0 ? reward.stock - totalClaimed : null
                    const timeLeft = reward.availableUntil ? formatTimeLeft(reward.availableUntil) : null
                    const hasActiveHold = activeHold?.rewardId === reward.id
                    const isBlackCard = profile?.subscriptionStatus === 'active'
                    return (
                      <div
                        key={reward.id}
                        className={`border rounded-xl p-5 transition-colors ${
                          soldOut ? 'border-amber-500/5 opacity-50'
                            : isBlackCard ? 'border-amber-500/20 hover:border-amber-500/40 bg-amber-500/[0.02]'
                            : 'border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">{reward.icon || CATEGORY_ICONS[reward.category] || '🎁'}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{reward.name}</h3>
                            <p className="text-[10px] text-amber-400/50 uppercase tracking-wider">
                              {reward.category} · Premium
                            </p>
                          </div>
                          {timeLeft && (
                            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                              {timeLeft}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mb-4 line-clamp-2">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-lg font-black tabular-nums ${
                              reward.currency === 'tc' ? 'text-emerald-400' : 'text-purple-400'
                            }`}>
                              {formatNum(reward.price)}
                            </span>
                            <span className="text-[10px] text-white/30 ml-1 uppercase">
                              {reward.currency === 'tc' ? 'TC' : 'LP'}
                            </span>
                            {reward.stock > 0 && (
                              <span className="text-[10px] text-white/20 ml-2">
                                {remaining} left
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford || soldOut || redeeming === reward.id || hasActiveHold}
                            className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded transition-colors ${
                              soldOut || hasActiveHold
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                          >
                            {redeeming === reward.id ? 'Reserving…' : hasActiveHold ? 'Held' : soldOut ? 'Sold Out' : canAfford ? (reward.stock > 0 ? 'Reserve' : 'Redeem') : 'Need More'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Recent Redemptions */}
        {redemptions.length > 0 && (
          <div className="mt-12">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">Recent Redemptions</p>
            <div className="space-y-2">
              {redemptions.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between border border-white/5 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{r.rewardName}</p>
                    <p className="text-[10px] text-white/20">{new Date(r.redeemedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${
                    r.currency === 'tc' ? 'text-emerald-400' : 'text-purple-400'
                  }`}>
                    -{formatNum(r.price)} {r.currency === 'tc' ? 'TC' : 'LP'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to locker */}
        <div className="mt-8 text-center">
          <Link
            href="/locker"
            className="text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500/60 hover:text-amber-500 transition-colors"
          >
            View Your Locker →
          </Link>
        </div>

      </div>
    </div>
  )
}
