/**
 * TXMX's in-app analytics: GA4 custom events, sent through the site's
 * existing gtag.js tag (G-R7VB7PGM2J, app/client-layout.tsx) to the TXMX GA4
 * property. Not Firebase Analytics. Approved by the founder on 2026-11-21.
 *
 * Every event the site sends is named in ANALYTICS_EVENTS below, so the full
 * list lives in one place. `sign_up`, `login`, `begin_checkout` and `purchase`
 * are GA4 recommended events, which GA4's built-in reports understand
 * (https://developers.google.com/analytics/devguides/collection/ga4/reference/events).
 * `pick_made`, `poll_vote` and `prop_pick` are TXMX's own.
 *
 * No personal data: parameters are limited to the keys in EventParams. They
 * are ids of public game objects, a sign-in method, or a price. Never a uid,
 * an email, a name or any text a fan typed. GA4's terms forbid personal data
 * in events too.
 */

export const ANALYTICS_EVENTS = {
  /** A fan account was created (email/password, or a first Google sign-in). */
  sign_up: 'sign_up',
  /** An existing fan signed in. */
  login: 'login',
  /** A fight pick was placed or changed. */
  pick_made: 'pick_made',
  /** A poll vote was cast. */
  poll_vote: 'poll_vote',
  /** A prop pick was placed. */
  prop_pick: 'prop_pick',
  /** The fan submitted the Black Card checkout form. */
  begin_checkout: 'begin_checkout',
  /** The Black Card payment was confirmed. */
  purchase: 'purchase',
} as const

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS

/** The only parameters an event may carry. None identifies a person. */
export interface EventParams {
  method?: 'password' | 'google'
  fight_night_id?: string
  bout_number?: number
  poll_id?: string
  prop_id?: string
  item_id?: string
  value?: number
  currency?: 'USD'
}

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void

/** Send one GA4 event. A no-op on the server, and when gtag.js is blocked or not loaded. */
export function track(event: AnalyticsEvent, params: EventParams = {}): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', ANALYTICS_EVENTS[event], { ...params })
  } catch {
    // Analytics must never break a fan action.
  }
}
