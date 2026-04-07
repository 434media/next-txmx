'use server'

import { firestore } from '../../lib/firebase-admin'

export interface EconomyConfig {
  shareReward: number
  pollVoteReward: number
  dailyLoginReward: number
  correctPredictionReward: number
  matchWinnerSPMin: number
  matchWinnerSPMax: number
  propPickSPMin: number
  propPickSPMax: number
  // Earning caps
  dailyTCCap: number
  weeklyTCCap: number
  dailySPCap: number
  weeklySPCap: number
  // Category caps (per day)
  dailyPredictionLimit: number
  dailyPollLimit: number
  dailyShareLimit: number
  // Cooldowns (in seconds)
  pollCooldownSeconds: number
  predictionCooldownSeconds: number
  // Diminishing returns (0 = off, 0.9 = 10% less each repeat)
  diminishingReturnFactor: number
  // Black Card subscriber earning multiplier (1 = no boost, 1.5 = 50% bonus)
  subscriberMultiplier: number
  // Abuse prevention (0 = off)
  accountAgeGateDays: number     // Min account age to earn rewards
  velocityTCPerHour: number      // Max TC/hour before flagging
  communityPostsPerDay: number   // Max community posts/day
  communityRepliesPerDay: number // Max community replies/day
  updatedAt: string
}

export interface EconomySnapshot {
  totalUsers: number
  totalTCInCirculation: number
  totalTCEarned: number
  totalTCSpent: number
  totalSPAwarded: number
  totalLPAwarded: number
  activeSubscribers: number
  snapshotAt: string
}

const CONFIG_DOC = 'economyConfig'

const DEFAULT_CONFIG: EconomyConfig = {
  shareReward: 20,
  pollVoteReward: 10,
  dailyLoginReward: 5,
  correctPredictionReward: 100,
  matchWinnerSPMin: 100,
  matchWinnerSPMax: 250,
  propPickSPMin: 500,
  propPickSPMax: 1250,
  // Caps (0 = unlimited)
  dailyTCCap: 0,
  weeklyTCCap: 0,
  dailySPCap: 0,
  weeklySPCap: 0,
  dailyPredictionLimit: 0,
  dailyPollLimit: 0,
  dailyShareLimit: 0,
  // Cooldowns (0 = no cooldown)
  pollCooldownSeconds: 0,
  predictionCooldownSeconds: 0,
  // Diminishing returns (0 = off)
  diminishingReturnFactor: 0,
  // Subscriber multiplier (1 = no boost)
  subscriberMultiplier: 1.5,
  // Abuse prevention (0 = off)
  accountAgeGateDays: 0,
  velocityTCPerHour: 0,
  communityPostsPerDay: 0,
  communityRepliesPerDay: 0,
  updatedAt: '',
}

export async function getEconomyConfig(): Promise<EconomyConfig> {
  const snap = await firestore.collection('system').doc(CONFIG_DOC).get()
  if (!snap.exists) return { ...DEFAULT_CONFIG }
  return { ...DEFAULT_CONFIG, ...snap.data() } as EconomyConfig
}

export async function updateEconomyConfig(config: Partial<EconomyConfig>): Promise<void> {
  await firestore.collection('system').doc(CONFIG_DOC).set(
    { ...config, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

export async function getEconomySnapshot(): Promise<EconomySnapshot> {
  const usersSnap = await firestore.collection('users').get()

  let activeSubscribers = 0

  for (const doc of usersSnap.docs) {
    const data = doc.data()
    if (data.subscriptionStatus === 'active') activeSubscribers++
  }

  // Aggregate TC from credit account ledgers (source of truth)
  const creditSnap = await firestore.collection('creditAccounts').get()
  let totalTCInCirculation = 0
  let totalTCEarned = 0
  let totalTCSpent = 0
  for (const doc of creditSnap.docs) {
    const data = doc.data()
    totalTCInCirculation += data.balance || 0
    totalTCEarned += data.lifetimeEarned || 0
    totalTCSpent += data.lifetimeSpent || 0
  }

  // Aggregate SP from SP account ledgers (source of truth)
  const spSnap = await firestore.collection('spAccounts').get()
  let totalSPAwarded = 0
  for (const doc of spSnap.docs) {
    const data = doc.data()
    totalSPAwarded += data.lifetimeEarned || 0
  }

  // Aggregate LP from LP account ledgers (source of truth)
  const lpSnap = await firestore.collection('lpAccounts').get()
  let totalLPAwarded = 0
  for (const doc of lpSnap.docs) {
    const data = doc.data()
    totalLPAwarded += data.lifetimeEarned || 0
  }

  return {
    totalUsers: usersSnap.size,
    totalTCInCirculation,
    totalTCEarned,
    totalTCSpent,
    totalSPAwarded,
    totalLPAwarded,
    activeSubscribers,
    snapshotAt: new Date().toISOString(),
  }
}
