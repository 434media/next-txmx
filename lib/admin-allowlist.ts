/**
 * Pure admin-allowlist decision — no Firebase, no Next.js, no env access —
 * so it can be reasoned about (and exercised) in isolation. The server-side
 * wiring that feeds it a verified Firebase identity lives in
 * `lib/admin-auth.ts`.
 *
 * Rule: an identity is an admin only when its email, lowercased, is listed in
 * `ADMIN_EMAILS` (comma-separated) AND Firebase reports that email as
 * verified. An unset or empty list means nobody is an admin (deny by default).
 */

export interface AdminCandidate {
  email?: string | null
  email_verified?: boolean | null
}

/** Parse the comma-separated ADMIN_EMAILS value into a lowercased set. */
export function parseAdminEmails(raw: string | undefined | null): Set<string> {
  const out = new Set<string>()
  if (!raw) return out
  for (const part of raw.split(',')) {
    const email = part.trim().toLowerCase()
    if (email) out.add(email)
  }
  return out
}

/** True only for a verified email that appears on the allowlist. */
export function isAllowlistedAdmin(
  candidate: AdminCandidate,
  allowlist: ReadonlySet<string>
): boolean {
  if (allowlist.size === 0) return false
  if (candidate.email_verified !== true) return false
  const email = candidate.email?.trim().toLowerCase()
  if (!email) return false
  return allowlist.has(email)
}
