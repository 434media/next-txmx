'use server'

import { firestore } from '../../lib/firebase-admin'
import {
  incrementStandingPoints,
  incrementPicksMade,
} from './fightnight-standings'

// ── Types ────────────────────────────────────────────────

export type PropStatus = 'open' | 'locked' | 'settled' | 'voided'

export interface PropOption {
  id: string
  label: string
}

export interface FightNightProp {
  id: string
  title: string
  description: string
  options: PropOption[]
  status: PropStatus
  correctOptionId: string | null
  pointsReward: number
  /** When true, payout is multiplied by 1.25 for winners */
  isUnderdog: boolean
  /** Optional tie to a bout — when that bout is recorded the prop auto-locks */
  boutNumber: number | null
  createdAt: string
  updatedAt: string
  settledAt: string | null
}

export interface FightNightPropPick {
  userId: string
  propId: string
  optionId: string
  createdAt: string
  settled: boolean
  won: boolean | null
  pointsAwarded: number
}

const UNDERDOG_MULTIPLIER = 1.25

function propsCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('props')
}

function picksCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('propPicks')
}

function pickDocId(userId: string, propId: string): string {
  return `${userId}_${propId}`
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function mapProp(doc: FirebaseFirestore.DocumentSnapshot): FightNightProp {
  const data = doc.data() || {}
  return {
    id: doc.id,
    title: data.title || '',
    description: data.description || '',
    options: (data.options as PropOption[]) || [],
    status: (data.status as PropStatus) || 'open',
    correctOptionId: data.correctOptionId || null,
    pointsReward: typeof data.pointsReward === 'number' ? data.pointsReward : 0,
    isUnderdog: data.isUnderdog === true,
    boutNumber: typeof data.boutNumber === 'number' ? data.boutNumber : null,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    settledAt: data.settledAt || null,
  }
}

// ── Prop CRUD ────────────────────────────────────────────

export async function createProp(
  fightNightId: string,
  data: {
    title: string
    description?: string
    options: { label: string }[]
    pointsReward?: number
    isUnderdog?: boolean
    boutNumber?: number | null
  }
): Promise<FightNightProp> {
  if (!fightNightId) throw new Error('Missing fightNightId')
  if (!data.title.trim()) throw new Error('Title is required')
  if (!data.options || data.options.length < 2) {
    throw new Error('At least 2 options required')
  }

  const now = new Date().toISOString()
  const payload = {
    title: data.title.trim(),
    description: (data.description || '').trim(),
    options: data.options.map((o) => ({
      id: generateId(),
      label: o.label.trim(),
    })),
    status: 'open' as PropStatus,
    correctOptionId: null,
    pointsReward: data.pointsReward ?? 500,
    isUnderdog: data.isUnderdog === true,
    boutNumber: typeof data.boutNumber === 'number' ? data.boutNumber : null,
    createdAt: now,
    updatedAt: now,
    settledAt: null,
  }
  const ref = await propsCol(fightNightId).add(payload)
  return { id: ref.id, ...payload }
}

export async function updatePropStatus(
  fightNightId: string,
  propId: string,
  status: PropStatus
): Promise<void> {
  await propsCol(fightNightId).doc(propId).update({
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteProp(
  fightNightId: string,
  propId: string
): Promise<void> {
  await propsCol(fightNightId).doc(propId).delete()
}

export async function getProps(fightNightId: string): Promise<FightNightProp[]> {
  if (!fightNightId) return []
  const snap = await propsCol(fightNightId).orderBy('createdAt', 'asc').get()
  return snap.docs.map(mapProp)
}

export async function getProp(
  fightNightId: string,
  propId: string
): Promise<FightNightProp | null> {
  if (!fightNightId || !propId) return null
  const snap = await propsCol(fightNightId).doc(propId).get()
  if (!snap.exists) return null
  return mapProp(snap)
}

/**
 * Lock all open props for a specific bout. Called by recordFightNightBoutResult.
 */
export async function lockPropsForBout(
  fightNightId: string,
  boutNumber: number
): Promise<{ locked: number }> {
  if (!fightNightId || !boutNumber) return { locked: 0 }
  const snap = await propsCol(fightNightId)
    .where('boutNumber', '==', boutNumber)
    .where('status', '==', 'open')
    .get()
  if (snap.empty) return { locked: 0 }
  const batch = firestore.batch()
  const now = new Date().toISOString()
  for (const d of snap.docs) {
    batch.update(d.ref, { status: 'locked' as PropStatus, updatedAt: now })
  }
  await batch.commit()
  return { locked: snap.size }
}

// ── Place a Pick ──────────────────────────────────────────

export async function placePropPick(
  fightNightId: string,
  userId: string,
  propId: string,
  optionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!fightNightId || !userId || !propId) {
    return { success: false, error: 'Missing args' }
  }

  const propRef = propsCol(fightNightId).doc(propId)
  const propSnap = await propRef.get()
  if (!propSnap.exists) return { success: false, error: 'Prop not found' }
  const prop = mapProp(propSnap)
  if (prop.status !== 'open') {
    return { success: false, error: 'This prop is no longer accepting picks' }
  }
  if (!prop.options.some((o) => o.id === optionId)) {
    return { success: false, error: 'Invalid option' }
  }

  const ref = picksCol(fightNightId).doc(pickDocId(userId, propId))
  const existing = await ref.get()
  if (existing.exists) {
    return { success: false, error: 'You already picked this prop' }
  }

  const now = new Date().toISOString()
  await ref.set({
    userId,
    propId,
    optionId,
    createdAt: now,
    settled: false,
    won: null,
    pointsAwarded: 0,
  } as FightNightPropPick)

  // Bump picksMade on standings (non-critical)
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

export async function getUserPropPicks(
  fightNightId: string,
  userId: string
): Promise<FightNightPropPick[]> {
  if (!fightNightId || !userId) return []
  const snap = await picksCol(fightNightId).where('userId', '==', userId).get()
  return snap.docs.map((d) => d.data() as FightNightPropPick)
}

// ── Settle ─────────────────────────────────────────────────

/**
 * Settle a prop by marking the correct option. Awards points to every user
 * who picked correctly, increments their standing.
 */
export async function settleProp(
  fightNightId: string,
  propId: string,
  correctOptionId: string
): Promise<{
  success: boolean
  settled: number
  winners: number
  error?: string
}> {
  if (!fightNightId || !propId) {
    return { success: false, settled: 0, winners: 0, error: 'Missing args' }
  }

  const propRef = propsCol(fightNightId).doc(propId)
  const propSnap = await propRef.get()
  if (!propSnap.exists) {
    return { success: false, settled: 0, winners: 0, error: 'Prop not found' }
  }
  const prop = mapProp(propSnap)
  if (prop.status === 'settled') {
    return { success: false, settled: 0, winners: 0, error: 'Already settled' }
  }
  if (!prop.options.some((o) => o.id === correctOptionId)) {
    return {
      success: false,
      settled: 0,
      winners: 0,
      error: 'correctOptionId is not a valid option',
    }
  }

  const now = new Date().toISOString()
  await propRef.update({
    status: 'settled' as PropStatus,
    correctOptionId,
    settledAt: now,
    updatedAt: now,
  })

  // Pull all picks
  const picksSnap = await picksCol(fightNightId)
    .where('propId', '==', propId)
    .get()
  if (picksSnap.empty) {
    return { success: true, settled: 0, winners: 0 }
  }

  const points = prop.isUnderdog
    ? Math.max(1, Math.floor(prop.pointsReward * UNDERDOG_MULTIPLIER))
    : prop.pointsReward

  let settled = 0
  let winners = 0

  for (const doc of picksSnap.docs) {
    const pick = doc.data() as FightNightPropPick
    if (pick.settled) continue
    const won = pick.optionId === correctOptionId
    await doc.ref.update({
      settled: true,
      won,
      pointsAwarded: won ? points : 0,
    })
    settled++
    if (won) {
      winners++
      try {
        const userSnap = await firestore.collection('users').doc(pick.userId).get()
        const u = userSnap.exists ? userSnap.data() : null
        await incrementStandingPoints(fightNightId, pick.userId, points, {
          displayName: u?.displayName || null,
          photoURL: u?.photoURL || null,
          email: u?.email || null,
        })
      } catch {
        // Non-critical
      }
    }
  }

  return { success: true, settled, winners }
}

export async function voidProp(
  fightNightId: string,
  propId: string
): Promise<void> {
  await propsCol(fightNightId).doc(propId).update({
    status: 'voided' as PropStatus,
    updatedAt: new Date().toISOString(),
  })
}
