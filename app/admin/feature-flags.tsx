'use client'

import { useState, useEffect } from 'react'
import {
  getFeatureFlags,
  setFeatureFlag,
  deleteFeatureFlag,
  type FeatureFlag,
  type FeatureFlagMap,
} from '@/app/actions/feature-flags'

export default function FeatureFlagsManager() {
  const [flags, setFlags] = useState<FeatureFlagMap | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [newFlagName, setNewFlagName] = useState('')
  const [newFlagDesc, setNewFlagDesc] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    getFeatureFlags().then(setFlags)
  }, [])

  const handleToggle = async (name: string) => {
    if (!flags) return
    const flag = flags[name]
    setSaving(name)
    const updated = { ...flag, enabled: !flag.enabled }
    await setFeatureFlag(name, updated)
    setFlags(prev => prev ? { ...prev, [name]: updated } : prev)
    setSaving(null)
  }

  const handleUpdate = async (name: string, patch: Partial<FeatureFlag>) => {
    if (!flags) return
    setSaving(name)
    const updated = { ...flags[name], ...patch }
    await setFeatureFlag(name, updated)
    setFlags(prev => prev ? { ...prev, [name]: updated } : prev)
    setSaving(null)
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete flag "${name}"?`)) return
    setSaving(name)
    await deleteFeatureFlag(name)
    setFlags(prev => {
      if (!prev) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setSaving(null)
  }

  const handleAdd = async () => {
    const key = newFlagName.trim().replace(/\s+/g, '_')
    if (!key) return
    setSaving(key)
    const flag: FeatureFlag = {
      enabled: false,
      rolloutPercent: 100,
      blackCardOnly: false,
      description: newFlagDesc.trim() || key,
    }
    await setFeatureFlag(key, flag)
    setFlags(prev => ({ ...prev, [key]: flag }))
    setNewFlagName('')
    setNewFlagDesc('')
    setShowAdd(false)
    setSaving(null)
  }

  if (!flags) {
    return <p className="text-gray-400 text-sm">Loading feature flags…</p>
  }

  const entries = Object.entries(flags).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 tracking-wide">
          Toggle features on/off, control rollout %, and restrict to Black Card holders.
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add Flag'}
        </button>
      </div>

      {/* Add new flag */}
      {showAdd && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <input
            type="text"
            placeholder="Flag name (e.g. myNewFeature)"
            value={newFlagName}
            onChange={e => setNewFlagName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB800]/40"
          />
          <input
            type="text"
            placeholder="Description"
            value={newFlagDesc}
            onChange={e => setNewFlagDesc(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB800]/40"
          />
          <button
            onClick={handleAdd}
            disabled={!newFlagName.trim()}
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40"
          >
            Create Flag
          </button>
        </div>
      )}

      {/* Flag list */}
      <div className="space-y-3">
        {entries.map(([name, flag]) => (
          <div
            key={name}
            className={`border rounded-lg p-4 transition-colors ${
              flag.enabled ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-semibold text-gray-800">{name}</code>
                  {flag.blackCardOnly && (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      Black Card
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{flag.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {saving === name && (
                  <span className="text-[10px] text-gray-400 animate-pulse">Saving…</span>
                )}
                <button
                  onClick={() => handleToggle(name)}
                  disabled={saving === name}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    flag.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      flag.enabled ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Controls row */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {/* Rollout % */}
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">Rollout %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={flag.rolloutPercent}
                  onChange={e =>
                    handleUpdate(name, { rolloutPercent: Math.min(100, Math.max(0, Number(e.target.value))) })
                  }
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FFB800]/40"
                />
              </label>

              {/* Black Card only */}
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flag.blackCardOnly}
                  onChange={e => handleUpdate(name, { blackCardOnly: e.target.checked })}
                  className="rounded border-gray-300 text-[#FFB800] focus:ring-[#FFB800]/40"
                />
                <span className="font-medium">Black Card Only</span>
              </label>

              {/* Delete */}
              <button
                onClick={() => handleDelete(name)}
                className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No feature flags configured yet.</p>
      )}
    </div>
  )
}
