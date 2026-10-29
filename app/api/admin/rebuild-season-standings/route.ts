import { NextRequest, NextResponse } from 'next/server'
import { requireCronSecret } from '../../../../lib/cron-auth'
import { rebuildSeasonStandings } from '../../../../lib/server/season-standings'

/**
 * One-off / maintenance backfill for the cross-event season leaderboard.
 *
 * Recomputes `seasonStandings` from every `fightNights/*` /standings doc. Safe
 * to run repeatedly — it overwrites totals from the source of truth and prunes
 * stale rows, so it doubles as a drift-repair tool.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` (lib/cron-auth.ts).
 * Refuses to run when CRON_SECRET is unset — a rebuild shouldn't be
 * world-callable even on a misconfigured deploy.
 *
 *   curl -X POST https://<host>/api/admin/rebuild-season-standings \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const denied = requireCronSecret(request)
  if (denied) return denied

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
