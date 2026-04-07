'use server'

import { firestore } from '../../lib/firebase-admin'

export type LPTransactionType =
  | 'gym_roster_win'
  | 'fan_multiplier'
  | 'quest_reward'
  | 'redeem'
  | 'adjustment'
  | 'reversal'
  | 'season_reset'
  | 'season_reward'

export type TransactionStatus = 'valid' | 'reversed' | 'flagged'

export interface LPAccount {
  userId: string
  balance: number
  lifetimeEarned: number
  gymId: string | null
  createdAt: string
  updatedAt: string
}

export interface LPTransaction {
  id: string
  userId: string
  amount: number
  type: LPTransactionType
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

export interface LPTransactionInput {
  userId: string
  amount: number
  type: LPTransactionType
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

function assertInput(input: LPTransactionInput) {
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

export async function getLPAccount(userId: string): Promise<LPAccount> {
  const ref = firestore.collection('lpAccounts').doc(userId)
  const snap = await ref.get()

  if (!snap.exists) {
    return {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      gymId: null,
      createdAt: '',
      updatedAt: '',
    }
  }

  const data = snap.data() as Partial<LPAccount>
  return {
    userId,
    balance: data.balance || 0,
    lifetimeEarned: data.lifetimeEarned || 0,
    gymId: data.gymId || null,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export async function postLPTransaction(input: LPTransactionInput) {
  assertInput(input)

  const accountRef = firestore.collection('lpAccounts').doc(input.userId)
  const ledgerRef = accountRef.collection('ledger').doc(input.idempotencyKey)

  const result = await firestore.runTransaction(async (tx) => {
    const now = new Date().toISOString()
    const [accountSnap, existingLedgerSnap] = await Promise.all([
      tx.get(accountRef),
      tx.get(ledgerRef),
    ])

    if (existingLedgerSnap.exists) {
      const existing = existingLedgerSnap.data() as LPTransaction
      return {
        idempotent: true,
        transaction: existing,
        balance: existing.balanceAfter,
      }
    }

    const current = accountSnap.exists
      ? (accountSnap.data() as Partial<LPAccount>)
      : undefined

    const balanceBefore = current?.balance || 0
    const balanceAfter = Math.max(0, balanceBefore + input.amount)

    const lifetimeEarned =
      (current?.lifetimeEarned || 0) + (input.amount > 0 ? input.amount : 0)

    const transaction: LPTransaction = {
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
        gymId: current?.gymId || null,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      },
      { merge: true }
    )

    // Sync cached balance on user doc
    const userRef = firestore.collection('users').doc(input.userId)
    tx.update(userRef, {
      loyaltyPoints: balanceAfter,
      updatedAt: now,
    })

    return {
      idempotent: false,
      transaction,
      balance: balanceAfter,
    }
  })

  return { success: true, ...result }
}

export async function awardLP(
  userId: string,
  amount: number,
  source: string,
  idempotencyKey: string,
  opts?: {
    type?: LPTransactionType
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
  return postLPTransaction({
    userId,
    amount,
    type: opts?.type ?? 'gym_roster_win',
    source,
    idempotencyKey,
    referenceId: opts?.referenceId,
    eventId: opts?.eventId,
    campaignId: opts?.campaignId,
    questId: opts?.questId,
    sourceType: opts?.sourceType,
    multiplierApplied: opts?.multiplierApplied,
    metadata: opts?.metadata,
  })
}

export async function getLPLedger(userId: string, limit = 50): Promise<LPTransaction[]> {
  const snap = await firestore
    .collection('lpAccounts')
    .doc(userId)
    .collection('ledger')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map((doc) => doc.data() as LPTransaction)
}
