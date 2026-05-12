import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

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
const storage = getStorage(app)

const googleProvider = new GoogleAuthProvider()
// No `hd` restriction — public fans need to sign in with any Google account.
// Admin access is gated separately in app/admin/admin-auth-gate.tsx by UID.
googleProvider.setCustomParameters({ prompt: "select_account" })

export { auth, db, storage, googleProvider }
