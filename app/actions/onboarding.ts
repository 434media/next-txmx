'use server'

import { firestore } from '../../lib/firebase-admin'
import { createQuest, type QuestDefinition } from './quests'

/**
 * Onboarding quest definitions.
 * These are seeded once and shared across all users.
 * The quest system auto-tracks progress when actions are performed.
 */
const ONBOARDING_QUESTS = [
  {
    title: 'First Login',
    description: 'Log in to TXMX Boxing for the first time to start earning.',
    objective: 'daily_login' as const,
    target: 1,
    reward: { sp: 0, tc: 10, lp: 0, badgeId: null },
    sortOrder: 1,
  },
  {
    title: 'Cast Your First Vote',
    description: 'Vote on a Fan Poll and earn TX-Credits.',
    objective: 'poll_vote' as const,
    target: 1,
    reward: { sp: 0, tc: 15, lp: 0, badgeId: null },
    sortOrder: 2,
  },
  {
    title: 'Share the Action',
    description: 'Share TXMX content on social media to earn credits.',
    objective: 'share' as const,
    target: 1,
    reward: { sp: 0, tc: 25, lp: 0, badgeId: null },
    sortOrder: 3,
  },
  {
    title: 'Make Your First Pick',
    description: 'Place a prediction on a live prop to earn Skill Points.',
    objective: 'prediction_placed' as const,
    target: 1,
    reward: { sp: 100, tc: 0, lp: 0, badgeId: null },
    sortOrder: 4,
  },
  {
    title: 'Poll Regular',
    description: 'Vote on 5 different Fan Polls to prove you study the game.',
    objective: 'poll_vote' as const,
    target: 5,
    reward: { sp: 50, tc: 25, lp: 0, badgeId: null },
    sortOrder: 5,
  },
]

const ONBOARDING_SEED_DOC = 'system/onboardingSeedComplete'

/**
 * Idempotent seeding — checks if onboarding quests have already been created.
 * Safe to call multiple times.
 */
export async function seedOnboardingQuests(): Promise<{
  seeded: boolean
  questIds: string[]
}> {
  const seedSnap = await firestore.doc(ONBOARDING_SEED_DOC).get()
  if (seedSnap.exists) {
    return { seeded: false, questIds: seedSnap.data()?.questIds || [] }
  }

  const questIds: string[] = []

  for (const q of ONBOARDING_QUESTS) {
    const quest = await createQuest({
      ...q,
      status: 'active',
      startsAt: null,
      expiresAt: null,
      blackCardOnly: false,
      seasonId: null,
    })
    questIds.push(quest.id)
  }

  // Mark as seeded
  await firestore.doc(ONBOARDING_SEED_DOC).set({
    questIds,
    seededAt: new Date().toISOString(),
  })

  return { seeded: true, questIds }
}

/**
 * Get onboarding quest IDs (returns empty array if not yet seeded).
 */
export async function getOnboardingQuestIds(): Promise<string[]> {
  const snap = await firestore.doc(ONBOARDING_SEED_DOC).get()
  if (!snap.exists) return []
  return snap.data()?.questIds || []
}

/**
 * Get a user's onboarding status — which quests are complete and claimed.
 */
export async function getOnboardingStatus(userId: string): Promise<{
  quests: (QuestDefinition & { progress: number; completed: boolean; claimed: boolean })[]
  allComplete: boolean
  allClaimed: boolean
}> {
  const questIds = await getOnboardingQuestIds()
  if (questIds.length === 0) return { quests: [], allComplete: false, allClaimed: false }

  // Fetch quest definitions and user progress in parallel
  const questSnaps = await Promise.all(
    questIds.map(id => firestore.collection('quests').doc(id).get())
  )
  const progressSnaps = await Promise.all(
    questIds.map(id =>
      firestore.collection('questProgress').doc(`${userId}_${id}`).get()
    )
  )

  const quests = questSnaps
    .filter(s => s.exists)
    .map((s, i) => {
      const quest = s.data() as QuestDefinition
      const progress = progressSnaps[i].exists
        ? progressSnaps[i].data()!
        : { progress: 0, completed: false, claimedAt: null }

      return {
        ...quest,
        progress: progress.progress || 0,
        completed: progress.completed || false,
        claimed: !!progress.claimedAt,
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const allComplete = quests.length > 0 && quests.every(q => q.completed)
  const allClaimed = quests.length > 0 && quests.every(q => q.claimed)

  return { quests, allComplete, allClaimed }
}
