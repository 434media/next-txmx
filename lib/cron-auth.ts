import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

// Shared-secret gate for cron and internal ops routes. Vercel Cron sends
// `Authorization: Bearer $CRON_SECRET`; manual callers send the same header.
//
// Fails closed: if CRON_SECRET is unset the route refuses to run (503) rather
// than becoming publicly triggerable. The comparison hashes both sides with
// sha256 so timingSafeEqual always gets equal-length buffers — no throw and no
// length leak on a mismatched header.
//
// Node runtime only (node:crypto). Returns null when authorized, otherwise the
// response to return.
export function requireCronSecret(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron-auth] CRON_SECRET is not set — refusing to run.')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 })
  }

  const header = req.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  const provided = header.startsWith(prefix) ? header.slice(prefix.length) : ''

  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(secret).digest()
  if (!provided || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
