"use client"

import { useAuth } from "../../lib/auth-context"
import Link from "next/link"

export default function BlackCardCta() {
  const { profile, loading } = useAuth()

  if (loading) return null

  if (profile?.subscriptionStatus === "active") {
    return (
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <p className="text-amber-500 text-sm font-semibold tracking-wider uppercase">
          Black Card Active
        </p>
      </div>
    )
  }

  return (
    <Link
      href="/checkout"
      className="min-w-[260px] inline-block text-center bg-amber-500 text-black font-semibold text-sm tracking-wide px-8 py-3 hover:bg-amber-400 transition-colors"
    >
      Get the Black Card — $14.99/mo
    </Link>
  )
}
