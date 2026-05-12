/**
 * Send the post-event recap email as a PREVIEW to a small set of reviewers
 * before the live blast goes out. Uses realistic sample personal stats
 * (#4 of N, mid-pack points + pick ratio) and pulls real top-3 standings
 * from the active fight night. The subject is prefixed with [PREVIEW] so
 * reviewers can distinguish from a real send.
 *
 * Does NOT touch `recapEmailSentAt` on any standing — safe to run
 * repeatedly while iterating on the template.
 *
 * Usage (from project root):
 *   node scripts/send-recap-preview.mjs
 *   PREVIEW_TO=alex@example.com,jamie@example.com node scripts/send-recap-preview.mjs
 *   FN_ID=abc123 node scripts/send-recap-preview.mjs   # specific fight night
 */

import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { Resend } from 'resend'

// ── env loader ────────────────────────────────────────────────

function loadEnv() {
  const content = readFileSync('.env.local', 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) {
      let val = match[2].trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      env[match[1]] = val
    }
  }
  return env
}

const env = loadEnv()
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})
const db = getFirestore(app, 'txmx')
const resend = new Resend(env.RESEND_API_KEY)

// Mirrors the live recap action. PREVIEW_FROM can still override for
// future domain swaps but the default now matches production.
const EMAIL_FROM =
  process.env.PREVIEW_FROM || 'Marcos Resendez <noreply@send.434media.com>'
const REPLY_TO = process.env.PREVIEW_REPLY_TO || 'build@434media.com'

// ── recipients + fight night ──────────────────────────────────

const recipients = (
  process.env.PREVIEW_TO ||
  'jesse@434media.com,marcos@434media.com'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

async function resolveFightNight() {
  if (process.env.FN_ID) {
    const snap = await db.collection('fightNights').doc(process.env.FN_ID).get()
    if (!snap.exists) throw new Error(`Fight night ${process.env.FN_ID} not found`)
    return { id: snap.id, ...snap.data() }
  }
  // Otherwise: most recent fight night by date
  const snap = await db
    .collection('fightNights')
    .orderBy('date', 'desc')
    .limit(1)
    .get()
  if (snap.empty) throw new Error('No fight nights found in the txmx database')
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

async function loadContext(fightNightId) {
  const standingsSnap = await db
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .orderBy('points', 'desc')
    .limit(50)
    .get()
  const standings = standingsSnap.docs.map((d) => d.data())
  const totalParticipants = standings.length
  const top3 = standings.slice(0, 3).map((s, i) => ({
    position: i + 1,
    displayName: s.displayName || 'Anonymous',
    points: s.points || 0,
    prizeLabel: null,
  }))
  return { totalParticipants, top3 }
}

// ── email template (inlined from app/actions/fightnight-recap.ts) ──

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderRecapEmail(d) {
  const accuracyPct =
    d.picksMade > 0 ? Math.round((d.picksWon / d.picksMade) * 100) : 0
  const venueLine = [d.venue, d.city].filter(Boolean).join(' · ')
  const dateLine = d.date
    ? new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : null

  const podiumRows = d.top3
    .map(
      (t) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;letter-spacing:1px;">#${t.position}</td>
                <td style="color:#fff;font-size:14px;font-weight:600;">${escapeHtml(t.displayName)}</td>
                <td align="right" style="color:#f59e0b;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;">${t.points.toLocaleString()} pts</td>
              </tr>
              ${
                t.prizeLabel
                  ? `<tr><td colspan="3" style="padding:4px 0 0 32px;color:rgba(245,158,11,0.7);font-size:11px;font-weight:500;">${escapeHtml(t.prizeLabel)}</td></tr>`
                  : ''
              }
            </table>
          </td>
        </tr>`
    )
    .join('')

  const prizeBlock = d.prize
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid rgba(245,158,11,0.35);background-color:rgba(245,158,11,0.06);border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 6px;color:#f59e0b;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">You won a prize</p>
            <p style="margin:0 0 10px;color:#fff;font-size:17px;font-weight:700;line-height:1.3;">${escapeHtml(d.prize.label)}</p>
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;">${escapeHtml(d.prize.claimInstructions)}</p>
          </td>
        </tr>
      </table>`
    : ''

  const previewBanner = d.isPreview
    ? `<tr>
        <td style="padding:0 0 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(245,158,11,0.35);background-color:rgba(245,158,11,0.08);border-radius:8px;">
            <tr><td style="padding:10px 14px;color:#f59e0b;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Preview · Sample personal stats</td></tr>
          </table>
        </td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          ${previewBanner}
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">TXMX Boxing${d.subtitle ? ' · ' + escapeHtml(d.subtitle) : ''}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 0 8px;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:0.3px;line-height:1.2;">
                That's a wrap, ${escapeHtml(d.firstName)}.
              </h1>
              ${
                dateLine || venueLine
                  ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.45);font-size:13px;font-weight:500;line-height:1.5;">${escapeHtml(d.eventName)}${dateLine ? ' · ' + escapeHtml(dateLine) : ''}${venueLine ? ' · ' + escapeHtml(venueLine) : ''}</p>`
                  : `<p style="margin:8px 0 0;color:rgba(255,255,255,0.45);font-size:13px;font-weight:500;line-height:1.5;">${escapeHtml(d.eventName)}</p>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your night</p>
                    <p style="margin:0 0 16px;color:#fff;font-size:28px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;">
                      #${d.position}
                      <span style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:500;margin-left:6px;">of ${d.totalPlayers}</span>
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08);">
                      <tr>
                        <td style="padding:14px 0;width:50%;">
                          <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Points</p>
                          <p style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;">${d.points.toLocaleString()}</p>
                        </td>
                        <td style="padding:14px 0;width:50%;">
                          <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Picks</p>
                          <p style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;">${d.picksWon}<span style="color:rgba(255,255,255,0.3);">/</span>${d.picksMade}<span style="color:rgba(255,255,255,0.4);font-size:12px;font-weight:500;margin-left:6px;">${accuracyPct}%</span></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${prizeBlock}
          <tr>
            <td style="padding:8px 0 0;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.4);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Top of the board</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${podiumRows}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 0 0;">
              <a href="https://www.txmxboxing.com/events/fight-night" style="display:inline-block;padding:12px 24px;background-color:#f59e0b;color:#000;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:8px;">
                See the full leaderboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 0 0;border-top:1px solid rgba(255,255,255,0.08);margin-top:32px;">
              <p style="margin:24px 0 0;color:rgba(255,255,255,0.3);font-size:11px;line-height:1.6;text-align:center;">
                Thanks for playing tonight. Levantamos los puños.<br>
                <span style="color:rgba(255,255,255,0.2);">TXMX Boxing · build@434media.com</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── main ──────────────────────────────────────────────────────

async function main() {
  if (!env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY in .env.local')
    process.exit(1)
  }
  if (recipients.length === 0) {
    console.error('No recipients — set PREVIEW_TO env var with comma-separated emails')
    process.exit(1)
  }

  const fightNight = await resolveFightNight()
  console.log(`Fight night: ${fightNight.title} (${fightNight.id})`)
  console.log(`Date: ${fightNight.date} · Venue: ${fightNight.venue}, ${fightNight.city}`)

  const { totalParticipants, top3 } = await loadContext(fightNight.id)
  console.log(`Total participants: ${totalParticipants}`)
  console.log(
    `Top 3: ${
      top3.length > 0
        ? top3.map((t) => `${t.displayName} (${t.points})`).join(', ')
        : 'none yet — using sample names'
    }`
  )

  // If no real top-3 yet, fall back to sample names so the preview shows
  // the section populated rather than empty.
  const previewTop3 =
    top3.length === 3
      ? top3
      : [
          { position: 1, displayName: 'Sam Rodriguez', points: 540, prizeLabel: 'BOXR Station prize' },
          { position: 2, displayName: 'Alex Garcia', points: 410, prizeLabel: null },
          { position: 3, displayName: 'Maria Lopez', points: 380, prizeLabel: null },
        ]
  const previewTotal = totalParticipants > 0 ? totalParticipants : 87

  let sent = 0
  let failed = 0
  for (const to of recipients) {
    const firstName = to.split('@')[0].split('.')[0]
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    try {
      const result = await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: REPLY_TO,
        to,
        subject: `[PREVIEW] Your Fight Night recap — ${fightNight.title || 'Fight Night'}`,
        html: renderRecapEmail({
          firstName: capitalized,
          eventName: fightNight.title || 'Fight Night',
          subtitle: fightNight.subtitle || null,
          date: fightNight.date || null,
          venue: fightNight.venue || null,
          city: fightNight.city || null,
          position: 4,
          totalPlayers: previewTotal,
          points: 290,
          picksWon: 4,
          picksMade: 7,
          top3: previewTop3,
          prize: null,
          isPreview: true,
        }),
      })
      // Resend SDK returns { data, error } without throwing — must check.
      if (result.error) {
        console.error(`✗ Failed to send to ${to}:`, JSON.stringify(result.error, null, 2))
        failed++
      } else if (!result.data?.id) {
        console.error(`✗ Send to ${to} returned no id and no error. Full response:`)
        console.error(JSON.stringify(result, null, 2))
        failed++
      } else {
        console.log(`✓ Sent to ${to} (id: ${result.data.id})`)
        sent++
      }
    } catch (err) {
      console.error(`✗ Threw on send to ${to}:`, err.message || err)
      failed++
    }
  }

  console.log(`\nDone — sent ${sent} · failed ${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
