'use server'

import { firestore } from '../../lib/firebase-admin'

export interface FightNightStanding {
  userId: string
  displayName: string | null
  photoURL: string | null
  /** Email snapshotted at first pick — used for winner notification */
  email: string | null
  /** Total points earned within this fight night */
  points: number
  /** Picks placed for this fight night (match + prop combined) */
  picksMade: number
  /** Picks won after settlement */
  picksWon: number
  /** Whether the user has checked in at the venue */
  atEvent: boolean
  joinedAt: string
  updatedAt: string
  /** ISO timestamp set when the post-event recap email is sent — used to
   * make recap blasts idempotent if the admin clicks Send twice. */
  recapEmailSentAt?: string
}

function standingsCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('standings')
}

function entryRef(fightNightId: string, userId: string) {
  return standingsCol(fightNightId).doc(userId)
}

/**
 * Increment a user's points for a fight night. Creates the standing on first call.
 */
export async function incrementStandingPoints(
  fightNightId: string,
  userId: string,
  amount: number,
  meta: {
    displayName: string | null
    photoURL: string | null
    email: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId || amount <= 0) return

  const ref = entryRef(fightNightId, userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<FightNightStanding>
      tx.update(ref, {
        points: (current.points || 0) + amount,
        picksWon: (current.picksWon || 0) + 1,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        email: current.email || meta.email,
        updatedAt: now,
      })
    } else {
      tx.set(ref, {
        userId,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        email: meta.email,
        points: amount,
        picksMade: 0,
        picksWon: 1,
        atEvent: false,
        joinedAt: now,
        updatedAt: now,
      } as FightNightStanding)
    }
  })
}

/**
 * Increment picksMade for a user. Creates the standing on first pick so they
 * appear on the leaderboard immediately.
 */
export async function incrementPicksMade(
  fightNightId: string,
  userId: string,
  meta: {
    displayName: string | null
    photoURL: string | null
    email: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId) return

  const ref = entryRef(fightNightId, userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<FightNightStanding>
      tx.update(ref, {
        picksMade: (current.picksMade || 0) + 1,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        email: current.email || meta.email,
        updatedAt: now,
      })
    } else {
      tx.set(ref, {
        userId,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        email: meta.email,
        points: 0,
        picksMade: 1,
        picksWon: 0,
        atEvent: false,
        joinedAt: now,
        updatedAt: now,
      } as FightNightStanding)
    }
  })
}

/**
 * Mark a user as checked in at the venue. Creates a stub if no standing exists yet.
 */
export async function setAtEvent(
  fightNightId: string,
  userId: string,
  atEvent: boolean,
  meta?: {
    displayName: string | null
    photoURL: string | null
    email: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId) return
  const ref = entryRef(fightNightId, userId)
  const snap = await ref.get()
  const now = new Date().toISOString()

  if (snap.exists) {
    await ref.update({ atEvent, updatedAt: now })
  } else {
    await ref.set({
      userId,
      displayName: meta?.displayName || null,
      photoURL: meta?.photoURL || null,
      email: meta?.email || null,
      points: 0,
      picksMade: 0,
      picksWon: 0,
      atEvent,
      joinedAt: now,
      updatedAt: now,
    } as FightNightStanding)
  }
}

export async function getStandings(
  fightNightId: string,
  opts: { atEventOnly?: boolean; limit?: number } = {}
): Promise<FightNightStanding[]> {
  if (!fightNightId) return []
  const limit = opts.limit ?? 100

  // Single-field order by `points` desc — avoids needing a composite index.
  // When atEventOnly is requested, fetch extra and filter client-side.
  const fetchSize = opts.atEventOnly ? Math.max(limit * 4, 200) : limit
  const snap = await standingsCol(fightNightId)
    .orderBy('points', 'desc')
    .limit(fetchSize)
    .get()

  const all = snap.docs.map((d) => d.data() as FightNightStanding)
  const filtered = opts.atEventOnly ? all.filter((e) => e.atEvent === true) : all
  return filtered.slice(0, limit)
}

export async function getUserStanding(
  fightNightId: string,
  userId: string
): Promise<FightNightStanding | null> {
  if (!fightNightId || !userId) return null
  const snap = await entryRef(fightNightId, userId).get()
  if (!snap.exists) return null
  return snap.data() as FightNightStanding
}
