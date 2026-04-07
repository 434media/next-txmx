'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAbuseEvents,
  getActiveSuspensions,
  getTopEarners,
  suspendUser,
  liftSuspension,
  getHighSpamUsers,
  resetSpamScore,
  type AbuseEvent,
  type UserSuspension,
  type SpamScore,
} from '@/app/actions/abuse-prevention'

const EVENT_BADGES: Record<string, { color: string; label: string }> = {
  velocity_spike: { color: 'bg-red-100 text-red-700', label: 'VELOCITY' },
  community_spam: { color: 'bg-orange-100 text-orange-700', label: 'SPAM' },
  suspension_applied: { color: 'bg-purple-100 text-purple-700', label: 'SUSPENDED' },
  suspension_lifted: { color: 'bg-green-100 text-green-700', label: 'LIFTED' },
  account_age_gate: { color: 'bg-blue-100 text-blue-700', label: 'AGE GATE' },
  rapid_fire: { color: 'bg-yellow-100 text-yellow-800', label: 'RAPID' },
  spam_warning: { color: 'bg-orange-100 text-orange-700', label: 'SPAM WARN' },
  spam_auto_suspend: { color: 'bg-red-100 text-red-700', label: 'AUTO-SUSPEND' },
}

type AbuseDashTab = 'events' | 'suspensions' | 'earners' | 'spam'

export default function AbuseDashboard() {
  const [tab, setTab] = useState<AbuseDashTab>('events')
  const [events, setEvents] = useState<AbuseEvent[]>([])
  const [suspensions, setSuspensions] = useState<UserSuspension[]>([])
  const [earners, setEarners] = useState<{ userId: string; tcEarned: number; spEarned: number; date: string }[]>([])
  const [spamScores, setSpamScores] = useState<SpamScore[]>([])
  const [earnerPeriod, setEarnerPeriod] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(true)

  // Suspend modal state
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendDays, setSuspendDays] = useState<string>('7')
  const [suspendPermanent, setSuspendPermanent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadTab = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'events') {
        setEvents(await getAbuseEvents(100))
      } else if (tab === 'suspensions') {
        setSuspensions(await getActiveSuspensions())
      } else if (tab === 'earners') {
        setEarners(await getTopEarners(earnerPeriod, 20))
      } else if (tab === 'spam') {
        setSpamScores(await getHighSpamUsers(1, 50))
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [tab, earnerPeriod])

  useEffect(() => {
    loadTab()
  }, [loadTab])

  async function handleSuspend() {
    if (!suspendTarget || !suspendReason.trim()) return
    setSubmitting(true)
    try {
      await suspendUser(
        suspendTarget,
        'admin',
        suspendReason.trim(),
        suspendPermanent ? null : parseInt(suspendDays) || 7
      )
      setSuspendTarget(null)
      setSuspendReason('')
      setSuspendDays('7')
      setSuspendPermanent(false)
      await loadTab()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLift(userId: string) {
    try {
      await liftSuspension(userId, 'admin')
      setSuspensions(prev => prev.filter(s => s.userId !== userId))
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'events' as AbuseDashTab, label: '🛡️ Abuse Events' },
          { key: 'suspensions' as AbuseDashTab, label: '🚫 Suspensions' },
          { key: 'earners' as AbuseDashTab, label: '📊 Top Earners' },
          { key: 'spam' as AbuseDashTab, label: '🧮 Spam Scores' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Suspend modal */}
      {suspendTarget && (
        <div className="border-2 border-red-300 rounded-lg bg-red-50 p-5 space-y-3">
          <h3 className="text-sm font-bold text-red-800">Suspend User: {suspendTarget}</h3>
          <div>
            <label className="block text-xs font-medium text-red-700 mb-1">Reason</label>
            <input
              type="text"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              className="w-full border border-red-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40"
              placeholder="Describe the violation…"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-red-700">
              <input
                type="checkbox"
                checked={suspendPermanent}
                onChange={e => setSuspendPermanent(e.target.checked)}
                className="rounded border-red-300"
              />
              Permanent ban
            </label>
            {!suspendPermanent && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-red-700">Days:</label>
                <input
                  type="number"
                  value={suspendDays}
                  onChange={e => setSuspendDays(e.target.value)}
                  min={1}
                  max={365}
                  className="w-20 border border-red-300 rounded px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSuspend}
              disabled={submitting || !suspendReason.trim()}
              className="px-4 py-2 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Suspending…' : suspendPermanent ? 'Ban User' : `Suspend ${suspendDays}d`}
            </button>
            <button
              onClick={() => setSuspendTarget(null)}
              className="px-4 py-2 rounded text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading…</div>
      ) : tab === 'events' ? (
        /* ── Abuse Events ─── */
        events.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">No abuse events logged</div>
        ) : (
          <div className="space-y-2">
            {events.map(event => {
              const badge = EVENT_BADGES[event.type] || { color: 'bg-gray-100 text-gray-700', label: event.type }
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 bg-white flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="font-medium text-gray-800">{event.displayName}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{event.detail}</p>
                    <p className="text-[10px] text-gray-300 mt-1 font-mono">{event.userId}</p>
                  </div>
                  <button
                    onClick={() => setSuspendTarget(event.userId)}
                    className="px-2 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                    title="Suspend this user"
                  >
                    Suspend
                  </button>
                </div>
              )
            })}
          </div>
        )
      ) : tab === 'suspensions' ? (
        /* ── Suspensions ─── */
        suspensions.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">No active suspensions</div>
        ) : (
          <div className="space-y-2">
            {suspensions.map(s => (
              <div key={s.userId} className="border border-red-200 rounded-lg p-4 bg-red-50/50 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      s.status === 'banned' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status === 'banned' ? 'BANNED' : 'SUSPENDED'}
                    </span>
                    <span className="text-gray-500">
                      {s.suspendedUntil
                        ? `until ${new Date(s.suspendedUntil).toLocaleDateString()}`
                        : 'permanent'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{s.reason}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">{s.userId}</p>
                  <p className="text-[10px] text-gray-400">
                    Since {new Date(s.suspendedAt).toLocaleDateString()} · by {s.suspendedBy}
                  </p>
                </div>
                <button
                  onClick={() => handleLift(s.userId)}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors shrink-0"
                >
                  Lift
                </button>
              </div>
            ))}
          </div>
        )
      ) : tab === 'earners' ? (
        /* ── Top Earners ─── */
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setEarnerPeriod('daily')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                earnerPeriod === 'daily'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setEarnerPeriod('weekly')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                earnerPeriod === 'weekly'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              This Week
            </button>
          </div>

          {earners.length === 0 ? (
            <div className="text-gray-400 text-sm py-8 text-center">No earning data yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">User ID</th>
                  <th className="text-right py-2 text-xs font-semibold text-emerald-600">TC Earned</th>
                  <th className="text-right py-2 text-xs font-semibold text-blue-600">SP Earned</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {earners.map((e, i) => (
                  <tr key={e.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 font-mono text-xs text-gray-600">{e.userId.slice(0, 16)}…</td>
                    <td className="py-2 text-right text-emerald-600 font-semibold">{e.tcEarned.toLocaleString()}</td>
                    <td className="py-2 text-right text-blue-600 font-semibold">{e.spEarned.toLocaleString()}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => setSuspendTarget(e.userId)}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── Spam Scores ─── */
        spamScores.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">No spam scores recorded</div>
        ) : (
          <div className="space-y-2">
            {spamScores.map(s => {
              const severity =
                s.score >= 200 ? { color: 'bg-red-100 text-red-800', label: 'BANNED' }
                : s.score >= 100 ? { color: 'bg-red-100 text-red-700', label: 'HIGH' }
                : s.score >= 50 ? { color: 'bg-orange-100 text-orange-700', label: 'MEDIUM' }
                : s.score >= 25 ? { color: 'bg-yellow-100 text-yellow-800', label: 'WARNING' }
                : { color: 'bg-gray-100 text-gray-600', label: 'LOW' }

              return (
                <div key={s.userId} className="border border-gray-200 rounded-lg p-4 bg-white flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${severity.color}`}>
                        {severity.label} · {s.score} pts
                      </span>
                      {s.lastWarningAt && (
                        <span className="text-orange-500 text-[10px] font-medium">⚠ Warned</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mb-1">{s.userId}</p>
                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                      {s.signals.rateLimitHits > 0 && (
                        <span>Rate limits: <strong className="text-gray-700">{s.signals.rateLimitHits}</strong></span>
                      )}
                      {s.signals.flagsReceived > 0 && (
                        <span>Flags: <strong className="text-red-600">{s.signals.flagsReceived}</strong></span>
                      )}
                      {s.signals.duplicateContent > 0 && (
                        <span>Duplicates: <strong className="text-orange-600">{s.signals.duplicateContent}</strong></span>
                      )}
                      {s.signals.linkSpam > 0 && (
                        <span>Link spam: <strong className="text-purple-600">{s.signals.linkSpam}</strong></span>
                      )}
                      {s.signals.rapidFire > 0 && (
                        <span>Rapid fire: <strong className="text-yellow-700">{s.signals.rapidFire}</strong></span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 mt-1">
                      Last activity: {new Date(s.lastActionAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => setSuspendTarget(s.userId)}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={async () => {
                        await resetSpamScore(s.userId)
                        setSpamScores(prev => prev.filter(x => x.userId !== s.userId))
                      }}
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
