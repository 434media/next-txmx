'use server'

import { firestore } from '../../lib/firebase-admin'
import { setAtEvent } from './fightnight-standings'

export interface CheckInCode {
  fightNightId: string
  currentCode: string
  validFrom: string
  validUntil: string
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

function codeRef(fightNightId: string) {
  return firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('codes')
    .doc('current')
}

/**
 * Rotate to a new 4-digit code. Admin-only.
 */
export async function rotateCheckInCode(
  fightNightId: string,
  ttlMinutes = 10,
  adminUid = ''
): Promise<CheckInCode> {
  if (!fightNightId) throw new Error('Missing fightNightId')
  if (ttlMinutes < 1 || ttlMinutes > 60) throw new Error('TTL must be 1-60 minutes')

  const now = new Date()
  const validUntil = new Date(now.getTime() + ttlMinutes * 60_000)

  // Preserve the totalCheckIns counter across rotations
  const existing = await codeRef(fightNightId).get()
  const totalCheckIns = existing.exists ? (existing.data()?.totalCheckIns as number || 0) : 0

  const code: CheckInCode = {
    fightNightId,
    currentCode: generateCode(),
    validFrom: now.toISOString(),
    validUntil: validUntil.toISOString(),
    ttlMinutes,
    rotatedAt: now.toISOString(),
    rotatedBy: adminUid,
    totalCheckIns,
  }
  await codeRef(fightNightId).set(code)
  return code
}

/**
 * Read the current code. Admin-only — users should never call this; they submit
 * a guess via `submitCheckInCode`.
 */
export async function getCheckInCode(fightNightId: string): Promise<CheckInCode | null> {
  if (!fightNightId) return null
  const snap = await codeRef(fightNightId).get()
  if (!snap.exists) return null
  return snap.data() as CheckInCode
}

/**
 * Submit a check-in code. Stamps atEvent on the user's standing on success.
 * Returns vague errors so codes can't be probed.
 */
export async function submitCheckInCode(
  fightNightId: string,
  userId: string,
  submittedCode: string
): Promise<{ success: boolean; alreadyCheckedIn?: boolean; error?: string }> {
  if (!userId.trim()) return { success: false, error: 'Not signed in' }
  if (!fightNightId.trim()) return { success: false, error: 'Missing fight night' }

  const cleaned = submittedCode.replace(/\D/g, '').trim()
  if (cleaned.length !== 4) {
    return { success: false, error: 'Enter the 4-digit code' }
  }

  const snap = await codeRef(fightNightId).get()
  if (!snap.exists) {
    return { success: false, error: 'No active code — ask staff to start check-in' }
  }
  const code = snap.data() as CheckInCode
  if (code.currentCode !== cleaned) {
    return { success: false, error: 'Code is incorrect or expired' }
  }

  const now = Date.now()
  const validUntilMs = new Date(code.validUntil).getTime()
  if (now > validUntilMs + CLOCK_SKEW_MS) {
    return { success: false, error: 'Code is incorrect or expired' }
  }

  // Idempotency: if already at event, return success
  const standingSnap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .doc(userId)
    .get()
  if (standingSnap.exists && standingSnap.data()?.atEvent === true) {
    return { success: true, alreadyCheckedIn: true }
  }

  // Stamp atEvent + write a check-in record
  const userSnap = await firestore.collection('users').doc(userId).get()
  const u = userSnap.exists ? userSnap.data() : null

  await setAtEvent(fightNightId, userId, true, {
    displayName: u?.displayName || null,
    photoURL: u?.photoURL || null,
    email: u?.email || null,
  })

  // Record the check-in for the audit trail
  try {
    await firestore
      .collection('fightNights')
      .doc(fightNightId)
      .collection('checkIns')
      .doc(userId)
      .set({
        userId,
        displayName: u?.displayName || null,
        email: u?.email || null,
        checkedInAt: new Date().toISOString(),
        codeUsed: cleaned,
      })
  } catch {
    // Non-critical
  }

  // Bump counter
  try {
    await codeRef(fightNightId).update({
      totalCheckIns: (code.totalCheckIns || 0) + 1,
    })
  } catch {
    // Non-critical
  }

  return { success: true }
}

export interface CheckInRecord {
  userId: string
  displayName: string | null
  email: string | null
  checkedInAt: string
  codeUsed: string
}

/**
 * Get the list of check-in records for an event — used by admin to track who's at the venue.
 * Returns most-recent first.
 */
export async function getCheckIns(fightNightId: string): Promise<CheckInRecord[]> {
  if (!fightNightId) return []
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('checkIns')
    .orderBy('checkedInAt', 'desc')
    .get()
  return snap.docs.map((d) => d.data() as CheckInRecord)
}

export async function isUserCheckedIn(
  fightNightId: string,
  userId: string
): Promise<boolean> {
  if (!fightNightId || !userId) return false
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .doc(userId)
    .get()
  if (!snap.exists) return false
  return snap.data()?.atEvent === true
}
