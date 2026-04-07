'use client'

import { useState, useEffect } from 'react'
import {
  getLegacyUsers,
  searchUsers,
  setUserLegacyRank,
  type UserRecord,
} from '@/app/actions/users'

const RANK_OPTIONS: { value: UserRecord['rank']; label: string; color: string }[] = [
  { value: 'hall_of_fame', label: 'Hall of Fame', color: 'text-purple-600' },
  { value: 'champion', label: 'Champion', color: 'text-amber-600' },
  { value: 'contender', label: 'Contender', color: 'text-blue-600' },
  { value: 'rookie', label: 'Rookie', color: 'text-gray-500' },
]

const RANK_COLORS: Record<string, string> = {
  hall_of_fame: 'bg-purple-50 text-purple-700',
  champion: 'bg-amber-50 text-amber-700',
  contender: 'bg-blue-50 text-blue-700',
  rookie: 'bg-gray-50 text-gray-500',
}

export default function LegacyRankManager() {
  const [legacyUsers, setLegacyUsers] = useState<UserRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserRecord[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLegacyUsers()
      .then(setLegacyUsers)
      .finally(() => setLoading(false))
  }, [])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchUsers(searchQuery.trim())
      setSearchResults(results)
    } catch {
      // silent
    } finally {
      setSearching(false)
    }
  }

  async function handleSetLegacy(user: UserRecord, rank: UserRecord['rank']) {
    try {
      await setUserLegacyRank(user.uid, rank)
      const updated = { ...user, legacyRank: rank }
      setLegacyUsers(prev => {
        const exists = prev.some(u => u.uid === user.uid)
        if (exists) return prev.map(u => u.uid === user.uid ? updated : u)
        return [...prev, updated]
      })
      setSearchResults(prev => prev.map(u => u.uid === user.uid ? updated : u))
    } catch {
      // silent
    }
  }

  async function handleRemoveLegacy(uid: string) {
    try {
      await setUserLegacyRank(uid, null)
      setLegacyUsers(prev => prev.filter(u => u.uid !== uid))
      setSearchResults(prev => prev.map(u => u.uid === uid ? { ...u, legacyRank: null } : u))
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Legacy Rank</h2>
        <p className="text-sm text-gray-500">
          Assign permanent rank floors to OG fans. A legacy rank prevents a user&apos;s rank from ever dropping below this level.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by name, email, or UID…"
          className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded bg-[#FFB800] hover:bg-amber-500 text-black transition-colors disabled:opacity-40"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Search Results
          </div>
          {searchResults.map(user => (
            <div key={user.uid} className="flex items-center justify-between px-4 py-3 border-t border-gray-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || 'Anonymous'}
                    </span>
                    {user.legacyRank && (
                      <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${RANK_COLORS[user.legacyRank]}`}>
                        LEGACY {user.legacyRank.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email || user.uid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user.legacyRank ? (
                  <button
                    onClick={() => handleRemoveLegacy(user.uid)}
                    className="text-xs font-medium px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <select
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) handleSetLegacy(user, e.target.value as UserRecord['rank'])
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    <option value="" disabled>Assign Legacy…</option>
                    {RANK_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legacy users list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Legacy Rank Holders ({legacyUsers.length})
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : legacyUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No legacy rank holders yet.</div>
        ) : (
          legacyUsers.map(user => (
            <div key={user.uid} className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || 'Anonymous'}
                    </span>
                    {user.legacyRank && (
                      <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${RANK_COLORS[user.legacyRank]}`}>
                        LEGACY {user.legacyRank.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email || user.uid}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveLegacy(user.uid)}
                className="text-xs font-medium px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
