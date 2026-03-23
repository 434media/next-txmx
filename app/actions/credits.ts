'use server'

import { firestore } from '../../lib/firebase-admin'

export type CreditTransactionType =
  | 'award'
  | 'prediction_settlement'
  | 'redeem'
  | 'adjustment'
  | 'reversal'

export interface CreditAccount {
  userId: string
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
  createdAt: string
  updatedAt: string
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: CreditTransactionType
  reason: string
  idempotencyKey: string
  balanceBefore: number
  balanceAfter: number
  metadata?: Record<string, string | number | boolean | null>
  createdAt: string
}

interface CreditTransactionInput {
  userId: string
  amount: number
  type: CreditTransactionType
  reason: string
  idempotencyKey: string
  metadata?: Record<string, string | number | boolean | null>
}

function assertInput(input: CreditTransactionInput) {
  if (!input.userId.trim()) throw new Error('userId is required')
  if (!input.reason.trim()) throw new Error('reason is required')
  if (!input.idempotencyKey.trim()) throw new Error('idempotencyKey is required')
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new Error('amount must be a non-zero number')
  }
  if (!Number.isInteger(input.amount)) {
    throw new Error('amount must be an integer')
  }
}

export async function getCreditAccount(userId: string): Promise<CreditAccount> {
  const ref = firestore.collection('creditAccounts').doc(userId)
  const snap = await ref.get()

  if (!snap.exists) {
    return {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      createdAt: '',
      updatedAt: '',
    }
  }

  const data = snap.data() as Partial<CreditAccount>
  return {
    userId,
    balance: data.balance || 0,
    lifetimeEarned: data.lifetimeEarned || 0,
    lifetimeSpent: data.lifetimeSpent || 0,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export async function postCreditTransaction(input: CreditTransactionInput) {
  assertInput(input)

  const accountRef = firestore.collection('creditAccounts').doc(input.userId)
  const ledgerRef = accountRef.collection('ledger').doc(input.idempotencyKey)

  const result = await firestore.runTransaction(async (tx) => {
    const now = new Date().toISOString()
    const [accountSnap, existingLedgerSnap] = await Promise.all([
      tx.get(accountRef),
      tx.get(ledgerRef),
    ])

    if (existingLedgerSnap.exists) {
      const existing = existingLedgerSnap.data() as CreditTransaction
      return {
        idempotent: true,
        transaction: existing,
        balance: existing.balanceAfter,
      }
    }

    const current = accountSnap.exists
      ? (accountSnap.data() as Partial<CreditAccount>)
      : undefined

    const balanceBefore = current?.balance || 0
    const balanceAfter = balanceBefore + input.amount

    if (balanceAfter < 0) {
      throw new Error('insufficient credits')
    }

    const lifetimeEarned = (current?.lifetimeEarned || 0) + (input.amount > 0 ? input.amount : 0)
    const lifetimeSpent = (current?.lifetimeSpent || 0) + (input.amount < 0 ? Math.abs(input.amount) : 0)

    const transaction: CreditTransaction = {
      id: ledgerRef.id,
      userId: input.userId,
      amount: input.amount,
      type: input.type,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
      balanceBefore,
      balanceAfter,
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
        lifetimeSpent,
        createdAt: current?.createdAt || now,
        updatedAt: now,
      },
      { merge: true }
    )

    return {
      idempotent: false,
      transaction,
      balance: balanceAfter,
    }
  })

  return { success: true, ...result }
}

export async function awardCredits(userId: string, amount: number, reason: string, idempotencyKey: string, metadata?: Record<string, string | number | boolean | null>) {
  if (amount <= 0) throw new Error('award amount must be positive')
  return postCreditTransaction({
    userId,
    amount,
    type: 'award',
    reason,
    idempotencyKey,
    metadata,
  })
}

export async function settlePredictionCredits(
  userId: string,
  amount: number,
  predictionId: string,
  outcome: 'won' | 'lost' | 'void',
  idempotencyKey: string
) {
  return postCreditTransaction({
    userId,
    amount,
    type: 'prediction_settlement',
    reason: `Prediction ${outcome}`,
    idempotencyKey,
    metadata: { predictionId, outcome },
  })
}

export async function redeemCredits(
  userId: string,
  amount: number,
  rewardId: string,
  idempotencyKey: string
) {
  if (amount <= 0) throw new Error('redeem amount must be positive')
  return postCreditTransaction({
    userId,
    amount: -Math.abs(amount),
    type: 'redeem',
    reason: 'Reward redemption',
    idempotencyKey,
    metadata: { rewardId },
  })
}

export async function getCreditLedger(userId: string, limit = 50): Promise<CreditTransaction[]> {
  const snap = await firestore
    .collection('creditAccounts')
    .doc(userId)
    .collection('ledger')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map((doc) => doc.data() as CreditTransaction)
}
