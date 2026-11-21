/**
 * Switches for every flow on the public site that collects user data.
 *
 * As of 2026-07-30 the ONLY form that captures anything is the newsletter
 * (footer + slide-out menu → /api/newsletter). Everything else is switched off
 * here rather than deleted, so each flow can be turned back on from one place
 * without re-deriving where its UI lived.
 *
 * The explicit `: boolean` annotations are deliberate — they stop TypeScript
 * from narrowing these to literal `false` and flagging the still-present
 * enabled branches as dead code.
 */

/**
 * Fan accounts — sign-up AND sign-in (Firebase Auth). Off means:
 *  - no sign-up form on the Fight Nights hub or any event page
 *  - no sign-in entry point in the navbar or slide-out menu
 *  - Fight Nights renders read-only: cards and leaderboards are visible,
 *    picks/props/polls cannot be submitted
 * The admin portal has its own gate (app/admin/admin-auth-gate.tsx) and is
 * unaffected by this flag.
 */
export const FAN_ACCOUNTS_ENABLED: boolean =
  // Off in code. A Preview deployment may turn it on for a test with
  // NEXT_PUBLIC_FAN_ACCOUNTS_PREVIEW=true (branch-scoped in Vercel). Production
  // ignores that variable: turning fan accounts on for the live site stays a
  // code change.
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
  process.env.NEXT_PUBLIC_FAN_ACCOUNTS_PREVIEW === 'true'

/**
 * Name + email gate in front of the Rise of a Champion photo gallery.
 * Off means the gallery is open to everyone and nothing is captured.
 */
export const GALLERY_EMAIL_GATE_ENABLED: boolean = false
