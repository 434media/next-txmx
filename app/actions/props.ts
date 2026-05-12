"use server"

import { firestore } from "../../lib/firebase-admin"
import { awardSP } from "./skill-points"
import { awardCredits } from "./credits"
import { checkCooldown, checkCategoryCap, setCooldown, incrementDailyTracker } from "./rate-limiter"
import { getEconomyConfig } from "./economy"
import { incrementQuestProgress } from "./quests"
import { getUserByUid } from "./users"
import type { EventMode } from "./events"
import { incrementEventSP, incrementEventTC, incrementEventPicksMade } from "./event-leaderboard"

export type PropStatus = "open" | "locked" | "settled" | "voided"
export type PropType = "match_winner" | "method" | "round" | "over_under"

export interface Prop {
  id: string
  eventId: string
  eventDate: string
  /** Snapshotted from the event at create-time. 'free-props' opens this prop to non-Black-Card users. */
  eventMode: EventMode
  /** Bout this prop is tied to (1-indexed). null/undefined for event-wide props. */
  boutNumber: number | null
  title: string
  description: string
  type: PropType
  options: PropOption[]
  status: PropStatus
  correctOptionId: string | null
  spReward: number
  tcReward: number
  isUnderdog: boolean
  createdAt: string
  updatedAt: string
  settledAt: string | null
}

export interface PropOption {
  id: string
  label: string
  description?: string
}

export interface PropPick {
  id: string
  propId: string
  userId: string
  optionId: string
  createdAt: string
  settled: boolean
  won: boolean | null
}

function mapPropDoc(doc: FirebaseFirestore.QueryDocumentSnapshot): Prop {
  const data = doc.data()
  return {
    id: doc.id,
    ...data,
    eventMode: (data.eventMode as EventMode) || 'standard',
    boutNumber: typeof data.boutNumber === 'number' ? data.boutNumber : null,
  } as Prop
}

/**
 * Bulk-lock all open props for a specific bout. Called from `recordBoutResult`
 * to enforce the per-fight lock cascade — once the bout's result is recorded
 * no further picks can be placed on it.
 */
export async function lockPropsForBout(
  eventId: string,
  boutNumber: number
): Promise<{ locked: number }> {
  if (!eventId || !boutNumber) return { locked: 0 }

  const snap = await firestore
    .collection('props')
    .where('eventId', '==', eventId)
    .where('boutNumber', '==', boutNumber)
    .where('status', '==', 'open')
    .get()

  if (snap.empty) return { locked: 0 }

  const batch = firestore.batch()
  const now = new Date().toISOString()
  for (const d of snap.docs) {
    batch.update(d.ref, { status: 'locked', updatedAt: now })
  }
  await batch.commit()
  return { locked: snap.size }
}

export async function getProps(status?: PropStatus): Promise<Prop[]> {
  let query = firestore.collection("props").orderBy("createdAt", "desc") as FirebaseFirestore.Query

  if (status) {
    query = query.where("status", "==", status)
  }

  const snapshot = await query.limit(100).get()

  return snapshot.docs.map(mapPropDoc)
}

export async function getOpenProps(): Promise<Prop[]> {
  return getProps("open")
}

export async function getPropsByEvent(eventId: string): Promise<Prop[]> {
  const snapshot = await firestore
    .collection("props")
    .where("eventId", "==", eventId)
    .orderBy("createdAt", "asc")
    .get()

  return snapshot.docs.map(mapPropDoc)
}

export async function createProp(
  data: Omit<Prop, "id" | "createdAt" | "updatedAt" | "settledAt" | "correctOptionId" | "status" | "eventMode" | "boutNumber"> & {
    eventMode?: EventMode
    boutNumber?: number | null
  }
): Promise<{ success: boolean; id: string }> {
  const now = new Date().toISOString()

  // Snapshot eventMode from the linked event so the prop carries its own copy
  let eventMode: EventMode = data.eventMode || 'standard'
  if (!data.eventMode && data.eventId) {
    const eventSnap = await firestore.collection('events').doc(data.eventId).get()
    if (eventSnap.exists) {
      const mode = eventSnap.data()?.eventMode as EventMode | undefined
      if (mode) eventMode = mode
    }
  }

  const docRef = await firestore.collection("props").add({
    ...data,
    eventMode,
    boutNumber: typeof data.boutNumber === 'number' ? data.boutNumber : null,
    status: "open" as PropStatus,
    correctOptionId: null,
    settledAt: null,
    createdAt: now,
    updatedAt: now,
  })
  return { success: true, id: docRef.id }
}

export async function updatePropStatus(
  propId: string,
  status: PropStatus,
  correctOptionId?: string
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  }

  if (status === "settled" && correctOptionId) {
    updates.correctOptionId = correctOptionId
    updates.settledAt = new Date().toISOString()
  }

  await firestore.collection("props").doc(propId).update(updates)
  return { success: true }
}

export async function placePick(
  propId: string,
  userId: string,
  optionId: string
): Promise<{ success: boolean; error?: string }> {
  // Check cooldown and category cap before creating the pick
  const config = await getEconomyConfig()

  if (config.predictionCooldownSeconds > 0) {
    const cdResult = await checkCooldown(userId, 'prediction', config.predictionCooldownSeconds * 1000)
    if (!cdResult.allowed) {
      return { success: false, error: cdResult.reason || 'Cooldown active' }
    }
  }

  if (config.dailyPredictionLimit > 0) {
    const catResult = await checkCategoryCap(userId, 'predictions', config.dailyPredictionLimit)
    if (!catResult.allowed) {
      return { success: false, error: catResult.reason || 'Daily prediction limit reached' }
    }
  }

  const propRef = firestore.collection("props").doc(propId)
  const propSnap = await propRef.get()

  if (!propSnap.exists) throw new Error("Prop not found")

  const prop = propSnap.data() as Omit<Prop, "id">
  if (prop.status !== "open") throw new Error("This prop is no longer accepting picks")

  // Check option exists
  const validOption = prop.options.some((o) => o.id === optionId)
  if (!validOption) throw new Error("Invalid option")

  // Check for existing pick (one pick per user per prop)
  const existingSnap = await firestore
    .collection("picks")
    .where("propId", "==", propId)
    .where("userId", "==", userId)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    throw new Error("You already placed a pick on this prop")
  }

  const now = new Date().toISOString()
  await firestore.collection("picks").add({
    propId,
    userId,
    optionId,
    createdAt: now,
    settled: false,
    won: null,
  })

  // Record cooldown and category usage
  try {
    await Promise.all([
      setCooldown(userId, 'prediction'),
      incrementDailyTracker(userId, 'predictions', 1),
      incrementQuestProgress(userId, 'prediction_placed'),
    ])
  } catch {
    // Non-critical
  }

  // Track event participation for the event leaderboard (non-critical)
  if (prop.eventId) {
    try {
      const user = await getUserByUid(userId)
      await incrementEventPicksMade(prop.eventId, userId, {
        displayName: user?.displayName || null,
        photoURL: user?.photoURL || null,
        rank: user?.rank || 'rookie',
      })
    } catch {
      // Non-critical
    }
  }

  return { success: true }
}

export async function getUserPicks(
  userId: string,
  limit = 50
): Promise<PropPick[]> {
  const snapshot = await firestore
    .collection("picks")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PropPick[]
}

export async function getUserPicksForProp(
  userId: string,
  propId: string
): Promise<PropPick | null> {
  const snapshot = await firestore
    .collection("picks")
    .where("userId", "==", userId)
    .where("propId", "==", propId)
    .limit(1)
    .get()

  if (snapshot.empty) return null
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PropPick
}

export async function settleProp(propId: string, correctOptionId: string) {
  const propRef = firestore.collection("props").doc(propId)
  const propSnap = await propRef.get()

  if (!propSnap.exists) throw new Error("Prop not found")

  const prop = { id: propSnap.id, ...propSnap.data() } as Prop
  if (prop.status === "settled") throw new Error("Prop already settled")

  // Mark the prop as settled
  await updatePropStatus(propId, "settled", correctOptionId)

  // Get all picks for this prop
  const picksSnap = await firestore
    .collection("picks")
    .where("propId", "==", propId)
    .get()

  const batch = firestore.batch()
  const winnerUserIds: string[] = []
  for (const pickDoc of picksSnap.docs) {
    const pick = pickDoc.data() as Omit<PropPick, "id">
    const won = pick.optionId === correctOptionId
    batch.update(pickDoc.ref, { settled: true, won })
    if (won) {
      winnerUserIds.push(pick.userId)
    }
  }
  await batch.commit()

  // Award SP and TC to winners via ledgers
  const config = await getEconomyConfig()
  for (const winnerId of winnerUserIds) {
    const spKey = `prop_sp:${propId}:${winnerId}`
    const tcKey = `prop_tc:${propId}:${winnerId}`

    // Check subscriber status for earning multiplier
    const winner = await getUserByUid(winnerId)
    const isBlackCard = winner?.subscriptionStatus === 'active'
    const subMult = isBlackCard && config.subscriberMultiplier > 1 ? config.subscriberMultiplier : 1

    const boostedSP = Math.max(1, Math.floor(prop.spReward * subMult))
    try {
      await awardSP(winnerId, boostedSP, 'prop_pick_win', spKey, {
        referenceId: propId,
        eventId: prop.eventId,
        sourceType: prop.isUnderdog ? 'prop_pick_underdog' : 'prop_pick_standard',
        multiplierApplied: subMult > 1 ? subMult : undefined,
      })

      // Event-scoped leaderboard increment (non-critical)
      if (prop.eventId) {
        try {
          await incrementEventSP(prop.eventId, winnerId, boostedSP, {
            displayName: winner?.displayName || null,
            photoURL: winner?.photoURL || null,
            rank: winner?.rank || 'rookie',
          })
        } catch {
          // Non-critical
        }
      }
    } catch {
      // SP award failure is logged but doesn't block settlement
    }

    try {
      if (prop.tcReward > 0) {
        const boostedTC = Math.max(1, Math.floor(prop.tcReward * subMult))
        await awardCredits(
          winnerId,
          boostedTC,
          `Prop pick win: ${prop.title}`,
          tcKey,
          { propId, eventId: prop.eventId, ...(subMult > 1 ? { subscriberMultiplier: subMult } : {}) }
        )

        if (prop.eventId) {
          try {
            await incrementEventTC(prop.eventId, winnerId, boostedTC)
          } catch {
            // Non-critical
          }
        }
      }
    } catch {
      // TC award failure is logged but doesn't block settlement
    }

    try {
      await incrementQuestProgress(winnerId, 'prediction_won')
    } catch {
      // Quest tracking failure is non-critical
    }
  }

  return {
    success: true,
    totalPicks: picksSnap.size,
    winners: winnerUserIds.length,
  }
}
