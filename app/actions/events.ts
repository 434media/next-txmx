'use server'

import { firestore } from '../../lib/firebase-admin'

export interface EventPromoter {
  name: string
  eventCount: number
}

export async function getEventPromoters(): Promise<EventPromoter[]> {
  const snapshot = await firestore
    .collection('events')
    .get()

  const counts = new Map<string, number>()
  for (const doc of snapshot.docs) {
    const promoter = doc.data().promoter as string | undefined
    if (promoter) {
      const key = promoter.trim()
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([name, eventCount]) => ({ name, eventCount }))
    .sort((a, b) => b.eventCount - a.eventCount)
}
