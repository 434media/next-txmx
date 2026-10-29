'use server'

import { firestore } from '../../lib/firebase-admin'

/**
 * Cross-event ("season") aggregate of a fan's fight-night play. This is a
 * denormalized rollup of every `fightNights/{id}/standings/{userId}` doc into a
 * single flat top-level collection so the public hub + /leaderboard can render
 * an all-time board with one cheap `orderBy('points','desc')` query (no fan-out
 * read across subcollections, no composite index).
 *
 * It is kept live by {@link bumpSeasonStanding}, called from the per-event
 * standings writers at settlement time. If it ever drifts, {@link rebuildSeasonStandings}
 * recomputes the whole collection from the per-event source of truth.
 */
export interface SeasonStanding {
  userId: string
  displayName: string | null
  photoURL: string | null
  email: string | null
  /** Lifetime points across every fight night */
  points: number
  /** Lifetime picks placed (match + prop) across every fight night */
  picksMade: number
  /** Lifetime picks won across every fight night */
  picksWon: number
  /** Distinct fight nights the fan has joined */
  eventsPlayed: number
  /** ISO timestamp of first participation */
  firstSeenAt: string
  updatedAt: string
}

const COLLECTION = 'seasonStandings'

function seasonCol() {
  return firestore.collection(COLLECTION)
}

function seasonRef(userId: string) {
  return seasonCol().doc(userId)
}

/**
 * Top-N all-time board for the public hub + /leaderboard.
 */
export async function getSeasonStandings(limit = 100): Promise<SeasonStanding[]> {
  const snap = await seasonCol().orderBy('points', 'desc').limit(limit).get()
  // Public action (anonymous callers): never return fans' emails.
  return snap.docs.map((d) => ({ ...(d.data() as SeasonStanding), email: null }))
}

export async function getUserSeasonStanding(
  userId: string
): Promise<SeasonStanding | null> {
  if (!userId) return null
  const snap = await seasonRef(userId).get()
  if (!snap.exists) return null
  return { ...(snap.data() as SeasonStanding), email: null }
}

