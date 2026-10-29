'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../../lib/firebase-client'

interface AdminAuthGateProps {
  children: React.ReactNode
  /** Email on the verified server-side admin session, or null if none. */
  sessionEmail: string | null
}

type Access = 'checking' | 'denied' | 'error'

const SESSION_ENDPOINT = '/api/admin/session'

/** Clear the httpOnly admin session cookie. Best effort. */
export async function clearAdminSession(): Promise<void> {
  try {
    await fetch(SESSION_ENDPOINT, { method: 'DELETE' })
  } catch {
    // Network failure — the cookie still expires on its own.
  }
}

/**
 * Client-side sign-in UI for /admin. This is presentation only: the server
 * decides who is an admin (verified email on ADMIN_EMAILS) when the ID token
 * is exchanged for a session cookie, and re-checks that cookie on every page
 * render, admin action and /api/admin request.
 */
export default function AdminAuthGate({ children, sessionEmail }: AdminAuthGateProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [access, setAccess] = useState<Access>('checking')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Read the latest server session from inside the auth listener without
  // re-subscribing it on every refresh.
  const sessionEmailRef = useRef(sessionEmail)
  useEffect(() => {
    sessionEmailRef.current = sessionEmail
  }, [sessionEmail])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setError('')
      setAccess('checking')
      setLoading(false)

      if (!firebaseUser) {
        // Signed out of Firebase: drop any admin session this browser holds.
        if (sessionEmailRef.current) {
          await clearAdminSession()
          router.refresh()
        }
        return
      }

      const userEmail = firebaseUser.email?.toLowerCase() ?? null
      if (userEmail && userEmail === sessionEmailRef.current) return

      // No session for this user yet: exchange the ID token for one. The
      // server answers 403 for anyone not on the allowlist.
      try {
        const idToken = await firebaseUser.getIdToken()
        const res = await fetch(SESSION_ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (res.ok) {
          // Re-render the server tree so the page loads its data under the
          // new session cookie.
          router.refresh()
        } else if (res.status === 403) {
          setAccess('denied')
        } else {
          setAccess('error')
          setError('Could not start an admin session. Please sign in again.')
        }
      } catch {
        setAccess('error')
        setError('Could not reach the server. Please try again.')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await clearAdminSession()
    await signOut(auth)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err instanceof Error && !err.message.includes('popup-closed')) {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigningIn(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 text-xs tracking-widest">LOADING</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16 admin-selection-fix">
        <div className="max-w-sm w-full px-8">
          <div className="text-center space-y-6">
            <div>
              <p className="text-gray-300 text-[10px] font-semibold tracking-[0.3em] mb-2">
                TXMX BOXING
              </p>
              <h1 className="text-gray-900 text-2xl font-bold tracking-[0.15em]">
                ADMIN PORTAL
              </h1>
              <div className="mt-2 h-px w-10 bg-gray-900/60 mx-auto" />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed tracking-tight">
              Sign in to access the admin dashboard.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/30 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/30 transition-colors"
              />
              <button
                type="submit"
                disabled={signingIn}
                className="w-full bg-gray-900 text-white font-medium text-sm tracking-wide px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-300 text-[10px] tracking-wider">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-medium text-sm tracking-wide px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingIn ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <p className="text-gray-300 text-[10px] tracking-wider">
              AUTHORIZED ACCOUNTS ONLY
            </p>
          </div>
        </div>
      </div>
    )
  }

  const authorized =
    !!sessionEmail && user.email?.toLowerCase() === sessionEmail

  if (authorized) {
    return <>{children}</>
  }

  if (access === 'denied' || access === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-16 admin-selection-fix">
        <div className="max-w-sm w-full px-8">
          <div className="text-center space-y-6">
            <div>
              <p className="text-gray-300 text-[10px] font-semibold tracking-[0.3em] mb-2">
                TXMX BOXING
              </p>
              <h1 className="text-gray-900 text-2xl font-bold tracking-[0.15em]">
                {access === 'denied' ? 'NOT AUTHORIZED' : 'SIGN-IN ERROR'}
              </h1>
              <div className="mt-2 h-px w-10 bg-gray-900/60 mx-auto" />
            </div>

            {access === 'denied' ? (
              <p className="text-gray-400 text-sm leading-relaxed tracking-tight">
                {user.email ? (
                  <>
                    <span className="text-gray-900">{user.email}</span> does not have
                    admin access.
                  </>
                ) : (
                  'This account does not have admin access.'
                )}{' '}
                Admin accounts must be on the allowlist and have a verified email.
              </p>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="w-full bg-gray-900 text-white font-medium text-sm tracking-wide px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Session exchange or page refresh in flight.
  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-400 text-xs tracking-widest">VERIFYING ACCESS</p>
      </div>
    </div>
  )
}

export function useAdminAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await clearAdminSession()
    await signOut(auth)
    router.refresh()
  }

  return { user, signOut: handleSignOut }
}
