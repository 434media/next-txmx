import type { Metadata } from 'next'
import Image from 'next/image'
import { getFanCardSummary } from '@/app/actions/fan-card'
import Link from 'next/link'

const TXMX_LOGO = 'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/TXMXBack.svg'

const RANK_STYLES: Record<string, { bg: string; text: string; border: string; glow: string; accent: string }> = {
  hall_of_fame: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20', accent: 'from-purple-600 to-purple-400' },
  champion: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20', accent: 'from-amber-600 to-amber-400' },
  contender: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', accent: 'from-blue-600 to-blue-400' },
  rookie: { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10', glow: '', accent: 'from-zinc-600 to-zinc-400' },
}

const RANK_LABELS: Record<string, string> = {
  hall_of_fame: 'Hall of Fame',
  champion: 'Champion',
  contender: 'Contender',
  rookie: 'Rookie',
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params
  const data = await getFanCardSummary(userId)

  if (!data) {
    return { title: 'Fan Card Not Found | TXMX Boxing' }
  }

  const name = data.displayName || 'Anonymous'
  const rank = RANK_LABELS[data.rank] || 'Rookie'

  return {
    title: `${name} — ${rank} | TXMX Fan Card`,
    description: `${name} is a ${rank} on TXMX Boxing with ${formatNum(data.skillPoints)} SP, a ${data.winRate}% win rate, and ${data.badgeCount} badges.`,
    openGraph: {
      title: `${name} — ${rank} | TXMX Fan Card`,
      description: `${data.wins}W-${data.losses}L · ${data.winRate}% win rate · ${formatNum(data.skillPoints)} SP`,
      url: `https://www.txmxboxing.com/fan-card/${userId}`,
      siteName: 'TXMX Boxing',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${rank} | TXMX Fan Card`,
      description: `${data.wins}W-${data.losses}L · ${data.winRate}% win rate · ${formatNum(data.skillPoints)} SP`,
    },
  }
}

export default async function PublicFanCardPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const data = await getFanCardSummary(userId)

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
        <div className="text-center max-w-sm px-6">
          <p className="text-amber-500/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Fan Card</p>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Profile Not Found</h2>
          <p className="text-white/50 text-sm font-medium mb-6">This fan card doesn&apos;t exist or the user hasn&apos;t joined yet.</p>
          <Link
            href="/scorecard"
            className="text-amber-400 text-xs font-bold tracking-wider uppercase hover:text-amber-300 transition-colors"
          >
            ← Back to Scorecard
          </Link>
        </div>
      </div>
    )
  }

  const rankStyle = RANK_STYLES[data.rank] || RANK_STYLES.rookie
  const displayName = data.displayName || 'Anonymous'
  const joined = new Date(data.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Membership Card */}
        <div className={`relative border ${rankStyle.border} rounded-2xl overflow-hidden ${rankStyle.glow ? `shadow-xl ${rankStyle.glow}` : ''}`}>
          <div className={`h-1 bg-linear-to-r ${rankStyle.accent}`} />
          <div className="relative bg-linear-to-br from-zinc-950 via-black to-zinc-950 p-6 sm:p-8">
            {/* Watermark */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-[0.04]">
              <Image src={TXMX_LOGO} alt="" width={120} height={120} className="select-none pointer-events-none" />
            </div>

            {/* Card header */}
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

            {/* Member info */}
            <div className="flex items-start gap-5 relative z-10">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 ${rankStyle.border} overflow-hidden shrink-0 bg-white/5 flex items-center justify-center`}>
                {data.photoURL ? (
                  <img src={data.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white/25 text-3xl font-black">
                    {displayName[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight truncate leading-tight">
                  {displayName}
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
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/45 font-medium">
                  <span>Member since {joined}</span>
                  {data.gymPledgeName && (
                    <>
                      <span className="text-white/15">|</span>
                      <span>Pledged to <span className="text-purple-400 font-semibold">{data.gymPledgeName}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Card number */}
            <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
              <p className="text-[10px] text-white/25 font-mono tracking-[0.15em]">
                {userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12).match(/.{1,4}/g)?.join(' · ')}
              </p>
            </div>
          </div>
          <div className={`h-0.5 bg-linear-to-r ${rankStyle.accent} opacity-50`} />
        </div>

        {/* Currency Balances */}
        <div className="grid grid-cols-3 gap-px mt-8 bg-white/5 rounded-xl overflow-hidden">
          {[
            { label: 'Skill Points', value: data.skillPoints, color: 'text-blue-400', icon: '⚡' },
            { label: 'TX-Credits', value: data.txCredits, color: 'text-emerald-400', icon: '💰' },
            { label: 'Loyalty Points', value: data.loyaltyPoints, color: 'text-purple-400', icon: '💎' },
          ].map((c) => (
            <div key={c.label} className="bg-black px-4 py-5 text-center">
              <p className="text-[10px] text-white/40 font-bold tracking-[0.15em] uppercase mb-1.5">{c.icon} {c.label}</p>
              <p className={`text-xl sm:text-2xl font-black tabular-nums ${c.color}`}>{formatNum(c.value)}</p>
            </div>
          ))}
        </div>

        {/* Picks Record */}
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
        </div>

        {/* Badges count */}
        {data.badgeCount > 0 && (
          <div className="mt-6 border border-white/10 rounded-xl p-5 text-center">
            <p className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Badges Earned</p>
            <p className="text-3xl font-black text-amber-400 tabular-nums">{data.badgeCount}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/scorecard"
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-6 py-3 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all"
          >
            Join the Scorecard
          </Link>
        </div>
      </div>
    </div>
  )
}
