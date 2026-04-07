'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getOnboardingStatus, seedOnboardingQuests } from '@/app/actions/onboarding'
import { claimQuestReward, type QuestDefinition } from '@/app/actions/quests'

type OnboardingQuest = QuestDefinition & {
  progress: number
  completed: boolean
  claimed: boolean
}

const QUEST_LINKS: Record<string, { href: string; cta: string }> = {
  daily_login: { href: '/scorecard', cta: 'Done' },
  poll_vote: { href: '/polls', cta: 'Vote Now' },
  share: { href: '/scorecard', cta: 'Share' },
  prediction_placed: { href: '/picks', cta: 'Make Pick' },
}

export default function OnboardingChecklist() {
  const { user, refreshProfile } = useAuth()
  const [quests, setQuests] = useState<OnboardingQuest[]>([])
  const [allClaimed, setAllClaimed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      // Ensure onboarding quests exist (idempotent)
      await seedOnboardingQuests()

      const status = await getOnboardingStatus(user.uid)
      setQuests(status.quests)
      setAllClaimed(status.allClaimed)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Check if previously dismissed this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = sessionStorage.getItem('txmx_onboarding_dismissed')
      if (d === 'true') setDismissed(true)
    }
  }, [])

  async function handleClaim(questId: string) {
    if (!user) return
    setClaiming(questId)
    try {
      const result = await claimQuestReward(user.uid, questId)
      if (result.claimed) {
        setQuests(prev =>
          prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
        )
        // Check if all now claimed
        const allNowClaimed = quests.every(q =>
          q.id === questId ? true : q.claimed
        )
        if (allNowClaimed) setAllClaimed(true)
        refreshProfile()
      }
    } catch {
      // silent
    } finally {
      setClaiming(null)
    }
  }

  function handleDismiss() {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('txmx_onboarding_dismissed', 'true')
    }
  }

  // Don't render if: not logged in, loading, no quests, all claimed, or dismissed
  if (!user || loading || quests.length === 0 || allClaimed || dismissed) {
    return null
  }

  const completedCount = quests.filter(q => q.claimed).length
  const progressPercent = Math.round((completedCount / quests.length) * 100)

  return (
    <section className="relative border-t border-b border-white/10 overflow-hidden">
      <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-20 py-12 lg:py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 bg-emerald-500" />
              <p className="text-emerald-500/80 text-[10px] font-bold tracking-[0.25em] uppercase">
                Getting Started
              </p>
            </div>
            <h3 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none mb-2">
              Welcome to the Scorecard
            </h3>
            <p className="text-white/40 text-sm font-semibold">
              Complete these starter quests to learn the platform and earn bonus rewards.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/20 hover:text-white/40 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 mt-1"
          >
            Dismiss
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/30 text-xs font-semibold">
              {completedCount}/{quests.length} complete
            </span>
            <span className="text-emerald-400/60 text-xs font-bold tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quest list */}
        <div className="space-y-0 border-t border-white/10">
          {quests.map(quest => {
            const link = QUEST_LINKS[quest.objective]
            const stepProgress = Math.min(quest.progress, quest.target)

            return (
              <div
                key={quest.id}
                className={`flex items-center gap-4 py-4 border-b border-white/10 ${
                  quest.claimed ? 'opacity-40' : ''
                }`}
              >
                {/* Status icon */}
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                  {quest.claimed ? (
                    <span className="text-emerald-400 text-sm">✓</span>
                  ) : quest.completed ? (
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  ) : (
                    <span className="w-3 h-3 border border-white/20 rounded-full" />
                  )}
                </div>

                {/* Quest info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold tracking-wide ${
                    quest.claimed ? 'text-white/30 line-through' : 'text-white'
                  }`}>
                    {quest.title}
                  </p>
                  <p className="text-white/30 text-xs font-semibold mt-0.5">
                    {quest.description}
                  </p>
                  {/* Progress for multi-step */}
                  {quest.target > 1 && !quest.claimed && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500/50 rounded-full transition-all"
                          style={{ width: `${(stepProgress / quest.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-white/20 text-[10px] font-bold tabular-nums">
                        {stepProgress}/{quest.target}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reward preview */}
                <div className="shrink-0 text-right mr-2">
                  {quest.reward.tc > 0 && (
                    <span className="text-emerald-400 text-xs font-bold">+{quest.reward.tc} TC</span>
                  )}
                  {quest.reward.sp > 0 && (
                    <span className="text-blue-400 text-xs font-bold ml-2">+{quest.reward.sp} SP</span>
                  )}
                </div>

                {/* Action button */}
                <div className="shrink-0">
                  {quest.claimed ? (
                    <span className="text-white/20 text-xs font-semibold">Claimed</span>
                  ) : quest.completed ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      disabled={claiming === quest.id}
                      className="px-4 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                    >
                      {claiming === quest.id ? '…' : 'Claim'}
                    </button>
                  ) : link ? (
                    <Link
                      href={link.href}
                      className="px-4 py-1.5 rounded-full bg-white/5 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white/70 transition-colors"
                    >
                      {link.cta}
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
