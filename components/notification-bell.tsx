"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth-context"
import {
  savePushSubscription,
  removePushSubscription,
  getVapidPublicKey,
} from "../app/actions/notifications"

export default function NotificationBell() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Check if already subscribed
  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator)) return
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    }
    check()
  }, [])

  const subscribe = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") {
        setLoading(false)
        return
      }

      const vapidKey = await getVapidPublicKey()
      if (!vapidKey) {
        setLoading(false)
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
          keys: {
            p256dh: json.keys.p256dh!,
            auth: json.keys.auth!,
          },
        })
        setSubscribed(true)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  const unsubscribe = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      await removePushSubscription(user.uid)
      setSubscribed(false)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  // Don't render if no push support or not logged in
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator) || !user) {
    return null
  }

  if (permission === "denied") {
    return (
      <button
        disabled
        className="relative p-2 text-white/20 cursor-not-allowed"
        title="Notifications blocked"
      >
        <BellIcon />
      </button>
    )
  }

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={`relative p-2 transition-colors ${
        subscribed
          ? "text-amber-500 hover:text-amber-400"
          : "text-white/50 hover:text-white/80"
      }`}
      title={subscribed ? "Disable notifications" : "Enable notifications"}
    >
      <BellIcon />
      {subscribed && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
      )}
    </button>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}
