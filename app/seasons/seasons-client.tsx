'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import {
  getActiveSeason,
  getSeasonalLeaderboard,
  getUserSeasonHistory,
  type Season,
  type SeasonalEntry,
  type SeasonSummary,
} from '@/app/actions/seasons'

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

function formatSP(sp: number): string {
  if (sp >= 1_000_000) return `${(sp / 1_000_000).toFixed(1)}M`
  if (sp >= 1_000) return `${(sp / 1_000).toFixed(1)}K`
  return sp.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SeasonsClient() {
  const { user, profile } = useAuth()
  const isBlackCard = profile?.subscriptionStatus === 'active'
  const enabled = useFeatureFlag('seasons', { isBlackCard })

  const [season, setSeason] = useState<Season | null>(null)
  const [leaderboard, setLeaderboard] = useState<SeasonalEntry[]>([])
  const [history, setHistory] = useState<SeasonSummary[]>([])
  const [tab, setTab] = useState<'current' | 'history'>('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const activeSeason = await getActiveSeason()
        setSeason(activeSeason)

        if (activeSeason) {
          const lb = await getSeasonalLeaderboard(activeSeason.id, 100)
          setLeaderboard(lb)
        }

        if (user) {
          const h = await getUserSeasonHistory(user.uid)
          setHistory(h)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (!enabled) {
    return (
      <div className="text-center py-24">
        <p className="text-white/40 text-sm">Seasons coming soon.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-24">
        <p className="text-white/40 text-sm animate-pulse">Loading seasonal data...</p>
      </div>
    )
  }

  // Find current user in leaderboard
  const userPosition = user ? leaderboard.findIndex(e => e.userId === user.uid) : -1
  const userEntry = userPosition >= 0 ? leaderboard[userPosition] : null

  return (
    <div className="space-y-10">
      {/* Season Header */}
      {season ? (
        <div className="border border-white/10 rounded-xl p-6 bg-white/2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Current Season</p>
              <h2 className="text-white text-2xl font-bold tracking-wide">{season.name}</h2>
              {season.description && (
                <p className="text-white/50 text-sm mt-1 max-w-lg">{season.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-white/30 text-xs">
                {formatDate(season.startDate)} — {formatDate(season.endDate)}
              </p>
              {(() => {
                const now = new Date()
                const end = new Date(season.endDate)
                const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000))
                return (
                  <p className="text-amber-400 text-sm font-bold mt-1">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Final day'}
                  </p>
                )
              })()}
            </div>
          </div>

          {/* User's Seasonal Position */}
          {userEntry && (
            <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-6">
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Your Position</p>
                <p className="text-amber-400 text-2xl font-bold">#{userPosition + 1}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase">Season SP</p>
                <p className="text-blue-400 text-2xl font-bold">{formatSP(userEntry.spEarned)}</p>
              </div>
            </div>
          )}

          {/* Reward Tiers */}
          {season.rewardTiers && season.rewardTiers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase mb-2">Reward Tiers</p>
              <div className="flex flex-wrap gap-3">
                {season.rewardTiers.map((tier, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg border border-white/10 bg-white/3 text-xs">
                    <span className="text-white/70 font-semibold">{tier.label}</span>
                    <span className="text-white/30 ml-1">
                      #{tier.minPosition}{tier.maxPosition > tier.minPosition ? `–${tier.maxPosition}` : ''}
                    </span>
                    <span className="text-white/20 mx-1.5">·</span>
                    {tier.tcReward > 0 && <span className="text-emerald-400">{tier.tcReward} TC</span>}
                    {tier.tcReward > 0 && tier.lpReward > 0 && <span className="text-white/20 mx-1">+</span>}
                    {tier.lpReward > 0 && <span className="text-purple-400">{tier.lpReward} LP</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl p-8 bg-white/2 text-center">
          <p className="text-white/40 text-sm">No active season right now.</p>
          <p className="text-white/25 text-xs mt-1">Check back soon for the next season.</p>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-2">
        <button
          onClick={() => setTab('current')}
          className={`text-xs font-bold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${
            tab === 'current' ? 'border-amber-400 text-white' : 'border-transparent text-white/30 hover:text-white/60'
          }`}
        >
          Standings
        </button>
        {user && (
          <button
            onClick={() => setTab('history')}
            className={`text-xs font-bold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${
              tab === 'history' ? 'border-amber-400 text-white' : 'border-transparent text-white/30 hover:text-white/60'
            }`}
          >
            Past Seasons ({history.length})
          </button>
        )}
      </div>

      {/* Current Season Leaderboard */}
      {tab === 'current' && season && (
        <div className="border border-white/8 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-white/3 border-b border-white/8">
            <div className="col-span-1 text-white/40 text-[10px] font-bold tracking-widest uppercase">#</div>
            <div className="col-span-5 text-white/40 text-[10px] font-bold tracking-widest uppercase">User</div>
            <div className="col-span-3 text-white/40 text-[10px] font-bold tracking-widest uppercase">Rank</div>
            <div className="col-span-3 text-right text-white/40 text-[10px] font-bold tracking-widest uppercase">Season SP</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {leaderboard.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-white/30 text-sm">No entries yet this season.</p>
              </div>
            )}
            {leaderboard.map((entry, i) => {
              const position = i + 1
              const style = RANK_STYLES[entry.rank] || RANK_STYLES.rookie
              const isCurrentUser = user && entry.userId === user.uid

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors ${
                    position <= 3 ? 'bg-white/2' : ''
                  } ${isCurrentUser ? 'ring-1 ring-amber-500/30 bg-amber-500/5' : ''}`}
                >
                  <div className="col-span-2 sm:col-span-1">
                    <span className={`text-sm font-bold tabular-nums ${
                      position === 1 ? 'text-amber-400' :
                      position === 2 ? 'text-white/70' :
                      position === 3 ? 'text-amber-600' :
                      'text-white/30'
                    }`}>
                      {position}
                    </span>
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {entry.photoURL ? (
                        <img src={entry.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-white/30 text-xs font-bold">
                          {(entry.displayName || '?')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm font-semibold leading-snug truncate">
                      {entry.displayName || 'Anonymous'}
                      {isCurrentUser && <span className="text-amber-400 text-[10px] ml-1.5">(you)</span>}
                    </p>
                  </div>

                  <div className="col-span-4 sm:col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${style.border} ${style.bg} ${style.text}`}>
                      {RANK_LABELS[entry.rank] || 'Rookie'}
                    </span>
                  </div>

                  <div className="col-span-12 sm:col-span-3 text-right">
                    <p className="text-white/80 text-sm font-bold tabular-nums leading-6">
                      {formatSP(entry.spEarned)} <span className="text-white/30 text-xs font-medium">SP</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'current' && !season && (
        <p className="text-white/30 text-sm text-center py-6">No active season to show standings for.</p>
      )}

      {/* Past Seasons */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">No completed seasons yet.</p>
          )}
          {history.map(s => (
            <div key={s.seasonId} className="border border-white/10 rounded-xl p-5 bg-white/2 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-white font-semibold text-sm">{s.seasonName}</p>
                <p className="text-white/30 text-xs mt-0.5">
                  Finished #{s.finalPosition} · {formatSP(s.spEarned)} SP
                </p>
              </div>
              <div className="flex items-center gap-3">
                {s.rewardsClaimed && (
                  <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase">Rewards Claimed</span>
                )}
                {!s.rewardsClaimed && (
                  <span className="text-white/20 text-[10px] font-bold tracking-wider uppercase">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
