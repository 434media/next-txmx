import 'server-only'

import { firestore } from '../firebase-admin'
import type { FightNightStanding } from '../../app/actions/fightnight-standings'
import type { SeasonStanding } from '../../app/actions/season-standings'

// Internal server-side helpers. NOT a "use server" module: nothing here is
// callable from the browser. These used to be exported server actions, which
// made them public POST endpoints; they are only ever called by other server
// code (the per-event standings writers and the CRON_SECRET-gated
// /api/admin/rebuild-season-standings route).

const COLLECTION = 'seasonStandings'

function seasonCol() {
  return firestore.collection(COLLECTION)
}

function seasonRef(userId: string) {
  return seasonCol().doc(userId)
}

export interface SeasonDelta {
  points?: number
  picksMade?: number
  picksWon?: number
  eventsPlayed?: number
}

export interface SeasonMeta {
  displayName: string | null
  photoURL: string | null
  /** Ignored: emails are no longer stored on season standings (see lib/server/fan-emails.ts). */
  email?: string | null
}

/**
 * Apply a signed delta to a fan's season aggregate, creating the doc on first
 * contribution. Counters clamp at 0 so a reversal (participant removal) can
 * never drive a total negative. Display fields follow the same "never clobber a
 * good value with null" rule as the per-event standings, so a stale users-doc
 * read can't wipe a name we already captured.
 *
 * Runs as its own transaction (separate from the per-event standings write).
 * The aggregate is denormalized and self-healing via rebuildSeasonStandings, so
 * a crash between the two writes only causes transient drift, not corruption.
 */
export async function bumpSeasonStanding(
  userId: string,
  delta: SeasonDelta,
  meta: SeasonMeta
): Promise<void> {
  if (!userId) return

  const ref = seasonRef(userId)
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const cur = snap.data() as Partial<SeasonStanding>
      tx.update(ref, {
        points: Math.max(0, (cur.points || 0) + (delta.points || 0)),
        picksMade: Math.max(0, (cur.picksMade || 0) + (delta.picksMade || 0)),
        picksWon: Math.max(0, (cur.picksWon || 0) + (delta.picksWon || 0)),
        eventsPlayed: Math.max(0, (cur.eventsPlayed || 0) + (delta.eventsPlayed || 0)),
        displayName: meta.displayName || cur.displayName || null,
        photoURL: meta.photoURL || cur.photoURL || null,
        updatedAt: now,
      })
    } else {
      tx.set(ref, {
        userId,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        points: Math.max(0, delta.points || 0),
        picksMade: Math.max(0, delta.picksMade || 0),
        picksWon: Math.max(0, delta.picksWon || 0),
        eventsPlayed: Math.max(0, delta.eventsPlayed || 0),
        firstSeenAt: now,
        updatedAt: now,
      } as SeasonStanding)
    }
  })
}

/**
 * Recompute the entire season collection from the per-event source of truth.
 *
 * Doubles as the one-time backfill (existing per-event standings predate the
 * live aggregate) and as a drift-repair tool. Reads every
 * `fightNights/*` /standings doc, sums per user, then overwrites
 * `seasonStandings`. Stale docs (users whose standings were all deleted) are
 * removed so the board can't keep phantom totals.
 */
export async function rebuildSeasonStandings(): Promise<{
  users: number
  eventsScanned: number
  standingsScanned: number
}> {
  const fightNights = await firestore.collection('fightNights').get()

  type Agg = SeasonStanding
  const byUser = new Map<string, Agg>()
  let standingsScanned = 0

  for (const fn of fightNights.docs) {
    const standings = await fn.ref.collection('standings').get()
    for (const doc of standings.docs) {
      standingsScanned++
      const s = doc.data() as FightNightStanding
      if (!s.userId) continue

      const cur = byUser.get(s.userId)
      const joinedAt = s.joinedAt || s.updatedAt || ''
      const updatedAt = s.updatedAt || s.joinedAt || ''

      if (cur) {
        cur.points += s.points || 0
        cur.picksMade += s.picksMade || 0
        cur.picksWon += s.picksWon || 0
        cur.eventsPlayed += 1
        cur.displayName = s.displayName || cur.displayName || null
        cur.photoURL = s.photoURL || cur.photoURL || null
        if (joinedAt && (!cur.firstSeenAt || joinedAt < cur.firstSeenAt)) {
          cur.firstSeenAt = joinedAt
        }
        if (updatedAt > cur.updatedAt) cur.updatedAt = updatedAt
      } else {
        byUser.set(s.userId, {
          userId: s.userId,
          displayName: s.displayName || null,
          photoURL: s.photoURL || null,
          points: s.points || 0,
          picksMade: s.picksMade || 0,
          picksWon: s.picksWon || 0,
          eventsPlayed: 1,
          firstSeenAt: joinedAt,
          updatedAt,
        })
      }
    }
  }

  // Wipe existing season docs that won't be rewritten, so removed participants
  // don't linger. Batched — Firestore admin batches cap at 500.
  const existing = await seasonCol().get()
  const staleRefs = existing.docs
    .filter((d) => !byUser.has(d.id))
    .map((d) => d.ref)

  async function commitBatches(
    ops: { type: 'set' | 'delete'; ref: FirebaseFirestore.DocumentReference; data?: SeasonStanding }[]
  ) {
    for (let i = 0; i < ops.length; i += 400) {
      const chunk = ops.slice(i, i + 400)
      const batch = firestore.batch()
      for (const op of chunk) {
        if (op.type === 'delete') batch.delete(op.ref)
        else batch.set(op.ref, op.data as SeasonStanding)
      }
      await batch.commit()
    }
  }

  const ops: { type: 'set' | 'delete'; ref: FirebaseFirestore.DocumentReference; data?: SeasonStanding }[] = []
  for (const ref of staleRefs) ops.push({ type: 'delete', ref })
  for (const agg of byUser.values()) ops.push({ type: 'set', ref: seasonRef(agg.userId), data: agg })

  await commitBatches(ops)

  return {
    users: byUser.size,
    eventsScanned: fightNights.size,
    standingsScanned,
  }
}
