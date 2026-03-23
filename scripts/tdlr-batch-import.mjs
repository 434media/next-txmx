#!/usr/bin/env node
/**
 * Batch import parsed TDLR boxing JSON files into Firestore.
 *
 * Reads all *.json files from tdlr-downloads/, checks which events
 * are already imported (by eventNumber), and imports the rest.
 *
 * Usage:
 *   node scripts/tdlr-batch-import.mjs                    # import all new events
 *   node scripts/tdlr-batch-import.mjs --dry-run           # preview without writing
 *   node scripts/tdlr-batch-import.mjs --dir ./other-dir   # custom JSON dir
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { createHash } from 'crypto'

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(import.meta.dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

// --- Firebase init (mirrors lib/firebase-admin.ts without 'server-only') ---
function initFirestore() {
  if (getApps().length > 0) return getFirestore(getApps()[0], 'txmx')

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY
  const privateKey = rawKey
    ?.replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase credentials in .env.local')
    process.exit(1)
  }

  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return getFirestore(app, 'txmx')
}

// --- Helpers (mirrors app/actions/tdlr-import.ts) ---
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  const lastName = parts.pop()
  return { firstName: parts.join(' '), lastName }
}

function generateSlug(firstName, lastName) {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function determineRegion(state) {
  const s = state.toUpperCase().trim()
  if (s === 'TX') return 'TX'
  const mxStates = ['MX', 'MEX', 'CHIH', 'NL', 'TAMPS', 'COAH', 'SON', 'BCN', 'BCS', 'DGO', 'GTO', 'JAL', 'SIN', 'SLP', 'ZAC']
  if (mxStates.includes(s)) return 'MX'
  return 'OTHER'
}

function normalizeNameToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMethod(rawMethod, rawResult) {
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

function determineOutcome(result, fighter1, fighter2) {
  const raw = String(result || '').trim()
  const normalized = raw.toLowerCase()

  if (!raw) return { winnerId: 0, kind: 'unresolved', confidence: 'low' }
  if (normalized.includes('draw')) return { winnerId: 0, kind: 'draw', confidence: 'high' }
  if (normalized.includes('no contest') || /\bnc\b/.test(normalized)) {
    return { winnerId: 0, kind: 'nc', confidence: 'high' }
  }

  const winnerToken = normalizeNameToken(raw.split(/\s+by\s+/i)[0] || '')
  const f1Full = normalizeNameToken(fighter1.name)
  const f2Full = normalizeNameToken(fighter2.name)
  const f1Last = normalizeNameToken(fighter1.name.split(/\s+/).pop() || '')
  const f2Last = normalizeNameToken(fighter2.name.split(/\s+/).pop() || '')

  if (winnerToken && (winnerToken === f1Full || winnerToken === f1Last)) {
    return { winnerId: 1, kind: 'win', confidence: 'high' }
  }
  if (winnerToken && (winnerToken === f2Full || winnerToken === f2Last)) {
    return { winnerId: 2, kind: 'win', confidence: 'high' }
  }

  return { winnerId: 0, kind: 'unresolved', confidence: 'low' }
}

function buildBoutSourceHash(event, bout) {
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

function inferWeightClass(weight) {
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

// --- Import logic ---
async function upsertFighter(db, fighter, weightClass, now) {
  // Check by TDLR boxer ID
  const byBoxerId = await db.collection('fighters')
    .where('tdlrBoxerId', '==', fighter.boxerId)
    .get()

  if (!byBoxerId.empty) {
    return { id: byBoxerId.docs[0].id, created: false }
  }

  // Check by slug
  const { firstName, lastName } = splitName(fighter.name)
  const slug = generateSlug(firstName, lastName)
  const bySlug = await db.collection('fighters').where('slug', '==', slug).get()

  if (!bySlug.empty) {
    await bySlug.docs[0].ref.update({ tdlrBoxerId: fighter.boxerId, updatedAt: now })
    return { id: bySlug.docs[0].id, created: false }
  }

  // Create new
  const region = determineRegion(fighter.state)
  const docRef = await db.collection('fighters').add({
    firstName, lastName, slug,
    sex: 'male',
    weightClass,
    status: 'active',
    region,
    residence: { city: fighter.city, state: fighter.state, country: 'US' },
    record: { wins: 0, losses: 0, draws: 0, knockouts: 0 },
    bouts: 0,
    koPercentage: 0,
    tdlrBoxerId: fighter.boxerId,
    createdAt: now,
    updatedAt: now,
  })

  return { id: docRef.id, created: true }
}

async function updateFighterRecord(db, fighterId, result) {
  const docRef = db.collection('fighters').doc(fighterId)
  const doc = await docRef.get()
  if (!doc.exists) return

  const data = doc.data()
  const record = data.record || { wins: 0, losses: 0, draws: 0, knockouts: 0 }

  if (result === 'W') record.wins++
  else if (result === 'L') record.losses++
  else if (result === 'D') record.draws++

  const bouts = record.wins + record.losses + record.draws
  const koPercentage = record.wins > 0
    ? Math.round((record.knockouts / record.wins) * 10000) / 100
    : 0

  await docRef.update({ record, bouts, koPercentage, updatedAt: new Date().toISOString() })
}

async function importEvent(db, event, dryRun) {
  const now = new Date().toISOString()
  const stats = { fightersCreated: 0, fightersUpdated: 0, boutsRecorded: 0, errors: [] }

  // Save event
  if (!dryRun) {
    await db.collection('events').add({
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

    // Upsert venue
    const existingVenue = await db.collection('venues').where('name', '==', event.venue).get()
    if (existingVenue.empty) {
      await db.collection('venues').add({
        name: event.venue, address: event.address, city: event.city,
        state: 'TX', eventCount: 1, createdAt: now,
      })
    } else {
      const venueDoc = existingVenue.docs[0]
      await venueDoc.ref.update({ eventCount: (venueDoc.data().eventCount || 0) + 1 })
    }
  }

  // Process bouts
  for (const bout of event.bouts) {
    try {
      const outcome = determineOutcome(bout.result, bout.fighter1, bout.fighter2)
      const winnerId = outcome.winnerId
      const weightClass = bout.weightClass
        ? bout.weightClass.charAt(0).toUpperCase() + bout.weightClass.slice(1)
        : inferWeightClass(Math.max(bout.fighter1.weight, bout.fighter2.weight))
      const settlementStatus =
        outcome.kind === 'unresolved'
          ? 'pending'
          : outcome.kind === 'nc'
            ? 'void'
            : 'final'
      const normalizedMethod = normalizeMethod(bout.method, bout.result)
      const boutKey = `${event.eventNumber}-${String(bout.boutNumber).padStart(2, '0')}`
      const sourceHash = buildBoutSourceHash(event, bout)

      if (dryRun) {
        stats.boutsRecorded++
        continue
      }

      const f1 = await upsertFighter(db, bout.fighter1, weightClass, now)
      const f2 = await upsertFighter(db, bout.fighter2, weightClass, now)

      if (f1.created) stats.fightersCreated++; else stats.fightersUpdated++
      if (f2.created) stats.fightersCreated++; else stats.fightersUpdated++

      const f1Result =
        outcome.kind === 'draw'
          ? 'D'
          : outcome.kind === 'nc' || outcome.kind === 'unresolved'
            ? 'NC'
            : winnerId === 1
              ? 'W'
              : 'L'
      const f2Result =
        outcome.kind === 'draw'
          ? 'D'
          : outcome.kind === 'nc' || outcome.kind === 'unresolved'
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
        winnerResolution: outcome.kind,
        winnerConfidence: outcome.confidence,
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
        source: 'TDLR',
        sourceHash,
        sourceImportedAt: now,
      }

      await db.collection('fighters').doc(f1.id).collection('fights').doc(boutKey).set({
        ...fightBase, opponent: bout.fighter2.name, opponentId: f2.id, result: f1Result,
      }, { merge: true })
      await db.collection('fighters').doc(f2.id).collection('fights').doc(boutKey).set({
        ...fightBase, opponent: bout.fighter1.name, opponentId: f1.id, result: f2Result,
      }, { merge: true })

      if (settlementStatus === 'final' && (f1Result === 'W' || f1Result === 'L' || f1Result === 'D')) {
        await updateFighterRecord(db, f1.id, f1Result)
      }
      if (settlementStatus === 'final' && (f2Result === 'W' || f2Result === 'L' || f2Result === 'D')) {
        await updateFighterRecord(db, f2.id, f2Result)
      }

      stats.boutsRecorded++
    } catch (err) {
      stats.errors.push(`Bout ${bout.boutNumber}: ${err.message}`)
    }
  }

  return stats
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const dirIdx = args.indexOf('--dir')
  const jsonDir = dirIdx !== -1 && args[dirIdx + 1]
    ? resolve(args[dirIdx + 1])
    : resolve(import.meta.dirname, '..', 'tdlr-downloads')

  console.log(dryRun ? '🔍 DRY RUN — no data will be written\n' : '')

  const db = initFirestore()

  // Get already-imported event numbers
  const importedSnap = await db.collection('events').get()
  const importedNumbers = new Set(importedSnap.docs.map(d => d.data().eventNumber))
  console.log(`📋 ${importedNumbers.size} events already in Firestore`)

  // Load JSON files
  const files = readdirSync(jsonDir).filter(f => f.endsWith('.json')).sort()
  console.log(`📁 ${files.length} JSON files found in ${jsonDir}\n`)

  let imported = 0, skipped = 0, totalBouts = 0, totalFightersCreated = 0

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(jsonDir, file), 'utf-8'))

    if (!data.eventNumber) {
      console.log(`  ⚠ ${file}: no eventNumber, skipping`)
      skipped++
      continue
    }

    if (importedNumbers.has(data.eventNumber)) {
      skipped++
      continue
    }

    const label = `${data.date} | ${data.promoter} | ${data.city} (Event #${data.eventNumber})`
    process.stdout.write(`  → ${label}...`)

    const stats = await importEvent(db, data, dryRun)
    imported++
    totalBouts += stats.boutsRecorded
    totalFightersCreated += stats.fightersCreated

    console.log(` ✓ ${stats.boutsRecorded} bouts, ${stats.fightersCreated} new fighters`)

    if (stats.errors.length > 0) {
      for (const err of stats.errors) console.log(`    ⚠ ${err}`)
    }
  }

  console.log(`\n${'═'.repeat(50)}`)
  console.log(`✅ Imported: ${imported} events (${totalBouts} bouts, ${totalFightersCreated} new fighters)`)
  console.log(`⏭  Skipped:  ${skipped} (already imported or no event number)`)
  if (dryRun) console.log(`\n🔍 This was a dry run. Re-run without --dry-run to write to Firestore.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
