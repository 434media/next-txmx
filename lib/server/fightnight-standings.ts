import 'server-only'

import { firestore } from '../firebase-admin'
import type { FightNightStanding } from '../../app/actions/fightnight-standings'
import { bumpSeasonStanding } from './season-standings'

// Internal server-side helpers. NOT a "use server" module: nothing here is
// callable from the browser. These used to be exported server actions, which
// made them public POST endpoints; they are only ever called by other server
// code (pick placement and settlement in app/actions/fightnight-picks.ts
// and app/actions/fightnight-props.ts).

function entryRef(fightNightId: string, userId: string) {
  return firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .doc(userId)
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
    /** Ignored: emails are no longer stored on standings (see lib/server/fan-emails.ts). */
    email?: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId || amount <= 0) return

  const ref = entryRef(fightNightId, userId)
  let createdStanding = false
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<FightNightStanding>
      tx.update(ref, {
        points: (current.points || 0) + amount,
        picksWon: (current.picksWon || 0) + 1,
        // Preserve a previously-good displayName/photoURL — only overwrite
        // when meta has a value, so a callsite reading from a stale users
        // doc can't null out a name we already captured.
        displayName: meta.displayName || current.displayName || null,
        photoURL: meta.photoURL || current.photoURL || null,
        updatedAt: now,
      })
    } else {
      createdStanding = true
      tx.set(ref, {
        userId,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        points: amount,
        picksMade: 0,
        picksWon: 1,
        joinedAt: now,
        updatedAt: now,
      } as FightNightStanding)
    }
  })

  // Mirror into the cross-event season aggregate. eventsPlayed only bumps when
  // this settlement created the per-event standing (i.e. their first action in
  // this fight night was a winning pick).
  await bumpSeasonStanding(
    userId,
    { points: amount, picksWon: 1, eventsPlayed: createdStanding ? 1 : 0 },
    meta
  )
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
    /** Ignored: emails are no longer stored on standings (see lib/server/fan-emails.ts). */
    email?: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId) return

  const ref = entryRef(fightNightId, userId)
  let createdStanding = false
  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = new Date().toISOString()

    if (snap.exists) {
      const current = snap.data() as Partial<FightNightStanding>
      tx.update(ref, {
        picksMade: (current.picksMade || 0) + 1,
        // See incrementStandingPoints — never clobber a good displayName
        // with null from a stale users-doc read.
        displayName: meta.displayName || current.displayName || null,
        photoURL: meta.photoURL || current.photoURL || null,
        updatedAt: now,
      })
    } else {
      createdStanding = true
      tx.set(ref, {
        userId,
        displayName: meta.displayName,
        photoURL: meta.photoURL,
        points: 0,
        picksMade: 1,
        picksWon: 0,
        joinedAt: now,
        updatedAt: now,
      } as FightNightStanding)
    }
  })

  // Mirror into the cross-event season aggregate (picks count toward lifetime
  // activity; eventsPlayed bumps only when this is their first action here).
  await bumpSeasonStanding(
    userId,
    { picksMade: 1, eventsPlayed: createdStanding ? 1 : 0 },
    meta
  )
}

/**
 * Ensure a standing exists for a user — used when someone joins the fight night
 * (the public "Start Playing" form) so they appear on the leaderboard right
 * away, before they've placed any picks. No-op if a standing already exists.
 */
export async function ensureStanding(
  fightNightId: string,
  userId: string,
  meta?: {
    displayName: string | null
    photoURL: string | null
    /** Ignored: emails are no longer stored on standings (see lib/server/fan-emails.ts). */
    email?: string | null
  }
): Promise<void> {
  if (!fightNightId || !userId) return
  const ref = entryRef(fightNightId, userId)
  const snap = await ref.get()
  const now = new Date().toISOString()

  if (snap.exists) {
    await ref.update({ updatedAt: now })
  } else {
    await ref.set({
      userId,
      displayName: meta?.displayName || null,
      photoURL: meta?.photoURL || null,
      points: 0,
      picksMade: 0,
      picksWon: 0,
      joinedAt: now,
      updatedAt: now,
    } as FightNightStanding)

    // First time joining this fight night — count the participation in the
    // season aggregate so joined-but-not-yet-picked fans appear all-time too.
    await bumpSeasonStanding(
      userId,
      { eventsPlayed: 1 },
      {
        displayName: meta?.displayName || null,
        photoURL: meta?.photoURL || null,
      }
    )
  }
}
