'use server'

import { awardCredits } from './credits'
import { updateUserPoints } from './users'
import { getEconomyConfig } from './economy'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function claimDailyLogin(userId: string) {
  const date = todayKey()
  const idempotencyKey = `daily_login:${userId}:${date}`

  const config = await getEconomyConfig()
  const reward = config.dailyLoginReward

  const result = await awardCredits(
    userId,
    reward,
    `Daily login reward — ${date}`,
    idempotencyKey,
    { source: 'daily_login', date }
  )

  // Also award a small SP bonus for daily engagement
  if (!result.idempotent) {
    await updateUserPoints(userId, 'txCredits', reward)
    await updateUserPoints(userId, 'skillPoints', 5)
  }

  return {
    success: true,
    alreadyClaimed: result.idempotent ?? false,
    reward,
    balance: result.balance,
  }
}
