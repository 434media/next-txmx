import { NextRequest, NextResponse } from 'next/server'
import { rebuildSeasonStandings } from '../../../actions/season-standings'

/**
 * One-off / maintenance backfill for the cross-event season leaderboard.
 *
 * Recomputes `seasonStandings` from every `fightNights/*` /standings doc. Safe
 * to run repeatedly — it overwrites totals from the source of truth and prunes
 * stale rows, so it doubles as a drift-repair tool.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}`. Unlike the cron
 * routes, this refuses to run when CRON_SECRET is unset — a rebuild shouldn't be
 * world-callable even on a misconfigured deploy.
 *
 *   curl -X POST https://<host>/api/admin/rebuild-season-standings \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured — refusing to run.' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await rebuildSeasonStandings()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Season standings rebuild failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rebuild failed' },
      { status: 500 }
    )
  }
}
