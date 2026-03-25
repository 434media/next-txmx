"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubscriptionConfirmation(
  email: string,
  displayName: string | null
) {
  const firstName = displayName?.split(" ")[0] || "Champ"

  await resend.emails.send({
    from: "TXMX Boxing <noreply@send.devsa.community>",
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
                    <a href="https://www.txmxboxing.com/scorecard" style="display:inline-block;background:#f59e0b;color:#000;font-size:14px;font-weight:600;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Open Scorecard
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
