"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import { claimDailyLogin } from "../app/actions/daily-login"

export default function DailyLoginReward() {
  const { user, refreshProfile } = useAuth()
  const [claimed, setClaimed] = useState(false)
  const [reward, setReward] = useState(0)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Check localStorage to see if already claimed today
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().slice(0, 10)
    const key = `daily_login_${user.uid}_${today}`
    if (localStorage.getItem(key)) {
      setClaimed(true)
    } else {
      setVisible(true)
    }
  }, [user])

  const handleClaim = useCallback(async () => {
    if (!user || loading || claimed) return
    setLoading(true)
    try {
      const result = await claimDailyLogin(user.uid)
      if (result.success) {
        const today = new Date().toISOString().slice(0, 10)
        localStorage.setItem(`daily_login_${user.uid}_${today}`, "1")
        setClaimed(true)
        setReward(result.reward)
        setAnimating(true)
        await refreshProfile()
        setTimeout(() => {
          setAnimating(false)
          setTimeout(() => setVisible(false), 500)
        }, 2000)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user, loading, claimed, refreshProfile])

  if (!user || !visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`bg-neutral-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${
          animating ? "scale-110" : claimed ? "opacity-0 scale-95" : "scale-100"
        }`}
      >
        {!claimed ? (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <p className="text-white text-sm font-bold">Daily Check-in</p>
              <p className="text-white/40 text-xs">
                {loading ? "Claiming..." : "Tap to earn 5 TC + 5 SP"}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-emerald-400 text-sm font-bold">+{reward} TC Earned!</p>
              <p className="text-white/40 text-xs">See you tomorrow</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
