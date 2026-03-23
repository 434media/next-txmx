#!/usr/bin/env node
/**
 * Backfill existing Firestore records with canonical settlement/provenance fields.
 *
 * Default mode is dry-run. Use --write to persist changes.
 *
 * Usage:
 *   node scripts/tdlr-backfill-settlement.mjs
 *   node scripts/tdlr-backfill-settlement.mjs --write
 *   node scripts/tdlr-backfill-settlement.mjs --limit-fighters 50 --limit-fights 500
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(import.meta.dirname, '..')
const REPORT_PATH = resolve(PROJECT_ROOT, 'tdlr-backfill-report.json')

// Load .env.local without dotenv.
const envPath = resolve(PROJECT_ROOT, '.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

function initFirestore() {
  if (getApps().length > 0) return getFirestore(getApps()[0], 'txmx')

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^['"]|['"]$/g, '')
    .replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase credentials in .env.local')
  }

  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return getFirestore(app, 'txmx')
}

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const param = (name) => {
  const idx = args.indexOf(name)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null
}

const WRITE = flag('--write')
const LIMIT_FIGHTERS = parseInt(param('--limit-fighters') || '0', 10)
const LIMIT_FIGHTS = parseInt(param('--limit-fights') || '0', 10)

function normalizeMethod(rawMethod, rawResult) {
  const value = `${rawMethod || ''} ${rawResult || ''}`.toLowerCase()
  if (!value.trim()) return ''
  if (value.includes('draw')) return ''
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

function inferResolution(result, rawResult) {
  const res = String(result || '').toUpperCase().trim()
  const raw = String(rawResult || '').toLowerCase()

  if (res === 'W' || res === 'L') return { winnerResolution: 'win', settlementStatus: 'final', winnerConfidence: 'high' }
  if (res === 'D') return { winnerResolution: 'draw', settlementStatus: 'final', winnerConfidence: 'high' }
  if (res === 'NC') {
    if (raw.includes('no contest') || /\bnc\b/.test(raw)) {
      return { winnerResolution: 'nc', settlementStatus: 'void', winnerConfidence: 'high' }
    }
    return { winnerResolution: 'unresolved', settlementStatus: 'pending', winnerConfidence: 'low' }
  }

  return { winnerResolution: 'unresolved', settlementStatus: 'pending', winnerConfidence: 'low' }
}

function deriveBoutNumber(data) {
  const direct = Number.parseInt(String(data.boutNumber || ''), 10)
  if (Number.isFinite(direct) && direct > 0) return direct

  const boutKey = String(data.boutKey || '')
  const keyMatch = boutKey.match(/-(\d{1,3})$/)
  if (keyMatch) return Number.parseInt(keyMatch[1], 10)

  return 0
}

function deriveBoutKey(eventNumber, boutNumber, fallbackDocId) {
  if (!eventNumber) return ''
  if (boutNumber > 0) return `${eventNumber}-${String(boutNumber).padStart(2, '0')}`
  return `${eventNumber}-${fallbackDocId.slice(0, 8)}`
}

function buildSourceHash(eventNumber, boutNumber, data) {
  if (!eventNumber) return ''

  const payload = [
    eventNumber,
    boutNumber || '',
    data.opponentId || '',
    data.result || '',
    data.rawResult || '',
    data.rawMethod || data.method || '',
    Array.isArray(data.scores) ? data.scores.join('|') : '',
  ].join('::')

  return createHash('sha256').update(payload).digest('hex')
}

function updateIfChanged(next, key, value) {
  if (value === undefined) return
  if (next[key] !== value) next[key] = value
}

async function backfillEvents(db, now, report) {
  const events = await db.collection('events').where('source', '==', 'TDLR').get()
  let updated = 0

  for (const doc of events.docs) {
    const data = doc.data()
    const nextMetadata = {
      settlementSource: data?.sourceMetadata?.settlementSource || 'TDLR_RESULTS_PDF',
      parser: data?.sourceMetadata?.parser || 'api/tdlr-parse.py',
      importedAt: data?.sourceMetadata?.importedAt || data?.createdAt || now,
      backfilledAt: data?.sourceMetadata?.backfilledAt || now,
    }

    const needsUpdate =
      !data.sourceMetadata ||
      data.sourceMetadata.settlementSource !== nextMetadata.settlementSource ||
      data.sourceMetadata.parser !== nextMetadata.parser ||
      !data.sourceMetadata.importedAt

    if (!needsUpdate) continue

    updated++
    report.eventUpdates.push({ eventDocId: doc.id, eventNumber: data.eventNumber || '' })

    if (WRITE) {
      await doc.ref.update({ sourceMetadata: nextMetadata })
    }
  }

  return { scanned: events.size, updated }
}

async function backfillFights(db, now, report) {
  const fighters = await db.collection('fighters').orderBy('lastName').get()

  let fightersScanned = 0
  let fightsScanned = 0
  let fightsUpdated = 0

  for (const fighterDoc of fighters.docs) {
    if (LIMIT_FIGHTERS > 0 && fightersScanned >= LIMIT_FIGHTERS) break
    fightersScanned++

    const fightsSnap = await fighterDoc.ref.collection('fights').get()

    for (const fightDoc of fightsSnap.docs) {
      if (LIMIT_FIGHTS > 0 && fightsScanned >= LIMIT_FIGHTS) break
      fightsScanned++

      const data = fightDoc.data()
      const rawResult = String(data.rawResult || data.result || '').trim()
      const rawMethod = String(data.rawMethod || data.method || '').trim()
      const normalizedMethod = normalizeMethod(rawMethod, rawResult)
      const resolution = inferResolution(data.result, rawResult)
      const eventNumber = String(data.eventNumber || '').trim()
      const boutNumber = deriveBoutNumber(data)
      const boutKey = deriveBoutKey(eventNumber, boutNumber, fightDoc.id)
      const sourceHash = data.sourceHash || buildSourceHash(eventNumber, boutNumber, {
        ...data,
        rawResult,
        rawMethod,
      })

      const next = {
        rawResult,
        rawMethod,
        sourceImportedAt: data.sourceImportedAt || now,
      }

      updateIfChanged(next, 'method', normalizedMethod)
      updateIfChanged(next, 'winnerResolution', resolution.winnerResolution)
      updateIfChanged(next, 'settlementStatus', resolution.settlementStatus)
      updateIfChanged(next, 'winnerConfidence', resolution.winnerConfidence)
      if (boutNumber > 0) updateIfChanged(next, 'boutNumber', boutNumber)
      if (boutKey) updateIfChanged(next, 'boutKey', boutKey)
      if (eventNumber) updateIfChanged(next, 'source', data.source || 'TDLR')
      if (sourceHash) updateIfChanged(next, 'sourceHash', sourceHash)

      const changedKeys = Object.keys(next).filter((k) => next[k] !== data[k])
      if (changedKeys.length === 0) continue

      fightsUpdated++
      report.fightUpdates.push({
        fighterId: fighterDoc.id,
        fightDocId: fightDoc.id,
        eventNumber,
        changedKeys,
      })

      if (WRITE) {
        await fightDoc.ref.update(next)
      }
    }

    if (LIMIT_FIGHTS > 0 && fightsScanned >= LIMIT_FIGHTS) break
  }

  return { fightersScanned, fightsScanned, fightsUpdated }
}

async function main() {
  const db = initFirestore()
  const now = new Date().toISOString()

  console.log(`\n🛠️  TDLR backfill ${WRITE ? '[WRITE]' : '[DRY RUN]'}`)
  console.log(`   Fighters limit: ${LIMIT_FIGHTERS || 'none'}`)
  console.log(`   Fights limit: ${LIMIT_FIGHTS || 'none'}`)

  const report = {
    mode: WRITE ? 'write' : 'dry-run',
    generatedAt: now,
    summary: {},
    eventUpdates: [],
    fightUpdates: [],
  }

  const eventStats = await backfillEvents(db, now, report)
  const fightStats = await backfillFights(db, now, report)

  report.summary = {
    eventsScanned: eventStats.scanned,
    eventsToUpdate: eventStats.updated,
    fightersScanned: fightStats.fightersScanned,
    fightsScanned: fightStats.fightsScanned,
    fightsToUpdate: fightStats.fightsUpdated,
  }

  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')

  console.log('\n✅ Backfill complete')
  console.log(`   Events scanned: ${eventStats.scanned}`)
  console.log(`   Events ${WRITE ? 'updated' : 'to update'}: ${eventStats.updated}`)
  console.log(`   Fighters scanned: ${fightStats.fightersScanned}`)
  console.log(`   Fights scanned: ${fightStats.fightsScanned}`)
  console.log(`   Fights ${WRITE ? 'updated' : 'to update'}: ${fightStats.fightsUpdated}`)
  console.log(`   Report: ${REPORT_PATH}`)
}

main().catch((err) => {
  console.error(`❌ Backfill failed: ${err.message}`)
  process.exit(1)
})
