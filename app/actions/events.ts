'use server'

import { firestore } from '../../lib/firebase-admin'

export interface TXMXEvent {
  id: string
  eventNumber: string
  date: string
  city: string
  promoter: string
  venue: string
  address: string
  boutCount: number
  source: string
  createdAt: string
}

export interface EventBout {
  boutNumber: number
  fighter1: string
  fighter1Id: string
  fighter2: string
  fighter2Id: string
  weightClass: string
  scheduledRounds: number
  result: string
  method: string
  winnerResolution: string
  rawResult: string
  scores: string[]
  referee: string
  titleFight: boolean
}

export async function getEvents(): Promise<TXMXEvent[]> {
  const snapshot = await firestore
    .collection('events')
    .orderBy('date', 'desc')
    .get()

  const today = new Date().toISOString().split('T')[0]

  const events = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      eventNumber: data.eventNumber || '',
      date: data.date || '',
      city: data.city || '',
      promoter: data.promoter || '',
      venue: data.venue || '',
      address: data.address || '',
      boutCount: data.boutCount || 0,
      source: data.source || '',
      createdAt: data.createdAt || '',
    }
  })

  // Sort upcoming first (ascending), then past (descending)
  const upcoming = events.filter((e) => e.date >= today).reverse()
  const past = events.filter((e) => e.date < today)
  return [...upcoming, ...past]
}

export async function getEventBouts(eventNumber: string): Promise<EventBout[]> {
  if (!eventNumber) return []

  const snapshot = await firestore
    .collectionGroup('fights')
    .where('eventNumber', '==', eventNumber)
    .get()

  // Build enriched docs with fighter names from parent refs
  const enrichedDocs: {
    docId: string
    fighterId: string
    fighterName: string
    data: FirebaseFirestore.DocumentData
  }[] = []

  for (const doc of snapshot.docs) {
    const data = doc.data()
    let fighterName = 'TBA'
    let fighterId = ''

    const fighterRef = doc.ref.parent.parent
    if (fighterRef) {
      const fighterSnap = await fighterRef.get()
      if (fighterSnap.exists) {
        const fd = fighterSnap.data()
        fighterName = `${fd?.firstName || ''} ${fd?.lastName || ''}`.trim() || 'TBA'
        fighterId = fighterSnap.id
      }
    }

    enrichedDocs.push({ docId: doc.id, fighterId, fighterName, data })
  }

  // Pair fight docs into bouts
  // Strategy: if boutNumber exists, group by it; otherwise pair by fighter↔opponent matching
  const hasBoutNumbers = enrichedDocs.some(d => d.data.boutNumber != null)

  const bouts: EventBout[] = []

  if (hasBoutNumbers) {
    // Group by boutNumber
    const boutMap = new Map<number, typeof enrichedDocs>()
    for (const ed of enrichedDocs) {
      const bn = ed.data.boutNumber as number
      if (!boutMap.has(bn)) boutMap.set(bn, [])
      boutMap.get(bn)!.push(ed)
    }
    for (const [boutNum, docs] of boutMap) {
      const d1 = docs[0]
      const d2 = docs[1]
      bouts.push({
        boutNumber: boutNum,
        fighter1: d1.fighterName,
        fighter1Id: d1.fighterId,
        fighter2: d2 ? d2.fighterName : (d1.data.opponent || 'TBA'),
        fighter2Id: d2 ? d2.fighterId : (d1.data.opponentId || ''),
        weightClass: d1.data.weightClass || '',
        scheduledRounds: d1.data.scheduledRounds || 0,
        result: d1.data.result || '',
        method: d1.data.method || '',
        winnerResolution: d1.data.winnerResolution || '',
        rawResult: d1.data.rawResult || '',
        scores: d1.data.scores || [],
        referee: d1.data.referee || '',
        titleFight: d1.data.titleFight || false,
      })
    }
  } else {
    // No boutNumber — pair by matching fighter name to opponent field
    const paired = new Set<string>()
    for (const ed of enrichedDocs) {
      if (paired.has(ed.docId)) continue
      paired.add(ed.docId)

      // Find the matching doc: opponent's fight doc where that fighter's name matches our opponent
      const opponentName = (ed.data.opponent || '').toUpperCase().trim()
      const match = enrichedDocs.find(
        other => !paired.has(other.docId) && other.fighterName.toUpperCase().trim() === opponentName
      )
      if (match) paired.add(match.docId)

      bouts.push({
        boutNumber: bouts.length + 1,
        fighter1: ed.fighterName,
        fighter1Id: ed.fighterId,
        fighter2: match ? match.fighterName : (ed.data.opponent || 'TBA'),
        fighter2Id: match ? match.fighterId : (ed.data.opponentId || ''),
        weightClass: ed.data.weightClass || '',
        scheduledRounds: ed.data.scheduledRounds || 0,
        result: ed.data.result || '',
        method: ed.data.method || '',
        winnerResolution: ed.data.winnerResolution || '',
        rawResult: ed.data.rawResult || '',
        scores: ed.data.scores || [],
        referee: ed.data.referee || '',
        titleFight: ed.data.titleFight || false,
      })
    }
  }

  return bouts.sort((a, b) => a.boutNumber - b.boutNumber)
}

export async function getEventById(eventId: string): Promise<TXMXEvent | null> {
  if (!eventId) return null
  const doc = await firestore.collection('events').doc(eventId).get()
  if (!doc.exists) return null
  const data = doc.data()!
  return {
    id: doc.id,
    eventNumber: data.eventNumber || '',
    date: data.date || '',
    city: data.city || '',
    promoter: data.promoter || '',
    venue: data.venue || '',
    address: data.address || '',
    boutCount: data.boutCount || 0,
    source: data.source || '',
    createdAt: data.createdAt || '',
  }
}

export async function getUpcomingEvents(limit = 10): Promise<TXMXEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const snapshot = await firestore
    .collection('events')
    .where('date', '>=', today)
    .orderBy('date', 'asc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      eventNumber: data.eventNumber || '',
      date: data.date || '',
      city: data.city || '',
      promoter: data.promoter || '',
      venue: data.venue || '',
      address: data.address || '',
      boutCount: data.boutCount || 0,
      source: data.source || '',
      createdAt: data.createdAt || '',
    }
  })
}

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

export async function updateEvent(id: string, data: Partial<Omit<TXMXEvent, 'id' | 'createdAt'>>) {
  await firestore.collection('events').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
  return { success: true }
}

export async function addEvent(data: Omit<TXMXEvent, 'id' | 'createdAt' | 'source'>): Promise<{ success: true; event: TXMXEvent }> {
  const now = new Date().toISOString()
  const docRef = await firestore.collection('events').add({
    ...data,
    source: 'ADMIN',
    createdAt: now,
  })
  return {
    success: true,
    event: { ...data, id: docRef.id, source: 'ADMIN', createdAt: now },
  }
}

export async function deleteEvent(id: string) {
  await firestore.collection('events').doc(id).delete()
  return { success: true }
}

// Bout CRUD — each bout has two fight docs (one per fighter)

export async function updateBout(
  fighter1Id: string,
  fighter2Id: string,
  docId: string,
  data: {
    weightClass?: string
    scheduledRounds?: number
    method?: string
    referee?: string
    result?: string
    winnerResolution?: string
    scores?: string[]
    titleFight?: boolean
    boutNumber?: number
  }
) {
  // Shared fields go to both docs
  const shared: Record<string, unknown> = {}
  if (data.weightClass !== undefined) shared.weightClass = data.weightClass
  if (data.scheduledRounds !== undefined) shared.scheduledRounds = data.scheduledRounds
  if (data.method !== undefined) shared.method = data.method
  if (data.referee !== undefined) shared.referee = data.referee
  if (data.winnerResolution !== undefined) shared.winnerResolution = data.winnerResolution
  if (data.scores !== undefined) shared.scores = data.scores
  if (data.titleFight !== undefined) shared.titleFight = data.titleFight
  if (data.boutNumber !== undefined) shared.boutNumber = data.boutNumber

  // Result is perspective-dependent
  const f1Doc = firestore.collection('fighters').doc(fighter1Id).collection('fights').doc(docId)
  const f2Doc = firestore.collection('fighters').doc(fighter2Id).collection('fights').doc(docId)

  const f1Update = { ...shared }
  const f2Update = { ...shared }

  if (data.result !== undefined) {
    // result is from fighter1's perspective
    f1Update.result = data.result
    if (data.result === 'W') f2Update.result = 'L'
    else if (data.result === 'L') f2Update.result = 'W'
    else f2Update.result = data.result // D, NC
  }

  const batch = firestore.batch()
  const f1Snap = await f1Doc.get()
  if (f1Snap.exists) batch.update(f1Doc, f1Update)
  const f2Snap = await f2Doc.get()
  if (f2Snap.exists) batch.update(f2Doc, f2Update)
  await batch.commit()

  return { success: true }
}

export async function deleteBout(
  fighter1Id: string,
  fighter2Id: string,
  docId: string
) {
  const batch = firestore.batch()
  batch.delete(firestore.collection('fighters').doc(fighter1Id).collection('fights').doc(docId))
  batch.delete(firestore.collection('fighters').doc(fighter2Id).collection('fights').doc(docId))
  await batch.commit()
  return { success: true }
}

export async function addBout(
  eventNumber: string,
  eventId: string,
  eventDate: string,
  fighter1Id: string,
  fighter1Name: string,
  fighter2Id: string,
  fighter2Name: string,
  boutNumber: number,
  data: {
    weightClass?: string
    scheduledRounds?: number
    method?: string
    referee?: string
    result?: string
    winnerResolution?: string
    scores?: string[]
    titleFight?: boolean
  }
) {
  const boutKey = `${eventNumber}-${String(boutNumber).padStart(2, '0')}`
  const now = new Date().toISOString()

  const sharedFields = {
    boutKey,
    boutNumber,
    eventNumber,
    eventId,
    date: eventDate,
    method: data.method || '',
    weightClass: data.weightClass || '',
    scheduledRounds: data.scheduledRounds || 0,
    referee: data.referee || '',
    winnerResolution: data.winnerResolution || '',
    scores: data.scores || [],
    titleFight: data.titleFight || false,
    source: 'ADMIN',
    sourceImportedAt: now,
  }

  let f1Result = data.result || ''
  let f2Result = data.result || ''
  if (data.result === 'W') { f1Result = 'W'; f2Result = 'L' }
  else if (data.result === 'L') { f1Result = 'L'; f2Result = 'W' }

  const batch = firestore.batch()

  batch.set(
    firestore.collection('fighters').doc(fighter1Id).collection('fights').doc(boutKey),
    { ...sharedFields, opponent: fighter2Name, opponentId: fighter2Id, result: f1Result }
  )

  batch.set(
    firestore.collection('fighters').doc(fighter2Id).collection('fights').doc(boutKey),
    { ...sharedFields, opponent: fighter1Name, opponentId: fighter1Id, result: f2Result }
  )

  await batch.commit()
  return { success: true, boutKey }
}

// Return enriched bouts with doc IDs for admin editing
export interface AdminEventBout extends EventBout {
  docId: string // fight doc ID for updates
}

export async function getAdminEventBouts(eventNumber: string): Promise<AdminEventBout[]> {
  if (!eventNumber) return []

  const snapshot = await firestore
    .collectionGroup('fights')
    .where('eventNumber', '==', eventNumber)
    .get()

  const enrichedDocs: {
    docId: string
    fighterId: string
    fighterName: string
    data: FirebaseFirestore.DocumentData
  }[] = []

  for (const doc of snapshot.docs) {
    const data = doc.data()
    let fighterName = 'TBA'
    let fighterId = ''

    const fighterRef = doc.ref.parent.parent
    if (fighterRef) {
      const fighterSnap = await fighterRef.get()
      if (fighterSnap.exists) {
        const fd = fighterSnap.data()
        fighterName = `${fd?.firstName || ''} ${fd?.lastName || ''}`.trim() || 'TBA'
        fighterId = fighterSnap.id
      }
    }

    enrichedDocs.push({ docId: doc.id, fighterId, fighterName, data })
  }

  const hasBoutNumbers = enrichedDocs.some(d => d.data.boutNumber != null)
  const bouts: AdminEventBout[] = []

  if (hasBoutNumbers) {
    const boutMap = new Map<number, typeof enrichedDocs>()
    for (const ed of enrichedDocs) {
      const bn = ed.data.boutNumber as number
      if (!boutMap.has(bn)) boutMap.set(bn, [])
      boutMap.get(bn)!.push(ed)
    }
    for (const [boutNum, docs] of boutMap) {
      const d1 = docs[0]
      const d2 = docs[1]
      bouts.push({
        docId: d1.docId,
        boutNumber: boutNum,
        fighter1: d1.fighterName,
        fighter1Id: d1.fighterId,
        fighter2: d2 ? d2.fighterName : (d1.data.opponent || 'TBA'),
        fighter2Id: d2 ? d2.fighterId : (d1.data.opponentId || ''),
        weightClass: d1.data.weightClass || '',
        scheduledRounds: d1.data.scheduledRounds || 0,
        result: d1.data.result || '',
        method: d1.data.method || '',
        winnerResolution: d1.data.winnerResolution || '',
        rawResult: d1.data.rawResult || '',
        scores: d1.data.scores || [],
        referee: d1.data.referee || '',
        titleFight: d1.data.titleFight || false,
      })
    }
  } else {
    const paired = new Set<string>()
    for (const ed of enrichedDocs) {
      if (paired.has(ed.docId)) continue
      paired.add(ed.docId)

      const opponentName = (ed.data.opponent || '').toUpperCase().trim()
      const match = enrichedDocs.find(
        other => !paired.has(other.docId) && other.fighterName.toUpperCase().trim() === opponentName
      )
      if (match) paired.add(match.docId)

      bouts.push({
        docId: ed.docId,
        boutNumber: bouts.length + 1,
        fighter1: ed.fighterName,
        fighter1Id: ed.fighterId,
        fighter2: match ? match.fighterName : (ed.data.opponent || 'TBA'),
        fighter2Id: match ? match.fighterId : (ed.data.opponentId || ''),
        weightClass: ed.data.weightClass || '',
        scheduledRounds: ed.data.scheduledRounds || 0,
        result: ed.data.result || '',
        method: ed.data.method || '',
        winnerResolution: ed.data.winnerResolution || '',
        rawResult: ed.data.rawResult || '',
        scores: ed.data.scores || [],
        referee: ed.data.referee || '',
        titleFight: ed.data.titleFight || false,
      })
    }
  }

  return bouts.sort((a, b) => a.boutNumber - b.boutNumber)
}
