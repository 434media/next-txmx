"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Bell, X } from "lucide-react"
import { db } from "../../../../lib/firebase-client"
import { useAuth } from "../../../../lib/auth-context"
import {
  getVapidPublicKey,
  savePushSubscription,
} from "../../../actions/notifications"

const DISMISS_KEY = "txmx-fightnight-push-prompt-dismissed-at"
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface NotificationPromptProps {
  fightNightId: string
}

/**
 * Soft inline nudge to enable push notifications. Renders only after the
 * signed-in user has placed at least one pick on the active fight night,
 * and only when they aren't already subscribed and haven't dismissed
 * recently. Avoids cold-asking for permission.
 */
export default function NotificationPrompt({ fightNightId }: NotificationPromptProps) {
  const { user } = useAuth()
  const [hasPick, setHasPick] = useState(false)
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)

  // Capability + permission probe
  useEffect(() => {
    if (typeof window === "undefined") return
    const ok =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    setSupported(ok)
    if (ok) setPermission(Notification.permission)
  }, [])

  // Dismissal window check
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY)
      if (!raw) return
      const ts = parseInt(raw, 10)
      if (Number.isFinite(ts) && Date.now() - ts < DISMISS_TTL_MS) {
        setDismissed(true)
      }
    } catch {
      // ignore (private browsing, etc.)
    }
  }, [])

  // Already subscribed?
  useEffect(() => {
    if (!supported) return
    let cancelled = false
    ;(async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setSubscribed(!!sub)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supported])

  // Has at least one pick on this event?
  useEffect(() => {
    if (!user) {
      setHasPick(false)
      return
    }
    const q = query(
      collection(db, "fightNights", fightNightId, "picks"),
      where("userId", "==", user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      setHasPick(snap.size > 0)
    })
    return () => unsub()
  }, [user, fightNightId])

  const enable = useCallback(async () => {
    if (!user) return
    setBusy(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") {
        setBusy(false)
        return
      }
      const vapidKey = await getVapidPublicKey()
      if (!vapidKey) {
        setBusy(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      })
      const json = sub.toJSON()
      if (json.endpoint && json.keys) {
        await savePushSubscription(user.uid, {
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh!, auth: json.keys.auth! },
        })
        setSubscribed(true)
      }
    } catch {
      // silent — user can retry via the bell in the nav
    } finally {
      setBusy(false)
    }
  }, [user])

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore
    }
  }

  // Render gates — every one of these must pass
  if (!user) return null
  if (!supported) return null
  if (subscribed) return null
  if (permission === "denied") return null
  if (dismissed) return null
  if (!hasPick) return null

  return (
    <div className="mb-10 border border-amber-500/30 rounded-xl bg-amber-500/5 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber-400" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-bold leading-snug">
            Get a buzz when your bout starts
          </p>
          <p className="text-white/60 text-xs font-medium leading-5 mt-1">
            We&apos;ll ping you when bouts you picked go live, and when your
            picks settle. Just for tonight — no follow-up spam.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={enable}
              disabled={busy}
              className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              {busy ? "Enabling…" : "Turn on"}
            </button>
            <button
              onClick={dismiss}
              disabled={busy}
              className="px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 text-white/55 hover:text-white text-[11px] font-medium tracking-wide transition-colors disabled:opacity-50"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 -mt-1 -mr-1 p-1 text-white/35 hover:text-white/80 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}
