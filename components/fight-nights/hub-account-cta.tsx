"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "../../lib/auth-context"
import {
  getUserSeasonStanding,
  type SeasonStanding,
} from "../../app/actions/season-standings"
import { Eyebrow } from "./section"

interface FeaturedRef {
  slug: string
  title: string
  status: string
}

interface HubAccountCtaProps {
  /** The featured event, if any — used to deep-link a signed-in fan straight
   *  into the playable night. Null when nothing is announced. */
  featured: FeaturedRef | null
}

/**
 * Persistent account on-ramp for the Fight Nights hub. Works with NO live event
 * (account creation is event-independent — Google or email/password). A live
 * "join this event" flow still lives on the per-event slug page; this is purely
 * "get an account so your picks and points follow you everywhere."
 */
export default function HubAccountCta({ featured }: HubAccountCtaProps) {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail } =
    useAuth()

  if (loading) {
    return (
      <div className="h-[168px] rounded-xl border border-neutral-200 bg-neutral-100 animate-pulse" />
    )
  }

  return user ? (
    <SignedIn featured={featured} userId={user.uid} name={user.displayName} />
  ) : (
    <SignedOut
      signInWithGoogle={signInWithGoogle}
      signUpWithEmail={signUpWithEmail}
      signInWithEmail={signInWithEmail}
    />
  )
}

// ── Signed-in: welcome + season snapshot + play CTA ──────────────────────────

function SignedIn({
  featured,
  userId,
  name,
}: {
  featured: FeaturedRef | null
  userId: string
  name: string | null
}) {
  const [standing, setStanding] = useState<SeasonStanding | null>(null)

  useEffect(() => {
    let active = true
    getUserSeasonStanding(userId)
      .then((s) => {
        if (active) setStanding(s)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [userId])

  const playable = featured && featured.status !== "completed"
  const firstName = name?.trim().split(" ")[0] || "Champ"

  return (
    <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="min-w-0">
          <Eyebrow tone="emerald" mb="mb-2">
            You&apos;re In
          </Eyebrow>
          <h2 className="text-neutral-900 text-2xl sm:text-3xl font-black uppercase tracking-tight leading-[0.95]">
            Welcome back, <span className="text-amber-600">{firstName}</span>.
          </h2>
          <p className="text-neutral-600 text-sm font-medium leading-6 mt-2">
            {standing
              ? `${(standing.points || 0).toLocaleString()} pts · ${standing.eventsPlayed || 0} ${
                  (standing.eventsPlayed || 0) === 1 ? "night" : "nights"
                } played all-time.`
              : "Your picks and points follow you to every fight night."}
          </p>
        </div>

        <div className="shrink-0">
          {playable ? (
            <Link
              href={`/fight-nights/${featured!.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              Play {featured!.status === "live" ? "Live" : "Now"} →
            </Link>
          ) : (
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-neutral-100 transition-colors whitespace-nowrap"
            >
              View Leaderboard →
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Signed-out: create-account on-ramp ───────────────────────────────────────

function SignedOut({
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
}: {
  signInWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
}) {
  const [showEmail, setShowEmail] = useState(false)
  const [mode, setMode] = useState<"signup" | "signin">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const handleGoogle = async () => {
    setBusy(true)
    setError("")
    try {
      await signInWithGoogle()
    } catch (e) {
      if (e instanceof Error && !e.message.includes("popup-closed")) {
        setError("Google sign-in failed. Try again.")
      }
    } finally {
      setBusy(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      if (mode === "signup") await signUpWithEmail(email, password)
      else await signInWithEmail(email, password)
    } catch {
      setError(
        mode === "signup"
          ? "Couldn't create that account. The email may already be in use."
          : "Invalid email or password."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
      <Eyebrow tone="amber" mb="mb-3">
        Join the Game
      </Eyebrow>
      <h2 className="text-neutral-900 text-2xl sm:text-3xl font-black uppercase tracking-tight leading-[0.95] mb-3">
        Create your free account.
      </h2>
      <p className="text-neutral-600 text-sm font-semibold leading-7 max-w-lg mb-7">
        Pick winners, call props, and climb the all-time leaderboard. One account
        plays every TXMX fight night — free to play.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-neutral-300 text-neutral-900 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-50 transition-colors rounded-md disabled:opacity-50"
        >
          <GoogleIcon className="w-4 h-4" />
          Sign up with Google
        </button>
        <button
          onClick={() => {
            setShowEmail((v) => !v)
            setError("")
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 text-neutral-900 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-100 transition-colors rounded-md"
        >
          {showEmail ? "Hide email" : "Use email"}
        </button>
      </div>

      {showEmail && (
        <form onSubmit={handleEmail} className="mt-4 max-w-lg space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-md bg-white border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full px-4 py-3 rounded-md bg-white border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors rounded-md disabled:opacity-50"
          >
            {busy
              ? "Working…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
          <p className="text-neutral-500 text-xs text-center">
            {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signup" ? "signin" : "signup"))
                setError("")
              }}
              className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>
      )}
    </section>
  )
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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
  )
}
