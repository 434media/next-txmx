'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useFeatureFlag } from '@/lib/use-feature-flag'
import {
  getActiveQuests,
  getUserQuestProgress,
  claimQuestReward,
  getUserBadges,
  getBadges,
  type QuestDefinition,
  type QuestProgress,
  type BadgeDefinition,
  type UserBadge,
} from '@/app/actions/quests'
import { getActiveSeason } from '@/app/actions/seasons'

const OBJECTIVE_LABELS: Record<string, string> = {
  daily_login: 'Daily Login',
  poll_vote: 'Vote in Polls',
  prediction_placed: 'Place Predictions',
  prediction_won: 'Win Predictions',
  share: 'Share Content',
  login_streak: 'Login Streak',
  props_settled: 'Props Settled',
  custom: 'Challenge',
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-400 text-gray-400',
  rare: 'border-blue-400 text-blue-400',
  epic: 'border-purple-400 text-purple-400',
  legendary: 'border-amber-400 text-amber-400',
}

export default function QuestBoard() {
  const { user, profile } = useAuth()
  const questsEnabled = useFeatureFlag('quests', {
    isBlackCard: profile?.subscriptionStatus === 'active',
    userId: user?.uid,
  })

  const [quests, setQuests] = useState<QuestDefinition[]>([])
  const [progress, setProgress] = useState<Map<string, QuestProgress>>(new Map())
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)
  const [seasonName, setSeasonName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!questsEnabled || !user) return
    let cancelled = false

    async function load() {
      const activeSeason = await getActiveSeason()
      const [activeQuests, userProgress, allBadges, ownedBadges] = await Promise.all([
        getActiveQuests(activeSeason?.id ?? null),
        getUserQuestProgress(user!.uid),
        getBadges(),
        getUserBadges(user!.uid),
      ])

      if (cancelled) return
      setQuests(activeQuests)
      if (activeSeason) setSeasonName(activeSeason.name)
      const pMap = new Map<string, QuestProgress>()
      for (const p of userProgress) pMap.set(p.questId, p)
      setProgress(pMap)
      setBadges(allBadges)
      setUserBadges(ownedBadges)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [questsEnabled, user])

  if (!questsEnabled) return null
  if (!user) return null

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500 text-sm animate-pulse">
        Loading quests…
      </div>
    )
  }

  const handleClaim = async (questId: string) => {
    setClaiming(questId)
    const result = await claimQuestReward(user.uid, questId)
    if (result.claimed) {
      // Refresh progress
      const updated = await getUserQuestProgress(user.uid)
      const pMap = new Map<string, QuestProgress>()
      for (const p of updated) pMap.set(p.questId, p)
      setProgress(pMap)
      // Refresh badges
      const newBadges = await getUserBadges(user.uid)
      setUserBadges(newBadges)
    }
    setClaiming(null)
  }

  const badgeMap = new Map(badges.map(b => [b.id, b]))
  const ownedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))

  return (
    <div className="space-y-8">
      {/* Quest list */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase mb-4">
          Active Quests
        </h3>
        {quests.length === 0 ? (
          <p className="text-sm text-gray-500">No active quests right now. Check back soon!</p>
        ) : (
          <div className="space-y-3">
            {quests.map(quest => {
              const p = progress.get(quest.id)
              const current = p?.progress ?? 0
              const pct = Math.min(100, Math.round((current / quest.target) * 100))
              const completed = p?.completed ?? false
              const claimed = !!p?.claimedAt

              return (
                <div
                  key={quest.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    claimed
                      ? 'border-green-700/50 bg-green-950/20'
                      : completed
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-gray-800 bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white">{quest.title}</span>
                        {quest.blackCardOnly && (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            Black Card
                          </span>
                        )}
                        {quest.seasonId && seasonName && (
                          <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            {seasonName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{quest.description}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {OBJECTIVE_LABELS[quest.objective] || quest.objective} — {current}/{quest.target}
                      </p>
                    </div>

                    {/* Rewards preview */}
                    <div className="text-right shrink-0 space-y-0.5">
                      {quest.reward.sp > 0 && (
                        <p className="text-[10px] text-gray-500">+{quest.reward.sp} SP</p>
                      )}
                      {quest.reward.tc > 0 && (
                        <p className="text-[10px] text-amber-500">+{quest.reward.tc} TC</p>
                      )}
                      {quest.reward.lp > 0 && (
                        <p className="text-[10px] text-blue-400">+{quest.reward.lp} LP</p>
                      )}
                      {quest.reward.badgeId && (
                        <p className="text-[10px] text-purple-400">🏅 Badge</p>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          claimed ? 'bg-green-500' : completed ? 'bg-amber-500' : 'bg-gray-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim button */}
                  {completed && !claimed && (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      disabled={claiming === quest.id}
                      className="mt-3 text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50"
                    >
                      {claiming === quest.id ? 'Claiming…' : 'Claim Reward'}
                    </button>
                  )}
                  {claimed && (
                    <p className="mt-2 text-[10px] text-green-500 font-medium tracking-wider uppercase">
                      ✓ Claimed
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Badge showcase */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase mb-4">
            Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {badges.map(badge => {
              const owned = ownedBadgeIds.has(badge.id)
              const colors = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common
              return (
                <div
                  key={badge.id}
                  className={`border rounded-lg px-3 py-2 text-center transition-opacity ${colors} ${
                    owned ? 'opacity-100' : 'opacity-30'
                  }`}
                  title={`${badge.name} — ${badge.description}\n${badge.rarity.toUpperCase()}`}
                >
                  <span className="text-2xl block">{badge.icon}</span>
                  <span className="text-[10px] font-medium block mt-1 truncate max-w-20">
                    {badge.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
