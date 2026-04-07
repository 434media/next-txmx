'use server'

import { getUserByUid } from './users'
import { getSPAccount } from './skill-points'
import { getCreditAccount } from './credits'
import { getLPAccount } from './loyalty-points'
import { getUserPicks } from './props'
import { getUserBadges, getUserQuestProgress, getBadges, getActiveQuests, type BadgeDefinition, type UserBadge, type QuestDefinition, type QuestProgress } from './quests'

export interface FanCardData {
  // Identity
  uid: string
  displayName: string | null
  photoURL: string | null
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due'
  gymPledge: string | null
  rank: 'rookie' | 'contender' | 'champion' | 'hall_of_fame'
  legacyRank: 'rookie' | 'contender' | 'champion' | 'hall_of_fame' | null
  isVerified: boolean
  joinedAt: string

  // Balances
  skillPoints: number
  txCredits: number
  loyaltyPoints: number
  lifetimeSP: number
  lifetimeTC: number
  lifetimeLP: number

  // Picks record
  totalPicks: number
  settledPicks: number
  wins: number
  losses: number
  winRate: number // 0-100

  // Badges
  badges: (UserBadge & { definition?: BadgeDefinition })[]

  // Active quests
  quests: (QuestProgress & { definition?: QuestDefinition })[]
}

export async function getFanCardData(userId: string): Promise<FanCardData | null> {
  const user = await getUserByUid(userId)
  if (!user) return null

  const [spAccount, creditAccount, lpAccount, picks, userBadges, badgeDefs, questProgress, activeQuests] =
    await Promise.all([
      getSPAccount(userId),
      getCreditAccount(userId),
      getLPAccount(userId),
      getUserPicks(userId, 500),
      getUserBadges(userId),
      getBadges(),
      getUserQuestProgress(userId),
      getActiveQuests(),
    ])

  // Compute pick stats
  const settled = picks.filter(p => p.settled)
  const wins = settled.filter(p => p.won === true).length
  const losses = settled.filter(p => p.won === false).length
  const winRate = settled.length > 0 ? Math.round((wins / settled.length) * 100) : 0

  // Merge badge definitions
  const badgeMap = new Map(badgeDefs.map(b => [b.id, b]))
  const badges = userBadges.map(ub => ({
    ...ub,
    definition: badgeMap.get(ub.badgeId),
  }))

  // Merge quest definitions
  const questMap = new Map(activeQuests.map(q => [q.id, q]))
  const quests = questProgress.map(qp => ({
    ...qp,
    definition: questMap.get(qp.questId),
  }))

  return {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscriptionStatus: user.subscriptionStatus,
    gymPledge: user.gymPledge,
    rank: user.rank,
    legacyRank: user.legacyRank ?? null,
    isVerified: user.isVerified ?? false,
    joinedAt: user.createdAt,

    skillPoints: spAccount.balance,
    txCredits: creditAccount.balance,
    loyaltyPoints: lpAccount.balance,
    lifetimeSP: spAccount.lifetimeEarned,
    lifetimeTC: creditAccount.lifetimeEarned,
    lifetimeLP: lpAccount.lifetimeEarned,

    totalPicks: picks.length,
    settledPicks: settled.length,
    wins,
    losses,
    winRate,

    badges,
    quests,
  }
}

/* ── Lightweight summary for OG image & public profile ── */

export interface FanCardSummary {
  uid: string
  displayName: string | null
  photoURL: string | null
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due'
  gymPledge: string | null
  rank: 'rookie' | 'contender' | 'champion' | 'hall_of_fame'
  legacyRank: 'rookie' | 'contender' | 'champion' | 'hall_of_fame' | null
  isVerified: boolean
  joinedAt: string
  skillPoints: number
  txCredits: number
  loyaltyPoints: number
  totalPicks: number
  wins: number
  losses: number
  winRate: number
  badgeCount: number
}

export async function getFanCardSummary(userId: string): Promise<FanCardSummary | null> {
  const user = await getUserByUid(userId)
  if (!user) return null

  const [spAccount, creditAccount, lpAccount, picks, userBadges] = await Promise.all([
    getSPAccount(userId),
    getCreditAccount(userId),
    getLPAccount(userId),
    getUserPicks(userId, 500),
    getUserBadges(userId),
  ])

  const settled = picks.filter(p => p.settled)
  const wins = settled.filter(p => p.won === true).length
  const losses = settled.filter(p => p.won === false).length
  const winRate = settled.length > 0 ? Math.round((wins / settled.length) * 100) : 0

  return {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscriptionStatus: user.subscriptionStatus,
    gymPledge: user.gymPledge,
    rank: user.rank,
    legacyRank: user.legacyRank ?? null,
    isVerified: user.isVerified ?? false,
    joinedAt: user.createdAt,
    skillPoints: spAccount.balance,
    txCredits: creditAccount.balance,
    loyaltyPoints: lpAccount.balance,
    totalPicks: picks.length,
    wins,
    losses,
    winRate,
    badgeCount: userBadges.length,
  }
}
