'use server'

import { firestore } from '../../lib/firebase-admin'

// ── Types ────────────────────────────────────────────────

export type FightNightStatus =
  | 'announced'      // visible on landing, not started
  | 'doors_open'     // check-in is live, picks open
  | 'live'           // first bell has rung
  | 'completed'      // all bouts done

export interface FightNight {
  id: string
  /** URL slug for the public page, e.g. "boxr-station-jan-2026". Unique
   * across fight nights; auto-derived from title + date on create. */
  slug: string
  /** Short title shown in hero, e.g. "Members Only Fight Night" */
  title: string
  /** Eyebrow above title, e.g. "BOXR Station Presents" */
  subtitle: string
  /** Venue name, e.g. "BOXR Station" */
  venue: string
  /** City, e.g. "San Antonio" */
  city: string
  /** Full address for map / display (optional) */
  address: string
  /** ISO date "YYYY-MM-DD" */
  date: string
  /** ISO datetime when doors open (with timezone) */
  doorsAt: string
  /** ISO datetime of first bell (with timezone) */
  firstBellAt: string
  status: FightNightStatus
  /** Flyer image URL, used as hero background */
  flyerUrl: string
  /** Prize label shown on landing + emails, e.g. "BOXR Station prize pack" */
  prizeLabel: string
  /** Long-form prize details rendered on landing */
  prizeDetails: string
  /** Free copy shown on landing page (markdown allowed; rendered as plain text for now) */
  promoCopy: string
  /** Toggle prop picks for this fight night */
  propsEnabled: boolean
  /** Toggle live polls for this fight night */
  pollsEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface FightNightBout {
  /** 1-indexed bout number (also the doc ID) */
  boutNumber: number
  fighter1Name: string
  fighter1Gym: string
  fighter2Name: string
  fighter2Gym: string
  weightClass: string
  /** Whether this bout is the main event */
  isMainEvent: boolean
  status: 'scheduled' | 'live' | 'completed'
  winnerCorner: 'fighter1' | 'fighter2' | 'draw' | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── FightNight CRUD ──────────────────────────────────────

function fightNightRef(id: string) {
  return firestore.collection('fightNights').doc(id)
}

function boutsCol(fightNightId: string) {
  return fightNightRef(fightNightId).collection('bouts')
}

function emptyDefaults(): Omit<FightNight, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    slug: '',
    title: '',
    subtitle: '',
    venue: '',
    city: '',
    address: '',
    date: '',
    doorsAt: '',
    firstBellAt: '',
    status: 'announced' as FightNightStatus,
    flyerUrl: '',
    prizeLabel: '',
    prizeDetails: '',
    promoCopy: '',
    propsEnabled: false,
    pollsEnabled: true,
  }
}

// ── Slug helpers ─────────────────────────────────────────

/** Normalize an arbitrary string into a URL-safe slug fragment. */
function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

/** Build a slug base from a fight night's identity fields (title + date). */
function buildSlugBase(data: { title?: string; venue?: string; date?: string }): string {
  const name = slugify(data.title || data.venue || '')
  const datePart = data.date ? slugify(data.date) : ''
  const base = [name, datePart].filter(Boolean).join('-')
  return base || 'fight-night'
}

/**
 * Return a slug guaranteed unique across the `fightNights` collection. If the
 * base is taken by another doc, append `-2`, `-3`, … until free. `excludeId`
 * lets a doc keep its own slug on update without colliding with itself.
 */
async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || 'fight-night'
  let candidate = root
  let n = 1
  // Equality queries on `slug` use the auto-created single-field index.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await firestore
      .collection('fightNights')
      .where('slug', '==', candidate)
      .limit(1)
      .get()
    const taken = !snap.empty && snap.docs[0].id !== excludeId
    if (!taken) return candidate
    n += 1
    candidate = `${root}-${n}`
  }
}

export async function createFightNight(
  data: Partial<Omit<FightNight, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<FightNight> {
  const now = new Date().toISOString()
  const merged = { ...emptyDefaults(), ...data }
  const base = merged.slug ? slugify(merged.slug) : buildSlugBase(merged)
  merged.slug = await ensureUniqueSlug(base)
  const payload = { ...merged, createdAt: now, updatedAt: now }
  const ref = await firestore.collection('fightNights').add(payload)
  return { id: ref.id, ...payload }
}

export async function updateFightNight(
  id: string,
  data: Partial<Omit<FightNight, 'id' | 'createdAt'>>
): Promise<void> {
  const patch: Record<string, unknown> = {
    ...data,
    updatedAt: new Date().toISOString(),
  }
  // When the slug is part of the patch, sanitize it and guarantee it stays
  // unique (excluding this doc). An empty/blank slug regenerates from the
  // night's identity fields so the public URL is never broken.
  if (typeof data.slug === 'string') {
    const base = slugify(data.slug) || buildSlugBase(data)
    patch.slug = await ensureUniqueSlug(base, id)
  }
  await fightNightRef(id).update(patch)
}

export async function deleteFightNight(id: string): Promise<void> {
  // Note: subcollections are NOT deleted by this — admin should drop manually
  // if a fight night is created in error. For Thursday's event we won't delete.
  await fightNightRef(id).delete()
}

function mapDoc(doc: FirebaseFirestore.DocumentSnapshot): FightNight {
  const data = doc.data() || {}
  return {
    id: doc.id,
    slug: data.slug || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    venue: data.venue || '',
    city: data.city || '',
    address: data.address || '',
    date: data.date || '',
    doorsAt: data.doorsAt || '',
    firstBellAt: data.firstBellAt || '',
    status: (data.status as FightNightStatus) || 'announced',
    flyerUrl: data.flyerUrl || '',
    prizeLabel: data.prizeLabel || '',
    prizeDetails: data.prizeDetails || '',
    promoCopy: data.promoCopy || '',
    propsEnabled: data.propsEnabled === true,
    pollsEnabled: data.pollsEnabled !== false, // default true
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export async function getFightNights(): Promise<FightNight[]> {
  const snap = await firestore
    .collection('fightNights')
    .orderBy('date', 'desc')
    .get()
  return snap.docs.map(mapDoc)
}

export async function getFightNight(id: string): Promise<FightNight | null> {
  if (!id) return null
  const snap = await fightNightRef(id).get()
  if (!snap.exists) return null
  return mapDoc(snap)
}

/**
 * Resolve a fight night by its public slug. Falls back to treating the param
 * as a raw doc id, so legacy/id-based URLs keep working after the slug
 * migration. Returns null if neither matches.
 */
export async function getFightNightBySlug(slug: string): Promise<FightNight | null> {
  if (!slug) return null
  const snap = await firestore
    .collection('fightNights')
    .where('slug', '==', slug)
    .limit(1)
    .get()
  if (!snap.empty) return mapDoc(snap.docs[0])
  return getFightNight(slug)
}

/**
 * Upcoming fight nights for the public calendar — `announced` events dated
 * today or later, soonest first. (Live / doors-open events are surfaced
 * separately as the "featured" night on the hub.)
 */
export async function getUpcomingFightNights(): Promise<FightNight[]> {
  const today = new Date().toISOString().slice(0, 10)
  const all = await getFightNights()
  return all
    .filter((d) => d.status === 'announced' && !!d.date && d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Past fight nights for the public archive — `completed` events, most recent
 * first. `getFightNights()` already orders by date desc.
 */
export async function getPastFightNights(limit = 12): Promise<FightNight[]> {
  const all = await getFightNights()
  return all.filter((d) => d.status === 'completed').slice(0, limit)
}

/**
 * One-time migration: assign a unique slug to every fight night that lacks
 * one. Idempotent — re-running skips nights that already have a slug. Safe to
 * trigger from an admin button or a one-off server invocation.
 */
export async function backfillFightNightSlugs(): Promise<{ updated: number }> {
  const snap = await firestore.collection('fightNights').get()
  let updated = 0
  for (const doc of snap.docs) {
    const data = doc.data() || {}
    if (data.slug) continue
    const base = buildSlugBase({
      title: data.title,
      venue: data.venue,
      date: data.date,
    })
    const slug = await ensureUniqueSlug(base, doc.id)
    await doc.ref.update({ slug, updatedAt: new Date().toISOString() })
    updated += 1
  }
  return { updated }
}

/**
 * Get the active fight night — the one users should land on right now.
 * Priority: `live` → `doors_open` → soonest `announced` within 7 days →
 * fallback to the most-recent fight night by date.
 *
 * The fallback exists because there's only one fight night being managed
 * at a time; an empty result was confusing admins who'd edit a fight night
 * outside the 7-day window and find the landing page showing nothing (or a
 * different event). The landing page always reflects the single fight night
 * the admin is working on.
 */
export async function getActiveFightNight(): Promise<FightNight | null> {
  const today = new Date().toISOString().slice(0, 10)
  const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const snap = await firestore
    .collection('fightNights')
    .orderBy('date', 'desc')
    .limit(50)
    .get()

  if (snap.empty) return null
  const docs = snap.docs.map(mapDoc)

  // Prefer in-flight events first
  const inFlight = docs.find(
    (d) => d.status === 'live' || d.status === 'doors_open'
  )
  if (inFlight) return inFlight

  // Else soonest announced within the next 7 days
  // (docs are sorted by date desc — filter then pick the earliest within window)
  const upcoming = docs
    .filter(
      (d) => d.status === 'announced' && d.date >= today && d.date <= sevenDays
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming[0]) return upcoming[0]

  // Fallback: most recent fight night by date (docs already sorted desc)
  return docs[0] || null
}

/**
 * Get the most recent completed fight night — used by landing page for "last event" recap.
 * Same single-field index pattern as getActiveFightNight.
 */
export async function getLastCompletedFightNight(): Promise<FightNight | null> {
  const snap = await firestore
    .collection('fightNights')
    .orderBy('date', 'desc')
    .limit(50)
    .get()

  if (snap.empty) return null
  for (const doc of snap.docs) {
    const fn = mapDoc(doc)
    if (fn.status === 'completed') return fn
  }
  return null
}

// ── Bout CRUD ─────────────────────────────────────────────

function mapBout(doc: FirebaseFirestore.DocumentSnapshot): FightNightBout {
  const data = doc.data() || {}
  return {
    boutNumber: data.boutNumber || parseInt(doc.id) || 0,
    fighter1Name: data.fighter1Name || '',
    fighter1Gym: data.fighter1Gym || '',
    fighter2Name: data.fighter2Name || '',
    fighter2Gym: data.fighter2Gym || '',
    weightClass: data.weightClass || '',
    isMainEvent: data.isMainEvent === true,
    status: (data.status as FightNightBout['status']) || 'scheduled',
    winnerCorner: (data.winnerCorner as FightNightBout['winnerCorner']) || null,
    startedAt: data.startedAt || null,
    completedAt: data.completedAt || null,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
  }
}

export async function getBouts(fightNightId: string): Promise<FightNightBout[]> {
  if (!fightNightId) return []
  const snap = await boutsCol(fightNightId).orderBy('boutNumber', 'asc').get()
  return snap.docs.map(mapBout)
}

export async function upsertBout(
  fightNightId: string,
  boutNumber: number,
  data: Partial<Omit<FightNightBout, 'boutNumber' | 'createdAt' | 'updatedAt'>>
): Promise<FightNightBout> {
  const ref = boutsCol(fightNightId).doc(String(boutNumber))
  const now = new Date().toISOString()
  const existing = await ref.get()

  if (existing.exists) {
    await ref.update({ ...data, updatedAt: now })
    const after = await ref.get()
    return mapBout(after)
  } else {
    const payload = {
      boutNumber,
      fighter1Name: '',
      fighter1Gym: '',
      fighter2Name: '',
      fighter2Gym: '',
      weightClass: '',
      isMainEvent: false,
      status: 'scheduled' as const,
      winnerCorner: null,
      startedAt: null,
      completedAt: null,
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    await ref.set(payload)
    return payload as FightNightBout
  }
}

export async function deleteBout(
  fightNightId: string,
  boutNumber: number
): Promise<void> {
  await boutsCol(fightNightId).doc(String(boutNumber)).delete()
}
