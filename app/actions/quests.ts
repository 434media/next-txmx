'use server'

import { firestore } from '../../lib/firebase-admin'
import { awardSP } from './skill-points'
import { awardCredits } from './credits'
import { awardLP } from './loyalty-points'

/* ─── types ─── */

export type QuestObjective =
  | 'daily_login'
  | 'poll_vote'
  | 'prediction_placed'
  | 'prediction_won'
  | 'share'
  | 'login_streak'
  | 'props_settled'
  | 'custom'

export type QuestStatus = 'active' | 'paused' | 'expired'

export interface QuestReward {
  sp: number
  tc: number
  lp: number
  badgeId: string | null
}

export interface QuestDefinition {
  id: string
  title: string
  description: string
  objective: QuestObjective
  /** How many times the objective must be completed */
  target: number
  reward: QuestReward
  status: QuestStatus
  /** ISO date — null means always available */
  startsAt: string | null
  /** ISO date — null means never expires */
  expiresAt: string | null
  /** Only for Black Card holders */
  blackCardOnly: boolean
  /** Sort order in the quest board */
  sortOrder: number
  /** Linked season id — null means always available (not tied to a season) */
  seasonId: string | null
  createdAt: string
  updatedAt: string
}

export interface QuestProgress {
  questId: string
  userId: string
  progress: number
  completed: boolean
  claimedAt: string | null
  updatedAt: string
}

/* ─── Firestore paths ─── */
const QUESTS_COL = 'quests'
const QUEST_PROGRESS_COL = 'questProgress' // doc id = `${userId}_${questId}`

/* ─── admin: CRUD ─── */

export async function createQuest(
  quest: Omit<QuestDefinition, 'id' | 'createdAt' | 'updatedAt'>
): Promise<QuestDefinition> {
  const now = new Date().toISOString()
  const ref = firestore.collection(QUESTS_COL).doc()
  const doc: QuestDefinition = {
    ...quest,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
  }
  await ref.set(doc)
  return doc
}

export async function updateQuest(
  id: string,
  patch: Partial<Omit<QuestDefinition, 'id' | 'createdAt'>>
): Promise<void> {
  if (!id) throw new Error('Quest id is required')
  await firestore
    .collection(QUESTS_COL)
    .doc(id)
    .update({ ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteQuest(id: string): Promise<void> {
  if (!id) throw new Error('Quest id is required')
  await firestore.collection(QUESTS_COL).doc(id).delete()
}

export async function getQuests(): Promise<QuestDefinition[]> {
  const snap = await firestore
    .collection(QUESTS_COL)
    .orderBy('sortOrder', 'asc')
    .get()
  return snap.docs.map(d => d.data() as QuestDefinition)
}

export async function getActiveQuests(seasonId?: string | null): Promise<QuestDefinition[]> {
  const now = new Date().toISOString()
  const all = await getQuests()
  return all.filter(q => {
    if (q.status !== 'active') return false
    if (q.startsAt && q.startsAt > now) return false
    if (q.expiresAt && q.expiresAt < now) return false
    // When a seasonId filter is provided, show quests for that season + universal quests
    if (seasonId !== undefined) {
      if (q.seasonId && q.seasonId !== seasonId) return false
    }
    return true
  })
}

/* ─── user progress ─── */

function progressDocId(userId: string, questId: string) {
  return `${userId}_${questId}`
}

export async function getQuestProgress(
  userId: string,
  questId: string
): Promise<QuestProgress | null> {
  const snap = await firestore
    .collection(QUEST_PROGRESS_COL)
    .doc(progressDocId(userId, questId))
    .get()
  if (!snap.exists) return null
  return snap.data() as QuestProgress
}

export async function getUserQuestProgress(
  userId: string
): Promise<QuestProgress[]> {
  const snap = await firestore
    .collection(QUEST_PROGRESS_COL)
    .where('userId', '==', userId)
    .get()
  return snap.docs.map(d => d.data() as QuestProgress)
}

/**
 * Increment quest progress for a user on a given objective type.
 * Called from action files (polls, props, shares, daily-login, etc.)
 * Automatically completes quest if target is reached.
 */
export async function incrementQuestProgress(
  userId: string,
  objective: QuestObjective,
  amount: number = 1
): Promise<void> {
  // Find active quests matching this objective
  const quests = await getActiveQuests()
  const matching = quests.filter(q => q.objective === objective)
  if (matching.length === 0) return

  for (const quest of matching) {
    const docId = progressDocId(userId, quest.id)
    const ref = firestore.collection(QUEST_PROGRESS_COL).doc(docId)

    await firestore.runTransaction(async tx => {
      const snap = await tx.get(ref)
      const existing: QuestProgress = snap.exists
        ? (snap.data() as QuestProgress)
        : {
            questId: quest.id,
            userId,
            progress: 0,
            completed: false,
            claimedAt: null,
            updatedAt: new Date().toISOString(),
          }

      // Already completed, skip
      if (existing.completed) return

      const newProgress = Math.min(existing.progress + amount, quest.target)
      const completed = newProgress >= quest.target

      tx.set(ref, {
        ...existing,
        progress: newProgress,
        completed,
        updatedAt: new Date().toISOString(),
      })
    })
  }
}

/**
 * Claim reward for a completed quest.
 * Returns true if reward was claimed, false if already claimed or not complete.
 */
export async function claimQuestReward(
  userId: string,
  questId: string
): Promise<{ claimed: boolean; reward?: QuestReward }> {
  const questSnap = await firestore.collection(QUESTS_COL).doc(questId).get()
  if (!questSnap.exists) return { claimed: false }
  const quest = questSnap.data() as QuestDefinition

  const docId = progressDocId(userId, questId)
  const ref = firestore.collection(QUEST_PROGRESS_COL).doc(docId)
  const snap = await ref.get()
  if (!snap.exists) return { claimed: false }

  const progress = snap.data() as QuestProgress
  if (!progress.completed || progress.claimedAt) return { claimed: false }

  // Mark claimed
  const now = new Date().toISOString()
  await ref.update({ claimedAt: now, updatedAt: now })

  // Distribute rewards
  const { reward } = quest
  const idemBase = `quest:${questId}:${userId}`

  if (reward.sp > 0) {
    await awardSP(
      userId,
      reward.sp,
      `quest:${quest.title}`,
      `${idemBase}:sp`,
      { questId, sourceType: 'quest_completion' }
    )
  }

  if (reward.tc > 0) {
    await awardCredits(
      userId,
      reward.tc,
      `quest:${quest.title}`,
      `${idemBase}:tc`,
      { questId, sourceType: 'quest_completion' }
    )
  }

  if (reward.lp > 0) {
    await awardLP(
      userId,
      reward.lp,
      `quest:${quest.title}`,
      `${idemBase}:lp`,
      { type: 'quest_reward', questId, sourceType: 'quest_completion' }
    )
  }

  // Award badge if configured
  if (reward.badgeId) {
    await awardBadge(userId, reward.badgeId, `quest:${questId}`)
  }

  return { claimed: true, reward }
}

/* ─── badges ─── */

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string           // emoji or image URL
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'quest' | 'achievement' | 'event' | 'seasonal' | 'manual'
  createdAt: string
}

export interface UserBadge {
  badgeId: string
  userId: string
  awardedAt: string
  source: string         // e.g., "quest:abc123" or "admin:manual"
}

const BADGES_COL = 'badges'
const USER_BADGES_COL = 'userBadges' // doc id = `${userId}_${badgeId}`

export async function createBadge(
  badge: Omit<BadgeDefinition, 'id' | 'createdAt'>
): Promise<BadgeDefinition> {
  const ref = firestore.collection(BADGES_COL).doc()
  const doc: BadgeDefinition = {
    ...badge,
    id: ref.id,
    createdAt: new Date().toISOString(),
  }
  await ref.set(doc)
  return doc
}

export async function updateBadge(
  id: string,
  patch: Partial<Omit<BadgeDefinition, 'id' | 'createdAt'>>
): Promise<void> {
  if (!id) throw new Error('Badge id is required')
  await firestore.collection(BADGES_COL).doc(id).update(patch)
}

export async function deleteBadge(id: string): Promise<void> {
  if (!id) throw new Error('Badge id is required')
  await firestore.collection(BADGES_COL).doc(id).delete()
}

export async function getBadges(): Promise<BadgeDefinition[]> {
  const snap = await firestore.collection(BADGES_COL).orderBy('name').get()
  return snap.docs.map(d => d.data() as BadgeDefinition)
}

export async function awardBadge(
  userId: string,
  badgeId: string,
  source: string
): Promise<boolean> {
  const docId = `${userId}_${badgeId}`
  const ref = firestore.collection(USER_BADGES_COL).doc(docId)
  const snap = await ref.get()
  if (snap.exists) return false // already owns it

  const ub: UserBadge = {
    badgeId,
    userId,
    awardedAt: new Date().toISOString(),
    source,
  }
  await ref.set(ub)
  return true
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const snap = await firestore
    .collection(USER_BADGES_COL)
    .where('userId', '==', userId)
    .get()
  return snap.docs.map(d => d.data() as UserBadge)
}

export async function revokeBadge(
  userId: string,
  badgeId: string
): Promise<void> {
  const docId = `${userId}_${badgeId}`
  await firestore.collection(USER_BADGES_COL).doc(docId).delete()
}
