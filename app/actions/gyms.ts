'use server'

import { firestore } from '../../lib/firebase-admin'

export interface GymData {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  website: string
  instagram: string
  facebook: string
  twitter: string
  tiktok: string
  youtube: string
  notes: string
  createdAt: string
  updatedAt: string
}

export async function getGyms(): Promise<GymData[]> {
  const snapshot = await firestore
    .collection('gyms')
    .orderBy('name', 'asc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    notes: '',
    updatedAt: '',
    ...doc.data(),
  })) as GymData[]
}

export async function addGym(data: Omit<GymData, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString()
  const docRef = await firestore.collection('gyms').add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return { success: true, id: docRef.id }
}

export async function updateGym(id: string, data: Partial<Omit<GymData, 'id' | 'createdAt'>>) {
  await firestore.collection('gyms').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function deleteGym(id: string) {
  await firestore.collection('gyms').doc(id).delete()
  return { success: true }
}
