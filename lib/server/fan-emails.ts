import 'server-only'

import { firestore } from '../firebase-admin'
import type { FightNightStanding } from '../../app/actions/fightnight-standings'
import type { FightNightPrize } from '../../app/actions/fightnight-prizes'

/**
 * Email-bearing reads for server-side senders only (recap and winner emails,
 * prize awarding). The public server actions — getStandings, getUserStanding,
 * getSeasonStandings, getUserSeasonStanding, getPrizes — blank the `email`
 * field, because server actions are public endpoints and those are called by
 * anonymous visitors. This module is `server-only` and not a server action, so
 * it is not reachable from the browser.
 */

export async function getStandingsWithEmails(
  fightNightId: string,
  opts: { limit?: number } = {}
): Promise<FightNightStanding[]> {
  if (!fightNightId) return []
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('standings')
    .orderBy('points', 'desc')
    .limit(opts.limit ?? 100)
    .get()
  return snap.docs.map((d) => d.data() as FightNightStanding)
}

export async function getPrizesWithEmails(fightNightId: string): Promise<FightNightPrize[]> {
  if (!fightNightId) return []
  const snap = await firestore
    .collection('fightNights')
    .doc(fightNightId)
    .collection('prizes')
    .orderBy('position', 'asc')
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FightNightPrize)
}
