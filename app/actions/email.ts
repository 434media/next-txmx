"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = "Marcos Resendez <noreply@send.434media.com>"
const REPLY_TO = "build@434media.com"

export async function sendSubscriptionConfirmation(
  email: string,
  displayName: string | null
) {
  const firstName = displayName?.split(" ")[0] || "Champ"

  await resend.emails.send({
    from: EMAIL_FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: "Welcome to the Black Card — TXMX Boxing",
    html: `
<!DOCTYPE html>
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
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">TXMX BOXING</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 0;">
              <h1 style="margin:0 0 16px;color:#fff;font-size:28px;font-weight:700;letter-spacing:0.5px;line-height:1.2;">
                Welcome to the Black Card, ${firstName}.
              </h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:15px;line-height:1.7;">
                Your subscription is active. You now have full access to the TXMX Scorecard economy — Prop Picks, Leaderboard, Rewards Store, and more.
              </p>

              <!-- What's Unlocked -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;border:1px solid rgba(245,158,11,0.2);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;background:rgba(245,158,11,0.05);border-bottom:1px solid rgba(245,158,11,0.1);">
                    <p style="margin:0;color:#f59e0b;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">WHAT&rsquo;S UNLOCKED</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Prop Picks &mdash; predict bout outcomes for Skill Points</p>
                    <p style="margin:0 0 12px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Leaderboard &mdash; compete for rank and status-gated rewards</p>
                    <p style="margin:0 0 12px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;The Pledge &mdash; choose your Gym Franchise</p>
                    <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Rewards Store &mdash; spend TX-Credits on real merch</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="https://www.txmxboxing.com/leaderboard" style="display:inline-block;background:#f59e0b;color:#000;font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      View Leaderboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:12px;">
                $14.99/mo &middot; Cancel anytime from your account
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">
                &copy; TXMX Boxing &middot; txmxboxing.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

// ── Event Night Templates ────────────────────────────────

export interface EventEmailContext {
  eventId: string
  eventName: string
  venue: string
  city: string
  date: string
  promoter: string
  /** URL path segment for the public event page. Use "fight-nights" (the live
   * slug-based pages); "events" is legacy and 301-redirects. */
  urlPath?: "events" | "events/fight-night" | "fight-nights"
}

/**
 * Sent on sign-up during an event window. Frames the user's account as their
 * pass to play the live fight card — not a generic welcome.
 */
export async function sendEventWelcomeEmail(
  email: string,
  displayName: string | null,
  event: EventEmailContext
) {
  const firstName = displayName?.split(" ")[0] || "Champ"
  const eventUrl = `https://www.txmxboxing.com/${event.urlPath || "events"}/${event.eventId}`

  await resend.emails.send({
    from: EMAIL_FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: `You're in — ${event.eventName} starts soon`,
    html: `
<!DOCTYPE html>
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
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;color:rgba(255,255,255,0.3);font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">TXMX BOXING &middot; FIGHT NIGHT</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 0;">
              <h1 style="margin:0 0 16px;color:#fff;font-size:28px;font-weight:700;letter-spacing:0.5px;line-height:1.2;">
                You're in for fight night, ${firstName}.
              </h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:15px;line-height:1.7;">
                Tonight's card runs at <strong style="color:#fff;">${event.venue}</strong> in ${event.city}. Pick winners, stack Skill Points, and climb the event leaderboard live.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;border:1px solid rgba(245,158,11,0.2);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;background:rgba(245,158,11,0.05);border-bottom:1px solid rgba(245,158,11,0.1);">
                    <p style="margin:0 0 4px;color:#f59e0b;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">${event.promoter}</p>
                    <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">${event.eventName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Pick the winner of every bout (free tonight)</p>
                    <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Vote on live polls during the night</p>
                    <p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Watch the leaderboard move after each bout</p>
                    <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">&#9654; &nbsp;Top finisher wins a prize from the venue</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="${eventUrl}" style="display:inline-block;background:#f59e0b;color:#000;font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Open Fight Card
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:12px;">
                ${event.date} &middot; ${event.venue} &middot; ${event.city}
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">
                &copy; TXMX Boxing &middot; txmxboxing.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

/**
 * Sent after the event ends to the top finisher(s) with prize-claim instructions.
 */
export async function sendEventWinnerEmail(
  email: string,
  displayName: string | null,
  event: EventEmailContext,
  details: {
    position: number
    spEarned: number
    prizeLabel: string
    claimInstructions: string
  }
) {
  const firstName = displayName?.split(" ")[0] || "Champ"
  const eventUrl = `https://www.txmxboxing.com/${event.urlPath || "events"}/${event.eventId}`
  const positionLabel =
    details.position === 1
      ? "1st place"
      : details.position === 2
        ? "2nd place"
        : details.position === 3
          ? "3rd place"
          : `#${details.position}`

  await resend.emails.send({
    from: EMAIL_FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: `You finished ${positionLabel} at ${event.eventName} — claim your prize`,
    html: `
<!DOCTYPE html>
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
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.1);">
              <p style="margin:0;color:#f59e0b;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">TXMX BOXING &middot; WINNER</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 0 24px;">
              <p style="margin:0 0 8px;color:#f59e0b;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${positionLabel}</p>
              <h1 style="margin:0 0 16px;color:#fff;font-size:32px;font-weight:700;letter-spacing:0.5px;line-height:1.15;">
                Nice work, ${firstName}.
              </h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.55);font-size:15px;line-height:1.7;">
                You earned <strong style="color:#fff;">${details.spEarned.toLocaleString()} SP</strong> at ${event.eventName} and finished ${positionLabel} on the event leaderboard.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid rgba(245,158,11,0.3);border-radius:12px;overflow:hidden;background:rgba(245,158,11,0.05);">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 6px;color:#f59e0b;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Your Prize</p>
                    <p style="margin:0 0 12px;color:#fff;font-size:20px;font-weight:700;">${details.prizeLabel}</p>
                    <p style="margin:0;color:rgba(255,255,255,0.65);font-size:14px;line-height:1.6;">
                      ${details.claimInstructions}
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="${eventUrl}" style="display:inline-block;background:#f59e0b;color:#000;font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      View Final Standings
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.2);font-size:12px;">
                ${event.date} &middot; ${event.venue} &middot; ${event.city}
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">
                &copy; TXMX Boxing &middot; txmxboxing.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  })
}

/**
 * Bulk-send winner emails for the top N finishers of an event.
 * The caller supplies email + position + prize details (looked up from the event
 * leaderboard + users collection). Idempotency is the caller's responsibility —
 * don't double-tap the admin button.
 */
export async function sendEventWinnerEmailsBatch(
  event: EventEmailContext,
  winners: Array<{
    userId: string
    displayName: string | null
    email: string | null
    position: number
    spEarned: number
    prizeLabel: string
    claimInstructions: string
  }>
): Promise<{
  sent: number
  skipped: number
  errors: number
  results: Array<{
    displayName: string | null
    email: string | null
    status: 'sent' | 'skipped' | 'error'
  }>
}> {
  let sent = 0
  let skipped = 0
  let errors = 0
  const results: Array<{
    displayName: string | null
    email: string | null
    status: 'sent' | 'skipped' | 'error'
  }> = []

  for (const w of winners) {
    if (!w.email) {
      skipped++
      results.push({ displayName: w.displayName, email: null, status: 'skipped' })
      continue
    }
    try {
      await sendEventWinnerEmail(w.email, w.displayName, event, {
        position: w.position,
        spEarned: w.spEarned,
        prizeLabel: w.prizeLabel,
        claimInstructions: w.claimInstructions,
      })
      sent++
      results.push({ displayName: w.displayName, email: w.email, status: 'sent' })
    } catch {
      errors++
      results.push({ displayName: w.displayName, email: w.email, status: 'error' })
    }
  }

  return { sent, skipped, errors, results }
}
