'use server'

import { firestore } from '../../lib/firebase-admin'
import { getEconomyConfig } from './economy'

/**
 * Rate limiter for the FanOS economy.
 *
 * Tracks daily/weekly earning totals and action timestamps per user.
 * Firestore path: userLimits/{userId}/daily/{YYYY-MM-DD}
 * Firestore path: userLimits/{userId}/weekly/{YYYY-Www}
 * Firestore path: userLimits/{userId}/cooldowns/{action}
 * Firestore path: userLimits/{userId}/actionCounts/{action}
 */

// ── Helpers ──────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function weekKey(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86_400_000)
  const week = Math.ceil((days + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

// ── Types ────────────────────────────────────────────────

export interface DailyTracker {
  tcEarned: number
  spEarned: number
  predictions: number
  polls: number
  shares: number
  date: string
}

export interface WeeklyTracker {
  tcEarned: number
  spEarned: number
  week: string
}

export interface CooldownRecord {
  action: string
  lastActionAt: string
}

export interface CapCheckResult {
  allowed: boolean
  remaining: number
  cappedAmount: number | null
  reason?: string
}

export interface CooldownCheckResult {
  allowed: boolean
  retryAfterMs: number | null
  reason?: string
}

export interface DiminishingReturnResult {
  multiplier: number
  actionCount: number
}

// ── Daily/Weekly Trackers ────────────────────────────────

async function getDailyTracker(userId: string): Promise<DailyTracker> {
  const day = todayKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('daily').doc(day)
  const snap = await ref.get()

  if (!snap.exists) {
    return { tcEarned: 0, spEarned: 0, predictions: 0, polls: 0, shares: 0, date: day }
  }

  return { tcEarned: 0, spEarned: 0, predictions: 0, polls: 0, shares: 0, date: day, ...snap.data() }
}

async function getWeeklyTracker(userId: string): Promise<WeeklyTracker> {
  const week = weekKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('weekly').doc(week)
  const snap = await ref.get()

  if (!snap.exists) {
    return { tcEarned: 0, spEarned: 0, week }
  }

  return { tcEarned: 0, spEarned: 0, week, ...snap.data() }
}

export async function incrementDailyTracker(
  userId: string,
  field: keyof Omit<DailyTracker, 'date'>,
  amount: number
): Promise<void> {
  const day = todayKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('daily').doc(day)

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists ? (snap.data() as Partial<DailyTracker>) : {}

    tx.set(ref, {
      ...current,
      [field]: ((current[field] as number) || 0) + amount,
      date: day,
    }, { merge: true })
  })
}

export async function incrementWeeklyTracker(
  userId: string,
  field: keyof Omit<WeeklyTracker, 'week'>,
  amount: number
): Promise<void> {
  const week = weekKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('weekly').doc(week)

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists ? (snap.data() as Partial<WeeklyTracker>) : {}

    tx.set(ref, {
      ...current,
      [field]: ((current[field] as number) || 0) + amount,
      week,
    }, { merge: true })
  })
}

// ── Cap Checks ───────────────────────────────────────────

export async function checkTCCap(
  userId: string,
  requestedAmount: number
): Promise<CapCheckResult> {
  const config = await getEconomyConfig()
  const [daily, weekly] = await Promise.all([
    getDailyTracker(userId),
    getWeeklyTracker(userId),
  ])

  // Check daily cap
  if (config.dailyTCCap > 0) {
    const dailyRemaining = Math.max(0, config.dailyTCCap - daily.tcEarned)
    if (dailyRemaining <= 0) {
      return { allowed: false, remaining: 0, cappedAmount: null, reason: 'Daily TC cap reached' }
    }
    if (requestedAmount > dailyRemaining) {
      return { allowed: true, remaining: dailyRemaining, cappedAmount: dailyRemaining, reason: 'Capped to daily limit' }
    }
  }

  // Check weekly cap
  if (config.weeklyTCCap > 0) {
    const weeklyRemaining = Math.max(0, config.weeklyTCCap - weekly.tcEarned)
    if (weeklyRemaining <= 0) {
      return { allowed: false, remaining: 0, cappedAmount: null, reason: 'Weekly TC cap reached' }
    }
    if (requestedAmount > weeklyRemaining) {
      return { allowed: true, remaining: weeklyRemaining, cappedAmount: weeklyRemaining, reason: 'Capped to weekly limit' }
    }
  }

  return { allowed: true, remaining: requestedAmount, cappedAmount: null }
}

export async function checkSPCap(
  userId: string,
  requestedAmount: number
): Promise<CapCheckResult> {
  const config = await getEconomyConfig()
  const [daily, weekly] = await Promise.all([
    getDailyTracker(userId),
    getWeeklyTracker(userId),
  ])

  // Check daily cap
  if (config.dailySPCap > 0) {
    const dailyRemaining = Math.max(0, config.dailySPCap - daily.spEarned)
    if (dailyRemaining <= 0) {
      return { allowed: false, remaining: 0, cappedAmount: null, reason: 'Daily SP cap reached' }
    }
    if (requestedAmount > dailyRemaining) {
      return { allowed: true, remaining: dailyRemaining, cappedAmount: dailyRemaining, reason: 'Capped to daily limit' }
    }
  }

  // Check weekly cap
  if (config.weeklySPCap > 0) {
    const weeklyRemaining = Math.max(0, config.weeklySPCap - weekly.spEarned)
    if (weeklyRemaining <= 0) {
      return { allowed: false, remaining: 0, cappedAmount: null, reason: 'Weekly SP cap reached' }
    }
    if (requestedAmount > weeklyRemaining) {
      return { allowed: true, remaining: weeklyRemaining, cappedAmount: weeklyRemaining, reason: 'Capped to weekly limit' }
    }
  }

  return { allowed: true, remaining: requestedAmount, cappedAmount: null }
}

export async function checkCategoryCap(
  userId: string,
  category: 'predictions' | 'polls' | 'shares',
  limit: number
): Promise<CapCheckResult> {
  if (limit <= 0) return { allowed: true, remaining: limit, cappedAmount: null }

  const daily = await getDailyTracker(userId)
  const current = daily[category] || 0
  const remaining = Math.max(0, limit - current)

  if (remaining <= 0) {
    return { allowed: false, remaining: 0, cappedAmount: null, reason: `Daily ${category} limit reached` }
  }

  return { allowed: true, remaining, cappedAmount: null }
}

// ── Cooldown Checks ──────────────────────────────────────

export async function checkCooldown(
  userId: string,
  action: string,
  cooldownMs: number
): Promise<CooldownCheckResult> {
  if (cooldownMs <= 0) return { allowed: true, retryAfterMs: null }

  const ref = firestore.collection('userLimits').doc(userId).collection('cooldowns').doc(action)
  const snap = await ref.get()

  if (!snap.exists) {
    return { allowed: true, retryAfterMs: null }
  }

  const data = snap.data() as CooldownRecord
  const lastAction = new Date(data.lastActionAt).getTime()
  const now = Date.now()
  const elapsed = now - lastAction

  if (elapsed < cooldownMs) {
    const retryAfterMs = cooldownMs - elapsed
    return {
      allowed: false,
      retryAfterMs,
      reason: `Cooldown active. Try again in ${Math.ceil(retryAfterMs / 1000)}s`,
    }
  }

  return { allowed: true, retryAfterMs: null }
}

export async function setCooldown(userId: string, action: string): Promise<void> {
  const ref = firestore.collection('userLimits').doc(userId).collection('cooldowns').doc(action)
  await ref.set({
    action,
    lastActionAt: new Date().toISOString(),
  })
}

// ── Diminishing Returns ──────────────────────────────────

export async function checkDiminishingReturn(
  userId: string,
  action: string,
  factor: number
): Promise<DiminishingReturnResult> {
  // factor = 0 means no diminishing returns
  if (factor <= 0 || factor >= 1) return { multiplier: 1, actionCount: 0 }

  const day = todayKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('actionCounts').doc(`${action}:${day}`)
  const snap = await ref.get()

  const actionCount = snap.exists ? ((snap.data()?.count as number) || 0) : 0

  // Each repeat multiplies reward by factor^count
  // e.g. factor=0.9, count=3 → 0.9^3 = 0.729 (72.9% of base)
  const multiplier = Math.pow(factor, actionCount)

  return { multiplier: Math.max(0.01, multiplier), actionCount }
}

export async function incrementActionCount(
  userId: string,
  action: string
): Promise<void> {
  const day = todayKey()
  const ref = firestore.collection('userLimits').doc(userId).collection('actionCounts').doc(`${action}:${day}`)

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists ? ((snap.data()?.count as number) || 0) : 0
    tx.set(ref, { count: current + 1, action, date: day })
  })
}

// ── Combined Guard ───────────────────────────────────────

export interface EarnGuardResult {
  allowed: boolean
  finalAmount: number
  cappedFlag: boolean
  cooldownFlag: boolean
  diminishingMultiplier: number
  subscriberMultiplier: number
  reason?: string
}

/**
 * Combined pre-check for any earning action.
 * Checks suspension → account age → cap → cooldown → diminishing returns in one call.
 */
export async function checkEarnGuard(
  userId: string,
  opts: {
    amount: number
    currency: 'tc' | 'sp'
    category?: 'predictions' | 'polls' | 'shares'
    categoryLimit?: number
    cooldownAction?: string
    cooldownMs?: number
    diminishingAction?: string
    diminishingFactor?: number
    isBlackCard?: boolean
    subscriberMultiplier?: number
  }
): Promise<EarnGuardResult> {
  // 0a. Suspension check
  const { isUserSuspended } = await import('./abuse-prevention')
  const suspCheck = await isUserSuspended(userId)
  if (suspCheck.suspended) {
    return {
      allowed: false,
      finalAmount: 0,
      cappedFlag: false,
      cooldownFlag: false,
      diminishingMultiplier: 1,
      subscriberMultiplier: 1,
      reason: `Account suspended: ${suspCheck.reason}`,
    }
  }

  // 0b. Account age gate
  const { checkAccountAge } = await import('./abuse-prevention')
  const ageCheck = await checkAccountAge(userId)
  if (!ageCheck.allowed) {
    return {
      allowed: false,
      finalAmount: 0,
      cappedFlag: false,
      cooldownFlag: false,
      diminishingMultiplier: 1,
      subscriberMultiplier: 1,
      reason: `Account too new (${ageCheck.accountAgeDays}d / ${ageCheck.requiredDays}d required)`,
    }
  }

  // 1. Cap check
  const capResult = opts.currency === 'tc'
    ? await checkTCCap(userId, opts.amount)
    : await checkSPCap(userId, opts.amount)

  if (!capResult.allowed) {
    return {
      allowed: false,
      finalAmount: 0,
      cappedFlag: true,
      cooldownFlag: false,
      diminishingMultiplier: 1,
      subscriberMultiplier: 1,
      reason: capResult.reason,
    }
  }

  // 2. Category cap
  if (opts.category && opts.categoryLimit && opts.categoryLimit > 0) {
    const catResult = await checkCategoryCap(userId, opts.category, opts.categoryLimit)
    if (!catResult.allowed) {
      return {
        allowed: false,
        finalAmount: 0,
        cappedFlag: true,
        cooldownFlag: false,
        diminishingMultiplier: 1,
        subscriberMultiplier: 1,
        reason: catResult.reason,
      }
    }
  }

  // 3. Cooldown check
  if (opts.cooldownAction && opts.cooldownMs && opts.cooldownMs > 0) {
    const cdResult = await checkCooldown(userId, opts.cooldownAction, opts.cooldownMs)
    if (!cdResult.allowed) {
      return {
        allowed: false,
        finalAmount: 0,
        cappedFlag: false,
        cooldownFlag: true,
        diminishingMultiplier: 1,
        subscriberMultiplier: 1,
        reason: cdResult.reason,
      }
    }
  }

  // 4. Diminishing returns
  let multiplier = 1
  if (opts.diminishingAction && opts.diminishingFactor) {
    const drResult = await checkDiminishingReturn(userId, opts.diminishingAction, opts.diminishingFactor)
    multiplier = drResult.multiplier
  }

  // 5. Subscriber multiplier (Black Card)
  let subMultiplier = 1
  if (opts.isBlackCard && opts.subscriberMultiplier && opts.subscriberMultiplier > 1) {
    subMultiplier = opts.subscriberMultiplier
  }

  // Compute final amount (base × diminishing × subscriber)
  let finalAmount = Math.floor(opts.amount * multiplier * subMultiplier)
  const cappedFlag = capResult.cappedAmount !== null

  if (capResult.cappedAmount !== null) {
    finalAmount = Math.min(finalAmount, capResult.cappedAmount)
  }

  // Must earn at least 1 if allowed
  finalAmount = Math.max(1, finalAmount)

  return {
    allowed: true,
    finalAmount,
    cappedFlag,
    cooldownFlag: false,
    diminishingMultiplier: multiplier,
    subscriberMultiplier: subMultiplier,
  }
}

/**
 * Record that an earning action was completed.
 * Call this AFTER a successful ledger write.
 */
export async function recordEarningAction(
  userId: string,
  opts: {
    tcAmount?: number
    spAmount?: number
    category?: 'predictions' | 'polls' | 'shares'
    cooldownAction?: string
    diminishingAction?: string
  }
): Promise<void> {
  const promises: Promise<void>[] = []

  if (opts.tcAmount && opts.tcAmount > 0) {
    promises.push(incrementDailyTracker(userId, 'tcEarned', opts.tcAmount))
    promises.push(incrementWeeklyTracker(userId, 'tcEarned', opts.tcAmount))

    // Velocity check (non-blocking — logs abuse event if flagged)
    import('./abuse-prevention').then(({ checkVelocity }) =>
      checkVelocity(userId, opts.tcAmount!).catch(() => {})
    )
  }

  if (opts.spAmount && opts.spAmount > 0) {
    promises.push(incrementDailyTracker(userId, 'spEarned', opts.spAmount))
    promises.push(incrementWeeklyTracker(userId, 'spEarned', opts.spAmount))
  }

  if (opts.category) {
    promises.push(incrementDailyTracker(userId, opts.category, 1))
  }

  if (opts.cooldownAction) {
    promises.push(setCooldown(userId, opts.cooldownAction))
  }

  if (opts.diminishingAction) {
    promises.push(incrementActionCount(userId, opts.diminishingAction))
  }

  await Promise.all(promises)
}
