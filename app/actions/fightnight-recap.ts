'use server'

import { Resend } from 'resend'
import { firestore } from '../../lib/firebase-admin'
import { getFightNight } from './fightnight'
import { getStandings, type FightNightStanding } from './fightnight-standings'
import { getPrizes } from './fightnight-prizes'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = 'TXMX Boxing <noreply@send.434media.com>'

// Resend free tier ≈ 10/sec. Throttle each send to stay well under.
const SEND_DELAY_MS = 120

interface RecapResult {
  sent: number
  skipped: number
  errors: number
  /** Optional first error message — surfaced to the admin for debugging. */
  firstError?: string
}

/**
 * Email every fight-night participant a personal recap: their final
 * standing, picks won, plus the top finishers and prize line.
 *
 * Idempotent — each standing doc gets a `recapEmailSentAt` timestamp on a
 * successful send, and subsequent calls skip those users. Safe to re-run
 * if a partial batch fails.
 */
export async function sendFightNightRecap(
  fightNightId: string,
  options?: { claimInstructions?: string }
): Promise<RecapResult> {
  const fightNight = await getFightNight(fightNightId)
  if (!fightNight) {
    return { sent: 0, skipped: 0, errors: 0, firstError: 'Fight night not found' }
  }

  const standings = await getStandings(fightNightId, { limit: 1000 })
  if (standings.length === 0) {
    return { sent: 0, skipped: 0, errors: 0 }
  }

  const prizes = await getPrizes(fightNightId)
  const prizesByUser = new Map(prizes.map((p) => [p.userId, p]))

  const top3 = standings.slice(0, 3).map((s, i) => ({
    position: i + 1,
    displayName: s.displayName || 'Anonymous',
    points: s.points || 0,
    prizeLabel: prizesByUser.get(s.userId)?.prizeLabel || null,
  }))

  const claimInstructions =
    options?.claimInstructions ||
    "Reply to this email by Sunday to claim. We'll coordinate pickup at the venue."

  let sent = 0
  let skipped = 0
  let errors = 0
  let firstError: string | undefined

  for (let i = 0; i < standings.length; i++) {
    const s = standings[i]
    const position = i + 1

    if (s.recapEmailSentAt) {
      skipped++
      continue
    }
    if (!s.email || (s.picksMade || 0) === 0) {
      skipped++
      continue
    }

    const prize = prizesByUser.get(s.userId)
    const firstName = s.displayName?.split(' ')[0] || 'Champ'

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: s.email,
        subject: `Your Fight Night recap — ${fightNight.title || 'Fight Night'}`,
        html: renderRecapEmail({
          firstName,
          eventName: fightNight.title || 'Fight Night',
          subtitle: fightNight.subtitle || null,
          date: fightNight.date || null,
          venue: fightNight.venue || null,
          city: fightNight.city || null,
          position,
          totalPlayers: standings.length,
          points: s.points || 0,
          picksWon: s.picksWon || 0,
          picksMade: s.picksMade || 0,
          top3,
          prize: prize
            ? { label: prize.prizeLabel, claimInstructions }
            : null,
        }),
      })

      await firestore
        .collection('fightNights')
        .doc(fightNightId)
        .collection('standings')
        .doc(s.userId)
        .update({ recapEmailSentAt: new Date().toISOString() })

      sent++
      // Pace sends to keep under Resend's throughput cap.
      if (i < standings.length - 1) await sleep(SEND_DELAY_MS)
    } catch (err) {
      errors++
      if (!firstError) {
        firstError = err instanceof Error ? err.message : String(err)
      }
    }
  }

  return { sent, skipped, errors, firstError }
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

// ── Email template ──────────────────────────────────────────

interface RecapEmailData {
  firstName: string
  eventName: string
  subtitle: string | null
  date: string | null
  venue: string | null
  city: string | null
  position: number
  totalPlayers: number
  points: number
  picksWon: number
  picksMade: number
  top3: { position: number; displayName: string; points: number; prizeLabel: string | null }[]
  prize: { label: string; claimInstructions: string } | null
}

function renderRecapEmail(d: RecapEmailData): string {
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
          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">TXMX Boxing${d.subtitle ? ' · ' + escapeHtml(d.subtitle) : ''}</p>
            </td>
          </tr>

          <!-- Headline -->
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

          <!-- Personal stats -->
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

          <!-- Top finishers -->
          <tr>
            <td style="padding:8px 0 0;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.4);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Top of the board</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${podiumRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:32px 0 0;">
              <a href="https://www.txmxboxing.com/events/fight-night" style="display:inline-block;padding:12px 24px;background-color:#f59e0b;color:#000;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-radius:8px;">
                See the full leaderboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:40px 0 0;border-top:1px solid rgba(255,255,255,0.08);margin-top:32px;">
              <p style="margin:24px 0 0;color:rgba(255,255,255,0.3);font-size:11px;line-height:1.6;text-align:center;">
                Thanks for playing tonight. Levantamos los puños.<br>
                <span style="color:rgba(255,255,255,0.2);">TXMX Boxing · noreply@send.434media.com</span>
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
