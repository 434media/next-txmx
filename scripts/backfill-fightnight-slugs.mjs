#!/usr/bin/env node
/**
 * Backfill a unique URL slug onto every fight night that lacks one.
 * Mirrors the server-side logic in app/actions/fightnight.ts (slugify +
 * ensureUniqueSlug). Idempotent — nights that already have a slug are skipped.
 *
 * Usage:
 *   node scripts/backfill-fightnight-slugs.mjs           # dry-run (prints plan)
 *   node scripts/backfill-fightnight-slugs.mjs --write    # persist slugs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(import.meta.dirname, '..')

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

function slugify(input) {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

function buildSlugBase({ title, venue, date }) {
  const name = slugify(title || venue || '')
  const datePart = date ? slugify(date) : ''
  return [name, datePart].filter(Boolean).join('-') || 'fight-night'
}

async function ensureUniqueSlug(db, base, excludeId) {
  const root = base || 'fight-night'
  let candidate = root
  let n = 1
  while (true) {
    const snap = await db.collection('fightNights').where('slug', '==', candidate).limit(1).get()
    const taken = !snap.empty && snap.docs[0].id !== excludeId
    if (!taken) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}

const WRITE = process.argv.slice(2).includes('--write')

async function main() {
  const db = initFirestore()
  const snap = await db.collection('fightNights').get()
  console.log(`Found ${snap.size} fight night(s).`)

  let updated = 0
  for (const doc of snap.docs) {
    const data = doc.data() || {}
    if (data.slug) {
      console.log(`  • ${doc.id} → already has slug "${data.slug}" (skip)`)
      continue
    }
    const base = buildSlugBase({ title: data.title, venue: data.venue, date: data.date })
    const slug = await ensureUniqueSlug(db, base, doc.id)
    console.log(`  • ${doc.id} → "${slug}"  (title: ${data.title || '—'})`)
    if (WRITE) {
      await doc.ref.update({ slug, updatedAt: new Date().toISOString() })
      updated += 1
    }
  }

  if (WRITE) {
    console.log(`\nDone. Updated ${updated} fight night(s).`)
  } else {
    console.log(`\nDry run — re-run with --write to persist.`)
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
