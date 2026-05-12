'use server'

import { firestore } from '../../lib/firebase-admin'
import { getEventById } from './events'
import { sendEventWinnerEmailsBatch, type EventEmailContext } from './email'
import { awardEventPrize } from './event-prizes'

export interface EventLeaderboardEntry {
  userId: string
  eventId: string
  /** SP earned within this event (match-pick wins + prop-pick wins) */
  spEarned: number
  /** TC earned within this event (poll votes during the event window, prop wins, etc.) */
  tcEarned: number
  displayName: string | null
  photoURL: string | null
  /** Overall user rank at time of last increment — used to style the entry */
  rank: string
  /** Picks placed for this event (match + prop) — incremented at pick time */
  picksMade: number
  /** Picks won after settlement */
  picksWon: number
  /** Physically at the venue. Tier 2 check-in mechanism flips this; default true for now. */
  atEvent: boolean
  joinedAt: string
  updatedAt: string
}

function entryRef(eventId: string, userId: string) {
  return firestore
    .collection('eventLeaderboards')
    .doc(eventId)
    .collection('entries')
    .doc(userId)
}

/**
 * Increment a user's event-scoped SP. Called from settlement paths.
 * Creates the entry on first increment.
 */
export async function incrementEventSP(
  eventId: string,
  userId: string,
  amount: number,
  meta: {
    displayName: string | null
    photoURL: string | null
    rank: string
  }
): Promise<void> {
  if (!eventId || !userId || amount <= 0) return

  const ref = entryRef(eventId, userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<EventLeaderboardEntry>
      tx.update(ref, {
        spEarned: (current.spEarned || 0) + amount,
        picksWon: (current.picksWon || 0) + 1,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        rank: meta.rank,
        updatedAt: now,
      })
    } else {
      const entry: EventLeaderboardEntry = {
        userId,
        eventId,
        spEarned: amount,
        tcEarned: 0,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        rank: meta.rank,
        picksMade: 0,
        picksWon: 1,
        atEvent: true,
        joinedAt: now,
        updatedAt: now,
      }
      tx.set(ref, entry)
    }
  })
}

/**
 * Increment TC earned within an event (prop wins, polls during the event window).
 */
export async function incrementEventTC(
  eventId: string,
  userId: string,
  amount: number
): Promise<void> {
  if (!eventId || !userId || amount <= 0) return

  const ref = entryRef(eventId, userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<EventLeaderboardEntry>
      tx.update(ref, {
        tcEarned: (current.tcEarned || 0) + amount,
        updatedAt: now,
      })
    } else {
      tx.set(ref, {
        userId,
        eventId,
        spEarned: 0,
        tcEarned: amount,
        displayName: null,
        photoURL: null,
        rank: 'rookie',
        picksMade: 0,
        picksWon: 0,
        atEvent: true,
        joinedAt: now,
        updatedAt: now,
      } as EventLeaderboardEntry)
    }
  })
}

/**
 * Increment the user's pick count for an event. Called when a pick is placed.
 * Creates the entry on first call so they appear on the leaderboard with 0 SP.
 */
export async function incrementEventPicksMade(
  eventId: string,
  userId: string,
  meta: {
    displayName: string | null
    photoURL: string | null
    rank: string
  }
): Promise<void> {
  if (!eventId || !userId) return

  const ref = entryRef(eventId, userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<EventLeaderboardEntry>
      tx.update(ref, {
        picksMade: (current.picksMade || 0) + 1,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        rank: meta.rank,
        updatedAt: now,
      })
    } else {
      tx.set(ref, {
        userId,
        eventId,
        spEarned: 0,
        tcEarned: 0,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        rank: meta.rank,
        picksMade: 1,
        picksWon: 0,
        atEvent: true,
        joinedAt: now,
        updatedAt: now,
      } as EventLeaderboardEntry)
    }
  })
}

/**
 * Get the leaderboard for a specific event, ranked by event SP DESC.
 * @param atEventOnly  When true, only include entries flagged atEvent=true (for prize eligibility)
 */
export async function getEventLeaderboard(
  eventId: string,
  opts: { atEventOnly?: boolean; limit?: number } = {}
): Promise<EventLeaderboardEntry[]> {
  if (!eventId) return []
  const limit = opts.limit ?? 100

  let query: FirebaseFirestore.Query = firestore
    .collection('eventLeaderboards')
    .doc(eventId)
    .collection('entries')
    .orderBy('spEarned', 'desc')

  if (opts.atEventOnly) {
    query = query.where('atEvent', '==', true)
  }

  const snap = await query.limit(limit).get()
  return snap.docs.map((d) => d.data() as EventLeaderboardEntry)
}

/**
 * Get a single user's entry for an event.
 */
export async function getUserEventEntry(
  userId: string,
  eventId: string
): Promise<EventLeaderboardEntry | null> {
  if (!userId || !eventId) return null
  const snap = await entryRef(eventId, userId).get()
  if (!snap.exists) return null
  return snap.data() as EventLeaderboardEntry
}

/**
 * Notify the top finishers of an event with prize-claim instructions via Resend.
 * Looks up email from the users collection.
 */
export async function notifyEventWinners(
  eventId: string,
  opts: {
    topN?: number
    prizeLabel: string
    claimInstructions: string
    atEventOnly?: boolean
  }
): Promise<{ sent: number; skipped: number; errors: number }> {
  const event = await getEventById(eventId)
  if (!event) return { sent: 0, skipped: 0, errors: 0 }

  const topN = opts.topN ?? 1
  const entries = await getEventLeaderboard(eventId, {
    atEventOnly: opts.atEventOnly,
    limit: topN,
  })
  if (entries.length === 0) return { sent: 0, skipped: 0, errors: 0 }

  // Look up emails from users collection
  const winners = await Promise.all(
    entries.map(async (entry, i) => {
      const userSnap = await firestore.collection('users').doc(entry.userId).get()
      const email = userSnap.exists ? (userSnap.data()?.email as string | null) || null : null
      return {
        userId: entry.userId,
        displayName: entry.displayName,
        email,
        position: i + 1,
        spEarned: entry.spEarned,
        prizeLabel: opts.prizeLabel,
        claimInstructions: opts.claimInstructions,
      }
    })
  )

  const ctx: EventEmailContext = {
    eventId: event.id,
    eventName: event.promoter || event.venue || `Event ${event.eventNumber}`,
    venue: event.venue,
    city: event.city,
    date: event.date,
    promoter: event.promoter,
  }

  // Create prize records first (idempotent on event+user+position) so the
  // admin has a paper trail even if any email send fails.
  for (const w of winners) {
    try {
      await awardEventPrize({
        eventId: event.id,
        userId: w.userId,
        position: w.position,
        prizeLabel: w.prizeLabel,
        displayName: w.displayName,
        email: w.email,
        spEarned: w.spEarned,
      })
    } catch {
      // Idempotent guard / non-critical
    }
  }

  return sendEventWinnerEmailsBatch(ctx, winners)
}

/**
 * Mark a user as physically at the event (Tier 2 check-in mechanism calls this).
 * Creates a stub entry if one doesn't exist yet.
 */
export async function setUserAtEvent(
  userId: string,
  eventId: string,
  atEvent: boolean,
  meta?: {
    displayName: string | null
    photoURL: string | null
    rank: string
  }
): Promise<void> {
  if (!userId || !eventId) return

  const ref = entryRef(eventId, userId)
  const snap = await ref.get()
  const now = new Date().toISOString()

  if (snap.exists) {
    await ref.update({ atEvent, updatedAt: now })
  } else {
    await ref.set({
      userId,
      eventId,
      spEarned: 0,
      tcEarned: 0,
      displayName: meta?.displayName || null,
      photoURL: meta?.photoURL || null,
      rank: meta?.rank || 'rookie',
      picksMade: 0,
      picksWon: 0,
      atEvent,
      joinedAt: now,
      updatedAt: now,
    } as EventLeaderboardEntry)
  }
}
