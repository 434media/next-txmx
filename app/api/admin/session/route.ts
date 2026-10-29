import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '../../../../lib/firebase-admin'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_MS,
  adminFromVerifiedClaims,
  adminSessionCookieOptions,
  checkAdminSessionCookie,
} from '../../../../lib/admin-auth'

export const dynamic = 'force-dynamic'

async function readIdToken(request: NextRequest): Promise<string | null> {
  const header = request.headers.get('authorization')
  if (header?.toLowerCase().startsWith('bearer ')) {
    const token = header.slice(7).trim()
    if (token) return token
  }
  try {
    const body = (await request.json()) as { idToken?: unknown }
    if (typeof body?.idToken === 'string' && body.idToken) return body.idToken
  } catch {
    // No JSON body
  }
  return null
}

/**
 * Exchange a Firebase ID token for an httpOnly admin session cookie.
 * 401 — missing or invalid token. 403 — valid Firebase user who is not an
 * admin (not on ADMIN_EMAILS, or email not verified). 200 — cookie set.
 */
export async function POST(request: NextRequest) {
  const idToken = await readIdToken(request)
  if (!idToken) {
    return NextResponse.json({ error: 'Missing ID token' }, { status: 401 })
  }

  let claims
  try {
    claims = await auth.verifyIdToken(idToken, true)
  } catch (err) {
    console.error('[POST /api/admin/session] verifyIdToken failed:', (err as { code?: string })?.code ?? 'unknown')
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const admin = adminFromVerifiedClaims(claims)
  if (!admin) {
    // Drop any stale admin cookie so a previous admin's session can't linger
    // in this browser under a different signed-in user.
    cookieStore.delete(ADMIN_SESSION_COOKIE)
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  let sessionCookie: string
  try {
    sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE_MS,
    })
  } catch (err) {
    console.error('[POST /api/admin/session] createSessionCookie failed:', (err as { code?: string })?.code ?? 'unknown')
    return NextResponse.json({ error: 'Could not create session' }, { status: 401 })
  }

  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    sessionCookie,
    adminSessionCookieOptions(ADMIN_SESSION_MAX_AGE_MS)
  )
  return NextResponse.json({ ok: true, email: admin.email })
}

/** Report whether the current admin session cookie is valid. */
export async function GET(request: NextRequest) {
  const result = await checkAdminSessionCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  )
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ ok: true, email: result.admin.email })
}

/** Sign out: clear the admin session cookie. */
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
