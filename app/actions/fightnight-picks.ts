'use server'

import { firestore } from '../../lib/firebase-admin'
import { getFightNight } from './fightnight'
import { incrementStandingPoints, incrementPicksMade } from './fightnight-standings'
import { lockPropsForBout, unlockPropsForBout } from './fightnight-props'
import { sendPushToUsers } from './notifications'

// ── Types ────────────────────────────────────────────────

export type PickCorner = 'fighter1' | 'fighter2'

export interface FightNightPick {
  userId: string
  boutNumber: number
  pickedCorner: PickCorner
  /** Snapshot of the picked fighter's name at pick time (for display when standings change) */
  pickedFighterName: string
  settled: boolean
  won: boolean | null
  pointsAwarded: number
  createdAt: string
  /** Set when a pick is changed before the bout locks. */
  updatedAt?: string
  settledAt: string | null
}

const MATCH_WIN_POINTS = 100

function picksCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('picks')
}

function pickDocId(userId: string, boutNumber: number): string {
  return `${userId}_${boutNumber}`
}

/**
 * Public deep-link to a specific bout on the night's dedicated page. Uses the
 * slug when available and falls back to the fight night id (the [slug] route
 * resolves both), so push notifications land on /fight-nights/<slug>#bout-N.
 */
async function fightNightBoutPath(
  fightNightId: string,
  boutNumber: number
): Promise<string> {
  let slugOrId = fightNightId
  try {
    const fn = await getFightNight(fightNightId)
    if (fn?.slug) slugOrId = fn.slug
  } catch {
    // fall back to the id
  }
  return `/fight-nights/${slugOrId}#bout-${boutNumber}`
}

// ── Place a Pick ──────────────────────────────────────────

export async function placeFightNightPick(
  fightNightId: string,
  userId: string,
  boutNumber: number,
  pickedCorner: PickCorner
): Promise<{ success: boolean; error?: string }> {
  if (!fightNightId || !userId) {
    return { success: false, error: 'Missing fightNightId or userId' }
  }
  if (!boutNumber || boutNumber < 1) {
    return { success: false, error: 'Invalid bout number' }
  }
  if (pickedCorner !== 'fighter1' && pickedCorner !== 'fighter2') {
    return { success: false, error: 'Invalid corner' }
  }

  // Validate the fight night + bout
  const fightNight = await getFightNight(fightNightId)
  if (!fightNight) return { success: false, error: 'Fight night not found' }
  if (fightNight.status === 'completed') {
    return { success: false, error: 'This fight night has already ended' }
  }

  const boutRef = firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('bouts')
    .doc(String(boutNumber))
  const boutSnap = await boutRef.get()
  if (!boutSnap.exists) return { success: false, error: 'Bout not found' }
  const bout = boutSnap.data()!
  if (bout.status === 'completed' || bout.status === 'live') {
    return { success: false, error: 'This bout is locked' }
  }

  // Snapshot the picked fighter's name
  const pickedFighterName =
    pickedCorner === 'fighter1'
      ? (bout.fighter1Name as string) || ''
      : (bout.fighter2Name as string) || ''

  // One pick doc per user per bout (doc ID = `${userId}_${boutNumber}`).
  // First pick creates the doc; subsequent picks BEFORE the bout locks
  // are pick-swaps — overwrite the corner, keep createdAt, don't double-
  // count picksMade. The bout-status guard above ensures swaps only land
  // while the bout is still `scheduled`.
  const ref = picksCol(fightNightId).doc(pickDocId(userId, boutNumber))
  const existing = await ref.get()
  const now = new Date().toISOString()

  if (existing.exists) {
    const prev = existing.data() as FightNightPick
    if (prev.settled) {
      return { success: false, error: 'This pick is already settled' }
    }
    // No-op when re-tapping the same corner.
    if (prev.pickedCorner === pickedCorner) {
      return { success: true }
    }
    await ref.update({
      pickedCorner,
      pickedFighterName,
      updatedAt: now,
    })
    return { success: true }
  }

  const pick: FightNightPick = {
    userId,
    boutNumber,
    pickedCorner,
    pickedFighterName,
    settled: false,
    won: null,
    pointsAwarded: 0,
    createdAt: now,
    settledAt: null,
  }
  await ref.set(pick)

  // Bump picksMade on standings only on first pick — swaps don't increment.
  try {
    const userSnap = await firestore.collection('users').doc(userId).get()
    const u = userSnap.exists ? userSnap.data() : null
    await incrementPicksMade(fightNightId, userId, {
      displayName: u?.displayName || null,
      photoURL: u?.photoURL || null,
      email: u?.email || null,
    })
  } catch {
    // Non-critical
  }

  return { success: true }
}

// ── Read Picks ─────────────────────────────────────────────

export async function getUserPicks(
  fightNightId: string,
  userId: string
): Promise<FightNightPick[]> {
  if (!fightNightId || !userId) return []
  // Sort client-side rather than on Firestore so we don't need a
  // composite (userId, boutNumber) index. Per-user picks are bounded
  // by the bout count (~8/event), so the sort is effectively free.
  const snap = await picksCol(fightNightId)
    .where('userId', '==', userId)
    .get()
  const picks = snap.docs.map((d) => d.data() as FightNightPick)
  return picks.sort((a, b) => a.boutNumber - b.boutNumber)
}

export async function getPicksForBout(
  fightNightId: string,
  boutNumber: number
): Promise<FightNightPick[]> {
  if (!fightNightId || !boutNumber) return []
  const snap = await picksCol(fightNightId)
    .where('boutNumber', '==', boutNumber)
    .get()
  return snap.docs.map((d) => d.data() as FightNightPick)
}

/**
 * Count of all bout picks placed on a fight night. Uses Firestore's
 * server-side count aggregation so the cost is one read regardless of
 * how many pick docs exist. Drives the Overview engagement metric.
 */
export async function getPickCount(fightNightId: string): Promise<number> {
  if (!fightNightId) return 0
  const agg = await picksCol(fightNightId).count().get()
  return agg.data().count
}

// ── Record + Settle a Bout ─────────────────────────────────

/**
 * Atomic fight-night control: write the bout's winner, mark it completed,
 * settle every pick on that bout, increment standings for winners.
 *
 * @param winnerCorner  'fighter1' | 'fighter2' | 'draw'
 */
export async function recordFightNightBoutResult(
  fightNightId: string,
  boutNumber: number,
  winnerCorner: 'fighter1' | 'fighter2' | 'draw'
): Promise<{
  success: boolean
  settled: number
  winners: number
  error?: string
}> {
  if (!fightNightId || !boutNumber) {
    return { success: false, settled: 0, winners: 0, error: 'Missing args' }
  }

  const boutRef = firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('bouts')
    .doc(String(boutNumber))
  const boutSnap = await boutRef.get()
  if (!boutSnap.exists) {
    return { success: false, settled: 0, winners: 0, error: 'Bout not found' }
  }

  // Update bout: status completed + winnerCorner + completedAt
  const now = new Date().toISOString()
  await boutRef.update({
    winnerCorner,
    status: 'completed' as const,
    completedAt: now,
    updatedAt: now,
  })

  // Pull all picks for this bout
  const picksSnap = await picksCol(fightNightId)
    .where('boutNumber', '==', boutNumber)
    .get()

  // Lock any open props tied to this bout (per-fight lock cascade) — non-critical
  try {
    await lockPropsForBout(fightNightId, boutNumber)
  } catch {
    // Non-critical
  }

  if (picksSnap.empty) {
    return { success: true, settled: 0, winners: 0 }
  }

  let settled = 0
  let winners = 0
  const winnerUserIds: string[] = []
  const loserUserIds: string[] = []
  const drawUserIds: string[] = []

  for (const doc of picksSnap.docs) {
    const pick = doc.data() as FightNightPick
    if (pick.settled) continue // already settled — skip

    let won = false
    let pointsAwarded = 0

    if (winnerCorner === 'draw') {
      // Nobody wins on a draw
      won = false
    } else if (pick.pickedCorner === winnerCorner) {
      won = true
      pointsAwarded = MATCH_WIN_POINTS
    }

    await doc.ref.update({
      settled: true,
      won,
      pointsAwarded,
      settledAt: now,
    })
    settled++

    if (winnerCorner === 'draw') {
      drawUserIds.push(pick.userId)
    } else if (won) {
      winnerUserIds.push(pick.userId)
    } else {
      loserUserIds.push(pick.userId)
    }

    if (won) {
      winners++
      try {
        const userSnap = await firestore.collection('users').doc(pick.userId).get()
        const u = userSnap.exists ? userSnap.data() : null
        await incrementStandingPoints(fightNightId, pick.userId, pointsAwarded, {
          displayName: u?.displayName || null,
          photoURL: u?.photoURL || null,
          email: u?.email || null,
        })
      } catch {
        // Non-critical — points will be off, but settlement succeeded
      }
    }
  }

  // Outcome-grouped push pings — winners, losers, draws each get a
  // tailored message. Same tag as the live push so a stale "live" alert
  // gets replaced by the settled one.
  try {
    const boutData = boutSnap.data() as
      | { fighter1Name?: string; fighter2Name?: string }
      | undefined
    const winnerName =
      winnerCorner === 'fighter1'
        ? boutData?.fighter1Name || 'Red corner'
        : winnerCorner === 'fighter2'
          ? boutData?.fighter2Name || 'Blue corner'
          : null
    const tag = `bout-${fightNightId}-${boutNumber}`
    const url = await fightNightBoutPath(fightNightId, boutNumber)

    if (winnerUserIds.length > 0) {
      await sendPushToUsers(
        winnerUserIds,
        `Your pick won · Bout ${boutNumber}`,
        `+${MATCH_WIN_POINTS} pts. ${winnerName} took it.`,
        url,
        tag
      )
    }
    if (loserUserIds.length > 0 && winnerName) {
      await sendPushToUsers(
        loserUserIds,
        `Bout ${boutNumber} settled`,
        `${winnerName} took it. Your pick missed.`,
        url,
        tag
      )
    }
    if (drawUserIds.length > 0) {
      await sendPushToUsers(
        drawUserIds,
        `Bout ${boutNumber} was a draw`,
        `No points awarded.`,
        url,
        tag
      )
    }
  } catch {
    // Non-critical — settlement is the source of truth, push is just UX
  }

  return { success: true, settled, winners }
}

/**
 * Lock all open bouts at or before a given bout number (called when a bout starts).
 * Use this when the admin clicks "Bout N is live" before recording the result, to prevent
 * late picks once the bell has rung.
 */
export async function markBoutLive(
  fightNightId: string,
  boutNumber: number
): Promise<void> {
  const boutRef = firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('bouts')
    .doc(String(boutNumber))
  const now = new Date().toISOString()
  await boutRef.update({
    status: 'live' as const,
    startedAt: now,
    updatedAt: now,
  })

  // Cascade: any prop tied to this bout also locks the moment the bell
  // rings — so fans can't sneak prop picks in after the bout has started.
  // Non-critical; the bout flip is the source of truth.
  try {
    await lockPropsForBout(fightNightId, boutNumber)
  } catch {
    // ignore
  }

  // Ping fans whose picks are now in flight on this bout. Push failures
  // must not block the status update, so wrap in try/catch.
  try {
    const boutSnap = await boutRef.get()
    const bout = boutSnap.data() as
      | { fighter1Name?: string; fighter2Name?: string }
      | undefined
    const picksSnap = await picksCol(fightNightId)
      .where('boutNumber', '==', boutNumber)
      .get()
    const userIds = Array.from(
      new Set(picksSnap.docs.map((d) => (d.data() as FightNightPick).userId))
    )
    if (userIds.length > 0) {
      const matchup =
        bout?.fighter1Name && bout?.fighter2Name
          ? `${bout.fighter1Name} vs ${bout.fighter2Name}`
          : `Bout ${boutNumber}`
      const liveUrl = await fightNightBoutPath(fightNightId, boutNumber)
      await sendPushToUsers(
        userIds,
        `Bout ${boutNumber} is live`,
        `${matchup} — your pick is on the line.`,
        liveUrl,
        `bout-${fightNightId}-${boutNumber}`
      )
    }
  } catch {
    // Non-critical — status flip is the source of truth, push is just UX
  }
}

/**
 * Reopen a previously-settled bout. Undoes the side-effects of
 * `recordFightNightBoutResult`:
 *   - Resets bout to `scheduled` (clears winnerCorner, completedAt,
 *     startedAt) so admin can mark it live again and declare a winner.
 *   - Resets every pick on the bout (settled → false, won/pointsAwarded
 *     cleared).
 *   - For each pick that previously won, decrements that user's standing
 *     points + picksWon counter by the awarded amount.
 *
 * Intended for testing cleanup and "I declared the wrong winner" rescues.
 * Push notifications are NOT reversed (already delivered).
 */
export async function reopenFightNightBout(
  fightNightId: string,
  boutNumber: number
): Promise<{
  success: boolean
  unsettled: number
  pointsReversed: number
  error?: string
}> {
  if (!fightNightId || !boutNumber) {
    return { success: false, unsettled: 0, pointsReversed: 0, error: 'Missing args' }
  }

  const boutRef = firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('bouts')
    .doc(String(boutNumber))
  const boutSnap = await boutRef.get()
  if (!boutSnap.exists) {
    return { success: false, unsettled: 0, pointsReversed: 0, error: 'Bout not found' }
  }
  const bout = boutSnap.data() as { status?: string }
  if (bout.status !== 'completed') {
    return {
      success: false,
      unsettled: 0,
      pointsReversed: 0,
      error: 'Bout is not settled — nothing to reopen',
    }
  }

  const picksSnap = await picksCol(fightNightId)
    .where('boutNumber', '==', boutNumber)
    .get()

  let unsettled = 0
  let pointsReversed = 0
  const now = new Date().toISOString()

  for (const doc of picksSnap.docs) {
    const pick = doc.data() as FightNightPick
    if (pick.settled && pick.won === true && pick.pointsAwarded > 0) {
      try {
        const standingRef = firestore
          .collection('fightNights')
          .doc(fightNightId)
          .collection('standings')
          .doc(pick.userId)
        await firestore.runTransaction(async (tx) => {
          const snap = await tx.get(standingRef)
          if (!snap.exists) return
          const cur = snap.data() as { points?: number; picksWon?: number }
          tx.update(standingRef, {
            points: Math.max(0, (cur.points || 0) - pick.pointsAwarded),
            picksWon: Math.max(0, (cur.picksWon || 0) - 1),
            updatedAt: now,
          })
        })
        pointsReversed += pick.pointsAwarded
      } catch {
        // Non-critical — pick reset still happens below
      }
    }
    await doc.ref.update({
      settled: false,
      won: null,
      pointsAwarded: 0,
      settledAt: null,
    })
    unsettled++
  }

  await boutRef.update({
    status: 'scheduled' as const,
    winnerCorner: null,
    completedAt: null,
    startedAt: null,
    updatedAt: now,
  })

  // Reverse the prop-lock cascade that fired when this bout originally
  // went live. Settled and voided props are preserved — only props that
  // were auto-locked by the bout lifecycle flip back to open. Non-
  // critical: bout state is the source of truth, prop sync is UX.
  try {
    await unlockPropsForBout(fightNightId, boutNumber)
  } catch {
    // ignore
  }

  return { success: true, unsettled, pointsReversed }
}
