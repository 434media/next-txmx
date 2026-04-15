'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import { getFanCardData, type FanCardData } from '@/app/actions/fan-card'
import { updateUserPhoto } from '@/app/actions/users'
import QuestBoard from '@/components/quest-board'
import ShareButton from '@/components/share-button'
import Link from 'next/link'

/* ─── Constants ─── */

const TXMX_LOGO = 'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg'

const RANK_STYLES: Record<string, { bg: string; text: string; border: string; glow: string; accent: string }> = {
  hall_of_fame: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20', accent: 'from-purple-600 to-purple-400' },
  champion:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/30',  glow: 'shadow-amber-500/20',  accent: 'from-amber-600 to-amber-400' },
  contender:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/30',   glow: 'shadow-blue-500/20',   accent: 'from-blue-600 to-blue-400' },
  rookie:       { bg: 'bg-white/5',       text: 'text-white/50',   border: 'border-white/10',      glow: '',                      accent: 'from-zinc-600 to-zinc-400' },
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

function formatCardNumber(uid: string): string {
  const hash = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12)
  return hash.match(/.{1,4}/g)?.join(' · ') || uid.slice(0, 12)
}

/* ─── Rank Progress ─── */
function RankProgress({ sp, rankStyle }: { sp: number; rankStyle: typeof RANK_STYLES.rookie }) {
  const currentIdx = RANK_THRESHOLDS.reduce((acc, t, i) => (sp >= t.min ? i : acc), 0)
  const current = RANK_THRESHOLDS[currentIdx]
  const next = RANK_THRESHOLDS[currentIdx + 1]

  if (!next) {
    return (
      <div className="mt-5">
        <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase mb-2">Max Rank Achieved</p>
        <div className="h-1.5 bg-purple-500/20 rounded-full">
          <div className="h-full bg-linear-to-r from-purple-600 to-purple-400 rounded-full w-full" />
        </div>
      </div>
    )
  }

  const progress = Math.min(100, Math.round(((sp - current.min) / (next.min - current.min)) * 100))

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-[10px] mb-2">
        <span className="text-white/50 font-semibold">{current.label}</span>
        <span className="text-white/40 font-semibold tabular-nums">{formatNum(sp)} / {formatNum(next.min)} SP</span>
        <span className="text-white/50 font-semibold">{next.label}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-linear-to-r ${rankStyle.accent} rounded-full transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Photo Upload ─── */
function PhotoUpload({
  currentPhoto,
  displayName,
  rankStyle,
  onPhotoUpdated,
}: {
  currentPhoto: string | null
  displayName: string
  rankStyle: typeof RANK_STYLES.rookie
  onPhotoUpdated: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'fan-cards')

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      await updateUserPhoto(user.uid, url)
      onPhotoUpdated(url)
    } catch {
      // silently fail — upload is non-critical
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 ${rankStyle.border} overflow-hidden shrink-0 bg-white/5 group cursor-pointer`}
    >
      {currentPhoto ? (
        <img src={currentPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/25 text-3xl font-black">
          {(displayName || '?')[0].toUpperCase()}
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </button>
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
          <Image src={TXMX_LOGO} alt="TXMX" width={48} height={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Fan Card</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Sign in to view your Fan Card</h2>
          <p className="text-white/50 text-sm font-medium leading-relaxed">Your profile, stats, badges, and quests — all in one place.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/40 text-sm font-medium animate-pulse">Loading your Fan Card…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <p className="text-white/40 text-sm font-medium">Could not load profile data.</p>
      </div>
    )
  }

  const rankStyle = RANK_STYLES[data.rank] || RANK_STYLES.rookie

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-white/40">
            <li>
              <Link href="/scorecard" className="hover:text-white/70 transition-colors">
                Scorecard
              </Link>
            </li>
            <li className="text-white/15">/</li>
            <li className="text-amber-500/70">Fan Card</li>
          </ol>
        </nav>

        {/* ═══════════════════════════════════════════════════
            MEMBERSHIP CARD
            ═══════════════════════════════════════════════════ */}
        <div className={`relative border ${rankStyle.border} rounded-2xl overflow-hidden ${rankStyle.glow ? `shadow-xl ${rankStyle.glow}` : ''}`}>
          {/* Top accent bar */}
          <div className={`h-1 bg-linear-to-r ${rankStyle.accent}`} />

          {/* Card background */}
          <div className="relative bg-linear-to-br from-zinc-950 via-black to-zinc-950 p-6 sm:p-8">
            {/* Watermark logo */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-[0.04]">
              <Image src={TXMX_LOGO} alt="" width={120} height={120} className="select-none pointer-events-none" />
            </div>

            {/* Card header: Logo + Member type */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Image src={TXMX_LOGO} alt="TXMX" width={28} height={28} className="opacity-80" />
                <div>
                  <p className="text-white/90 text-xs font-black tracking-[0.3em] uppercase leading-none">TXMX Boxing</p>
                  <p className="text-amber-500/60 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
                    {data.subscriptionStatus === 'active' ? 'Black Card Member' : 'Fan Card'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-2.5 py-1 rounded-md ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border} border`}>
                {RANK_LABELS[data.rank]}
              </span>
            </div>

            {/* Member info row */}
            <div className="flex items-start gap-5 relative z-10">
              {/* Photo with upload */}
              <PhotoUpload
                currentPhoto={data.photoURL}
                displayName={data.displayName || 'A'}
                rankStyle={rankStyle}
                onPhotoUpdated={(url) => setData(d => d ? { ...d, photoURL: url } : d)}
              />

              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight truncate leading-tight">
                  {data.displayName || 'Anonymous'}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {data.legacyRank && (
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      👑 Legacy
                    </span>
                  )}
                  {data.subscriptionStatus === 'active' && (
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Black Card
                    </span>
                  )}
                  {data.isVerified && (
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/45 font-medium">
                  <span>Member since {formatDate(data.joinedAt)}</span>
                  {data.gymPledgeName && (
                    <>
                      <span className="text-white/15">|</span>
                      <span>Pledged to <span className="text-purple-400 font-semibold">{data.gymPledgeName}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rank progress */}
            <RankProgress sp={data.skillPoints} rankStyle={rankStyle} />

            {/* Card number + share row */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
              <p className="text-[10px] text-white/25 font-mono tracking-[0.15em]">
                {formatCardNumber(data.uid)}
              </p>
              <ShareButton
                url={`https://www.txmxboxing.com/fan-card/${data.uid}`}
                title={`${data.displayName || 'Anonymous'} — ${RANK_LABELS[data.rank]} | TXMX Fan Card`}
                text={`Check out my TXMX Fan Card! ${data.wins}W-${data.losses}L · ${data.winRate}% win rate · ${formatNum(data.skillPoints)} SP`}
                variant="default"
              />
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className={`h-0.5 bg-linear-to-r ${rankStyle.accent} opacity-50`} />
        </div>

        {/* ═══ Currency Balances ═══ */}
        <div className="grid grid-cols-3 gap-px mt-8 bg-white/5 rounded-xl overflow-hidden">
          {[
            { label: 'Skill Points', value: data.skillPoints, lifetime: data.lifetimeSP, color: 'text-blue-400', icon: '⚡' },
            { label: 'TX-Credits', value: data.txCredits, lifetime: data.lifetimeTC, color: 'text-emerald-400', icon: '💰' },
            { label: 'Loyalty Points', value: data.loyaltyPoints, lifetime: data.lifetimeLP, color: 'text-purple-400', icon: '💎' },
          ].map((c) => (
            <div key={c.label} className="bg-black px-4 py-5 text-center">
              <p className="text-[10px] text-white/40 font-bold tracking-[0.15em] uppercase mb-1.5">{c.icon} {c.label}</p>
              <p className={`text-xl sm:text-2xl font-black tabular-nums ${c.color}`}>{formatNum(c.value)}</p>
              <p className="text-[10px] text-white/25 mt-1 tabular-nums font-medium">{formatNum(c.lifetime)} lifetime</p>
            </div>
          ))}
        </div>

        {/* ═══ Prediction Record ═══ */}
        <div className="mt-6 border border-white/10 rounded-xl p-5">
          <p className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase mb-4">Prediction Record</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-white">{data.totalPicks}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">Total</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-emerald-400">{data.wins}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">Wins</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-red-400">{data.losses}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">Losses</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black tabular-nums text-amber-400">{data.winRate}%</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">Win Rate</p>
            </div>
          </div>
          {data.settledPicks > 0 && (
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${data.winRate}%` }} />
              <div className="h-full bg-red-500 rounded-r-full transition-all" style={{ width: `${100 - data.winRate}%` }} />
            </div>
          )}
        </div>

        {/* ═══ Badges ═══ */}
        {data.badges.length > 0 && (
          <div className="mt-6 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase mb-4">
              Badges ({data.badges.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {data.badges.map((ub) => {
                const def = ub.definition
                const colors = RARITY_COLORS[def?.rarity || 'common']
                return (
                  <div
                    key={ub.badgeId}
                    className={`border rounded-lg px-3.5 py-2.5 text-center ${colors}`}
                    title={def ? `${def.name}\n${def.description}\n${def.rarity.toUpperCase()}` : ub.badgeId}
                  >
                    <span className="text-2xl block">{def?.icon || '🏅'}</span>
                    <span className="text-[10px] font-semibold block mt-1.5 truncate max-w-20">
                      {def?.name || ub.badgeId}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ Quests ═══ */}
        {fanCardEnabled && (
          <div className="mt-6 border border-white/10 rounded-xl p-5">
            <QuestBoard />
          </div>
        )}

        {/* ═══ Quick Links ═══ */}
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
              className="border border-white/10 rounded-xl px-4 py-3.5 text-center hover:bg-white/5 hover:border-white/15 transition-all group"
            >
              <span className="text-xl block mb-1.5">{link.icon}</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50 group-hover:text-white/70 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
