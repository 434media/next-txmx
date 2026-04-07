'use server'

import { firestore } from '../../lib/firebase-admin'

// ── Types ────────────────────────────────────────────────

export type BlockType = 'block' | 'mute'

export interface UserBlock {
  userId: string
  targetId: string
  type: BlockType
  createdAt: string
}

// ── Block / Unblock ──────────────────────────────────────

export async function blockUser(userId: string, targetId: string): Promise<void> {
  if (!userId || !targetId) throw new Error('Missing user IDs')
  if (userId === targetId) throw new Error('Cannot block yourself')

  const docId = `${userId}_${targetId}`
  await firestore.collection('userBlocks').doc(docId).set({
    userId,
    targetId,
    type: 'block',
    createdAt: new Date().toISOString(),
  })
}

export async function unblockUser(userId: string, targetId: string): Promise<void> {
  if (!userId || !targetId) throw new Error('Missing user IDs')
  const docId = `${userId}_${targetId}`
  await firestore.collection('userBlocks').doc(docId).delete()
}

// ── Mute / Unmute ────────────────────────────────────────

export async function muteUser(userId: string, targetId: string): Promise<void> {
  if (!userId || !targetId) throw new Error('Missing user IDs')
  if (userId === targetId) throw new Error('Cannot mute yourself')

  const docId = `${userId}_${targetId}`
  await firestore.collection('userBlocks').doc(docId).set({
    userId,
    targetId,
    type: 'mute',
    createdAt: new Date().toISOString(),
  })
}

export async function unmuteUser(userId: string, targetId: string): Promise<void> {
  if (!userId || !targetId) throw new Error('Missing user IDs')
  const docId = `${userId}_${targetId}`
  await firestore.collection('userBlocks').doc(docId).delete()
}

// ── Query ────────────────────────────────────────────────

/** Returns sets of blocked and muted user IDs for a given user. */
export async function getUserBlockList(userId: string): Promise<{
  blocked: string[]
  muted: string[]
}> {
  if (!userId) return { blocked: [], muted: [] }

  const snap = await firestore
    .collection('userBlocks')
    .where('userId', '==', userId)
    .get()

  const blocked: string[] = []
  const muted: string[] = []

  for (const doc of snap.docs) {
    const data = doc.data() as UserBlock
    if (data.type === 'block') blocked.push(data.targetId)
    else if (data.type === 'mute') muted.push(data.targetId)
  }

  return { blocked, muted }
}

/** Check if userId has blocked targetId. */
export async function isUserBlocked(userId: string, targetId: string): Promise<boolean> {
  if (!userId || !targetId) return false
  const docId = `${userId}_${targetId}`
  const snap = await firestore.collection('userBlocks').doc(docId).get()
  return snap.exists && snap.data()?.type === 'block'
}
