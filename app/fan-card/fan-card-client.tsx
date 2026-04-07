'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import { getFanCardData, type FanCardData } from '@/app/actions/fan-card'
import QuestBoard from '@/components/quest-board'
import ShareButton from '@/components/share-button'
import Link from 'next/link'

/* ─── shared constants ─── */

const RANK_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  hall_of_fame: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
  champion:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  glow: 'shadow-amber-500/20' },
  contender:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/30',   glow: 'shadow-blue-500/20' },
  rookie:       { bg: 'bg-white/5',       text: 'text-white/50',   border: 'border-white/10',      glow: '' },
}

const RANK_LABELS: Record<string, string> = {
  hall_of_fame: 'Hall of Fame',
  champion: 'Champion',
  contender: 'Contender',
  rookie: 'Rookie',
}

const RANK_THRESHOLDS = [
  { rank: 'rookie', min: 0, label: 'Rookie' },
  { rank: 'contender', min: 5_000, label: 'Contender' },
  { rank: 'champion', min: 25_000, label: 'Champion' },
  { rank: 'hall_of_fame', min: 100_000, label: 'Hall of Fame' },
]

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500/40 text-gray-400',
  rare: 'border-blue-500/40 text-blue-400',
  epic: 'border-purple-500/40 text-purple-400',
  legendary: 'border-amber-500/40 text-amber-400',
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/* ─── Rank progress bar ─── */
function RankProgress({ sp }: { sp: number }) {
  const currentIdx = RANK_THRESHOLDS.reduce((acc, t, i) => (sp >= t.min ? i : acc), 0)
  const current = RANK_THRESHOLDS[currentIdx]
  const next = RANK_THRESHOLDS[currentIdx + 1]

  if (!next) {
    return (
      <div className="mt-3">
        <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase">Max Rank Achieved</p>
        <div className="h-1 bg-purple-500/30 rounded-full mt-1.5">
          <div className="h-full bg-purple-500 rounded-full w-full" />
        </div>
      </div>
    )
  }

  const progress = Math.min(100, Math.round(((sp - current.min) / (next.min - current.min)) * 100))

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/40">{current.label}</span>
        <span className="text-white/30">{formatNum(sp)} / {formatNum(next.min)} SP</span>
        <span className="text-white/40">{next.label}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export default function FanCardClient() {
  const { user, profile } = useAuth()
  const fanCardEnabled = useFeatureFlag('fanCard', {
    isBlackCard: profile?.subscriptionStatus === 'active',
    userId: user?.uid,
  })

  const [data, setData] = useState<FanCardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getFanCardData(user.uid)
      .then(setData)
      .finally(() => setLoading(false))
  }, [user])

  // Not logged in
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Fan Card</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sign in to view your Fan Card</h2>
          <p className="text-white/40 text-sm">Your profile, stats, badges, and quests — all in one place.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/30 text-sm animate-pulse">Loading your Fan Card…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/30 text-sm">Could not load profile data.</p>
      </div>
    )
  }

  const rankStyle = RANK_STYLES[data.rank] || RANK_STYLES.rookie

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ─── Card Header ─── */}
        <div className={`border rounded-xl p-6 sm:p-8 ${rankStyle.border} ${rankStyle.bg} ${rankStyle.glow ? `shadow-lg ${rankStyle.glow}` : ''}`}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${rankStyle.border} overflow-hidden shrink-0 bg-white/5`}>
              {data.photoURL ? (
                <img src={data.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">
                  {(data.displayName || '?')[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight truncate">
                {data.displayName || 'Anonymous'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border} border`}>
                  {RANK_LABELS[data.rank]}
                </span>
                {data.legacyRank && (
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    👑 Legacy
                  </span>
                )}
                {data.subscriptionStatus === 'active' && (
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Black Card
                  </span>
                )}
                {data.isVerified && (
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/30 mt-1.5 tracking-wide">
                Member since {formatDate(data.joinedAt)}
                {data.gymPledge && <> · Pledged to <span className="text-purple-400">{data.gymPledge}</span></>}
              </p>
            </div>
          </div>

          {/* Rank progress */}
          <RankProgress sp={data.skillPoints} />

          {/* Share */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-white/20 tracking-wide">Share your Fan Card</p>
            <ShareButton
              url={`https://www.txmxboxing.com/fan-card/${data.uid}`}
              title={`${data.displayName || 'Anonymous'} — ${RANK_LABELS[data.rank]} | TXMX Fan Card`}
              text={`Check out my TXMX Fan Card! ${data.wins}W-${data.losses}L · ${data.winRate}% win rate · ${formatNum(data.skillPoints)} SP`}
              variant="default"
            />
          </div>
        </div>

        {/* ─── Currency Balances ─── */}
        <div className="grid grid-cols-3 gap-px mt-6 bg-white/5 rounded-lg overflow-hidden">
          {[
            { label: 'Skill Points', value: data.skillPoints, lifetime: data.lifetimeSP, color: 'text-blue-400', icon: '⚡' },
            { label: 'TX-Credits', value: data.txCredits, lifetime: data.lifetimeTC, color: 'text-emerald-400', icon: '💰' },
            { label: 'Loyalty Points', value: data.loyaltyPoints, lifetime: data.lifetimeLP, color: 'text-purple-400', icon: '💎' },
          ].map((c) => (
            <div key={c.label} className="bg-black px-4 py-5 text-center">
              <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-1">{c.icon} {c.label}</p>
              <p className={`text-xl sm:text-2xl font-black tabular-nums ${c.color}`}>{formatNum(c.value)}</p>
              <p className="text-[9px] text-white/20 mt-1 tabular-nums">{formatNum(c.lifetime)} lifetime</p>
            </div>
          ))}
        </div>

        {/* ─── Picks Record ─── */}
        <div className="mt-6 border border-white/10 rounded-lg p-5">
          <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">Prediction Record</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg sm:text-xl font-black tabular-nums text-white">{data.totalPicks}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Total</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black tabular-nums text-green-400">{data.wins}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Wins</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black tabular-nums text-red-400">{data.losses}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Losses</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black tabular-nums text-amber-400">{data.winRate}%</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Win Rate</p>
            </div>
          </div>
          {data.settledPicks > 0 && (
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${data.winRate}%` }} />
              <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - data.winRate}%` }} />
            </div>
          )}
        </div>

        {/* ─── Badges ─── */}
        {data.badges.length > 0 && (
          <div className="mt-6 border border-white/10 rounded-lg p-5">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-4">
              Badges ({data.badges.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {data.badges.map((ub) => {
                const def = ub.definition
                const colors = RARITY_COLORS[def?.rarity || 'common']
                return (
                  <div
                    key={ub.badgeId}
                    className={`border rounded-lg px-3 py-2 text-center ${colors}`}
                    title={def ? `${def.name}\n${def.description}\n${def.rarity.toUpperCase()}` : ub.badgeId}
                  >
                    <span className="text-2xl block">{def?.icon || '🏅'}</span>
                    <span className="text-[9px] font-medium block mt-1 truncate max-w-[72px]">
                      {def?.name || ub.badgeId}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Quests ─── */}
        {fanCardEnabled && (
          <div className="mt-6 border border-white/10 rounded-lg p-5">
            <QuestBoard />
          </div>
        )}

        {/* ─── Quick Links ─── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/picks', label: 'Make Picks', icon: '🎯' },
            { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
            { href: '/pledge', label: 'Gym Pledge', icon: '🏋️' },
            { href: '/scorecard', label: 'Scorecard', icon: '📊' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border border-white/10 rounded-lg px-4 py-3 text-center hover:bg-white/5 transition-colors group"
            >
              <span className="text-xl block mb-1">{link.icon}</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 group-hover:text-white/60 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
