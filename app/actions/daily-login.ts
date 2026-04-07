'use server'

import { awardCredits } from './credits'
import { awardDailyEngagementSP } from './skill-points'
import { getEconomyConfig } from './economy'
import { incrementQuestProgress } from './quests'
import { getUserByUid } from './users'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function claimDailyLogin(userId: string) {
  const date = todayKey()
  const idempotencyKey = `daily_login:${userId}:${date}`

  const config = await getEconomyConfig()
  const user = await getUserByUid(userId)
  const isBlackCard = user?.subscriptionStatus === 'active'

  // Apply subscriber multiplier to daily login reward
  const baseReward = config.dailyLoginReward
  const multiplier = isBlackCard && config.subscriberMultiplier > 1 ? config.subscriberMultiplier : 1
  const reward = Math.max(1, Math.floor(baseReward * multiplier))

  const result = await awardCredits(
    userId,
    reward,
    `Daily login reward — ${date}`,
    idempotencyKey,
    { source: 'daily_login', date, ...(multiplier > 1 ? { subscriberMultiplier: multiplier } : {}) }
  )

  // Award SP via ledger (idempotent — separate key)
  if (!result.idempotent) {
    const spKey = `daily_login_sp:${userId}:${date}`
    try {
      await awardDailyEngagementSP(userId, 5, spKey, { date })
    } catch {
      // SP award failure doesn't break daily login
    }
  }

  // Track quest progress for daily login
  if (!result.idempotent) {
    try {
      await incrementQuestProgress(userId, 'daily_login')
    } catch {
      // Quest tracking failure is non-critical
    }
  }

  return {
    success: true,
    alreadyClaimed: result.idempotent ?? false,
    reward,
    balance: result.balance,
  }
}
