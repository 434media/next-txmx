#!/usr/bin/env node
/**
 * Purge the legacy event-system Firestore collections that are no longer read
 * or written by any code (the events → fight-nights migration replaced them).
 *
 * ALLOWLIST ONLY — never touches fightNights/*, events, users, gyms, etc.
 *
 * Default mode is a DRY RUN (counts only). Pass --write to:
 *   1. back up every doc (recursively, incl. subcollections) to
 *      scripts/backups/purge-<stamp>/<collection>.json
 *   2. recursively delete each collection.
 *
 * Usage:
 *   node scripts/purge-legacy-collections.mjs            # dry run
 *   node scripts/purge-legacy-collections.mjs --write     # backup + delete
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(import.meta.dirname, '..')

// ── Load .env.local without dotenv ──
const envPath = resolve(PROJECT_ROOT, '.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  const k = t.slice(0, i)
  let v = t.slice(i + 1)
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  if (!process.env[k]) process.env[k] = v
}

function initFirestore() {
  if (getApps().length > 0) return getFirestore(getApps()[0], 'txmx')
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n')
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return getFirestore(app, 'txmx')
}

// ── EXACT allowlist of dead legacy collections (top-level) ──
const TARGETS = ['matchPicks', 'props', 'picks', 'eventLeaderboards', 'eventPrizes']

// Hard guard: anything in this set must never appear in TARGETS.
const PROTECTED = new Set(['fightNights', 'events', 'users', 'gyms', 'venues', 'fighters', 'promoters'])
for (const t of TARGETS) {
  if (PROTECTED.has(t)) throw new Error(`Refusing to target protected collection: ${t}`)
}

const WRITE = process.argv.slice(2).includes('--write')
const db = initFirestore()

/** Recursively serialize a doc + all its subcollections. */
async function dumpDoc(docSnap) {
  const out = { id: docSnap.id, data: docSnap.data(), collections: {} }
  const subs = await docSnap.ref.listCollections()
  for (const sub of subs) {
    const s = await sub.get()
    out.collections[sub.id] = []
    for (const d of s.docs) out.collections[sub.id].push(await dumpDoc(d))
  }
  return out
}

/** Count a doc + all nested subcollection docs. */
async function countDeep(docSnap) {
  let n = 1
  const subs = await docSnap.ref.listCollections()
  for (const sub of subs) {
    const s = await sub.get()
    for (const d of s.docs) n += await countDeep(d)
  }
  return n
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (backup + delete)' : 'DRY RUN (counts only)'}`)
  console.log(`Database: txmx`)
  console.log('')

  let backupDir = null
  if (WRITE) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    backupDir = resolve(PROJECT_ROOT, 'scripts', 'backups', `purge-${stamp}`)
    mkdirSync(backupDir, { recursive: true })
    console.log(`Backups → ${backupDir}\n`)
  }

  const summary = []
  for (const name of TARGETS) {
    const col = db.collection(name)
    const snap = await col.get()
    let deep = 0
    for (const d of snap.docs) deep += await countDeep(d)
    const subNote = deep > snap.size ? ` (+${deep - snap.size} nested)` : ''
    console.log(`• ${name}: ${snap.size} top-level doc(s)${subNote}`)

    if (WRITE) {
      const dump = []
      for (const d of snap.docs) dump.push(await dumpDoc(d))
      writeFileSync(resolve(backupDir, `${name}.json`), JSON.stringify(dump, null, 2))
      await db.recursiveDelete(col)
      console.log(`    backed up + deleted`)
    }
    summary.push({ name, topLevel: snap.size, deep })
  }

  console.log('')
  if (WRITE) {
    console.log('Purge complete. Re-run without --write to confirm 0 docs remain.')
  } else {
    console.log('Dry run only. Re-run with --write to back up + delete.')
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
