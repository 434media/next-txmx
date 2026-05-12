"use client"

import { useCallback, useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Bell, X } from "lucide-react"
import { db } from "../lib/firebase-client"
import { useAuth } from "../lib/auth-context"
import {
  getVapidPublicKey,
  savePushSubscription,
} from "../app/actions/notifications"
import type { FightNight } from "../app/actions/fightnight"

const DISMISS_KEY = "txmx-fightnight-push-prompt-dismissed-at"
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface NotificationPromptProps {
  activeFightNight: FightNight | null
}

/**
 * Bottom-corner banner that nudges a signed-in fan to enable push
 * notifications once they've made at least one pick. Replaces the
 * earlier inline full-row card so it doesn't compete with content for
 * vertical space. Renders globally so it can appear on any page, not
 * just the fight night surface.
 *
 * Six gates all have to pass before it renders: an active fight night
 * exists, the user is signed in, the browser supports push, they aren't
 * already subscribed, permission isn't denied, and they haven't
 * dismissed it in the last 30 days.
 */
export default function NotificationPrompt({ activeFightNight }: NotificationPromptProps) {
  const { user } = useAuth()
  const [hasPick, setHasPick] = useState(false)
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)

  // Capability probe — Web Notifications + service worker + push manager
  useEffect(() => {
    if (typeof window === "undefined") return
    const ok =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    setSupported(ok)
    if (ok) setPermission(Notification.permission)
  }, [])

  // 30-day dismissal window
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
      // private browsing — proceed without dismissal memory
    }
  }, [])

  // Existing subscription check
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

  // Has at least one pick on the active fight night?
  useEffect(() => {
    if (!user || !activeFightNight) {
      setHasPick(false)
      return
    }
    const q = query(
      collection(db, "fightNights", activeFightNight.id, "picks"),
      where("userId", "==", user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      setHasPick(snap.size > 0)
    })
    return () => unsub()
  }, [user, activeFightNight])

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
      // silent — the bell in the nav menu can still be used
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

  if (!activeFightNight) return null
  if (!user) return null
  if (!supported) return null
  if (subscribed) return null
  if (permission === "denied") return null
  if (dismissed) return null
  if (!hasPick) return null

  return (
    <div
      role="dialog"
      aria-labelledby="push-prompt-title"
      className="fixed bottom-3 inset-x-3 z-40 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm"
    >
      <div className="rounded-xl border border-amber-500/30 bg-black/90 backdrop-blur-md shadow-2xl">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id="push-prompt-title"
              className="text-white text-sm font-bold leading-snug"
            >
              Get a buzz when your bout starts
            </p>
            <p className="text-white/60 text-[11px] font-medium leading-snug mt-1">
              We&apos;ll ping when bouts you picked go live and when picks settle.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <button
                onClick={enable}
                disabled={busy}
                className="px-2.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
              >
                {busy ? "Enabling…" : "Turn on"}
              </button>
              <button
                onClick={dismiss}
                disabled={busy}
                className="px-2.5 py-1.5 text-white/60 hover:text-white text-[10px] font-medium tracking-wide transition-colors disabled:opacity-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 -mt-1 -mr-1 p-1 text-white/40 hover:text-white/80 transition-colors"
            aria-label="Dismiss notification prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
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
