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
  updatedAt: string
}

export interface EconomySnapshot {
  totalUsers: number
  totalTCInCirculation: number
  totalTCEarned: number
  totalTCSpent: number
  totalSPAwarded: number
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

  let totalTCInCirculation = 0
  let totalSPAwarded = 0
  let activeSubscribers = 0

  for (const doc of usersSnap.docs) {
    const data = doc.data()
    totalTCInCirculation += data.txCredits || 0
    totalSPAwarded += data.skillPoints || 0
    if (data.subscriptionStatus === 'active') activeSubscribers++
  }

  // Aggregate credit account data
  const creditSnap = await firestore.collection('creditAccounts').get()
  let totalTCEarned = 0
  let totalTCSpent = 0
  for (const doc of creditSnap.docs) {
    const data = doc.data()
    totalTCEarned += data.lifetimeEarned || 0
    totalTCSpent += data.lifetimeSpent || 0
  }

  return {
    totalUsers: usersSnap.size,
    totalTCInCirculation,
    totalTCEarned,
    totalTCSpent,
    totalSPAwarded,
    activeSubscribers,
    snapshotAt: new Date().toISOString(),
  }
}
