import 'server-only'

import type { DecodedIdToken } from 'firebase-admin/auth'
import { auth } from './firebase-admin'

/**
 * Identity for fan-facing server actions.
 *
 * Server actions are public POST endpoints: any argument can be forged by the
 * caller. A fan action must therefore never trust a uid sent from the browser.
 * The browser sends its Firebase ID token (`user.getIdToken()`), and the uid is
 * taken from the verified token. Returns null for a missing, malformed, expired
 * or revoked token.
 */
export async function verifyFanIdToken(idToken: unknown): Promise<DecodedIdToken | null> {
  if (typeof idToken !== 'string' || idToken.length === 0) return null
  try {
    // No checkRevoked: that calls the Firebase Auth admin API, which this
    // project's service account may not use (auth/insufficient-permission).
    // Public-key verification needs no IAM role.
    return await auth.verifyIdToken(idToken)
  } catch (err) {
    console.error('[fan-auth] verifyIdToken failed:', (err as { code?: string })?.code ?? 'unknown')
    return null
  }
}

/** The verified uid behind an ID token, or null. */
export async function uidFromIdToken(idToken: unknown): Promise<string | null> {
  return (await verifyFanIdToken(idToken))?.uid ?? null
}
