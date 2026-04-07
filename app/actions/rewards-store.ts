'use server'

import { firestore } from '../../lib/firebase-admin'
import { redeemCredits } from './credits'
import { postLPTransaction } from './loyalty-points'
import { awardBadge } from './quests'

/* ─── types ─── */

export type RewardCurrency = 'tc' | 'lp'
export type RewardCategory = 'avatar' | 'title' | 'badge' | 'booster' | 'physical' | 'experience'
export type RewardStatus = 'available' | 'sold_out' | 'hidden'
export type RewardLane = 'standard' | 'premium'

export interface RewardItem {
  id: string
  name: string
  description: string
  icon: string               // emoji or image URL
  category: RewardCategory
  currency: RewardCurrency
  price: number
  /** Max total redemptions, 0 = unlimited */
  stock: number
  /** Current redemption count */
  redeemed: number
  /** Current active reservation count */
  reserved: number
  status: RewardStatus
  /** Restrict to Black Card holders */
  blackCardOnly: boolean
  /** Badge ID to award on purchase (for badge category) */
  badgeId: string | null
  /** Locker item key to unlock (for avatar/title) */
  lockerItemId: string | null
  /** ISO timestamp — reward becomes available (null = immediately) */
  availableFrom: string | null
  /** ISO timestamp — reward becomes unavailable (null = no expiry) */
  availableUntil: string | null
  /** Store lane — groups items into Standard vs Premium sections */
  lane: RewardLane
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Redemption {
  id: string
  userId: string
  rewardId: string
  rewardName: string
  currency: RewardCurrency
  price: number
  status: 'completed' | 'pending' | 'refunded'
  redeemedAt: string
}

export interface Reservation {
  id: string
  userId: string
  rewardId: string
  rewardName: string
  currency: RewardCurrency
  price: number
  status: 'held' | 'confirmed' | 'expired' | 'canceled'
  createdAt: string
  expiresAt: string
}

/** Reservation hold duration in milliseconds (5 minutes) */
const HOLD_DURATION_MS = 5 * 60 * 1000

/* ─── Firestore paths ─── */
const REWARDS_COL = 'rewards'
const REDEMPTIONS_COL = 'redemptions'
const RESERVATIONS_COL = 'reservations'

/* ─── admin CRUD ─── */

export async function createReward(
  reward: Omit<RewardItem, 'id' | 'redeemed' | 'reserved' | 'createdAt' | 'updatedAt'>
): Promise<RewardItem> {
  const now = new Date().toISOString()
  const ref = firestore.collection(REWARDS_COL).doc()
  const doc: RewardItem = {
    ...reward,
    id: ref.id,
    redeemed: 0,
    reserved: 0,
    createdAt: now,
    updatedAt: now,
  }
  await ref.set(doc)
  return doc
}

export async function updateReward(
  id: string,
  patch: Partial<Omit<RewardItem, 'id' | 'createdAt'>>
): Promise<void> {
  if (!id) throw new Error('Reward id is required')
  await firestore.collection(REWARDS_COL).doc(id).update({
    ...patch,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteReward(id: string): Promise<void> {
  if (!id) throw new Error('Reward id is required')
  await firestore.collection(REWARDS_COL).doc(id).delete()
}

export async function getRewards(): Promise<RewardItem[]> {
  const snap = await firestore
    .collection(REWARDS_COL)
    .orderBy('sortOrder', 'asc')
    .get()
  return snap.docs.map(d => d.data() as RewardItem)
}

export async function getAvailableRewards(): Promise<RewardItem[]> {
  const all = await getRewards()
  const now = Date.now()
  return all.filter(r => {
    if (r.status !== 'available') return false
    if (r.stock > 0 && (r.redeemed + (r.reserved || 0)) >= r.stock) return false
    // Time-window filtering: hide rewards outside their availability window
    if (r.availableFrom && new Date(r.availableFrom).getTime() > now) return false
    if (r.availableUntil && new Date(r.availableUntil).getTime() < now) return false
    return true
  })
}

/* ─── redemption ─── */

export async function redeemReward(
  userId: string,
  rewardId: string,
  opts?: { isBlackCard?: boolean }
): Promise<{ success: boolean; error?: string; redemption?: Redemption }> {
  // Load reward
  const rewardRef = firestore.collection(REWARDS_COL).doc(rewardId)
  const rewardSnap = await rewardRef.get()
  if (!rewardSnap.exists) return { success: false, error: 'Reward not found' }
  const reward = rewardSnap.data() as RewardItem

  // Validate
  if (reward.status !== 'available') return { success: false, error: 'Reward not available' }
  if (reward.stock > 0 && reward.redeemed >= reward.stock) return { success: false, error: 'Sold out' }
  if (reward.blackCardOnly && !opts?.isBlackCard) return { success: false, error: 'Black Card required' }

  // Time-window checks
  const now = Date.now()
  if (reward.availableFrom && new Date(reward.availableFrom).getTime() > now) {
    return { success: false, error: 'This reward is not available yet' }
  }
  if (reward.availableUntil && new Date(reward.availableUntil).getTime() < now) {
    return { success: false, error: 'This reward has expired' }
  }

  const idempotencyKey = `reward:${rewardId}:${userId}:${Date.now()}`

  // Deduct currency
  try {
    if (reward.currency === 'tc') {
      await redeemCredits(userId, reward.price, rewardId, idempotencyKey)
    } else {
      // LP redemption
      await postLPTransaction({
        userId,
        amount: -Math.abs(reward.price),
        type: 'adjustment',
        source: `Reward redemption: ${reward.name}`,
        idempotencyKey,
        sourceType: 'reward_redemption',
        metadata: { rewardId },
      })
    }
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('insufficient')) {
      return { success: false, error: `Not enough ${reward.currency === 'tc' ? 'TX-Credits' : 'Loyalty Points'}` }
    }
    return { success: false, error: 'Payment failed' }
  }

  // Increment redeemed count
  const { FieldValue } = await import('firebase-admin/firestore')
  await rewardRef.update({ redeemed: FieldValue.increment(1), updatedAt: new Date().toISOString() })

  // Record redemption
  const redemptionRef = firestore.collection(REDEMPTIONS_COL).doc()
  const redemption: Redemption = {
    id: redemptionRef.id,
    userId,
    rewardId,
    rewardName: reward.name,
    currency: reward.currency,
    price: reward.price,
    status: 'completed',
    redeemedAt: new Date().toISOString(),
  }
  await redemptionRef.set(redemption)

  // Grant reward-specific items
  if (reward.badgeId) {
    try { await awardBadge(userId, reward.badgeId, `reward:${rewardId}`) } catch { /* */ }
  }
  if (reward.lockerItemId) {
    try { await unlockLockerItem(userId, reward.lockerItemId, `reward:${rewardId}`) } catch { /* */ }
  }

  return { success: true, redemption }
}

export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  const snap = await firestore
    .collection(REDEMPTIONS_COL)
    .where('userId', '==', userId)
    .orderBy('redeemedAt', 'desc')
    .limit(100)
    .get()
  return snap.docs.map(d => d.data() as Redemption)
}

/* ─── reservations (cart hold) ─── */

export async function reserveReward(
  userId: string,
  rewardId: string,
  opts?: { isBlackCard?: boolean }
): Promise<{ success: boolean; error?: string; reservation?: Reservation }> {
  const rewardRef = firestore.collection(REWARDS_COL).doc(rewardId)
  const rewardSnap = await rewardRef.get()
  if (!rewardSnap.exists) return { success: false, error: 'Reward not found' }
  const reward = rewardSnap.data() as RewardItem

  // Validate availability
  if (reward.status !== 'available') return { success: false, error: 'Reward not available' }
  if (reward.stock > 0 && (reward.redeemed + (reward.reserved || 0)) >= reward.stock) {
    return { success: false, error: 'Sold out' }
  }
  if (reward.blackCardOnly && !opts?.isBlackCard) return { success: false, error: 'Black Card required' }

  const now = Date.now()
  if (reward.availableFrom && new Date(reward.availableFrom).getTime() > now) {
    return { success: false, error: 'This reward is not available yet' }
  }
  if (reward.availableUntil && new Date(reward.availableUntil).getTime() < now) {
    return { success: false, error: 'This reward has expired' }
  }

  // Check for existing active reservation by this user for this reward
  const existingSnap = await firestore
    .collection(RESERVATIONS_COL)
    .where('userId', '==', userId)
    .where('rewardId', '==', rewardId)
    .where('status', '==', 'held')
    .limit(1)
    .get()
  if (!existingSnap.empty) {
    return { success: false, error: 'You already have a hold on this item' }
  }

  // Atomically increment reserved count
  const { FieldValue } = await import('firebase-admin/firestore')
  await rewardRef.update({ reserved: FieldValue.increment(1) })

  const resRef = firestore.collection(RESERVATIONS_COL).doc()
  const reservation: Reservation = {
    id: resRef.id,
    userId,
    rewardId,
    rewardName: reward.name,
    currency: reward.currency,
    price: reward.price,
    status: 'held',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(now + HOLD_DURATION_MS).toISOString(),
  }
  await resRef.set(reservation)

  return { success: true, reservation }
}

export async function confirmReservation(
  userId: string,
  reservationId: string
): Promise<{ success: boolean; error?: string; redemption?: Redemption }> {
  const resRef = firestore.collection(RESERVATIONS_COL).doc(reservationId)
  const resSnap = await resRef.get()
  if (!resSnap.exists) return { success: false, error: 'Reservation not found' }
  const reservation = resSnap.data() as Reservation

  if (reservation.userId !== userId) return { success: false, error: 'Not your reservation' }
  if (reservation.status !== 'held') return { success: false, error: 'Reservation is no longer active' }

  // Check if expired
  if (new Date(reservation.expiresAt).getTime() < Date.now()) {
    // Release the hold
    await resRef.update({ status: 'expired' })
    const { FieldValue } = await import('firebase-admin/firestore')
    await firestore.collection(REWARDS_COL).doc(reservation.rewardId).update({
      reserved: FieldValue.increment(-1),
    })
    return { success: false, error: 'Reservation expired' }
  }

  // Load reward for granting items
  const rewardSnap = await firestore.collection(REWARDS_COL).doc(reservation.rewardId).get()
  const reward = rewardSnap.exists ? (rewardSnap.data() as RewardItem) : null

  const idempotencyKey = `reservation:${reservationId}:${userId}`

  // Deduct currency
  try {
    if (reservation.currency === 'tc') {
      await redeemCredits(userId, reservation.price, reservation.rewardId, idempotencyKey)
    } else {
      await postLPTransaction({
        userId,
        amount: -Math.abs(reservation.price),
        type: 'adjustment',
        source: `Reward redemption: ${reservation.rewardName}`,
        idempotencyKey,
        sourceType: 'reward_redemption',
        metadata: { rewardId: reservation.rewardId, reservationId },
      })
    }
  } catch (e) {
    const msg = (e as Error).message
    if (msg.includes('insufficient')) {
      return { success: false, error: `Not enough ${reservation.currency === 'tc' ? 'TX-Credits' : 'Loyalty Points'}` }
    }
    return { success: false, error: 'Payment failed' }
  }

  // Convert reservation to confirmed, move reserved → redeemed
  const { FieldValue } = await import('firebase-admin/firestore')
  await firestore.collection(REWARDS_COL).doc(reservation.rewardId).update({
    redeemed: FieldValue.increment(1),
    reserved: FieldValue.increment(-1),
    updatedAt: new Date().toISOString(),
  })

  await resRef.update({ status: 'confirmed' })

  // Record redemption
  const redemptionRef = firestore.collection(REDEMPTIONS_COL).doc()
  const redemption: Redemption = {
    id: redemptionRef.id,
    userId,
    rewardId: reservation.rewardId,
    rewardName: reservation.rewardName,
    currency: reservation.currency,
    price: reservation.price,
    status: 'completed',
    redeemedAt: new Date().toISOString(),
  }
  await redemptionRef.set(redemption)

  // Grant reward-specific items
  if (reward?.badgeId) {
    try { await awardBadge(userId, reward.badgeId, `reward:${reservation.rewardId}`) } catch { /* */ }
  }
  if (reward?.lockerItemId) {
    try { await unlockLockerItem(userId, reward.lockerItemId, `reward:${reservation.rewardId}`) } catch { /* */ }
  }

  return { success: true, redemption }
}

export async function cancelReservation(
  userId: string,
  reservationId: string
): Promise<{ success: boolean; error?: string }> {
  const resRef = firestore.collection(RESERVATIONS_COL).doc(reservationId)
  const resSnap = await resRef.get()
  if (!resSnap.exists) return { success: false, error: 'Reservation not found' }
  const reservation = resSnap.data() as Reservation

  if (reservation.userId !== userId) return { success: false, error: 'Not your reservation' }
  if (reservation.status !== 'held') return { success: false, error: 'Reservation is no longer active' }

  // Release the hold
  await resRef.update({ status: 'canceled' })
  const { FieldValue } = await import('firebase-admin/firestore')
  await firestore.collection(REWARDS_COL).doc(reservation.rewardId).update({
    reserved: FieldValue.increment(-1),
  })

  return { success: true }
}

export async function getUserActiveReservation(
  userId: string,
  rewardId: string
): Promise<Reservation | null> {
  const snap = await firestore
    .collection(RESERVATIONS_COL)
    .where('userId', '==', userId)
    .where('rewardId', '==', rewardId)
    .where('status', '==', 'held')
    .limit(1)
    .get()
  if (snap.empty) return null
  const res = snap.docs[0].data() as Reservation
  // Auto-expire if past deadline
  if (new Date(res.expiresAt).getTime() < Date.now()) {
    const { FieldValue } = await import('firebase-admin/firestore')
    await snap.docs[0].ref.update({ status: 'expired' })
    await firestore.collection(REWARDS_COL).doc(rewardId).update({
      reserved: FieldValue.increment(-1),
    })
    return null
  }
  return res
}

/* ─── locker ─── */

export type LockerItemType = 'avatar_frame' | 'title' | 'card_skin' | 'flair'

export interface LockerItemDef {
  id: string
  name: string
  description: string
  type: LockerItemType
  icon: string           // emoji or image URL
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  /** Days after unlock until item expires (0 = never) */
  expiryDays: number
  createdAt: string
}

export interface UserLockerItem {
  itemId: string
  userId: string
  equipped: boolean
  unlockedAt: string
  /** ISO timestamp — item becomes unusable after this date (null = never) */
  expiresAt: string | null
  source: string         // "reward:abc", "quest:xyz", "admin:manual"
}

const LOCKER_DEFS_COL = 'lockerItems'
const USER_LOCKER_COL = 'userLocker'  // doc id = `${userId}_${itemId}`

/* admin CRUD for locker items */

export async function createLockerItem(
  item: Omit<LockerItemDef, 'id' | 'createdAt'>
): Promise<LockerItemDef> {
  const ref = firestore.collection(LOCKER_DEFS_COL).doc()
  const doc: LockerItemDef = { ...item, id: ref.id, createdAt: new Date().toISOString() }
  await ref.set(doc)
  return doc
}

export async function updateLockerItem(
  id: string,
  patch: Partial<Omit<LockerItemDef, 'id' | 'createdAt'>>
): Promise<void> {
  await firestore.collection(LOCKER_DEFS_COL).doc(id).update(patch)
}

export async function deleteLockerItem(id: string): Promise<void> {
  await firestore.collection(LOCKER_DEFS_COL).doc(id).delete()
}

export async function getLockerItemDefs(): Promise<LockerItemDef[]> {
  const snap = await firestore.collection(LOCKER_DEFS_COL).orderBy('name').get()
  return snap.docs.map(d => d.data() as LockerItemDef)
}

/* user locker */

export async function unlockLockerItem(
  userId: string,
  itemId: string,
  source: string
): Promise<boolean> {
  const docId = `${userId}_${itemId}`
  const ref = firestore.collection(USER_LOCKER_COL).doc(docId)
  const snap = await ref.get()
  if (snap.exists) return false // already unlocked

  // Check if the item definition has an expiry duration
  let expiresAt: string | null = null
  const defSnap = await firestore.collection(LOCKER_DEFS_COL).doc(itemId).get()
  if (defSnap.exists) {
    const def = defSnap.data() as LockerItemDef
    if (def.expiryDays && def.expiryDays > 0) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + def.expiryDays)
      expiresAt = expiry.toISOString()
    }
  }

  const item: UserLockerItem = {
    itemId,
    userId,
    equipped: false,
    unlockedAt: new Date().toISOString(),
    expiresAt,
    source,
  }
  await ref.set(item)
  return true
}

export async function getUserLocker(userId: string): Promise<UserLockerItem[]> {
  const snap = await firestore
    .collection(USER_LOCKER_COL)
    .where('userId', '==', userId)
    .get()
  const items = snap.docs.map(d => d.data() as UserLockerItem)
  const now = Date.now()

  // Auto-unequip expired items (fire-and-forget)
  for (const item of items) {
    if (item.expiresAt && new Date(item.expiresAt).getTime() < now && item.equipped) {
      firestore.collection(USER_LOCKER_COL).doc(`${userId}_${item.itemId}`).update({ equipped: false }).catch(() => {})
      item.equipped = false
    }
  }

  return items
}

export async function equipLockerItem(
  userId: string,
  itemId: string,
  itemType: LockerItemType
): Promise<void> {
  // Unequip all items of same type, then equip requested one
  const userItems = await getUserLocker(userId)

  // Block equip if item is expired
  const target = userItems.find(ui => ui.itemId === itemId)
  if (target?.expiresAt && new Date(target.expiresAt).getTime() < Date.now()) {
    throw new Error('This item has expired')
  }

  const allDefs = await getLockerItemDefs()
  const defMap = new Map(allDefs.map(d => [d.id, d]))

  const batch = firestore.batch()

  for (const ui of userItems) {
    const def = defMap.get(ui.itemId)
    if (def && def.type === itemType && ui.equipped) {
      batch.update(
        firestore.collection(USER_LOCKER_COL).doc(`${userId}_${ui.itemId}`),
        { equipped: false }
      )
    }
  }

  batch.update(
    firestore.collection(USER_LOCKER_COL).doc(`${userId}_${itemId}`),
    { equipped: true }
  )

  await batch.commit()
}

export async function unequipLockerItem(
  userId: string,
  itemId: string
): Promise<void> {
  await firestore
    .collection(USER_LOCKER_COL)
    .doc(`${userId}_${itemId}`)
    .update({ equipped: false })
}
