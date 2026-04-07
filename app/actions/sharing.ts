'use server'

import { awardCredits } from './credits'
import { checkCategoryCap, recordEarningAction } from './rate-limiter'
import { getEconomyConfig } from './economy'
import { incrementQuestProgress } from './quests'
import { getUserByUid } from './users'

export async function awardShareCredits(
  userId: string,
  platform: string,
  sharedUrl: string
): Promise<{ awarded: boolean; error?: string }> {
  if (!userId || !platform || !sharedUrl) {
    return { awarded: false }
  }

  const config = await getEconomyConfig()

  // Check daily share cap
  if (config.dailyShareLimit > 0) {
    const catResult = await checkCategoryCap(userId, 'shares', config.dailyShareLimit)
    if (!catResult.allowed) {
      return { awarded: false, error: catResult.reason }
    }
  }

  // Apply subscriber multiplier
  const user = await getUserByUid(userId)
  const isBlackCard = user?.subscriptionStatus === 'active'
  const multiplier = isBlackCard && config.subscriberMultiplier > 1 ? config.subscriberMultiplier : 1
  const reward = Math.max(1, Math.floor(config.shareReward * multiplier))

  // Idempotency: one reward per user per URL per day
  const today = new Date().toISOString().split('T')[0]
  const idempotencyKey = `share:${userId}:${sharedUrl}:${today}`

  try {
    const result = await awardCredits(
      userId,
      reward,
      `Social share (${platform})`,
      idempotencyKey,
      { platform, sharedUrl, ...(multiplier > 1 ? { subscriberMultiplier: multiplier } : {}) }
    )

    if (!result.idempotent) {
      try {
        await recordEarningAction(userId, {
          tcAmount: reward,
          category: 'shares',
        })
      } catch {
        // Non-critical
      }
    }

    if (!result.idempotent) {
      try { await incrementQuestProgress(userId, 'share') } catch { /* non-critical */ }
    }

    return { awarded: !result.idempotent }
  } catch {
    return { awarded: false }
  }
}
