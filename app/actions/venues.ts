'use server'

import { firestore } from '../../lib/firebase-admin'

export interface VenueData {
  id: string
  name: string
  address: string
  city: string
  state: string
  eventCount: number
  createdAt: string
}

export async function getVenues(): Promise<VenueData[]> {
  const snapshot = await firestore
    .collection('venues')
    .orderBy('name', 'asc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as VenueData[]
}
