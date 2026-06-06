import 'server-only'

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

interface SaCredential {
  projectId: string
  clientEmail: string
  privateKey: string
}

/**
 * Resolve the server service-account credential.
 *
 * Preferred: a single `GOOGLE_SERVICE_ACCOUNT_KEY` (the full SA JSON) — one key
 * powers Firestore (game system + captures) and Google Drive (gallery).
 *
 * Fallback (transitional — remove after the first clean deploy verifies the
 * consolidated key in prod): the legacy `FIREBASE_PROJECT_ID` /
 * `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` trio.
 */
function resolveCredential(): SaCredential {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (json) {
    try {
      const sa = JSON.parse(json)
      if (sa.project_id && sa.client_email && sa.private_key) {
        return {
          projectId: sa.project_id,
          clientEmail: sa.client_email,
          // JSON.parse already converts the escaped \n into real newlines.
          privateKey: sa.private_key,
        }
      }
    } catch {
      // Malformed JSON — fall through to the legacy vars below.
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^["']|["']$/g, '') // strip wrapping quotes
    .replace(/\\n/g, '\n') // convert literal \n to newlines

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase credentials. Set GOOGLE_SERVICE_ACCOUNT_KEY (preferred, full SA JSON) or the FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY trio.'
    )
  }
  return { projectId, clientEmail, privateKey }
}

function getApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }
  const { projectId, clientEmail, privateKey } = resolveCredential()
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

const app = getApp()
const firestore = getFirestore(app, 'txmx')
const auth = getAuth(app)

export { firestore, auth }
