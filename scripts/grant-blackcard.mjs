import { readFileSync } from 'fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Parse .env.local manually to handle multiline FIREBASE_PRIVATE_KEY
function loadEnv() {
  const content = readFileSync('.env.local', 'utf8')
  const env = {}
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) {
      let val = match[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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

const EMAILS = ['jesse@434media.com', 'marcos@434media.com']

const snap = await db.collection('users')
  .where('email', 'in', EMAILS)
  .get()

if (snap.empty) {
  console.log('No users found with those emails. Existing users:')
  const all = await db.collection('users').limit(30).get()
  all.docs.forEach(d => {
    const data = d.data()
    console.log(`  ${d.id} | ${data.email} | ${data.subscriptionStatus}`)
  })
  process.exit(0)
}

for (const doc of snap.docs) {
  const data = doc.data()
  console.log(`Found: ${data.email} (${doc.id}) — current: ${data.subscriptionStatus}`)
  await doc.ref.update({
    subscriptionStatus: 'active',
    updatedAt: new Date().toISOString(),
  })
  console.log(`  ✓ Updated → active`)
}

process.exit(0)
