import type { Metadata } from 'next'
import { getFanCardSummary } from '@/app/actions/fan-card'
import Link from 'next/link'

const RANK_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  hall_of_fame: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  champion: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  contender: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  rookie: { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10' },
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
          <p className="text-white/40 text-sm mb-6">This fan card doesn&apos;t exist or the user hasn&apos;t joined yet.</p>
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

        {/* Card Header */}
        <div className={`border rounded-xl p-6 sm:p-8 ${rankStyle.border} ${rankStyle.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${rankStyle.border} overflow-hidden shrink-0 bg-white/5 flex items-center justify-center`}>
              {data.photoURL ? (
                <img src={data.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white/20 text-2xl font-bold">
                  {displayName[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
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
              </div>
              <p className="text-[10px] text-white/30 mt-1.5 tracking-wide">
                Member since {joined}
                {data.gymPledge && <> · Pledged to <span className="text-purple-400">{data.gymPledge}</span></>}
              </p>
            </div>
          </div>
        </div>

        {/* Currency Balances */}
        <div className="grid grid-cols-3 gap-px mt-6 bg-white/5 rounded-lg overflow-hidden">
          {[
            { label: 'Skill Points', value: data.skillPoints, color: 'text-blue-400', icon: '⚡' },
            { label: 'TX-Credits', value: data.txCredits, color: 'text-emerald-400', icon: '💰' },
            { label: 'Loyalty Points', value: data.loyaltyPoints, color: 'text-purple-400', icon: '💎' },
          ].map((c) => (
            <div key={c.label} className="bg-black px-4 py-5 text-center">
              <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-1">{c.icon} {c.label}</p>
              <p className={`text-xl sm:text-2xl font-black tabular-nums ${c.color}`}>{formatNum(c.value)}</p>
            </div>
          ))}
        </div>

        {/* Picks Record */}
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
        </div>

        {/* Badges count */}
        {data.badgeCount > 0 && (
          <div className="mt-6 border border-white/10 rounded-lg p-5 text-center">
            <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mb-2">Badges Earned</p>
            <p className="text-3xl font-black text-amber-400 tabular-nums">{data.badgeCount}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/scorecard"
            className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-6 py-3 rounded-lg text-xs font-bold tracking-[0.2em] uppercase transition-all"
          >
            Join the Scorecard
          </Link>
        </div>
      </div>
    </div>
  )
}
