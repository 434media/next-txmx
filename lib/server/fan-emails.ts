import 'server-only'

import { firestore } from '../firebase-admin'
import type { FightNightStanding } from '../../app/actions/fightnight-standings'
import type { FightNightPrize } from '../../app/actions/fightnight-prizes'

/**
 * Fans' email addresses, for server-side code only: recap and winner emails,
 * prize awarding, and the admin-gated email lookups.
 *
 * Emails live on `users/{uid}`, which firestore.rules let only the owner read.
 * They are NOT stored on standings, season standings or prize docs, because
 * those are readable by any signed-in user (the live leaderboard reads them
 * with onSnapshot). Older docs may still carry a legacy `email` field until
 * the cleanup runs; it is used only as a fallback when the users doc has none.
 *
 * This module is `server-only` and not a server action, so it is not reachable
 * from the browser.
 */

/** uid → email from users/{uid}. Missing docs or emails map to null. */
export async function emailsForUids(uids: string[]): Promise<Map<string, string | null>> {
  const unique = [...new Set(uids.filter((u) => typeof u === 'string' && u.length > 0))]
  const out = new Map<string, string | null>()
  if (unique.length === 0) return out
  const CHUNK = 300
  for (let i = 0; i < unique.length; i += CHUNK) {
    const refs = unique.slice(i, i + CHUNK).map((uid) => firestore.collection('users').doc(uid))
    const snaps = await firestore.getAll(...refs)
    for (const snap of snaps) {
      const email = snap.exists ? (snap.get('email') as unknown) : null
      out.set(snap.id, typeof email === 'string' && email ? email : null)
    }
  }
  return out
}

async function withEmails<T extends { userId: string; email?: string | null }>(
  rows: T[]
): Promise<(T & { email: string | null })[]> {
  const emails = await emailsForUids(rows.map((r) => r.userId))
  return rows.map((r) => ({ ...r, email: emails.get(r.userId) ?? r.email ?? null }))
}

export async function getStandingsWithEmails(
  fightNightId: string,
  opts: { limit?: number } = {}
): Promise<(FightNightStanding & { email: string | null })[]> {
  if (!fightNightId) return []
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .orderBy('points', 'desc')
    .limit(opts.limit ?? 100)
    .get()
  return withEmails(snap.docs.map((d) => d.data() as FightNightStanding))
}

export async function getPrizesWithEmails(
  fightNightId: string
): Promise<(FightNightPrize & { email: string | null })[]> {
  if (!fightNightId) return []
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('prizes')
    .orderBy('position', 'asc')
    .get()
  return withEmails(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FightNightPrize))
}
