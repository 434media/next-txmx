/**
 * Fight-night fan-game scoring constants — the single source of truth shared by
 * the server settlement logic (app/actions/fightnight-picks.ts,
 * fightnight-props.ts) and any UI that explains scoring to fans
 * (e.g. the hub "How Points Work" strip). This module is intentionally free of
 * server-only dependencies so it can be imported from client and server alike.
 */

/** Points awarded for a correct bout (fight) pick. */
export const MATCH_WIN_POINTS = 100

/** Default points reward assigned to a newly created prop. */
export const DEFAULT_PROP_POINTS = 500

/** Payout multiplier applied when a prop flagged as an underdog is called correctly. */
export const UNDERDOG_MULTIPLIER = 1.25
