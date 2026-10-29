import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { signAdminSession, verifyAdminSession } from './admin-session-token'
import { isAllowlistedAdmin, parseAdminEmails, type AdminCandidate } from './admin-allowlist'

/**
 * Server-side admin authorization for /admin, the admin server actions and
 * /api/admin/* routes.
 *
 * Sign-up on this Firebase project is public (fans create accounts), so "is
 * signed in" is never enough. An admin is a Firebase identity whose verified
 * email is on the ADMIN_EMAILS allowlist — see lib/admin-allowlist.ts.
 *
 * The browser sends its Firebase ID token to /api/admin/session, which checks
 * it with public-key verification only (no Firebase Auth admin API: this
 * project's service account may not call it), applies the allowlist, and
 * issues our own HMAC-signed session cookie (lib/admin-session-token.ts,
 * secret ADMIN_SESSION_SECRET). Every server-side check verifies that
 * cookie's signature and expiry and re-applies the allowlist, so removing an
 * email from ADMIN_EMAILS takes effect on the next request.
 */

export const ADMIN_SESSION_COOKIE = 'txmx_admin_session'

/** Session lifetime: 8 hours. Revocation is not checked, so keep it short. */
export const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

export interface AdminIdentity {
  uid: string
  email: string
}

export type AdminCheck =
  | { ok: true; admin: AdminIdentity }
  | { ok: false; status: 401 | 403; error: string }

export class AdminAuthError extends Error {
  readonly status: 401 | 403
  constructor(status: 401 | 403, message: string) {
    super(message)
    this.name = 'AdminAuthError'
    this.status = status
  }
}

/** Apply the ADMIN_EMAILS allowlist to a verified Firebase identity. */
export function adminFromVerifiedClaims(
  claims: AdminCandidate & { uid: string }
): AdminIdentity | null {
  const allowlist = parseAdminEmails(process.env.ADMIN_EMAILS)
  if (!isAllowlistedAdmin(claims, allowlist)) return null
  return { uid: claims.uid, email: claims.email!.trim().toLowerCase() }
}

/** Verify a raw session cookie value and apply the allowlist. */
export async function checkAdminSessionCookie(
  sessionCookie: string | undefined | null
): Promise<AdminCheck> {
  if (!sessionCookie) {
    return { ok: false, status: 401, error: 'Not signed in' }
  }
  // Signature and expiry (fails closed without a valid ADMIN_SESSION_SECRET).
  const payload = verifyAdminSession(sessionCookie)
  if (!payload) {
    return { ok: false, status: 401, error: 'Session expired or invalid' }
  }
  // The email was verified when the session was issued; re-apply the
  // allowlist on every request.
  const admin = adminFromVerifiedClaims({
    uid: payload.uid,
    email: payload.email,
    email_verified: true,
  })
  if (!admin) {
    return { ok: false, status: 403, error: 'Not authorized' }
  }
  return { ok: true, admin }
}

/**
 * Check the current request's admin session. Memoized per render pass so a
 * page that calls several gated actions verifies the cookie once.
 */
export const getAdminSession = cache(async (): Promise<AdminCheck> => {
  const cookieStore = await cookies()
  return checkAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
})

/**
 * Gate for admin-only server actions and server code. Throws AdminAuthError
 * (401 no/invalid session, 403 not on the allowlist); returns the admin
 * identity otherwise.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const result = await getAdminSession()
  if (!result.ok) throw new AdminAuthError(result.status, result.error)
  return result.admin
}

/**
 * Mint the signed session cookie value for an admin, or null when
 * ADMIN_SESSION_SECRET is unset or shorter than 32 bytes (fail closed).
 */
export function issueAdminSessionToken(admin: AdminIdentity): string | null {
  return signAdminSession({
    email: admin.email,
    uid: admin.uid,
    exp: Date.now() + ADMIN_SESSION_MAX_AGE_MS,
  })
}

export function adminSessionCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    // Chrome and Firefox treat http://localhost as secure, so this works in dev.
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  }
}
