'use server'

import { firestore } from '../../lib/firebase-admin'

// ── Types ────────────────────────────────────────────────

export type SuspensionStatus = 'active' | 'suspended' | 'banned'

export interface UserSuspension {
  userId: string
  status: SuspensionStatus
  reason: string
  suspendedAt: string
  suspendedUntil: string | null   // null = permanent (banned)
  suspendedBy: string             // admin UID
  liftedAt: string | null
  liftedBy: string | null
}

export type AbuseEventType =
  | 'velocity_spike'
  | 'community_spam'
  | 'suspension_applied'
  | 'suspension_lifted'
  | 'account_age_gate'
  | 'rapid_fire'
  | 'spam_warning'
  | 'spam_auto_suspend'

export interface AbuseEvent {
  id: string
  userId: string
  displayName: string
  type: AbuseEventType
  detail: string
  meta: Record<string, unknown>
  createdAt: string
}

// ── Spam Score ────────────────────────────────────────────

export interface SpamScore {
  userId: string
  score: number
  /** Individual signal counts */
  signals: {
    rateLimitHits: number
    flagsReceived: number
    duplicateContent: number
    linkSpam: number
    rapidFire: number
  }
  lastWarningAt: string | null
  lastActionAt: string
  updatedAt: string
}

/** Points added per signal type */
const SPAM_WEIGHTS = {
  rateLimitHit: 5,
  flagReceived: 10,
  duplicateContent: 8,
  linkSpam: 15,
  rapidFire: 3,
} as const

/** Score thresholds for auto-escalation */
const SPAM_THRESHOLDS = {
  warning: 25,
  suspend1Day: 50,
  suspend7Days: 100,
  ban: 200,
} as const

// ── Suspension CRUD ──────────────────────────────────────

export async function getUserSuspension(userId: string): Promise<UserSuspension | null> {
  const ref = firestore.collection('suspensions').doc(userId)
  const snap = await ref.get()
  if (!snap.exists) return null

  const data = snap.data() as UserSuspension

  // Auto-lift expired timed suspensions
  if (
    data.status === 'suspended' &&
    data.suspendedUntil &&
    new Date(data.suspendedUntil).getTime() < Date.now()
  ) {
    await ref.update({ status: 'active', liftedAt: new Date().toISOString(), liftedBy: 'system' })
    return { ...data, status: 'active', liftedAt: new Date().toISOString(), liftedBy: 'system' }
  }

  return data
}

export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string,
  durationDays: number | null    // null = permanent ban
): Promise<void> {
  const now = new Date()
  const suspendedUntil = durationDays
    ? new Date(now.getTime() + durationDays * 86_400_000).toISOString()
    : null

  const status: SuspensionStatus = durationDays ? 'suspended' : 'banned'

  await firestore.collection('suspensions').doc(userId).set({
    userId,
    status,
    reason,
    suspendedAt: now.toISOString(),
    suspendedUntil,
    suspendedBy: adminId,
    liftedAt: null,
    liftedBy: null,
  })

  // Log event
  await logAbuseEvent(userId, 'suspension_applied', `${status}: ${reason}`, {
    adminId,
    durationDays,
  })
}

export async function liftSuspension(userId: string, adminId: string): Promise<void> {
  const ref = firestore.collection('suspensions').doc(userId)
  const snap = await ref.get()
  if (!snap.exists) return

  await ref.update({
    status: 'active',
    liftedAt: new Date().toISOString(),
    liftedBy: adminId,
  })

  await logAbuseEvent(userId, 'suspension_lifted', 'Suspension lifted by admin', { adminId })
}

export async function getActiveSuspensions(): Promise<UserSuspension[]> {
  const snap = await firestore
    .collection('suspensions')
    .where('status', 'in', ['suspended', 'banned'])
    .get()

  return snap.docs.map(d => d.data() as UserSuspension)
}

// ── Account Age Gate ─────────────────────────────────────

/**
 * Check if account is old enough to earn rewards.
 * Returns the number of days since account creation.
 */
export async function checkAccountAge(userId: string): Promise<{
  allowed: boolean
  accountAgeDays: number
  requiredDays: number
}> {
  const { getEconomyConfig } = await import('./economy')
  const config = await getEconomyConfig()
  const requiredDays = config.accountAgeGateDays || 0

  if (requiredDays <= 0) return { allowed: true, accountAgeDays: 0, requiredDays: 0 }

  const userSnap = await firestore.collection('users').doc(userId).get()
  if (!userSnap.exists) return { allowed: false, accountAgeDays: 0, requiredDays }

  const userData = userSnap.data()!
  const created = userData.createdAt
    ? new Date(userData.createdAt).getTime()
    : Date.now()

  const ageDays = Math.floor((Date.now() - created) / 86_400_000)

  if (ageDays < requiredDays) {
    await logAbuseEvent(userId, 'account_age_gate', `Account age ${ageDays}d < required ${requiredDays}d`, {
      ageDays,
      requiredDays,
    })
    return { allowed: false, accountAgeDays: ageDays, requiredDays }
  }

  return { allowed: true, accountAgeDays: ageDays, requiredDays }
}

// ── Velocity Detection ───────────────────────────────────

/**
 * Check if a user is earning at a suspiciously fast rate.
 * Looks at TC earned in the last N minutes.
 */
export async function checkVelocity(
  userId: string,
  tcJustEarned: number
): Promise<{ flagged: boolean; recentTotal: number }> {
  const { getEconomyConfig } = await import('./economy')
  const config = await getEconomyConfig()
  const velocityLimit = config.velocityTCPerHour || 0

  if (velocityLimit <= 0) return { flagged: false, recentTotal: 0 }

  // Check hourly earning from daily tracker
  const ref = firestore
    .collection('userLimits')
    .doc(userId)
    .collection('velocity')
    .doc('hourly')

  const snap = await ref.get()
  const now = Date.now()
  const hourAgo = now - 3_600_000

  let recentTotal = tcJustEarned

  if (snap.exists) {
    const data = snap.data()!
    const windowStart = data.windowStart ? new Date(data.windowStart).getTime() : 0

    if (windowStart > hourAgo) {
      // Same window — accumulate
      recentTotal += (data.tcTotal as number) || 0
    }
    // Else: old window — start fresh with just this earning
  }

  // Update velocity window
  const windowData = snap.exists && new Date(snap.data()!.windowStart).getTime() > hourAgo
    ? { tcTotal: recentTotal, windowStart: snap.data()!.windowStart }
    : { tcTotal: tcJustEarned, windowStart: new Date().toISOString() }

  await ref.set(windowData)

  if (recentTotal > velocityLimit) {
    await logAbuseEvent(userId, 'velocity_spike', `Earned ${recentTotal} TC in 1 hour (limit: ${velocityLimit})`, {
      recentTotal,
      velocityLimit,
      tcJustEarned,
    })
    return { flagged: true, recentTotal }
  }

  return { flagged: false, recentTotal }
}

// ── Community Rate Limits ────────────────────────────────

export async function checkCommunityRateLimit(
  userId: string,
  action: 'post' | 'reply'
): Promise<{ allowed: boolean; reason?: string }> {
  const { getEconomyConfig } = await import('./economy')
  const config = await getEconomyConfig()

  const postLimit = config.communityPostsPerDay || 0
  const replyLimit = config.communityRepliesPerDay || 0

  const limit = action === 'post' ? postLimit : replyLimit
  if (limit <= 0) return { allowed: true }

  const today = new Date().toISOString().slice(0, 10)
  const ref = firestore
    .collection('userLimits')
    .doc(userId)
    .collection('community')
    .doc(today)

  const snap = await ref.get()
  const data = snap.exists ? (snap.data() as Record<string, number>) : {}
  const count = data[action] || 0

  if (count >= limit) {
    await logAbuseEvent(userId, 'community_spam', `Hit ${action} limit: ${count}/${limit}`, {
      action,
      count,
      limit,
    })
    return { allowed: false, reason: `Daily ${action} limit reached (${limit}/day)` }
  }

  // Increment
  await ref.set({ ...data, [action]: count + 1 }, { merge: true })
  return { allowed: true }
}

// ── Rapid-Fire Detection ─────────────────────────────────

/**
 * Checks minimum interval between same action type.
 * Returns false if user acted too quickly (< minIntervalMs).
 */
export async function checkRapidFire(
  userId: string,
  action: string,
  minIntervalMs: number
): Promise<{ allowed: boolean; elapsedMs: number }> {
  if (minIntervalMs <= 0) return { allowed: true, elapsedMs: Infinity }

  const ref = firestore
    .collection('userLimits')
    .doc(userId)
    .collection('rapidFire')
    .doc(action)

  const snap = await ref.get()
  const now = Date.now()

  if (snap.exists) {
    const lastAt = new Date(snap.data()!.lastAt).getTime()
    const elapsed = now - lastAt

    if (elapsed < minIntervalMs) {
      await logAbuseEvent(userId, 'rapid_fire', `${action} fired ${elapsed}ms apart (min: ${minIntervalMs}ms)`, {
        action,
        elapsed,
        minIntervalMs,
      })
      return { allowed: false, elapsedMs: elapsed }
    }
  }

  await ref.set({ lastAt: new Date().toISOString(), action })
  return { allowed: true, elapsedMs: snap.exists ? now - new Date(snap.data()!.lastAt).getTime() : Infinity }
}

// ── Suspension Check (Guard) ─────────────────────────────

/**
 * Quick check: is the user currently suspended/banned?
 * Use this at the top of every earning/community action.
 */
export async function isUserSuspended(userId: string): Promise<{
  suspended: boolean
  reason?: string
  until?: string | null
}> {
  const suspension = await getUserSuspension(userId)
  if (!suspension) return { suspended: false }
  if (suspension.status === 'active') return { suspended: false }

  return {
    suspended: true,
    reason: suspension.reason,
    until: suspension.suspendedUntil,
  }
}

// ── Abuse Event Logging ──────────────────────────────────

export async function logAbuseEvent(
  userId: string,
  type: AbuseEventType,
  detail: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  // Look up display name (best effort)
  let displayName = 'Unknown'
  try {
    const userSnap = await firestore.collection('users').doc(userId).get()
    if (userSnap.exists) {
      displayName = userSnap.data()!.displayName || 'Unknown'
    }
  } catch {
    // silent
  }

  await firestore.collection('abuseEvents').add({
    userId,
    displayName,
    type,
    detail,
    meta,
    createdAt: new Date().toISOString(),
  })
}

// ── Admin: Abuse Events Feed ─────────────────────────────

export async function getAbuseEvents(limit = 100): Promise<AbuseEvent[]> {
  const snap = await firestore
    .collection('abuseEvents')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as AbuseEvent)
}

export async function getAbuseEventsForUser(userId: string, limit = 50): Promise<AbuseEvent[]> {
  const snap = await firestore
    .collection('abuseEvents')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as AbuseEvent)
}

// ── Top Earners (Suspicious Leaderboard) ─────────────────

export async function getTopEarners(period: 'daily' | 'weekly' = 'daily', limit = 20): Promise<{
  userId: string
  tcEarned: number
  spEarned: number
  date: string
}[]> {
  const today = new Date().toISOString().slice(0, 10)

  if (period === 'daily') {
    // Query all daily tracker docs for today, sort by tcEarned desc
    const snap = await firestore
      .collectionGroup('daily')
      .where('date', '==', today)
      .orderBy('tcEarned', 'desc')
      .limit(limit)
      .get()

    return snap.docs.map(d => {
      const data = d.data()
      // Parent path: userLimits/{userId}/daily/{date}
      const userId = d.ref.parent.parent?.id || 'unknown'
      return {
        userId,
        tcEarned: data.tcEarned || 0,
        spEarned: data.spEarned || 0,
        date: data.date || today,
      }
    })
  } else {
    // Weekly top earners
    const jan1 = new Date(new Date().getFullYear(), 0, 1)
    const days = Math.floor((Date.now() - jan1.getTime()) / 86_400_000)
    const week = Math.ceil((days + jan1.getDay() + 1) / 7)
    const weekStr = `${new Date().getFullYear()}-W${String(week).padStart(2, '0')}`

    const snap = await firestore
      .collectionGroup('weekly')
      .where('week', '==', weekStr)
      .orderBy('tcEarned', 'desc')
      .limit(limit)
      .get()

    return snap.docs.map(d => {
      const data = d.data()
      const userId = d.ref.parent.parent?.id || 'unknown'
      return {
        userId,
        tcEarned: data.tcEarned || 0,
        spEarned: data.spEarned || 0,
        date: data.week || weekStr,
      }
    })
  }
}

// ── Spam Score System ────────────────────────────────────

const SPAM_SCORES_COL = 'spamScores'

export async function getSpamScore(userId: string): Promise<SpamScore> {
  const ref = firestore.collection(SPAM_SCORES_COL).doc(userId)
  const snap = await ref.get()
  if (!snap.exists) {
    return {
      userId,
      score: 0,
      signals: { rateLimitHits: 0, flagsReceived: 0, duplicateContent: 0, linkSpam: 0, rapidFire: 0 },
      lastWarningAt: null,
      lastActionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  return snap.data() as SpamScore
}

type SpamSignal = 'rateLimitHit' | 'flagReceived' | 'duplicateContent' | 'linkSpam' | 'rapidFire'

const SIGNAL_TO_FIELD: Record<SpamSignal, keyof SpamScore['signals']> = {
  rateLimitHit: 'rateLimitHits',
  flagReceived: 'flagsReceived',
  duplicateContent: 'duplicateContent',
  linkSpam: 'linkSpam',
  rapidFire: 'rapidFire',
}

/**
 * Add spam points for a specific signal. Handles auto-escalation:
 * - 25 pts → warning logged
 * - 50 pts → auto 1-day suspension
 * - 100 pts → auto 7-day suspension
 * - 200 pts → permanent ban
 */
export async function addSpamPoints(
  userId: string,
  signal: SpamSignal,
  detail?: string
): Promise<{ newScore: number; escalation: 'none' | 'warning' | 'suspend_1d' | 'suspend_7d' | 'ban' }> {
  const ref = firestore.collection(SPAM_SCORES_COL).doc(userId)
  const snap = await ref.get()
  const now = new Date().toISOString()

  const existing: SpamScore = snap.exists
    ? (snap.data() as SpamScore)
    : {
        userId,
        score: 0,
        signals: { rateLimitHits: 0, flagsReceived: 0, duplicateContent: 0, linkSpam: 0, rapidFire: 0 },
        lastWarningAt: null,
        lastActionAt: now,
        updatedAt: now,
      }

  const points = SPAM_WEIGHTS[signal]
  const newScore = existing.score + points
  const signalField = SIGNAL_TO_FIELD[signal]

  const updated: SpamScore = {
    ...existing,
    score: newScore,
    signals: {
      ...existing.signals,
      [signalField]: (existing.signals[signalField] || 0) + 1,
    },
    lastActionAt: now,
    updatedAt: now,
  }

  // Determine escalation
  let escalation: 'none' | 'warning' | 'suspend_1d' | 'suspend_7d' | 'ban' = 'none'

  if (newScore >= SPAM_THRESHOLDS.ban && existing.score < SPAM_THRESHOLDS.ban) {
    escalation = 'ban'
    await suspendUser(userId, 'system', `Auto-ban: spam score ${newScore}`, null)
    await logAbuseEvent(userId, 'spam_auto_suspend', `Auto-banned at score ${newScore}`, { signal, newScore })
  } else if (newScore >= SPAM_THRESHOLDS.suspend7Days && existing.score < SPAM_THRESHOLDS.suspend7Days) {
    escalation = 'suspend_7d'
    await suspendUser(userId, 'system', `Auto-suspend: spam score ${newScore}`, 7)
    await logAbuseEvent(userId, 'spam_auto_suspend', `Auto-suspended 7d at score ${newScore}`, { signal, newScore })
  } else if (newScore >= SPAM_THRESHOLDS.suspend1Day && existing.score < SPAM_THRESHOLDS.suspend1Day) {
    escalation = 'suspend_1d'
    await suspendUser(userId, 'system', `Auto-suspend: spam score ${newScore}`, 1)
    await logAbuseEvent(userId, 'spam_auto_suspend', `Auto-suspended 1d at score ${newScore}`, { signal, newScore })
  } else if (newScore >= SPAM_THRESHOLDS.warning && existing.score < SPAM_THRESHOLDS.warning) {
    escalation = 'warning'
    updated.lastWarningAt = now
    await logAbuseEvent(userId, 'spam_warning', `Spam warning at score ${newScore}: ${detail || signal}`, { signal, newScore })
  }

  await ref.set(updated)
  return { newScore, escalation }
}

export async function resetSpamScore(userId: string): Promise<void> {
  const ref = firestore.collection(SPAM_SCORES_COL).doc(userId)
  await ref.delete()
}

export async function getHighSpamUsers(minScore = 10, limit = 50): Promise<SpamScore[]> {
  const snap = await firestore
    .collection(SPAM_SCORES_COL)
    .where('score', '>=', minScore)
    .orderBy('score', 'desc')
    .limit(limit)
    .get()

  return snap.docs.map(d => d.data() as SpamScore)
}

/**
 * Analyze post content for spam signals. Returns signals detected.
 * Called after post/reply creation to accumulate spam score.
 */
export async function scoreContent(
  userId: string,
  body: string
): Promise<SpamSignal[]> {
  const signals: SpamSignal[] = []

  // Link spam: 3+ URLs in a single post
  const urlCount = (body.match(/https?:\/\/\S+/gi) || []).length
  if (urlCount >= 3) {
    signals.push('linkSpam')
  }

  // Duplicate content: check last 5 posts for identical body
  const recentSnap = await firestore
    .collection('communityPosts')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get()

  const normalizedBody = body.toLowerCase().replace(/\s+/g, ' ').trim()
  for (const doc of recentSnap.docs) {
    const existing = (doc.data().body || '').toLowerCase().replace(/\s+/g, ' ').trim()
    if (existing === normalizedBody) {
      signals.push('duplicateContent')
      break
    }
  }

  // Apply all detected signals
  for (const signal of signals) {
    await addSpamPoints(userId, signal, `Content: "${body.slice(0, 80)}"`)
  }

  return signals
}
