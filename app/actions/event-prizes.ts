'use server'

import { firestore } from '../../lib/firebase-admin'

export type PrizeStatus = 'pending' | 'claimed' | 'forfeited'

export interface EventPrize {
  id: string
  eventId: string
  userId: string
  /** Final position on the event leaderboard (1 = winner) */
  position: number
  /** Human-readable prize label, e.g. "BOXR Station prize pack" */
  prizeLabel: string
  /** Whom we recorded as the recipient — snapshotted at award time */
  displayName: string | null
  email: string | null
  spEarned: number
  status: PrizeStatus
  /** Free-text notes added by the admin when marking claimed */
  notes: string
  awardedAt: string
  claimedAt: string | null
  /** Admin uid that marked the prize claimed/forfeited */
  resolvedBy: string | null
}

function prizeRef(prizeId: string) {
  return firestore.collection('eventPrizes').doc(prizeId)
}

/**
 * Create a pending prize record for a single winner. Idempotent on (eventId, userId, position):
 * if a record already exists for that triple it returns the existing one.
 */
export async function awardEventPrize(input: {
  eventId: string
  userId: string
  position: number
  prizeLabel: string
  displayName: string | null
  email: string | null
  spEarned: number
}): Promise<EventPrize> {
  if (!input.eventId || !input.userId) {
    throw new Error('Missing eventId or userId')
  }

  // Idempotency check: one prize per (event, user, position)
  const existingSnap = await firestore
    .collection('eventPrizes')
    .where('eventId', '==', input.eventId)
    .where('userId', '==', input.userId)
    .where('position', '==', input.position)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    const doc = existingSnap.docs[0]
    return { id: doc.id, ...doc.data() } as EventPrize
  }

  const now = new Date().toISOString()
  const data: Omit<EventPrize, 'id'> = {
    eventId: input.eventId,
    userId: input.userId,
    position: input.position,
    prizeLabel: input.prizeLabel,
    displayName: input.displayName,
    email: input.email,
    spEarned: input.spEarned,
    status: 'pending',
    notes: '',
    awardedAt: now,
    claimedAt: null,
    resolvedBy: null,
  }
  const ref = await firestore.collection('eventPrizes').add(data)
  return { id: ref.id, ...data }
}

/**
 * Get all prize records for an event, ordered by position ASC.
 */
export async function getEventPrizes(eventId: string): Promise<EventPrize[]> {
  if (!eventId) return []
  const snap = await firestore
    .collection('eventPrizes')
    .where('eventId', '==', eventId)
    .orderBy('position', 'asc')
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventPrize)
}

/**
 * Admin action: mark a prize as claimed by the recipient.
 */
export async function markPrizeClaimed(
  prizeId: string,
  adminUid: string,
  notes = ''
): Promise<void> {
  if (!prizeId) throw new Error('Missing prizeId')
  await prizeRef(prizeId).update({
    status: 'claimed' as PrizeStatus,
    claimedAt: new Date().toISOString(),
    resolvedBy: adminUid,
    notes,
  })
}

/**
 * Admin action: mark a prize as forfeited (winner didn't respond or
 * couldn't be verified). Optionally re-award to the next finisher.
 */
export async function markPrizeForfeited(
  prizeId: string,
  adminUid: string,
  reason = ''
): Promise<void> {
  if (!prizeId) throw new Error('Missing prizeId')
  await prizeRef(prizeId).update({
    status: 'forfeited' as PrizeStatus,
    claimedAt: null,
    resolvedBy: adminUid,
    notes: reason,
  })
}
