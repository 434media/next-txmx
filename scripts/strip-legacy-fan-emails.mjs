#!/usr/bin/env node
/**
 * Remove the legacy `email` field from fan-readable docs in the txmx database:
 *
 *   fightNights/{id}/standings/{uid}   (readable by any signed-in user)
 *   fightNights/{id}/prizes/{prizeId}  (readable by any signed-in user)
 *   seasonStandings/{uid}              (server-only, but should not keep a copy)
 *
 * Emails now live only on users/{uid} (owner-only in firestore.rules) and are
 * resolved server-side by lib/server/fan-emails.ts.
 *
 * DO NOT RUN until the code that stops writing these fields and reads emails
 * from users/{uid} (next-txmx #14 and #19) is merged AND deployed, and the
 * founder has given the go. Running it earlier would make recap/winner emails
 * lose addresses that only exist on the legacy field.
 *
 * Default mode is a DRY RUN: it reads only and prints counts. It never prints
 * an email address.
 *
 * Preflight (both modes): for every doc that still has `email`, check that
 * users/{uid}.email exists. If any are missing, --write refuses to run, because
 * deleting the field would lose the only copy of that address. Those uids are
 * listed (uid and doc path only) for a decision.
 *
 * Usage:
 *   node scripts/strip-legacy-fan-emails.mjs            # dry run (read-only)
 *   node scripts/strip-legacy-fan-emails.mjs --write    # delete the fields
 *
 * Credentials: FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * from .env.local, as the other scripts in this folder.
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(import.meta.dirname, '..')

// ── Load .env.local without dotenv ──
const envPath = resolve(PROJECT_ROOT, '.env.local')
if (existsSync(envPath)) {
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
}

function initFirestore() {
  if (getApps().length > 0) return getFirestore(getApps()[0], 'txmx')
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY')
  }
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return getFirestore(app, 'txmx')
}

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
for (const a of args) {
  if (a !== '--write') throw new Error(`Unknown argument: ${a}`)
}

const db = initFirestore()

/** Docs under fightNights/{id}/<sub>/{doc} that still carry `email`. */
async function fightNightSubDocsWithEmail(sub) {
  const out = []
  const nights = await db.collection('fightNights').get()
  for (const night of nights.docs) {
    const snap = await night.ref.collection(sub).get()
    for (const d of snap.docs) {
      if (Object.prototype.hasOwnProperty.call(d.data(), 'email')) {
        out.push({ ref: d.ref, uid: d.get('userId') || (sub === 'standings' ? d.id : null) })
      }
    }
  }
  return out
}

async function seasonDocsWithEmail() {
  const snap = await db.collection('seasonStandings').get()
  return snap.docs
    .filter((d) => Object.prototype.hasOwnProperty.call(d.data(), 'email'))
    .map((d) => ({ ref: d.ref, uid: d.get('userId') || d.id }))
}

/** uids whose users/{uid} doc has no non-empty email. */
async function uidsWithoutUserEmail(uids) {
  const unique = [...new Set(uids.filter(Boolean))]
  const missing = new Set()
  for (let i = 0; i < unique.length; i += 300) {
    const refs = unique.slice(i, i + 300).map((u) => db.collection('users').doc(u))
    const snaps = await db.getAll(...refs)
    for (const s of snaps) {
      const e = s.exists ? s.get('email') : null
      if (typeof e !== 'string' || !e) missing.add(s.id)
    }
  }
  return missing
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (deleting legacy email fields)' : 'DRY RUN (read-only)'}`)

  const groups = {
    'fightNights/*/standings': await fightNightSubDocsWithEmail('standings'),
    'fightNights/*/prizes': await fightNightSubDocsWithEmail('prizes'),
    seasonStandings: await seasonDocsWithEmail(),
  }

  const all = Object.values(groups).flat()
  for (const [name, docs] of Object.entries(groups)) {
    console.log(`  ${name}: ${docs.length} doc(s) with an email field`)
  }

  const noUid = all.filter((d) => !d.uid)
  const missing = await uidsWithoutUserEmail(all.map((d) => d.uid))
  const unsafe = all.filter((d) => !d.uid || missing.has(d.uid))

  console.log(`\nPreflight: ${missing.size} uid(s) have no users/{uid}.email; ${noUid.length} doc(s) have no userId.`)
  for (const d of unsafe.slice(0, 50)) console.log(`  needs a decision: ${d.ref.path} (uid ${d.uid ?? 'none'})`)
  if (unsafe.length > 50) console.log(`  … and ${unsafe.length - 50} more`)

  if (!WRITE) {
    console.log(`\nDry run complete. ${all.length} field(s) would be deleted. Nothing was written.`)
    return
  }

  if (unsafe.length > 0) {
    console.error('\nRefusing to write: some docs hold the only copy of an email. Resolve those first.')
    process.exitCode = 1
    return
  }

  let deleted = 0
  for (let i = 0; i < all.length; i += 400) {
    const batch = db.batch()
    for (const d of all.slice(i, i + 400)) batch.update(d.ref, { email: FieldValue.delete() })
    await batch.commit()
    deleted += Math.min(400, all.length - i)
    console.log(`  deleted ${deleted}/${all.length}`)
  }

  // Verify: re-scan and expect zero.
  const left =
    (await fightNightSubDocsWithEmail('standings')).length +
    (await fightNightSubDocsWithEmail('prizes')).length +
    (await seasonDocsWithEmail()).length
  console.log(`\nDone. Deleted ${deleted} field(s). Remaining docs with an email field: ${left}.`)
  if (left !== 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err?.message ?? err)
  process.exitCode = 1
})
