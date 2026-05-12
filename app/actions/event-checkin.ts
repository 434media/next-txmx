'use server'

import { firestore } from '../../lib/firebase-admin'
import { setUserAtEvent } from './event-leaderboard'
import { getUserByUid } from './users'

export interface CheckInCode {
  eventId: string
  currentCode: string        // 4-digit string, e.g. "4827"
  validFrom: string          // ISO
  validUntil: string         // ISO
  ttlMinutes: number
  rotatedAt: string
  rotatedBy: string
  totalCheckIns: number
}

/** Clock-skew tolerance — accept codes for 30s past validUntil. */
const CLOCK_SKEW_MS = 30_000

function generateCode(): string {
  return Math.floor(Math.random() * 10_000).toString().padStart(4, '0')
}

function codeRef(eventId: string) {
  return firestore.collection('eventCheckIns').doc(eventId)
}

/**
 * Generate a new 4-digit check-in code for an event. Admin-only.
 * The new code replaces the old one; the old code is no longer valid even
 * within the clock-skew window.
 */
export async function rotateCheckInCode(
  eventId: string,
  ttlMinutes = 10,
  adminUid = ''
): Promise<CheckInCode> {
  if (!eventId) throw new Error('Missing eventId')
  if (ttlMinutes < 1 || ttlMinutes > 60) throw new Error('TTL must be 1-60 minutes')

  const now = new Date()
  const validUntil = new Date(now.getTime() + ttlMinutes * 60_000)

  // Pull current totalCheckIns so we don't reset the counter on rotate
  const existing = await codeRef(eventId).get()
  const totalCheckIns = existing.exists ? (existing.data()?.totalCheckIns as number || 0) : 0

  const code: CheckInCode = {
    eventId,
    currentCode: generateCode(),
    validFrom: now.toISOString(),
    validUntil: validUntil.toISOString(),
    ttlMinutes,
    rotatedAt: now.toISOString(),
    rotatedBy: adminUid,
    totalCheckIns,
  }

  await codeRef(eventId).set(code)
  return code
}

/**
 * Read the current check-in code for an event. Admin-only — never call this
 * from a user-facing client (users should never see the code, only enter it).
 */
export async function getCheckInCode(eventId: string): Promise<CheckInCode | null> {
  if (!eventId) return null
  const snap = await codeRef(eventId).get()
  if (!snap.exists) return null
  return snap.data() as CheckInCode
}

/**
 * Submit a check-in code on behalf of a user. Validates the code, stamps
 * `atEvent: true` on the user's event leaderboard entry, and increments
 * the totalCheckIns counter.
 *
 * Returns `{ success, alreadyCheckedIn?, error? }`. Error reasons are
 * intentionally vague to non-admins to avoid leaking code state.
 */
export async function submitCheckInCode(
  userId: string,
  eventId: string,
  submittedCode: string
): Promise<{ success: boolean; alreadyCheckedIn?: boolean; error?: string }> {
  if (!userId.trim()) return { success: false, error: 'Not signed in' }
  if (!eventId.trim()) return { success: false, error: 'Missing event' }

  const cleaned = submittedCode.replace(/\D/g, '').trim()
  if (cleaned.length !== 4) {
    return { success: false, error: 'Enter the 4-digit code' }
  }

  const codeDoc = await codeRef(eventId).get()
  if (!codeDoc.exists) {
    return { success: false, error: 'No active code — ask staff to start check-in' }
  }

  const code = codeDoc.data() as CheckInCode
  if (code.currentCode !== cleaned) {
    return { success: false, error: 'Code is incorrect or expired' }
  }

  // Check expiry with clock-skew tolerance
  const now = Date.now()
  const validUntilMs = new Date(code.validUntil).getTime()
  if (now > validUntilMs + CLOCK_SKEW_MS) {
    return { success: false, error: 'Code is incorrect or expired' }
  }

  // Check if user already checked in (idempotent success)
  const entrySnap = await firestore
    .collection('eventLeaderboards')
    .doc(eventId)
    .collection('entries')
    .doc(userId)
    .get()

  if (entrySnap.exists && entrySnap.data()?.atEvent === true) {
    return { success: true, alreadyCheckedIn: true }
  }

  // Stamp atEvent: true on the entry (creates a stub if none exists yet)
  const user = await getUserByUid(userId)
  await setUserAtEvent(userId, eventId, true, {
    displayName: user?.displayName || null,
    photoURL: user?.photoURL || null,
    rank: user?.rank || 'rookie',
  })

  // Increment counter (non-critical)
  try {
    await codeRef(eventId).update({
      totalCheckIns: (code.totalCheckIns || 0) + 1,
    })
  } catch {
    // Non-critical
  }

  return { success: true }
}

/**
 * Check whether a user has already checked in to an event.
 */
export async function isUserCheckedIn(
  userId: string,
  eventId: string
): Promise<boolean> {
  if (!userId || !eventId) return false
  const snap = await firestore
    .collection('eventLeaderboards')
    .doc(eventId)
    .collection('entries')
    .doc(userId)
    .get()
  if (!snap.exists) return false
  return snap.data()?.atEvent === true
}
