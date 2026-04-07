'use client'

import { useState, useEffect } from 'react'
import {
  getVerifiedUsers,
  searchUsers,
  setUserVerified,
  type UserRecord,
} from '@/app/actions/users'

export default function VerifiedManager() {
  const [verified, setVerified] = useState<UserRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserRecord[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVerifiedUsers()
      .then(setVerified)
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

  async function handleVerify(user: UserRecord) {
    try {
      await setUserVerified(user.uid, true)
      setVerified(prev => [...prev, { ...user, isVerified: true }])
      setSearchResults(prev => prev.map(u => u.uid === user.uid ? { ...u, isVerified: true } : u))
    } catch {
      // silent
    }
  }

  async function handleUnverify(uid: string) {
    try {
      await setUserVerified(uid, false)
      setVerified(prev => prev.filter(u => u.uid !== uid))
      setSearchResults(prev => prev.map(u => u.uid === uid ? { ...u, isVerified: false } : u))
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Verified Accounts</h2>
        <p className="text-sm text-gray-500">
          Manage verified badges for fighters, promoters, and notable accounts.
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
                    {user.isVerified && (
                      <span className="text-green-600 text-[10px] font-bold tracking-wider">✓ VERIFIED</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email || user.uid}</p>
                </div>
              </div>
              <div className="shrink-0">
                {user.isVerified ? (
                  <button
                    onClick={() => handleUnverify(user.uid)}
                    className="text-xs font-medium px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => handleVerify(user)}
                    className="text-xs font-medium px-3 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verified users list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Currently Verified ({verified.length})
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : verified.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No verified accounts yet.</div>
        ) : (
          verified.map(user => (
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
                    <span className="text-green-600 text-[10px] font-bold tracking-wider">✓ VERIFIED</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email || user.uid}</p>
                </div>
              </div>
              <button
                onClick={() => handleUnverify(user.uid)}
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
