/**
 * Seed the BOXR Station "Members Only Fight Night" — fight night doc + 8 bouts.
 *
 * Usage (run from project root, same pattern as scripts/grant-blackcard.mjs):
 *   node scripts/seed-boxr-fight-night.mjs                       # default — May 14, 2026
 *   FN_DATE=2026-05-14 node scripts/seed-boxr-fight-night.mjs    # custom date
 *
 * Idempotent: if a fight night with the same title already exists in the
 * `fightNights` collection, the script updates it in place and re-upserts the
 * 8 bouts (so it's safe to re-run after editing the bout data below).
 *
 * The script DOES NOT change the status field on re-runs — flip status from
 * the admin UI when you're ready to take it from `announced` → `doors_open`.
 */

import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ── env loader (matches the existing scripts pattern) ────────

function loadEnv() {
  const content = readFileSync('.env.local', 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) {
      let val = match[2].trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      env[match[1]] = val
    }
  }
  return env
}

const env = loadEnv()
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})
const db = getFirestore(app, 'txmx')

// ── Seed data — pulled from the BOXR Station flyer ───────────

const FIGHT_NIGHT_TITLE = 'Members Only Fight Night'

const eventDate = process.env.FN_DATE || '2026-05-14'

const fightNightData = {
  title: FIGHT_NIGHT_TITLE,
  subtitle: 'BOXR Station Presents',
  venue: 'BOXR Station',
  city: 'San Antonio',
  address: '',
  date: eventDate,
  doorsAt: '',
  firstBellAt: '',
  status: 'announced',
  flyerUrl: 'https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Ffightnight.PNG?alt=media',
  prizeLabel: 'BOXR Station prize pack',
  prizeDetails: 'Top finisher on the leaderboard at the end of the night takes home a prize from BOXR Station.',
  promoCopy:
    'Eight bouts. One night. Pick winners live, climb the leaderboard, and win prizes from the venue. Free to play — no Black Card needed for fight night.',
  propsEnabled: true,
  pollsEnabled: true,
}

// ── Props — common boxing predictions ────────────────────────
//
// Per-bout props apply to every bout (titled with the matchup substituted in).
// Event-wide props span the whole card.
//
// Using deterministic doc IDs (`bout-${n}-method`, `event-stoppage-count`)
// so re-running the script updates existing props instead of duplicating.

const PROPS_PER_BOUT = [
  {
    suffix: 'method',
    title: 'How does {matchup} end?',
    description: 'Pick the most likely outcome — amateur cards trend toward decisions.',
    options: [
      { id: 'decision', label: 'Decision (judges call it)' },
      { id: 'stoppage', label: 'Stoppage (KO / TKO / ref stops it)' },
      { id: 'draw', label: 'Draw or No Contest' },
    ],
    pointsReward: 500,
  },
  {
    suffix: 'distance',
    title: 'Does {matchup} go all 3 rounds?',
    description: 'Yes if both fighters hear the final bell.',
    options: [
      { id: 'yes', label: 'Yes — full 3 rounds' },
      { id: 'no', label: 'No — ends early' },
    ],
    pointsReward: 300,
  },
]

const EVENT_PROPS = [
  {
    id: 'event-stoppage-count',
    title: 'How many bouts end by stoppage tonight?',
    description: 'Pick the over/under range across all 8 fights on the card.',
    options: [
      { id: 'low', label: '0-2 stoppages' },
      { id: 'mid', label: '3-5 stoppages' },
      { id: 'high', label: '6+ stoppages' },
    ],
    pointsReward: 1000,
  },
  {
    id: 'event-first-round-finish',
    title: 'Will any bout end in the 1st round?',
    description: 'Yes if a single fight on the card ends inside round 1.',
    options: [
      { id: 'yes', label: 'Yes — at least one' },
      { id: 'no', label: 'No — none' },
    ],
    pointsReward: 750,
  },
  {
    id: 'event-main-event',
    title: 'Main event: Gomez vs Paez — who takes it?',
    description: 'Scribner Boxing vs Alamo City Boxing in the headliner.',
    options: [
      { id: 'gomez', label: 'David Gomez (Scribner)' },
      { id: 'paez', label: 'Christian "Sonic" Paez (Alamo City)' },
      { id: 'draw', label: 'Draw' },
    ],
    pointsReward: 500,
  },
]

// ── Polls — crowd engagement (no points, just vibes + TC for voting) ──
//
// Mix of opening polls (always-on crowd warmup), bout-tagged vibe checks,
// and late-event recap polls (admin opens these during the night).

const POLLS = [
  // ── Opening crowd warmup ────────────────────────────────────
  {
    id: 'opening-into-boxing',
    question: 'What got you into boxing?',
    options: [
      'Grew up in the sport',
      'Family or a friend',
      'A specific fighter I follow',
      'Movies / TV',
      'Just stumbled in tonight',
    ],
    boutNumber: null,
  },
  {
    id: 'opening-favorite-part',
    question: "What's your favorite part of fight night?",
    options: [
      'The knockouts',
      'The close decisions',
      'The atmosphere',
      'The walkouts',
    ],
    boutNumber: null,
  },
  {
    id: 'opening-first-time',
    question: 'First time at BOXR Station?',
    options: [
      'Yes — first time',
      "No — I'm a regular",
      'I train here',
    ],
    boutNumber: null,
  },
  {
    id: 'opening-corner-loyalty',
    question: 'Which corner are you cheering for tonight?',
    options: [
      'Red corner all night',
      'Blue corner energy',
      "Whoever's winning",
      'Cheering for both — boxing wins',
    ],
    boutNumber: null,
  },

  // ── Bout-tagged vibe checks ─────────────────────────────────
  {
    id: 'bout-1-vibes',
    question: 'Main event vibe check — Gomez vs Paez, who you got?',
    options: [
      'David Gomez (Scribner)',
      'Christian "Sonic" Paez (Alamo City)',
      'Too close to call',
    ],
    boutNumber: 1,
  },
  {
    id: 'bout-8-vibes',
    question: 'Bout 8 vibe check — Olivares vs Teran, your pick?',
    options: [
      'Kaylee Olivares (Anzures)',
      'Adrienne Teran (Top Dog)',
      'Too close to call',
    ],
    boutNumber: 8,
  },

  // ── Recap polls (open these mid/late event) ─────────────────
  {
    id: 'night-fight-of-night',
    question: 'Fight of the night?',
    options: [
      'Bout 1 — Gomez vs Paez',
      'Bout 2 — Zamora vs Escobar',
      'Bout 3 — Cardenas vs Hernandez',
      'Bout 4 — Martinez vs Hernandez',
      'Bout 5 — Rodriguez vs Guerrero',
      'Bout 6 — Fernandez vs Amaya',
      'Bout 7 — Cruz vs Chissem',
      'Bout 8 — Olivares vs Teran',
    ],
    boutNumber: null,
  },
  {
    id: 'night-best-gym',
    question: 'Which gym put on the best show tonight?',
    options: [
      'Scribner Boxing',
      'Alamo City Boxing',
      'South Park Boxing Academy',
      'Leija Boxing / Leija BXF',
      'Top Dog Boxing',
      'Randazzo Boxing Club',
      'Beast Athletics Boxing',
      'Anzures Boxing Team',
      'Other',
    ],
    boutNumber: null,
  },
  {
    id: 'night-comeback-fans',
    question: 'Coming back next time?',
    options: [
      'Already booked',
      'Definitely',
      'If a friend pulls me in',
      'Maybe',
    ],
    boutNumber: null,
  },
]

const bouts = [
  {
    boutNumber: 1,
    fighter1Name: 'David Gomez',
    fighter1Gym: 'Scribner Boxing',
    fighter2Name: 'Christian "Sonic" Paez',
    fighter2Gym: 'Alamo City Boxing',
    weightClass: '',
    isMainEvent: true,
  },
  {
    boutNumber: 2,
    fighter1Name: 'Justin Zamora',
    fighter1Gym: 'South Park Boxing Academy',
    fighter2Name: 'Elliott Escobar',
    fighter2Gym: 'Leija Boxing',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 3,
    fighter1Name: 'Parker Cardenas',
    fighter1Gym: 'Leija BXF',
    fighter2Name: 'Jose Hernandez',
    fighter2Gym: 'Boxers and Brawlers',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 4,
    fighter1Name: 'Sergio Martinez',
    fighter1Gym: 'Top Dog Boxing',
    fighter2Name: 'Viggo Hernandez',
    fighter2Gym: 'The Box-Scene Academy',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 5,
    fighter1Name: 'Adrian Rodriguez',
    fighter1Gym: 'Randazzo Boxing Club',
    fighter2Name: 'Joe Guerrero',
    fighter2Gym: 'Daniel Leija Boxing',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 6,
    fighter1Name: 'Jason Fernandez',
    fighter1Gym: 'South Park Boxing Academy',
    fighter2Name: 'Stevan Amaya',
    fighter2Gym: 'Top Dog Boxing',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 7,
    fighter1Name: 'Juan Cruz',
    fighter1Gym: 'Beast Athletics Boxing',
    fighter2Name: 'Jason Chissem',
    fighter2Gym: 'Ramos Boxing Club',
    weightClass: '',
    isMainEvent: false,
  },
  {
    boutNumber: 8,
    fighter1Name: 'Kaylee Olivares',
    fighter1Gym: 'Anzures Boxing Team',
    fighter2Name: 'Adrienne Teran',
    fighter2Gym: 'Top Dog Boxing',
    weightClass: '',
    isMainEvent: false,
  },
]

// ── Upsert fight night ───────────────────────────────────────

console.log(`\nSeeding: ${FIGHT_NIGHT_TITLE} (date: ${eventDate})\n`)

const existingSnap = await db
  .collection('fightNights')
  .where('title', '==', FIGHT_NIGHT_TITLE)
  .limit(1)
  .get()

const now = new Date().toISOString()
let fightNightId

if (existingSnap.empty) {
  // Create new
  const ref = await db.collection('fightNights').add({
    ...fightNightData,
    createdAt: now,
    updatedAt: now,
  })
  fightNightId = ref.id
  console.log(`✓ Created new fight night: ${fightNightId}`)
} else {
  // Update in place — but preserve existing status (admin may have flipped it already)
  const existing = existingSnap.docs[0]
  fightNightId = existing.id
  const existingData = existing.data()
  await existing.ref.update({
    ...fightNightData,
    status: existingData.status || 'announced', // preserve current status
    flyerUrl: existingData.flyerUrl || fightNightData.flyerUrl, // preserve admin-set flyer
    updatedAt: now,
  })
  console.log(`↺ Updated existing fight night: ${fightNightId} (preserved status="${existingData.status}")`)
}

// ── Upsert the 8 bouts ───────────────────────────────────────

console.log(`\nUpserting ${bouts.length} bouts:\n`)

for (const bout of bouts) {
  const boutRef = db
    .collection('fightNights')
    .doc(fightNightId)
    .collection('bouts')
    .doc(String(bout.boutNumber))

  const existing = await boutRef.get()
  if (existing.exists) {
    // Preserve status / winnerCorner / completedAt if admin has already touched it
    const existingData = existing.data()
    await boutRef.update({
      ...bout,
      status: existingData.status || 'scheduled',
      winnerCorner: existingData.winnerCorner || null,
      startedAt: existingData.startedAt || null,
      completedAt: existingData.completedAt || null,
      updatedAt: now,
    })
    console.log(
      `  ↺  #${bout.boutNumber} ${bout.fighter1Name} vs ${bout.fighter2Name}` +
        (existingData.status !== 'scheduled' ? `  [preserved: ${existingData.status}]` : '')
    )
  } else {
    await boutRef.set({
      ...bout,
      status: 'scheduled',
      winnerCorner: null,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`  +  #${bout.boutNumber} ${bout.fighter1Name} vs ${bout.fighter2Name}`)
  }
}

// ── Upsert props ─────────────────────────────────────────────

console.log(`\nUpserting props:\n`)

async function upsertProp(propId, payload) {
  const ref = db
    .collection('fightNights')
    .doc(fightNightId)
    .collection('props')
    .doc(propId)

  const existing = await ref.get()

  if (existing.exists) {
    const existingData = existing.data()
    // Preserve admin actions (status changes, settlement) on re-run
    await ref.update({
      ...payload,
      status: existingData.status || 'open',
      correctOptionId: existingData.correctOptionId ?? null,
      settledAt: existingData.settledAt ?? null,
      updatedAt: now,
    })
    const note =
      existingData.status && existingData.status !== 'open'
        ? `  [preserved: ${existingData.status}]`
        : ''
    console.log(`  ↺  ${propId}${note}`)
  } else {
    await ref.set({
      ...payload,
      status: 'open',
      correctOptionId: null,
      settledAt: null,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`  +  ${propId}`)
  }
}

// Per-bout props
for (const bout of bouts) {
  const matchup = `${bout.fighter1Name} vs ${bout.fighter2Name}`
  for (const template of PROPS_PER_BOUT) {
    const propId = `bout-${bout.boutNumber}-${template.suffix}`
    await upsertProp(propId, {
      title: template.title.replace('{matchup}', matchup),
      description: template.description,
      options: template.options,
      pointsReward: template.pointsReward,
      isUnderdog: false,
      boutNumber: bout.boutNumber,
    })
  }
}

// Event-wide props
for (const template of EVENT_PROPS) {
  await upsertProp(template.id, {
    title: template.title,
    description: template.description,
    options: template.options,
    pointsReward: template.pointsReward,
    isUnderdog: false,
    boutNumber: null,
  })
}

// ── Upsert polls ─────────────────────────────────────────────

console.log(`\nUpserting polls:\n`)

async function upsertPoll(pollId, template) {
  const ref = db
    .collection('fightNights')
    .doc(fightNightId)
    .collection('polls')
    .doc(pollId)

  const existing = await ref.get()

  if (existing.exists) {
    // Preserve admin actions (status changes) and accumulated votes on re-run.
    // Only refresh the question + boutNumber metadata.
    const existingData = existing.data()
    await ref.update({
      question: template.question,
      boutNumber: template.boutNumber,
    })
    const voteSummary = existingData.totalVotes
      ? ` [${existingData.totalVotes} votes, ${existingData.status}]`
      : ''
    console.log(`  ↺  ${pollId}${voteSummary}`)
  } else {
    await ref.set({
      question: template.question,
      options: template.options.map((label) => ({ label, votes: 0 })),
      totalVotes: 0,
      status: 'open',
      boutNumber: template.boutNumber,
      createdAt: now,
      closedAt: null,
    })
    console.log(`  +  ${pollId}`)
  }
}

for (const template of POLLS) {
  await upsertPoll(template.id, template)
}

// ── Done ─────────────────────────────────────────────────────

const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

console.log('\n────────────────────────────────────────────────────────')
console.log('Done.')
console.log('')
console.log(`Fight Night ID:  ${fightNightId}`)
console.log(`Public URL:      ${baseUrl}/events/fight-night`)
console.log(`Admin:           ${baseUrl}/admin → Fight Nights → select`)
console.log('')
console.log(`Seeded ${bouts.length} bouts + ${bouts.length * PROPS_PER_BOUT.length + EVENT_PROPS.length} props + ${POLLS.length} polls`)
console.log('  · Props: 2 per bout (method + distance), 3 event-wide')
console.log('  · Polls: 4 opening, 2 bout-tagged vibe checks, 3 recap')
console.log('')
console.log('Next steps:')
console.log('  1. Flyer URL is already seeded — verify in admin → Fight Nights → Setup')
console.log('  2. Add doors-at / first-bell timestamps in admin → Setup')
console.log('  3. Tweak / delete / add props in admin → Props tab')
console.log('  4. Flip status: announced → doors_open (~30 min before first bell)')
console.log('  5. Rotate check-in code from the Live tab before announcing it from the ring')
console.log('  6. Mark each bout Live + Record result as they happen')
console.log('  7. After bout 8: settle remaining props, Award Top N, Send Winner Emails')
console.log('────────────────────────────────────────────────────────\n')

process.exit(0)
