'use server'

import { firestore } from '../../lib/firebase-admin'
import { getEventBouts, type EventBout } from './events'
import { awardSP } from './skill-points'
import { awardLP } from './loyalty-points'
import { getEconomyConfig } from './economy'
import { checkCooldown, checkCategoryCap, setCooldown, incrementDailyTracker } from './rate-limiter'
import { incrementQuestProgress } from './quests'
import { getUserByUid } from './users'
import { getFighterById } from './fighters'

// ── Types ────────────────────────────────────────────────

export interface MatchPick {
  id: string
  eventId: string
  eventNumber: string
  boutNumber: number
  userId: string
  fighter1Id: string
  fighter1Name: string
  fighter2Id: string
  fighter2Name: string
  pickedFighterId: string
  pickedFighterName: string
  settled: boolean
  won: boolean | null
  spAwarded: number | null
  createdAt: string
}

export interface MatchPickInput {
  eventId: string
  eventNumber: string
  boutNumber: number
  fighter1Id: string
  fighter1Name: string
  fighter2Id: string
  fighter2Name: string
  pickedFighterId: string
  pickedFighterName: string
}

export interface EventPickSummary {
  eventId: string
  totalBouts: number
  pickedBouts: number
  settledBouts: number
  wins: number
  losses: number
  pending: number
}

// ── Constants ────────────────────────────────────────────

const MATCH_PICKS_COL = 'matchPicks'
const MATCH_WINNER_SP = 100
const GYM_ROSTER_WIN_LP = 10_000

// ── Place a Pick ─────────────────────────────────────────

export async function placeMatchPick(
  userId: string,
  input: MatchPickInput
): Promise<{ success: boolean; error?: string }> {
  if (!userId.trim()) return { success: false, error: 'Not signed in' }
  if (!input.eventId.trim()) return { success: false, error: 'Missing event' }
  if (!input.pickedFighterId.trim()) return { success: false, error: 'No fighter selected' }

  // Validate the picked fighter is one of the two in the bout
  if (
    input.pickedFighterId !== input.fighter1Id &&
    input.pickedFighterId !== input.fighter2Id
  ) {
    return { success: false, error: 'Invalid fighter selection' }
  }

  // Check the event is upcoming (not past)
  const eventDoc = await firestore.collection('events').doc(input.eventId).get()
  if (!eventDoc.exists) return { success: false, error: 'Event not found' }

  const eventData = eventDoc.data()!
  const eventDate = eventData.date as string
  if (!eventDate) return { success: false, error: 'Event has no date' }

  const today = new Date().toISOString().slice(0, 10)
  if (eventDate < today) {
    return { success: false, error: 'This event has already passed' }
  }

  // Rate limiting: cooldown + daily prediction cap
  const config = await getEconomyConfig()

  if (config.predictionCooldownSeconds > 0) {
    const cdResult = await checkCooldown(
      userId,
      'match_prediction',
      config.predictionCooldownSeconds * 1000
    )
    if (!cdResult.allowed) {
      return { success: false, error: cdResult.reason || 'Cooldown active' }
    }
  }

  if (config.dailyPredictionLimit > 0) {
    const catResult = await checkCategoryCap(
      userId,
      'predictions',
      config.dailyPredictionLimit
    )
    if (!catResult.allowed) {
      return { success: false, error: catResult.reason || 'Daily prediction limit reached' }
    }
  }

  // One pick per user per bout per event
  const existingSnap = await firestore
    .collection(MATCH_PICKS_COL)
    .where('userId', '==', userId)
    .where('eventId', '==', input.eventId)
    .where('boutNumber', '==', input.boutNumber)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    return { success: false, error: 'You already picked this bout' }
  }

  const now = new Date().toISOString()
  const pick: Omit<MatchPick, 'id'> = {
    eventId: input.eventId,
    eventNumber: input.eventNumber,
    boutNumber: input.boutNumber,
    userId,
    fighter1Id: input.fighter1Id,
    fighter1Name: input.fighter1Name,
    fighter2Id: input.fighter2Id,
    fighter2Name: input.fighter2Name,
    pickedFighterId: input.pickedFighterId,
    pickedFighterName: input.pickedFighterName,
    settled: false,
    won: null,
    spAwarded: null,
    createdAt: now,
  }

  await firestore.collection(MATCH_PICKS_COL).add(pick)

  // Record cooldown + category usage + quest progress (non-critical)
  try {
    await Promise.all([
      setCooldown(userId, 'match_prediction'),
      incrementDailyTracker(userId, 'predictions', 1),
      incrementQuestProgress(userId, 'prediction_placed'),
    ])
  } catch {
    // Non-critical
  }

  return { success: true }
}

// ── Read Picks ───────────────────────────────────────────

export async function getUserMatchPicks(
  userId: string,
  limit = 100
): Promise<MatchPick[]> {
  const snapshot = await firestore
    .collection(MATCH_PICKS_COL)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MatchPick[]
}

export async function getUserMatchPicksForEvent(
  userId: string,
  eventId: string
): Promise<MatchPick[]> {
  const snapshot = await firestore
    .collection(MATCH_PICKS_COL)
    .where('userId', '==', userId)
    .where('eventId', '==', eventId)
    .orderBy('boutNumber', 'asc')
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MatchPick[]
}

export async function getMatchPicksForEvent(
  eventId: string
): Promise<MatchPick[]> {
  const snapshot = await firestore
    .collection(MATCH_PICKS_COL)
    .where('eventId', '==', eventId)
    .orderBy('createdAt', 'asc')
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MatchPick[]
}

export async function getEventPickSummary(
  userId: string,
  eventId: string,
  totalBouts: number
): Promise<EventPickSummary> {
  const picks = await getUserMatchPicksForEvent(userId, eventId)
  const settled = picks.filter((p) => p.settled)
  const wins = settled.filter((p) => p.won === true).length
  const losses = settled.filter((p) => p.won === false).length

  return {
    eventId,
    totalBouts,
    pickedBouts: picks.length,
    settledBouts: settled.length,
    wins,
    losses,
    pending: picks.length - settled.length,
  }
}

// ── Settlement ───────────────────────────────────────────

/**
 * Settle all match picks for an event.
 *
 * Pulls the real bout results via getEventBouts(), then for each bout:
 * - Finds all unsettled picks for that bout
 * - Compares pickedFighterId to the bout's winnerResolution
 * - Marks picks won/lost
 * - Awards SP to winners via the existing ledger system
 *
 * winnerResolution values from TDLR data:
 *   - "fighter1" → fighter1 won
 *   - "fighter2" → fighter2 won
 *   - "draw" → no winner
 *   - "" → not yet decided
 */
export async function settleEventMatchPicks(
  eventId: string,
  eventNumber: string
): Promise<{
  success: boolean
  settled: number
  winners: number
  draws: number
  skipped: number
  errors: number
}> {
  // 1. Get real bout results
  const bouts = await getEventBouts(eventNumber)
  if (bouts.length === 0) {
    return { success: true, settled: 0, winners: 0, draws: 0, skipped: 0, errors: 0 }
  }

  // 2. Get all unsettled picks for this event
  const picksSnap = await firestore
    .collection(MATCH_PICKS_COL)
    .where('eventId', '==', eventId)
    .where('settled', '==', false)
    .get()

  if (picksSnap.empty) {
    return { success: true, settled: 0, winners: 0, draws: 0, skipped: 0, errors: 0 }
  }

  // Index bouts by boutNumber for fast lookup
  const boutMap = new Map<number, EventBout>()
  for (const bout of bouts) {
    boutMap.set(bout.boutNumber, bout)
  }

  const config = await getEconomyConfig()
  let settled = 0
  let winners = 0
  let draws = 0
  let skipped = 0
  let errors = 0

  for (const pickDoc of picksSnap.docs) {
    const pick = pickDoc.data() as Omit<MatchPick, 'id'>
    const bout = boutMap.get(pick.boutNumber)

    // No matching bout data or no result yet — skip
    if (!bout || !bout.winnerResolution) {
      skipped++
      continue
    }

    // Determine winner fighter ID from the bout
    let winnerFighterId: string | null = null
    if (bout.winnerResolution === 'fighter1') {
      winnerFighterId = bout.fighter1Id
    } else if (bout.winnerResolution === 'fighter2') {
      winnerFighterId = bout.fighter2Id
    } else if (bout.winnerResolution === 'draw') {
      // Draw — no one wins, mark as settled + lost (no SP)
      await pickDoc.ref.update({
        settled: true,
        won: false,
        spAwarded: 0,
      })
      draws++
      settled++
      continue
    } else {
      // Unrecognized result — skip
      skipped++
      continue
    }

    const won = pick.pickedFighterId === winnerFighterId

    if (won) {
      // Award SP via ledger
      const idempotencyKey = `match_sp:${eventId}:${pick.boutNumber}:${pick.userId}`

      // Check for subscriber multiplier
      const user = await getUserByUid(pick.userId)
      const isBlackCard = user?.subscriptionStatus === 'active'
      const subMult =
        isBlackCard && config.subscriberMultiplier > 1
          ? config.subscriberMultiplier
          : 1

      const spAmount = Math.max(1, Math.floor(MATCH_WINNER_SP * subMult))

      try {
        await awardSP(pick.userId, spAmount, 'match_pick_win', idempotencyKey, {
          referenceId: pickDoc.id,
          eventId,
          sourceType: 'match_winner_open',
          multiplierApplied: subMult > 1 ? subMult : undefined,
        })

        await pickDoc.ref.update({
          settled: true,
          won: true,
          spAwarded: spAmount,
        })

        winners++
        settled++
      } catch {
        errors++
      }

      // Quest progress (non-critical)
      try {
        await incrementQuestProgress(pick.userId, 'prediction_won')
      } catch {
        // Non-critical
      }
    } else {
      // Lost — mark settled
      await pickDoc.ref.update({
        settled: true,
        won: false,
        spAwarded: 0,
      })
      settled++
    }
  }

  return { success: true, settled, winners, draws, skipped, errors }
}

// ── Settle a Single Bout ─────────────────────────────────

/**
 * Settle match picks for a specific bout in an event.
 * Useful for partial settlement when only some bouts have results.
 */
export async function settleBoutMatchPicks(
  eventId: string,
  boutNumber: number,
  winnerFighterId: string | null // null = draw
): Promise<{ settled: number; winners: number }> {
  const picksSnap = await firestore
    .collection(MATCH_PICKS_COL)
    .where('eventId', '==', eventId)
    .where('boutNumber', '==', boutNumber)
    .where('settled', '==', false)
    .get()

  if (picksSnap.empty) return { settled: 0, winners: 0 }

  const config = await getEconomyConfig()
  let settled = 0
  let winners = 0

  for (const pickDoc of picksSnap.docs) {
    const pick = pickDoc.data() as Omit<MatchPick, 'id'>

    if (winnerFighterId === null) {
      // Draw
      await pickDoc.ref.update({ settled: true, won: false, spAwarded: 0 })
      settled++
      continue
    }

    const won = pick.pickedFighterId === winnerFighterId

    if (won) {
      const idempotencyKey = `match_sp:${eventId}:${boutNumber}:${pick.userId}`
      const user = await getUserByUid(pick.userId)
      const isBlackCard = user?.subscriptionStatus === 'active'
      const subMult =
        isBlackCard && config.subscriberMultiplier > 1
          ? config.subscriberMultiplier
          : 1
      const spAmount = Math.max(1, Math.floor(MATCH_WINNER_SP * subMult))

      try {
        await awardSP(pick.userId, spAmount, 'match_pick_win', idempotencyKey, {
          referenceId: pickDoc.id,
          eventId,
          sourceType: 'match_winner_open',
          multiplierApplied: subMult > 1 ? subMult : undefined,
        })

        await pickDoc.ref.update({ settled: true, won: true, spAwarded: spAmount })
        winners++
      } catch {
        await pickDoc.ref.update({ settled: true, won: false, spAwarded: 0 })
      }

      try {
        await incrementQuestProgress(pick.userId, 'prediction_won')
      } catch {
        // Non-critical
      }
    } else {
      await pickDoc.ref.update({ settled: true, won: false, spAwarded: 0 })
    }

    settled++
  }

  // ── Gym Pledge LP: award LP to users pledged to the winning fighter's gym ──
  if (winnerFighterId) {
    try {
      const winnerFighter = await getFighterById(winnerFighterId)
      if (winnerFighter?.gymId) {
        const pledgedUsersSnap = await firestore
          .collection('users')
          .where('gymPledge', '==', winnerFighter.gymId)
          .get()

        for (const userDoc of pledgedUsersSnap.docs) {
          const lpKey = `gym_lp:${eventId}:${boutNumber}:${userDoc.id}`
          try {
            await awardLP(userDoc.id, GYM_ROSTER_WIN_LP, 'gym_roster_win', lpKey, {
              type: 'gym_roster_win',
              referenceId: winnerFighterId,
              eventId,
              sourceType: 'gym_roster_win',
            })
          } catch {
            // Idempotency or error — skip
          }
        }
      }
    } catch {
      // Non-critical: don't block settlement
    }
  }

  return { settled, winners }
}
