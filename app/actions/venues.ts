'use server'

import { firestore } from '../../lib/firebase-admin'

export interface VenueData {
  id: string
  name: string
  address: string
  city: string
  state: string
  eventCount: number
  capacity: string
  type: string
  phone: string
  website: string
  instagram: string
  notes: string
  createdAt: string
  updatedAt: string
}

export async function getVenues(): Promise<VenueData[]> {
  const snapshot = await firestore
    .collection('venues')
    .orderBy('name', 'asc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    capacity: '',
    type: '',
    phone: '',
    website: '',
    instagram: '',
    notes: '',
    updatedAt: '',
    ...doc.data(),
  })) as VenueData[]
}

export async function updateVenue(id: string, data: Partial<Omit<VenueData, 'id' | 'createdAt'>>) {
  await firestore.collection('venues').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function deleteVenue(id: string) {
  await firestore.collection('venues').doc(id).delete()
  return { success: true }
}
