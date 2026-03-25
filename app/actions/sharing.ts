'use server'

import { awardCredits } from './credits'

const SHARE_TC_AMOUNT = 20

export async function awardShareCredits(
  userId: string,
  platform: string,
  sharedUrl: string
): Promise<{ awarded: boolean }> {
  if (!userId || !platform || !sharedUrl) {
    return { awarded: false }
  }

  // Idempotency: one reward per user per URL per day
  const today = new Date().toISOString().split('T')[0]
  const idempotencyKey = `share:${userId}:${sharedUrl}:${today}`

  try {
    const result = await awardCredits(
      userId,
      SHARE_TC_AMOUNT,
      `Social share (${platform})`,
      idempotencyKey,
      { platform, sharedUrl }
    )

    return { awarded: !result.idempotent }
  } catch {
    return { awarded: false }
  }
}
