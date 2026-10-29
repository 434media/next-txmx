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
    return await auth.verifyIdToken(idToken)
  } catch {
    return null
  }
}

/** The verified uid behind an ID token, or null. */
export async function uidFromIdToken(idToken: unknown): Promise<string | null> {
  return (await verifyFanIdToken(idToken))?.uid ?? null
}
