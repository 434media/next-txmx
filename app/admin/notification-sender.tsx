"use client"

import { useState } from "react"
import { sendPushToAll } from "../actions/notifications"

export default function NotificationSender() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("/")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    setResult(null)
    try {
      const res = await sendPushToAll(title, body, url)
      if (res.success) {
        setResult({ sent: res.sent ?? 0, failed: res.failed ?? 0 })
        setTitle("")
        setBody("")
        setUrl("/")
      }
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        Send a push notification to all subscribed users. Users must have enabled
        notifications via the bell icon in the navbar.
      </p>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fight Night is LIVE!"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="e.g. Tune in now for live results from Houston!"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Link URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="bg-amber-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Push Notification"}
        </button>

        {result && (
          <p className="text-sm font-medium">
            <span className="text-emerald-600">{result.sent} sent</span>
            {result.failed > 0 && (
              <span className="text-red-500 ml-2">{result.failed} failed</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
