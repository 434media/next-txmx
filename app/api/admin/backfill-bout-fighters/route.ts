import { NextRequest, NextResponse } from "next/server"
import { backfillBoutFighters } from "../../../actions/backfill-bout-fighters"

/**
 * One-time backfill: link existing fight-night bouts to fighter records by name,
 * snapshotting portrait/record/nickname/etc onto each bout so cards created
 * before the fighter-link feature light up without manual re-saves in admin.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}`; refuses if unset.
 * Query:
 *   - `?dryRun=1`  preview the matches/misses without writing
 *   - `?force=1`   re-snapshot already-linked corners too (refreshes records)
 *
 *   # Preview first:
 *   curl -X POST "https://<host>/api/admin/backfill-bout-fighters?dryRun=1" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *   # Then run for real:
 *   curl -X POST "https://<host>/api/admin/backfill-bout-fighters" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured — refusing to run." },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const truthy = (v: string | null) => v === "1" || v === "true"

  try {
    const report = await backfillBoutFighters({
      dryRun: truthy(searchParams.get("dryRun")),
      force: truthy(searchParams.get("force")),
    })
    return NextResponse.json({ ok: true, ...report })
  } catch (error) {
    console.error("Bout fighter backfill failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backfill failed" },
      { status: 500 }
    )
  }
}
