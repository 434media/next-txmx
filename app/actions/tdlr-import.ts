'use server'

import { createHash } from 'crypto'
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

type WinnerId = 1 | 2 | 0
type OutcomeKind = 'win' | 'draw' | 'nc' | 'unresolved'
type SettlementStatus = 'final' | 'pending' | 'void'

interface BoutResolution {
  winnerId: WinnerId
  kind: OutcomeKind
  confidence: 'high' | 'low'
  winnerToken?: string
}

function normalizeNameToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMethod(rawMethod: string, rawResult: string): '' | 'KO' | 'TKO' | 'UD' | 'SD' | 'MD' | 'RTD' | 'DQ' | 'NC' {
  const value = `${rawMethod || ''} ${rawResult || ''}`.toLowerCase()
  if (!value.trim()) return ''
  if (value.includes('no contest') || /\bnc\b/.test(value)) return 'NC'
  if (value.includes('majority decision') || /\bmd\b/.test(value)) return 'MD'
  if (value.includes('split decision') || /\bsd\b/.test(value)) return 'SD'
  if (value.includes('decision') || /\bud\b/.test(value)) return 'UD'
  if (value.includes('technical knockout') || /\btko\b/.test(value)) return 'TKO'
  if (value.includes('knockout') || /\bko\b/.test(value)) return 'KO'
  if (value.includes('retired') || /\brtd\b/.test(value)) return 'RTD'
  if (value.includes('disqual') || /\bdq\b/.test(value)) return 'DQ'
  return ''
}

function determineBoutResolution(
  result: string,
  fighter1: TDLRFighter,
  fighter2: TDLRFighter
): BoutResolution {
  const raw = (result || '').trim()
  const normalized = raw.toLowerCase()

  if (!raw) {
    return { winnerId: 0, kind: 'unresolved', confidence: 'low' }
  }

  if (normalized.includes('draw')) {
    return { winnerId: 0, kind: 'draw', confidence: 'high' }
  }

  if (normalized.includes('no contest') || /\bnc\b/.test(normalized)) {
    return { winnerId: 0, kind: 'nc', confidence: 'high' }
  }

  const winnerToken = normalizeNameToken(raw.split(/\s+by\s+/i)[0] || '')
  if (!winnerToken) {
    return { winnerId: 0, kind: 'unresolved', confidence: 'low' }
  }

  const f1Full = normalizeNameToken(fighter1.name)
  const f2Full = normalizeNameToken(fighter2.name)
  const f1Last = normalizeNameToken(fighter1.name.split(/\s+/).pop() || '')
  const f2Last = normalizeNameToken(fighter2.name.split(/\s+/).pop() || '')

  if (winnerToken === f1Full || winnerToken === f1Last) {
    return { winnerId: 1, kind: 'win', confidence: 'high', winnerToken }
  }
  if (winnerToken === f2Full || winnerToken === f2Last) {
    return { winnerId: 2, kind: 'win', confidence: 'high', winnerToken }
  }

  return { winnerId: 0, kind: 'unresolved', confidence: 'low', winnerToken }
}

function buildBoutSourceHash(event: TDLREvent, bout: TDLRBout): string {
  const payload = [
    event.eventNumber,
    bout.boutNumber,
    bout.fighter1.boxerId,
    bout.fighter2.boxerId,
    bout.result,
    bout.method,
    (bout.scores || []).join('|'),
  ].join('::')

  return createHash('sha256').update(payload).digest('hex')
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
    sourceMetadata: {
      settlementSource: 'TDLR_RESULTS_PDF',
      parser: 'api/tdlr-parse.py',
      importedAt: now,
    },
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
      const resolution = determineBoutResolution(bout.result, bout.fighter1, bout.fighter2)
      const winnerId = resolution.winnerId
      const weightClass = bout.weightClass
        ? bout.weightClass.charAt(0).toUpperCase() + bout.weightClass.slice(1)
        : inferWeightClass(Math.max(bout.fighter1.weight, bout.fighter2.weight))
      const normalizedMethod = normalizeMethod(bout.method, bout.result)
      const settlementStatus: SettlementStatus =
        resolution.kind === 'unresolved'
          ? 'pending'
          : resolution.kind === 'nc'
            ? 'void'
            : 'final'
      const boutKey = `${event.eventNumber}-${String(bout.boutNumber).padStart(2, '0')}`
      const sourceHash = buildBoutSourceHash(event, bout)

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
          resolution.kind === 'draw'
            ? 'D'
            : resolution.kind === 'nc' || resolution.kind === 'unresolved'
              ? 'NC'
              : winnerId === 1
                ? 'W'
                : 'L'
        const f2Result: 'W' | 'L' | 'D' | 'NC' =
          resolution.kind === 'draw'
            ? 'D'
            : resolution.kind === 'nc' || resolution.kind === 'unresolved'
              ? 'NC'
              : winnerId === 2
                ? 'W'
                : 'L'

        const fightBase = {
          boutKey,
          boutNumber: bout.boutNumber,
          date: event.date,
          method: normalizedMethod,
          settlementStatus,
          winnerResolution: resolution.kind,
          winnerConfidence: resolution.confidence,
          rawResult: bout.result,
          rawMethod: bout.method,
          scheduledRounds: bout.rounds,
          referee: bout.referee,
          weightClass,
          venue: event.venue,
          location: `${event.city}, TX`,
          titleFight: !!bout.titleFight,
          scores: bout.scores,
          eventNumber: event.eventNumber,
          eventId: eventDoc.id,
          source: 'TDLR',
          sourceHash,
          sourceImportedAt: now,
        }

        // Add fight to fighter 1
        await firestore
          .collection('fighters')
          .doc(f1Id.id)
          .collection('fights')
          .doc(boutKey)
          .set({
            ...fightBase,
            opponent: bout.fighter2.name,
            opponentId: f2Id.id,
            result: f1Result,
          }, { merge: true })

        // Add fight to fighter 2
        await firestore
          .collection('fighters')
          .doc(f2Id.id)
          .collection('fights')
          .doc(boutKey)
          .set({
            ...fightBase,
            opponent: bout.fighter1.name,
            opponentId: f1Id.id,
            result: f2Result,
          }, { merge: true })

        // Update aggregate records only for final W/L/D outcomes.
        if (settlementStatus === 'final' && (f1Result === 'W' || f1Result === 'L' || f1Result === 'D')) {
          await updateFighterRecord(f1Id.id, f1Result)
        }
        if (settlementStatus === 'final' && (f2Result === 'W' || f2Result === 'L' || f2Result === 'D')) {
          await updateFighterRecord(f2Id.id, f2Result)
        }

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

async function updateFighterRecord(fighterId: string, result: 'W' | 'L' | 'D') {
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
