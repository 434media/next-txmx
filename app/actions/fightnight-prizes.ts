'use server'

import { firestore } from '../../lib/firebase-admin'
import { requireAdmin } from '../../lib/admin-auth'
import { getFightNight } from './fightnight'
import { getStandingsWithEmails, getPrizesWithEmails } from '../../lib/server/fan-emails'
import { auth } from '../../lib/firebase-admin'
import { isAllowlistedAdmin, parseAdminEmails } from '../../lib/admin-allowlist'
import { sendEventWinnerEmailsBatch, type EventEmailContext } from './email'

export type PrizeStatus = 'pending' | 'claimed' | 'forfeited'

export interface FightNightPrize {
  id: string
  fightNightId: string
  userId: string
  position: number
  prizeLabel: string
  displayName: string | null
  email: string | null
  pointsEarned: number
  status: PrizeStatus
  notes: string
  awardedAt: string
  claimedAt: string | null
  resolvedBy: string | null
}

function prizesCol(fightNightId: string) {
  return firestore.collection('fightNights').doc(fightNightId).collection('prizes')
}

/**
 * Create or fetch a prize record (idempotent on fightNightId + userId + position).
 */
export async function awardPrize(input: {
  fightNightId: string
  userId: string
  position: number
  prizeLabel: string
  displayName: string | null
  email: string | null
  pointsEarned: number
}): Promise<FightNightPrize> {
  await requireAdmin()
  if (!input.fightNightId || !input.userId) {
    throw new Error('Missing fightNightId or userId')
  }

  // Idempotency: one prize per (fightNight, user, position)
  const existingSnap = await prizesCol(input.fightNightId)
    .where('userId', '==', input.userId)
    .where('position', '==', input.position)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    const doc = existingSnap.docs[0]
    return { id: doc.id, ...doc.data() } as FightNightPrize
  }

  const now = new Date().toISOString()
  const data: Omit<FightNightPrize, 'id'> = {
    fightNightId: input.fightNightId,
    userId: input.userId,
    position: input.position,
    prizeLabel: input.prizeLabel,
    displayName: input.displayName,
    email: input.email,
    pointsEarned: input.pointsEarned,
    status: 'pending',
    notes: '',
    awardedAt: now,
    claimedAt: null,
    resolvedBy: null,
  }
  const ref = await prizesCol(input.fightNightId).add(data)
  return { id: ref.id, ...data }
}

/**
 * Award the top-N standings as prize records and (optionally) send winner emails.
 * Returns the prize records that were created.
 */
export async function awardTopFinishers(
  fightNightId: string,
  opts: {
    topN: number
    prizeLabel: string
  }
): Promise<FightNightPrize[]> {
  await requireAdmin()
  if (!fightNightId) return []

  const fightNight = await getFightNight(fightNightId)
  if (!fightNight) return []

  const standings = await getStandingsWithEmails(fightNightId, {
    limit: opts.topN,
  })

  const prizes: FightNightPrize[] = []
  for (let i = 0; i < standings.length; i++) {
    const s = standings[i]
    const prize = await awardPrize({
      fightNightId,
      userId: s.userId,
      position: i + 1,
      prizeLabel: opts.prizeLabel,
      displayName: s.displayName,
      email: s.email,
      pointsEarned: s.points,
    })
    prizes.push(prize)
  }
  return prizes
}

/** Public action (anonymous callers on the fight-night page): emails blanked. */
export async function getPrizes(fightNightId: string): Promise<FightNightPrize[]> {
  if (!fightNightId) return []
  const snap = await prizesCol(fightNightId).orderBy('position', 'asc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), email: null }) as FightNightPrize)
}

/**
 * Prizes with winners' emails, for the admin prize panel. The caller sends its
 * Firebase ID token; only a verified email on ADMIN_EMAILS gets emails back
 * (same rule as lib/admin-allowlist.ts). Anyone else gets null, and the panel
 * falls back to getPrizes (emails blank).
 */
export async function getPrizesForAdmin(
  fightNightId: string,
  idToken: string
): Promise<FightNightPrize[] | null> {
  if (!fightNightId || typeof idToken !== 'string' || !idToken) return null
  let claims
  try {
    // Public-key verification only: checkRevoked calls the Firebase Auth admin
    // API, which this project's service account may not use
    // (auth/insufficient-permission).
    claims = await auth.verifyIdToken(idToken)
  } catch (err) {
    console.error('[getPrizesForAdmin] verifyIdToken failed:', (err as { code?: string })?.code ?? 'unknown')
    return null
  }
  if (!isAllowlistedAdmin(claims, parseAdminEmails(process.env.ADMIN_EMAILS))) return null
  return getPrizesWithEmails(fightNightId)
}

export async function markPrizeClaimed(
  fightNightId: string,
  prizeId: string,
  adminUid: string,
  notes = ''
): Promise<void> {
  await requireAdmin()
  await prizesCol(fightNightId).doc(prizeId).update({
    status: 'claimed' as PrizeStatus,
    claimedAt: new Date().toISOString(),
    resolvedBy: adminUid,
    notes,
  })
}

export async function markPrizeForfeited(
  fightNightId: string,
  prizeId: string,
  adminUid: string,
  reason = ''
): Promise<void> {
  await requireAdmin()
  await prizesCol(fightNightId).doc(prizeId).update({
    status: 'forfeited' as PrizeStatus,
    claimedAt: null,
    resolvedBy: adminUid,
    notes: reason,
  })
}

/**
 * Send winner emails for the pending prizes of a fight night. Uses the
 * existing email templates (sendEventWinnerEmailsBatch). Idempotency is the
 * caller's responsibility — don't tap the admin button twice.
 */
export async function notifyFightNightWinners(
  fightNightId: string,
  claimInstructions: string
): Promise<{
  sent: number
  skipped: number
  errors: number
  results: Array<{
    displayName: string | null
    email: string | null
    status: 'sent' | 'skipped' | 'error'
  }>
}> {
  await requireAdmin()
  const fightNight = await getFightNight(fightNightId)
  if (!fightNight) return { sent: 0, skipped: 0, errors: 0, results: [] }

  const prizes = await getPrizesWithEmails(fightNightId)
  const pending = prizes.filter((p) => p.status === 'pending')
  if (pending.length === 0) return { sent: 0, skipped: 0, errors: 0, results: [] }

  const ctx: EventEmailContext = {
    // The public page is /fight-nights/{slug}; fall back to the doc id if a
    // slug hasn't been backfilled. ("events/*" paths now 301-redirect.)
    eventId: fightNight.slug || fightNight.id,
    eventName: fightNight.title || 'Fight Night',
    venue: fightNight.venue,
    city: fightNight.city,
    date: fightNight.date,
    promoter: fightNight.subtitle || 'TXMX Boxing',
    urlPath: 'fight-nights',
  }
  const winners = pending.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    email: p.email,
    position: p.position,
    spEarned: p.pointsEarned,
    prizeLabel: p.prizeLabel,
    claimInstructions,
  }))

  return sendEventWinnerEmailsBatch(ctx, winners)
}
