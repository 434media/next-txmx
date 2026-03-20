'use client'

import { useState } from 'react'
import type { VenueData } from '../actions/venues'
import { updateVenue, deleteVenue } from '../actions/venues'

const VENUE_TYPES = ['Arena', 'Convention Center', 'Casino', 'Hotel Ballroom', 'Outdoor', 'Civic Center', 'Stadium', 'Other']

const inputClass =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
const labelClass = 'text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1'

interface VenueListProps {
  venues: VenueData[]
  onUpdate?: (venue: VenueData) => void
  onDelete?: (id: string) => void
}

export default function VenueList({ venues, onUpdate, onDelete }: VenueListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'events' | 'city'>('name')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<VenueData>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = venues
    .filter(v =>
      search === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase()) ||
      v.address.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'events': return b.eventCount - a.eventCount
        case 'city': return a.city.localeCompare(b.city)
        default: return a.name.localeCompare(b.name)
      }
    })

  const handleExpand = (venue: VenueData) => {
    if (expandedId === venue.id) {
      setExpandedId(null)
      setEditData({})
    } else {
      setExpandedId(venue.id)
      setEditData({
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        capacity: venue.capacity || '',
        type: venue.type || '',
        phone: venue.phone || '',
        website: venue.website || '',
        instagram: venue.instagram || '',
        notes: venue.notes || '',
      })
    }
  }

  const handleSave = async (venue: VenueData) => {
    setSaving(true)
    try {
      await updateVenue(venue.id, editData)
      onUpdate?.({ ...venue, ...editData } as VenueData)
      setExpandedId(null)
      setEditData({})
    } catch {
      // stay open on error
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await deleteVenue(id)
      onDelete?.(id)
      setExpandedId(null)
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🏟️</div>
        <h2 className="text-lg font-semibold text-gray-700 tracking-[0.2em] mb-2">NO VENUES YET</h2>
        <p className="text-gray-400 text-[13px] leading-relaxed tracking-wide">
          Venues are automatically saved when you import TDLR event PDFs
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search venues by name, city, or address..."
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'events' | 'city')}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
        >
          <option value="name">Sort: Name</option>
          <option value="events">Sort: Most Events</option>
          <option value="city">Sort: City</option>
        </select>
      </div>

      <p className="text-gray-400 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} VENUE{filtered.length !== 1 ? 'S' : ''}
      </p>

      <div className="grid gap-3">
        {filtered.map(venue => {
          const isExpanded = expandedId === venue.id
          return (
            <div
              key={venue.id}
              className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => handleExpand(venue)}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-[15px] leading-tight tracking-wide">{venue.name}</h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed mt-0.5">{venue.city}, {venue.state}</p>
                  {(venue.type || venue.capacity) && (
                    <div className="flex gap-2 mt-1">
                      {venue.type && (
                        <span className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">{venue.type}</span>
                      )}
                      {venue.capacity && (
                        <span className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">Cap: {venue.capacity}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{venue.eventCount}</span>
                  <p className="text-gray-400 text-[10px] font-medium tracking-[0.15em]">EVENT{venue.eventCount !== 1 ? 'S' : ''}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-5 py-5 space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">LOCATION</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>NAME</label>
                        <input className={inputClass} value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>ADDRESS</label>
                        <input className={inputClass} value={editData.address || ''} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>CITY</label>
                        <input className={inputClass} value={editData.city || ''} onChange={e => setEditData(d => ({ ...d, city: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>STATE</label>
                        <input className={inputClass} value={editData.state || ''} onChange={e => setEditData(d => ({ ...d, state: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">DETAILS</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>TYPE</label>
                        <select className={inputClass} value={editData.type || ''} onChange={e => setEditData(d => ({ ...d, type: e.target.value }))}>
                          <option value="">Select type...</option>
                          {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>CAPACITY</label>
                        <input className={inputClass} placeholder="e.g. 2,500" value={editData.capacity || ''} onChange={e => setEditData(d => ({ ...d, capacity: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>PHONE</label>
                        <input className={inputClass} placeholder="(xxx) xxx-xxxx" value={editData.phone || ''} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">ONLINE</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>WEBSITE</label>
                        <input className={inputClass} placeholder="https://..." value={editData.website || ''} onChange={e => setEditData(d => ({ ...d, website: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>INSTAGRAM</label>
                        <input className={inputClass} placeholder="@handle" value={editData.instagram || ''} onChange={e => setEditData(d => ({ ...d, instagram: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">NOTES</p>
                    <textarea
                      className={`${inputClass} min-h-[60px] resize-y`}
                      placeholder="Additional notes..."
                      value={editData.notes || ''}
                      onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDelete(venue.id)}
                      disabled={deleting === venue.id}
                      className="text-red-500 text-[11px] font-semibold tracking-[0.15em] border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === venue.id ? 'DELETING...' : 'DELETE VENUE'}
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setExpandedId(null); setEditData({}) }}
                        className="text-gray-400 text-[11px] font-semibold tracking-[0.15em] px-3 py-1.5 hover:text-gray-500 transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => handleSave(venue)}
                        disabled={saving}
                        className="bg-[#FFB800] text-black text-[11px] font-semibold tracking-[0.15em] px-4 py-1.5 rounded hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
