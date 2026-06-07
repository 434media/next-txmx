'use server'

import { firestore } from '../../lib/firebase-admin'
import type { Fighter, FightRecord } from '../../lib/types/fighter'

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function addFighter(data: Omit<Fighter, 'id' | 'slug' | 'createdAt' | 'updatedAt'>) {
  const slug = generateSlug(data.firstName, data.lastName)
  const now = new Date().toISOString()

  // Check for duplicate slug
  const existing = await firestore
    .collection('fighters')
    .where('slug', '==', slug)
    .get()

  if (!existing.empty) {
    return { success: false, error: 'A fighter with this name already exists' }
  }

  const fighter: Omit<Fighter, 'id'> = {
    ...data,
    slug,
    koPercentage: data.record.wins > 0
      ? Math.round((data.record.knockouts / data.record.wins) * 10000) / 100
      : 0,
    bouts: data.record.wins + data.record.losses + data.record.draws,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = await firestore.collection('fighters').add(fighter)

  return { success: true, id: docRef.id, slug }
}

/**
 * Quick-create a fighter from the fight-card flow — minimal required fields
 * with sensible defaults (region TX, active, empty record). The admin can
 * fill in the rest later in the Fighters section. Reuses addFighter so the
 * slug + duplicate guard behave identically.
 */
export async function quickAddFighter(input: {
  firstName: string
  lastName: string
  sex: 'male' | 'female'
  gym?: string
  weightClass?: string
}) {
  return addFighter({
    firstName: input.firstName,
    lastName: input.lastName,
    sex: input.sex,
    region: 'TX',
    weightClass: input.weightClass || '',
    status: 'active',
    record: { wins: 0, losses: 0, draws: 0, knockouts: 0 },
    gym: input.gym || '',
  })
}

export async function updateFighter(id: string, data: Partial<Fighter>) {
  const now = new Date().toISOString()

  await firestore.collection('fighters').doc(id).update({
    ...data,
    updatedAt: now,
  })

  return { success: true }
}

export async function deleteFighter(id: string) {
  await firestore.collection('fighters').doc(id).delete()
  return { success: true }
}

export async function getFighters(): Promise<Fighter[]> {
  const snapshot = await firestore
    .collection('fighters')
    .orderBy('lastName', 'asc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Fighter[]
}

export async function getFighterBySlug(slug: string): Promise<Fighter | null> {
  const snapshot = await firestore
    .collection('fighters')
    .where('slug', '==', slug)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Fighter
}

export async function getFighterById(id: string): Promise<Fighter | null> {
  if (!id) return null
  const doc = await firestore.collection('fighters').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Fighter
}

export async function getFighterFights(fighterId: string): Promise<FightRecord[]> {
  const snapshot = await firestore
    .collection('fighters')
    .doc(fighterId)
    .collection('fights')
    .orderBy('date', 'desc')
    .get()

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as FightRecord[]
}
