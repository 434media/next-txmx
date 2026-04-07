'use server'

import { firestore } from '../../lib/firebase-admin'
import { checkSPCap, recordEarningAction } from './rate-limiter'
import { getActiveSeason, incrementSeasonalSP } from './seasons'

export type SPTransactionType =
  | 'prediction_win'
  | 'daily_engagement'
  | 'quest_reward'
  | 'adjustment'
  | 'reversal'
  | 'season_reset'

export type TransactionStatus = 'valid' | 'reversed' | 'flagged'

export interface SPAccount {
  userId: string
  balance: number
  lifetimeEarned: number
  rank: 'rookie' | 'contender' | 'champion' | 'hall_of_fame'
  createdAt: string
  updatedAt: string
}

export interface SPTransaction {
  id: string
  userId: string
  amount: number
  type: SPTransactionType
  source: string
  referenceId: string | null
  idempotencyKey: string
  balanceBefore: number
  balanceAfter: number
  status: TransactionStatus
  fraudFlag: boolean
  // Structured ledger fields
  campaignId: string | null
  eventId: string | null
  questId: string | null
  sourceType: string | null
  multiplierApplied: number | null
  cappedFlag: boolean
  cooldownFlag: boolean
  metadata?: Record<string, string | number | boolean | null>
  createdAt: string
}

export interface SPTransactionInput {
  userId: string
  amount: number
  type: SPTransactionType
  source: string
  referenceId?: string | null
  idempotencyKey: string
  campaignId?: string | null
  eventId?: string | null
  questId?: string | null
  sourceType?: string | null
  multiplierApplied?: number | null
  cappedFlag?: boolean
  cooldownFlag?: boolean
  metadata?: Record<string, string | number | boolean | null>
}

function computeRank(sp: number): SPAccount['rank'] {
  if (sp >= 100_000) return 'hall_of_fame'
  if (sp >= 25_000) return 'champion'
  if (sp >= 5_000) return 'contender'
  return 'rookie'
}

function assertInput(input: SPTransactionInput) {
  if (!input.userId.trim()) throw new Error('userId is required')
  if (!input.source.trim()) throw new Error('source is required')
  if (!input.idempotencyKey.trim()) throw new Error('idempotencyKey is required')
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new Error('amount must be a non-zero number')
  }
  if (!Number.isInteger(input.amount)) {
    throw new Error('amount must be an integer')
  }
}

export async function getSPAccount(userId: string): Promise<SPAccount> {
  const ref = firestore.collection('spAccounts').doc(userId)
  const snap = await ref.get()

  if (!snap.exists) {
    return {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      rank: 'rookie',
      createdAt: '',
      updatedAt: '',
    }
  }

  const data = snap.data() as Partial<SPAccount>
  return {
    userId,
    balance: data.balance || 0,
    lifetimeEarned: data.lifetimeEarned || 0,
    rank: data.rank || 'rookie',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export async function postSPTransaction(input: SPTransactionInput) {
  assertInput(input)

  const accountRef = firestore.collection('spAccounts').doc(input.userId)
  const ledgerRef = accountRef.collection('ledger').doc(input.idempotencyKey)

  const result = await firestore.runTransaction(async (tx) => {
    const now = new Date().toISOString()
    const [accountSnap, existingLedgerSnap] = await Promise.all([
      tx.get(accountRef),
      tx.get(ledgerRef),
    ])

    if (existingLedgerSnap.exists) {
      const existing = existingLedgerSnap.data() as SPTransaction
      return {
        idempotent: true,
        transaction: existing,
        balance: existing.balanceAfter,
      }
    }

    const current = accountSnap.exists
      ? (accountSnap.data() as Partial<SPAccount>)
      : undefined

    const balanceBefore = current?.balance || 0
    const balanceAfter = Math.max(0, balanceBefore + input.amount)

    const lifetimeEarned =
      (current?.lifetimeEarned || 0) + (input.amount > 0 ? input.amount : 0)

    const newRank = computeRank(balanceAfter)

    const transaction: SPTransaction = {
      id: ledgerRef.id,
      userId: input.userId,
      amount: input.amount,
      type: input.type,
      source: input.source,
      referenceId: input.referenceId ?? null,
      idempotencyKey: input.idempotencyKey,
      balanceBefore,
      balanceAfter,
      status: 'valid',
      fraudFlag: false,
      campaignId: input.campaignId ?? null,
      eventId: input.eventId ?? null,
      questId: input.questId ?? null,
      sourceType: input.sourceType ?? null,
      multiplierApplied: input.multiplierApplied ?? null,
      cappedFlag: input.cappedFlag ?? false,
      cooldownFlag: input.cooldownFlag ?? false,
      metadata: input.metadata,
      createdAt: now,
    }

    tx.set(ledgerRef, transaction, { merge: false })
    tx.set(
      accountRef,
      {
        userId: input.userId,
        balance: balanceAfter,
        lifetimeEarned,
        rank: newRank,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      },
      { merge: true }
    )

    // Sync cached balance on user doc
    const userRef = firestore.collection('users').doc(input.userId)
    tx.update(userRef, {
      skillPoints: balanceAfter,
      rank: newRank,
      updatedAt: now,
    })

    return {
      idempotent: false,
      transaction,
      balance: balanceAfter,
      rank: newRank,
    }
  })

  return { success: true, ...result }
}

export async function awardSP(
  userId: string,
  amount: number,
  source: string,
  idempotencyKey: string,
  opts?: {
    referenceId?: string
    eventId?: string
    campaignId?: string
    questId?: string
    sourceType?: string
    multiplierApplied?: number
    metadata?: Record<string, string | number | boolean | null>
  }
) {
  if (amount <= 0) throw new Error('award amount must be positive')

  // Check earning cap before awarding
  const capCheck = await checkSPCap(userId, amount)
  if (!capCheck.allowed) {
    return { success: false, idempotent: false, balance: 0, capped: true, reason: capCheck.reason }
  }

  const finalAmount = capCheck.cappedAmount ?? amount
  const cappedFlag = capCheck.cappedAmount !== null

  const result = await postSPTransaction({
    userId,
    amount: finalAmount,
    type: 'prediction_win',
    source,
    idempotencyKey,
    referenceId: opts?.referenceId,
    eventId: opts?.eventId,
    campaignId: opts?.campaignId,
    questId: opts?.questId,
    sourceType: opts?.sourceType,
    multiplierApplied: opts?.multiplierApplied,
    cappedFlag,
    metadata: opts?.metadata,
  })

  // Track earning for future cap checks
  if (!result.idempotent) {
    try {
      await recordEarningAction(userId, { spAmount: finalAmount, category: 'predictions' })
    } catch {
      // Tracker failure is non-critical
    }

    // Track seasonal SP if a season is active
    try {
      const activeSeason = await getActiveSeason()
      if (activeSeason) {
        const userDoc = await firestore.collection('users').doc(userId).get()
        const userData = userDoc.data()
        await incrementSeasonalSP(
          userId,
          activeSeason.id,
          finalAmount,
          userData?.displayName || null,
          userData?.photoURL || null,
          userData?.rank || 'rookie'
        )
      }
    } catch {
      // Seasonal tracking failure is non-critical
    }
  }

  return result
}

export async function awardDailyEngagementSP(
  userId: string,
  amount: number,
  idempotencyKey: string,
  metadata?: Record<string, string | number | boolean | null>
) {
  if (amount <= 0) throw new Error('award amount must be positive')

  const capCheck = await checkSPCap(userId, amount)
  if (!capCheck.allowed) {
    return { success: false, idempotent: false, balance: 0, capped: true, reason: capCheck.reason }
  }

  const finalAmount = capCheck.cappedAmount ?? amount
  const cappedFlag = capCheck.cappedAmount !== null

  const result = await postSPTransaction({
    userId,
    amount: finalAmount,
    type: 'daily_engagement',
    source: 'daily_login',
    idempotencyKey,
    sourceType: 'daily_login',
    cappedFlag,
    metadata,
  })

  if (!result.idempotent) {
    try {
      await recordEarningAction(userId, { spAmount: finalAmount })
    } catch {
      // Tracker failure is non-critical
    }

    // Track seasonal SP if a season is active
    try {
      const activeSeason = await getActiveSeason()
      if (activeSeason) {
        const userDoc = await firestore.collection('users').doc(userId).get()
        const userData = userDoc.data()
        await incrementSeasonalSP(
          userId,
          activeSeason.id,
          finalAmount,
          userData?.displayName || null,
          userData?.photoURL || null,
          userData?.rank || 'rookie'
        )
      }
    } catch {
      // Seasonal tracking failure is non-critical
    }
  }

  return result
}

export async function getSPLedger(userId: string, limit = 50): Promise<SPTransaction[]> {
  const snap = await firestore
    .collection('spAccounts')
    .doc(userId)
    .collection('ledger')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map((doc) => doc.data() as SPTransaction)
}
