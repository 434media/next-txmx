import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Our own signed admin session token: base64url(JSON payload) + "." +
 * base64url(HMAC-SHA256(payload, ADMIN_SESSION_SECRET)).
 *
 * Why not Firebase session cookies: TXMX's service account cannot call the
 * Firebase Auth admin APIs (createSessionCookie, verifySessionCookie with
 * revocation, verifyIdToken with checkRevoked all fail with
 * auth/insufficient-permission), and the fix is not to grant it more IAM.
 * Plain ID-token verification needs only Google's public keys, so the
 * session is minted here after that check.
 *
 * Fails closed: an unset secret, or one shorter than 32 bytes, means no token
 * can be issued or accepted.
 */

export interface AdminSessionPayload {
  email: string
  uid: string
  /** Expiry, milliseconds since the epoch. */
  exp: number
}

export const MIN_SECRET_BYTES = 32

export function adminSessionSecret(
  raw: string | undefined = process.env.ADMIN_SESSION_SECRET
): Buffer | null {
  if (!raw) return null
  const buf = Buffer.from(raw, 'utf8')
  return buf.length >= MIN_SECRET_BYTES ? buf : null
}

function sign(data: string, secret: Buffer): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

/** Returns the token, or null if the secret is missing or too short. */
export function signAdminSession(
  payload: AdminSessionPayload,
  secret: Buffer | null = adminSessionSecret()
): string | null {
  if (!secret) return null
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${data}.${sign(data, secret)}`
}

/**
 * Returns the payload only when the signature is valid and the token has not
 * expired. Any malformed input, bad signature, expired token or missing
 * secret returns null.
 */
export function verifyAdminSession(
  token: string | undefined | null,
  now: number = Date.now(),
  secret: Buffer | null = adminSessionSecret()
): AdminSessionPayload | null {
  if (!secret || !token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, mac] = parts
  const expected = Buffer.from(sign(data, secret), 'utf8')
  const given = Buffer.from(mac, 'utf8')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  let payload: unknown
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  const p = payload as Partial<AdminSessionPayload>
  if (
    typeof p?.email !== 'string' ||
    typeof p.uid !== 'string' ||
    typeof p.exp !== 'number' ||
    !Number.isFinite(p.exp)
  ) {
    return null
  }
  if (p.exp <= now) return null
  return { email: p.email, uid: p.uid, exp: p.exp }
}
