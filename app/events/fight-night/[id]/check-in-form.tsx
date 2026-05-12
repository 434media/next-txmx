"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../lib/auth-context"
import {
  submitCheckInCode,
  isUserCheckedIn,
} from "../../../actions/fightnight-checkin"

interface CheckInFormProps {
  fightNightId: string
}

export default function CheckInForm({ fightNightId }: CheckInFormProps) {
  const { user } = useAuth()
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [checkedIn, setCheckedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      setChecking(false)
      return
    }
    let cancelled = false
    isUserCheckedIn(fightNightId, user.uid)
      .then((flag) => {
        if (!cancelled) {
          setCheckedIn(flag)
          setChecking(false)
        }
      })
      .catch(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, fightNightId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const cleaned = code.replace(/\D/g, "")
    if (cleaned.length !== 4) {
      setError("Enter the 4-digit code")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await submitCheckInCode(fightNightId, user.uid, cleaned)
      if (res.success) {
        setCheckedIn(true)
        setCode("")
      } else {
        setError(res.error || "Code is incorrect or expired")
        setCode("")
        inputRef.current?.focus()
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-5 py-4">
        <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
          Check-in
        </p>
        <p className="text-white/55 text-sm font-medium leading-6">
          Sign in to check in at the venue and qualify for the prize.
        </p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="border border-white/8 rounded-xl bg-white/2 px-5 py-4">
        <p className="text-white/40 text-sm font-medium">Checking status…</p>
      </div>
    )
  }

  if (checkedIn) {
    return (
      <div className="border border-emerald-500/30 rounded-xl bg-emerald-500/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5">
              Checked In
            </p>
            <p className="text-white text-sm font-semibold leading-5">
              You're eligible for the venue prize.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-amber-500/30 rounded-xl bg-amber-500/5 px-5 py-5">
      <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
        On-site Check-in
      </p>
      <p className="text-white text-sm font-semibold leading-6 mb-1">
        At the venue? Enter the 4-digit code from the ring announcer.
      </p>
      <p className="text-white/50 text-xs font-medium leading-5 mb-4">
        Only checked-in fans qualify for the venue prize. Codes rotate during the night.
      </p>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={code}
          onChange={(e) => {
            setError("")
            setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
          }}
          placeholder="0000"
          autoComplete="off"
          className="w-32 px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white text-2xl font-black tracking-[0.4em] tabular-nums text-center focus:outline-none focus:border-amber-500/60 placeholder:text-white/15"
        />
        <button
          type="submit"
          disabled={submitting || code.length !== 4}
          className="px-5 py-3 rounded-lg bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "…" : "Check In"}
        </button>
      </form>

      {error && <p className="mt-3 text-red-400 text-xs font-medium">{error}</p>}
    </div>
  )
}
