'use server'

import { firestore } from '../../lib/firebase-admin'
import type { Fighter } from '../../lib/types/fighter'

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

export interface GymRosterFighter {
  id: string
  firstName: string
  lastName: string
  nickname?: string
  slug: string
  weightClass: string
  status: string
  record: { wins: number; losses: number; draws: number; knockouts: number }
  profileImageUrl?: string
}

export interface GymWithRoster extends GymData {
  roster: GymRosterFighter[]
  fanCount: number
  rosterRecord: { wins: number; losses: number; draws: number }
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

export async function getGymsWithRosters(): Promise<GymWithRoster[]> {
  const [gymsSnap, fightersSnap, fansSnap] = await Promise.all([
    firestore.collection('gyms').orderBy('name', 'asc').get(),
    firestore.collection('fighters').get(),
    firestore.collection('users').where('gymPledge', '!=', null).get(),
  ])

  const fightersByGym = new Map<string, GymRosterFighter[]>()
  for (const doc of fightersSnap.docs) {
    const f = doc.data() as Fighter
    const gymId = f.gymId
    if (!gymId) continue
    if (!fightersByGym.has(gymId)) fightersByGym.set(gymId, [])
    fightersByGym.get(gymId)!.push({
      id: doc.id,
      firstName: f.firstName,
      lastName: f.lastName,
      nickname: f.nickname,
      slug: f.slug,
      weightClass: f.weightClass,
      status: f.status,
      record: {
        wins: f.record?.wins || 0,
        losses: f.record?.losses || 0,
        draws: f.record?.draws || 0,
        knockouts: f.record?.knockouts || 0,
      },
      profileImageUrl: f.profileImageUrl,
    })
  }

  const fanCounts = new Map<string, number>()
  for (const doc of fansSnap.docs) {
    const pledge = doc.data().gymPledge as string
    fanCounts.set(pledge, (fanCounts.get(pledge) || 0) + 1)
  }

  return gymsSnap.docs.map((doc) => {
    const data = doc.data()
    const roster = fightersByGym.get(doc.id) || []

    roster.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return b.record.wins - a.record.wins
    })

    const rosterRecord = roster.reduce(
      (acc, f) => ({
        wins: acc.wins + f.record.wins,
        losses: acc.losses + f.record.losses,
        draws: acc.draws + f.record.draws,
      }),
      { wins: 0, losses: 0, draws: 0 }
    )

    return {
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
      ...data,
      roster,
      fanCount: fanCounts.get(doc.id) || 0,
      rosterRecord,
    } as GymWithRoster
  })
}
