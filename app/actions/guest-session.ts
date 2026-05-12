'use server'

import crypto from 'crypto'
import { auth } from '../../lib/firebase-admin'

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface GuestSessionResult {
  success: boolean
  token?: string
  uid?: string
  error?: string
}

/**
 * Mint a Firebase Auth custom token for a walk-in guest. Used by the
 * fight-night walk-in form instead of signInAnonymously, which requires
 * Anonymous Auth to be enabled in the Firebase Console. Custom tokens
 * work regardless of which sign-in providers are enabled — they're
 * server-signed by the Admin SDK using the service account credentials.
 *
 * Each call generates a fresh random UID so guest sessions are isolated.
 * The token is valid for ~1 hour; the resulting Firebase session
 * refreshes itself thereafter until the user signs out.
 */
export async function createGuestSessionToken(
  email: string,
  displayName: string
): Promise<GuestSessionResult> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = displayName.trim()

  if (!cleanName) {
    return { success: false, error: 'Enter your name' }
  }
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return { success: false, error: 'Enter a valid email' }
  }

  const uid = `guest_${crypto.randomBytes(12).toString('hex')}`

  try {
    const token = await auth.createCustomToken(uid, {
      guest: true,
      email: cleanEmail,
      displayName: cleanName,
    })
    return { success: true, token, uid }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Could not sign you in',
    }
  }
}
