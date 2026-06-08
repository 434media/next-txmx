"use client"

import { useState } from "react"
import { signInWithCustomToken, updateProfile } from "firebase/auth"
import { auth } from "../../../lib/firebase-client"
import { getOrCreateUser } from "../../actions/users"
import { ensureStanding } from "../../actions/fightnight-standings"
import { createGuestSessionToken } from "../../actions/guest-session"

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

interface WalkInFormProps {
  fightNightId: string | null
}

export default function WalkInForm({ fightNightId }: WalkInFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) return setError("Enter your name")
    if (!EMAIL_PATTERN.test(trimmedEmail)) return setError("Enter a valid email")
    if (!fightNightId) return setError("Event isn't live yet — try again in a moment")

    setSubmitting(true)
    try {
      const session = await createGuestSessionToken(trimmedEmail, trimmedName)
      if (!session.success || !session.token) {
        setError(session.error || "Could not sign you in")
        setSubmitting(false)
        return
      }
      const cred = await signInWithCustomToken(auth, session.token)
      await updateProfile(cred.user, { displayName: trimmedName })
      await getOrCreateUser(cred.user.uid, trimmedEmail, trimmedName, null)
      await ensureStanding(fightNightId, cred.user.uid, {
        displayName: trimmedName,
        photoURL: null,
        email: trimmedEmail,
      })
      // AuthContext picks up the new user and re-renders into the game grid.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="walkin-name" className="block text-neutral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
          Your Name
        </label>
        <input
          id="walkin-name"
          type="text"
          value={name}
          onChange={(e) => {
            setError(null)
            setName(e.target.value)
          }}
          placeholder="Alex"
          autoComplete="name"
          disabled={submitting}
          className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-md text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="walkin-email" className="block text-neutral-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
          Email
        </label>
        <input
          id="walkin-email"
          type="email"
          value={email}
          onChange={(e) => {
            setError(null)
            setEmail(e.target.value)
          }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={submitting}
          className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-md text-neutral-900 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Setting You Up…" : "Start Playing"}
      </button>

      {error && (
        <p role="alert" className="text-red-600 text-xs font-medium">
          {error}
        </p>
      )}

      <p className="text-neutral-400 text-[10px] leading-relaxed pt-1">
        We use your email to notify you if you win — no spam, no follow-up unless you opt in.
      </p>
    </form>
  )
}
