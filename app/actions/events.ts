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

// Promoter collection

export interface PromoterData {
  id: string
  name: string
  company: string
  city: string
  state: string
  email: string
  phone: string
  website: string
  instagram: string
  notes: string
  eventCount: number
  createdAt: string
  updatedAt: string
}

export async function getPromoters(): Promise<PromoterData[]> {
  const snapshot = await firestore
    .collection('promoters')
    .orderBy('name', 'asc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    company: '',
    city: '',
    state: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    notes: '',
    eventCount: 0,
    updatedAt: '',
    ...doc.data(),
  })) as PromoterData[]
}

export async function upsertPromoter(name: string, data: Partial<Omit<PromoterData, 'id' | 'createdAt'>>) {
  // Check if promoter doc already exists by name
  const existing = await firestore
    .collection('promoters')
    .where('name', '==', name)
    .get()

  const now = new Date().toISOString()

  if (!existing.empty) {
    await existing.docs[0].ref.update({ ...data, updatedAt: now })
    return { success: true, id: existing.docs[0].id }
  }

  const docRef = await firestore.collection('promoters').add({
    name,
    company: '',
    city: '',
    state: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    notes: '',
    eventCount: 0,
    ...data,
    createdAt: now,
    updatedAt: now,
  })

  return { success: true, id: docRef.id }
}

export async function updatePromoter(id: string, data: Partial<Omit<PromoterData, 'id' | 'createdAt'>>) {
  await firestore.collection('promoters').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function deletePromoter(id: string) {
  await firestore.collection('promoters').doc(id).delete()
  return { success: true }
}
