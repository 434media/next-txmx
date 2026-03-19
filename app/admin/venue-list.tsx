'use client'

import { useState } from 'react'

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  state: string
  eventCount: number
  createdAt: string
}

interface VenueListProps {
  venues: Venue[]
}

export default function VenueList({ venues }: VenueListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'events' | 'city'>('name')

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

  if (venues.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🏟️</div>
        <h2 className="text-lg font-semibold text-white/80 tracking-[0.2em] mb-2">NO VENUES YET</h2>
        <p className="text-white/35 text-[13px] leading-relaxed tracking-wide">
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
          className="flex-1 bg-white/4 border border-white/12 text-white text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800]/60 focus:ring-1 focus:ring-[#FFB800]/20 placeholder:text-white/25 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'events' | 'city')}
          className="bg-white/4 border border-white/12 text-white text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800]/60 rounded-md"
        >
          <option value="name">Sort: Name</option>
          <option value="events">Sort: Most Events</option>
          <option value="city">Sort: City</option>
        </select>
      </div>

      <p className="text-white/30 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} VENUE{filtered.length !== 1 ? 'S' : ''}
      </p>

      <div className="grid gap-3">
        {filtered.map(venue => (
          <div
            key={venue.id}
            className="border border-white/8 rounded-lg p-5 hover:border-white/15 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-[15px] leading-tight tracking-wide">{venue.name}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed mt-1">{venue.address}</p>
                <p className="text-white/30 text-[11px] mt-1">
                  {venue.city}, {venue.state}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{venue.eventCount}</span>
                <p className="text-white/30 text-[10px] font-medium tracking-[0.15em]">EVENT{venue.eventCount !== 1 ? 'S' : ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
