'use server'

import { firestore } from '../../lib/firebase-admin'

// ── Types ────────────────────────────────────────────────

export type SeasonStatus = 'upcoming' | 'active' | 'completed'

export interface Season {
  id: string
  name: string
  slug: string
  description: string
  startDate: string   // ISO date
  endDate: string     // ISO date
  status: SeasonStatus
  /** Top N finishers who earn rewards */
  rewardTiers: SeasonRewardTier[]
  createdAt: string
  updatedAt: string
}

export interface SeasonRewardTier {
  /** Min position (inclusive), e.g. 1 */
  minPosition: number
  /** Max position (inclusive), e.g. 3 */
  maxPosition: number
  /** Label shown in UI, e.g. "Gold" */
  label: string
  /** TC reward for this tier */
  tcReward: number
  /** LP reward for this tier */
  lpReward: number
  /** Badge ID to award (optional) */
  badgeId?: string | null
}

export interface SeasonalEntry {
  id: string
  userId: string
  seasonId: string
  spEarned: number
  displayName: string | null
  photoURL: string | null
  rank: string
  updatedAt: string
}

export interface SeasonSummary {
  seasonId: string
  seasonName: string
  finalPosition: number
  spEarned: number
  rewardsClaimed: boolean
}

// ── Season CRUD ──────────────────────────────────────────

export async function createSeason(data: Omit<Season, 'id' | 'createdAt' | 'updatedAt'>): Promise<Season> {
  const now = new Date().toISOString()
  const ref = await firestore.collection('seasons').add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return { id: ref.id, ...data, createdAt: now, updatedAt: now }
}

export async function updateSeason(id: string, data: Partial<Omit<Season, 'id' | 'createdAt'>>): Promise<void> {
  await firestore.collection('seasons').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteSeason(id: string): Promise<void> {
  await firestore.collection('seasons').doc(id).delete()
}

export async function getSeasons(): Promise<Season[]> {
  const snap = await firestore.collection('seasons').orderBy('startDate', 'desc').get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Season)
}

export async function getActiveSeason(): Promise<Season | null> {
  const snap = await firestore
    .collection('seasons')
    .where('status', '==', 'active')
    .limit(1)
    .get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() } as Season
}

export async function getSeasonBySlug(slug: string): Promise<Season | null> {
  const snap = await firestore
    .collection('seasons')
    .where('slug', '==', slug)
    .limit(1)
    .get()
  if (snap.empty) return null
  const doc = snap.docs[0]
  return { id: doc.id, ...doc.data() } as Season
}

// ── Seasonal SP Tracking ─────────────────────────────────

/**
 * Increment a user's seasonal SP.
 * Called alongside normal SP awards so seasonal tallies stay in sync.
 */
export async function incrementSeasonalSP(
  userId: string,
  seasonId: string,
  amount: number,
  displayName: string | null,
  photoURL: string | null,
  rank: string
): Promise<void> {
  if (amount <= 0) return

  const docId = `${seasonId}_${userId}`
  const ref = firestore.collection('seasonalEntries').doc(docId)

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (snap.exists) {
      const current = snap.data()!
      tx.update(ref, {
        spEarned: (current.spEarned || 0) + amount,
        displayName,
        photoURL,
        rank,
        updatedAt: new Date().toISOString(),
      })
    } else {
      tx.set(ref, {
        userId,
        seasonId,
        spEarned: amount,
        displayName,
        photoURL,
        rank,
        updatedAt: new Date().toISOString(),
      })
    }
  })
}

/**
 * Get the seasonal leaderboard for a given season.
 */
export async function getSeasonalLeaderboard(
  seasonId: string,
  limit = 100
): Promise<SeasonalEntry[]> {
  const snap = await firestore
    .collection('seasonalEntries')
    .where('seasonId', '==', seasonId)
    .orderBy('spEarned', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as SeasonalEntry)
}

/**
 * Get a user's seasonal entry for a specific season.
 */
export async function getUserSeasonalEntry(
  userId: string,
  seasonId: string
): Promise<SeasonalEntry | null> {
  const docId = `${seasonId}_${userId}`
  const snap = await firestore.collection('seasonalEntries').doc(docId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as SeasonalEntry
}

/**
 * Get a user's history across all completed seasons.
 */
export async function getUserSeasonHistory(userId: string): Promise<SeasonSummary[]> {
  // Get all completed seasons
  const seasonsSnap = await firestore
    .collection('seasons')
    .where('status', '==', 'completed')
    .orderBy('endDate', 'desc')
    .get()

  const summaries: SeasonSummary[] = []

  for (const seasonDoc of seasonsSnap.docs) {
    const season = { id: seasonDoc.id, ...seasonDoc.data() } as Season

    // Get this user's entry
    const docId = `${season.id}_${userId}`
    const entrySnap = await firestore.collection('seasonalEntries').doc(docId).get()
    if (!entrySnap.exists) continue

    const entry = entrySnap.data()!

    // Calculate position by counting users with more SP
    const higherSnap = await firestore
      .collection('seasonalEntries')
      .where('seasonId', '==', season.id)
      .where('spEarned', '>', entry.spEarned)
      .count()
      .get()

    const position = (higherSnap.data().count || 0) + 1

    // Check if rewards were claimed
    const rewardRef = firestore.collection('seasonRewards').doc(`${season.id}_${userId}`)
    const rewardSnap = await rewardRef.get()

    summaries.push({
      seasonId: season.id,
      seasonName: season.name,
      finalPosition: position,
      spEarned: entry.spEarned || 0,
      rewardsClaimed: rewardSnap.exists,
    })
  }

  return summaries
}

// ── Season Lifecycle ─────────────────────────────────────

/**
 * Activate a season (sets status to 'active').
 * Only one season can be active at a time.
 */
export async function activateSeason(seasonId: string): Promise<void> {
  // Deactivate any currently active season
  const activeSeason = await getActiveSeason()
  if (activeSeason && activeSeason.id !== seasonId) {
    throw new Error(`Season "${activeSeason.name}" is already active. Complete it first.`)
  }

  await firestore.collection('seasons').doc(seasonId).update({
    status: 'active',
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Complete a season, calculate final standings.
 * Does NOT auto-distribute rewards (admin can do that separately).
 */
export async function completeSeason(seasonId: string): Promise<{
  totalParticipants: number
  topEntries: SeasonalEntry[]
}> {
  const season = await firestore.collection('seasons').doc(seasonId).get()
  if (!season.exists) throw new Error('Season not found')

  // Get final standings
  const topEntries = await getSeasonalLeaderboard(seasonId, 100)

  await firestore.collection('seasons').doc(seasonId).update({
    status: 'completed',
    updatedAt: new Date().toISOString(),
  })

  // Count total participants
  const countSnap = await firestore
    .collection('seasonalEntries')
    .where('seasonId', '==', seasonId)
    .count()
    .get()

  return {
    totalParticipants: countSnap.data().count || 0,
    topEntries,
  }
}

/**
 * Distribute rewards for a completed season.
 * Awards TC, LP, and badges based on reward tiers.
 */
export async function distributeSeasonRewards(seasonId: string): Promise<{
  rewarded: number
}> {
  const seasonDoc = await firestore.collection('seasons').doc(seasonId).get()
  if (!seasonDoc.exists) throw new Error('Season not found')
  const season = { id: seasonDoc.id, ...seasonDoc.data() } as Season
  if (season.status !== 'completed') throw new Error('Season must be completed first')
  if (!season.rewardTiers || season.rewardTiers.length === 0) return { rewarded: 0 }

  // Lazy-import to avoid circular dependency
  const { awardCredits } = await import('./credits')
  const { postLPTransaction } = await import('./loyalty-points')
  const { awardBadge } = await import('./quests')

  const leaderboard = await getSeasonalLeaderboard(seasonId, Math.max(...season.rewardTiers.map(t => t.maxPosition)))

  let rewarded = 0

  for (let i = 0; i < leaderboard.length; i++) {
    const position = i + 1
    const entry = leaderboard[i]

    // Find tier for this position
    const tier = season.rewardTiers.find(t => position >= t.minPosition && position <= t.maxPosition)
    if (!tier) continue

    // Check if already rewarded (idempotent)
    const rewardDocId = `${seasonId}_${entry.userId}`
    const existing = await firestore.collection('seasonRewards').doc(rewardDocId).get()
    if (existing.exists) continue

    // Award TC
    if (tier.tcReward > 0) {
      const key = `season_reward_tc:${seasonId}:${entry.userId}`
      try {
        await awardCredits(entry.userId, tier.tcReward, `Season reward: ${season.name} (#${position})`, key)
      } catch { /* idempotent guard */ }
    }

    // Award LP
    if (tier.lpReward > 0) {
      const key = `season_reward_lp:${seasonId}:${entry.userId}`
      try {
        await postLPTransaction({
          userId: entry.userId,
          amount: tier.lpReward,
          type: 'season_reward',
          source: `Season reward: ${season.name} (#${position})`,
          idempotencyKey: key,
        })
      } catch { /* idempotent guard */ }
    }

    // Award badge
    if (tier.badgeId) {
      try {
        await awardBadge(entry.userId, tier.badgeId, `season:${seasonId}`)
      } catch { /* badge may already exist */ }
    }

    // Record reward
    await firestore.collection('seasonRewards').doc(rewardDocId).set({
      userId: entry.userId,
      seasonId,
      position,
      tierLabel: tier.label,
      tcReward: tier.tcReward,
      lpReward: tier.lpReward,
      badgeId: tier.badgeId || null,
      awardedAt: new Date().toISOString(),
    })

    rewarded++
  }

  return { rewarded }
}
