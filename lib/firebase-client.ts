import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
// Client must point at the same named database the admin SDK writes to.
// The server (`lib/firebase-admin.ts`) uses `getFirestore(app, 'txmx')`.
const db = getFirestore(app, 'txmx')

const googleProvider = new GoogleAuthProvider()
// No `hd` restriction — public fans need to sign in with any Google account.
// Admin access is gated separately in app/admin/admin-auth-gate.tsx by UID.
googleProvider.setCustomParameters({ prompt: "select_account" })

// Staff sign-in for /admin, kept apart from fans (Security Policy 7.4).
// Fans sign in to TXMX's own project (NEXT_PUBLIC_FIREBASE_*), where anyone
// may create an account. Staff sign in to 434's staff project
// (NEXT_PUBLIC_STAFF_FIREBASE_*, groovy-ego), where sign-up is off, and the
// server verifies admin tokens against that project only
// (lib/firebase-admin.ts staffAuth). Until the staff variables are set, staff
// use the main app, exactly as before.
const staffConfig = {
  apiKey: process.env.NEXT_PUBLIC_STAFF_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_STAFF_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_STAFF_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_STAFF_FIREBASE_APP_ID,
}
const staffApp =
  staffConfig.apiKey && staffConfig.projectId && staffConfig.projectId !== firebaseConfig.projectId
    ? getApps().find((a) => a.name === 'staff') ?? initializeApp(staffConfig, 'staff')
    : app
const staffAuth = staffApp === app ? auth : getAuth(staffApp)
const staffGoogleProvider = new GoogleAuthProvider()
staffGoogleProvider.setCustomParameters({ prompt: "select_account" })

// No browser Storage client: every upload goes through /api/admin/upload, so
// the bucket's rules can refuse writes from browsers entirely.
export { auth, db, googleProvider, staffAuth, staffGoogleProvider }
