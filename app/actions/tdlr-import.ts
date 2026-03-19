'use server'

import { firestore } from '../../lib/firebase-admin'

interface TDLRFighter {
  name: string
  city: string
  state: string
  boxerId: string
  weight: number
}

interface TDLRBout {
  boutNumber: number
  referee: string
  fighter1: TDLRFighter
  fighter2: TDLRFighter
  rounds: number
  result: string
  method: string
  scores: string[]
  weightClass: string | null
  titleFight: string | null
}

interface TDLREvent {
  date: string
  eventNumber: string
  city: string
  promoter: string
  venue: string
  address: string
  bouts: TDLRBout[]
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  const lastName = parts.pop()!
  return { firstName: parts.join(' '), lastName }
}

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function determineRegion(state: string): 'TX' | 'MX' | 'OTHER' {
  const s = state.toUpperCase().trim()
  if (s === 'TX') return 'TX'
  // Mexican states
  const mxStates = ['MX', 'MEX', 'CHIH', 'NL', 'TAMPS', 'COAH', 'SON', 'BCN', 'BCS', 'DGO', 'GTO', 'JAL', 'SIN', 'SLP', 'ZAC']
  if (mxStates.includes(s)) return 'MX'
  // Not TX or MX — tag as other
  return 'OTHER'
}

function determineWinner(
  result: string,
  fighter1: TDLRFighter,
  fighter2: TDLRFighter
): { winnerId: 1 | 2 | 0 } {
  const winnerName = result.split(' by ')[0]?.trim()
  if (!winnerName) return { winnerId: 0 }

  const f1Last = fighter1.name.split(/\s+/).pop()?.toLowerCase()
  const f2Last = fighter2.name.split(/\s+/).pop()?.toLowerCase()

  if (winnerName.toLowerCase() === f1Last) return { winnerId: 1 }
  if (winnerName.toLowerCase() === f2Last) return { winnerId: 2 }
  return { winnerId: 0 }
}

function inferWeightClass(weight: number): string {
  if (weight <= 105) return 'Minimumweight'
  if (weight <= 108) return 'Light Flyweight'
  if (weight <= 112) return 'Flyweight'
  if (weight <= 115) return 'Super Flyweight'
  if (weight <= 118) return 'Bantamweight'
  if (weight <= 122) return 'Super Bantamweight'
  if (weight <= 126) return 'Featherweight'
  if (weight <= 130) return 'Super Featherweight'
  if (weight <= 135) return 'Lightweight'
  if (weight <= 140) return 'Super Lightweight'
  if (weight <= 147) return 'Welterweight'
  if (weight <= 154) return 'Super Welterweight'
  if (weight <= 160) return 'Middleweight'
  if (weight <= 168) return 'Super Middleweight'
  if (weight <= 175) return 'Light Heavyweight'
  if (weight <= 200) return 'Cruiserweight'
  if (weight <= 224) return 'Bridgerweight'
  return 'Heavyweight'
}

export async function importTDLREvent(event: TDLREvent) {
  const now = new Date().toISOString()
  const results: {
    eventId: string
    fightersCreated: number
    fightersUpdated: number
    boutsRecorded: number
    errors: string[]
  } = {
    eventId: '',
    fightersCreated: 0,
    fightersUpdated: 0,
    boutsRecorded: 0,
    errors: [],
  }

  // 1. Check if event already imported
  const existingEvent = await firestore
    .collection('events')
    .where('eventNumber', '==', event.eventNumber)
    .get()

  if (!existingEvent.empty) {
    return {
      success: false,
      error: `Event #${event.eventNumber} has already been imported`,
      results,
    }
  }

  // 2. Save the event
  const eventDoc = await firestore.collection('events').add({
    eventNumber: event.eventNumber,
    date: event.date,
    city: event.city,
    promoter: event.promoter,
    venue: event.venue,
    address: event.address,
    boutCount: event.bouts.length,
    source: 'TDLR',
    createdAt: now,
  })
  results.eventId = eventDoc.id

  // 3. Save or update venue
  const existingVenue = await firestore
    .collection('venues')
    .where('name', '==', event.venue)
    .get()

  if (existingVenue.empty) {
    await firestore.collection('venues').add({
      name: event.venue,
      address: event.address,
      city: event.city,
      state: 'TX',
      eventCount: 1,
      createdAt: now,
    })
  } else {
    const venueDoc = existingVenue.docs[0]
    await venueDoc.ref.update({
      eventCount: (venueDoc.data().eventCount || 0) + 1,
    })
  }

  // 4. Process each bout
  for (const bout of event.bouts) {
    try {
      const { winnerId } = determineWinner(bout.result, bout.fighter1, bout.fighter2)
      const weightClass = bout.weightClass
        ? bout.weightClass.charAt(0).toUpperCase() + bout.weightClass.slice(1)
        : inferWeightClass(Math.max(bout.fighter1.weight, bout.fighter2.weight))

      // Process both fighters
      const f1Id = await upsertFighter(bout.fighter1, weightClass, now)
      const f2Id = await upsertFighter(bout.fighter2, weightClass, now)

      if (f1Id === null) {
        results.errors.push(`Failed to save fighter: ${bout.fighter1.name}`)
      } else if (f1Id.created) {
        results.fightersCreated++
      } else {
        results.fightersUpdated++
      }

      if (f2Id === null) {
        results.errors.push(`Failed to save fighter: ${bout.fighter2.name}`)
      } else if (f2Id.created) {
        results.fightersCreated++
      } else {
        results.fightersUpdated++
      }

      // Add fight records to both fighters
      if (f1Id && f2Id) {
        const f1Result: 'W' | 'L' | 'D' | 'NC' =
          winnerId === 1 ? 'W' : winnerId === 2 ? 'L' : 'D'
        const f2Result: 'W' | 'L' | 'D' | 'NC' =
          winnerId === 2 ? 'W' : winnerId === 1 ? 'L' : 'D'

        const fightBase = {
          date: event.date,
          method: bout.method as 'KO' | 'TKO' | 'UD' | 'SD' | 'MD' | 'RTD' | 'DQ' | 'NC' | '',
          scheduledRounds: bout.rounds,
          weightClass,
          venue: event.venue,
          location: `${event.city}, TX`,
          titleFight: !!bout.titleFight,
          scores: bout.scores,
          eventNumber: event.eventNumber,
        }

        // Add fight to fighter 1
        await firestore
          .collection('fighters')
          .doc(f1Id.id)
          .collection('fights')
          .add({
            ...fightBase,
            opponent: bout.fighter2.name,
            opponentId: f2Id.id,
            result: f1Result,
          })

        // Add fight to fighter 2
        await firestore
          .collection('fighters')
          .doc(f2Id.id)
          .collection('fights')
          .add({
            ...fightBase,
            opponent: bout.fighter1.name,
            opponentId: f1Id.id,
            result: f2Result,
          })

        // Update win/loss/draw records
        await updateFighterRecord(f1Id.id, f1Result)
        await updateFighterRecord(f2Id.id, f2Result)

        results.boutsRecorded++
      }
    } catch (err) {
      results.errors.push(
        `Bout ${bout.boutNumber}: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    }
  }

  return { success: true, results }
}

async function upsertFighter(
  tdlrFighter: TDLRFighter,
  weightClass: string,
  now: string
): Promise<{ id: string; created: boolean } | null> {
  try {
    // Check if fighter exists by TDLR boxer ID
    const byBoxerId = await firestore
      .collection('fighters')
      .where('tdlrBoxerId', '==', tdlrFighter.boxerId)
      .get()

    if (!byBoxerId.empty) {
      return { id: byBoxerId.docs[0].id, created: false }
    }

    // Check by name slug
    const { firstName, lastName } = splitName(tdlrFighter.name)
    const slug = generateSlug(firstName, lastName)

    const bySlug = await firestore
      .collection('fighters')
      .where('slug', '==', slug)
      .get()

    if (!bySlug.empty) {
      // Update existing fighter with TDLR boxer ID
      const existingDoc = bySlug.docs[0]
      await existingDoc.ref.update({
        tdlrBoxerId: tdlrFighter.boxerId,
        updatedAt: now,
      })
      return { id: existingDoc.id, created: false }
    }

    // Create new fighter
    const region = determineRegion(tdlrFighter.state)

    const docRef = await firestore.collection('fighters').add({
      firstName,
      lastName,
      slug,
      sex: 'male' as const,
      weightClass,
      status: 'active' as const,
      region,
      residence: {
        city: tdlrFighter.city,
        state: tdlrFighter.state,
        country: tdlrFighter.state.toUpperCase() === 'TX' ? 'US' : 'US',
      },
      record: { wins: 0, losses: 0, draws: 0, knockouts: 0 },
      bouts: 0,
      koPercentage: 0,
      tdlrBoxerId: tdlrFighter.boxerId,
      createdAt: now,
      updatedAt: now,
    })

    return { id: docRef.id, created: true }
  } catch {
    return null
  }
}

async function updateFighterRecord(fighterId: string, result: 'W' | 'L' | 'D' | 'NC') {
  const docRef = firestore.collection('fighters').doc(fighterId)
  const doc = await docRef.get()
  if (!doc.exists) return

  const data = doc.data()!
  const record = data.record || { wins: 0, losses: 0, draws: 0, knockouts: 0 }

  if (result === 'W') record.wins++
  else if (result === 'L') record.losses++
  else if (result === 'D') record.draws++

  const bouts = record.wins + record.losses + record.draws
  const koPercentage = record.wins > 0
    ? Math.round((record.knockouts / record.wins) * 10000) / 100
    : 0

  await docRef.update({
    record,
    bouts,
    koPercentage,
    updatedAt: new Date().toISOString(),
  })
}
