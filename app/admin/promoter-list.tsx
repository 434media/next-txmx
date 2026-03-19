'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'

interface PromoterListProps {
  fighters: Fighter[]
  eventPromoters: { name: string; eventCount: number }[]
}

interface PromoterEntry {
  name: string
  fighters: Fighter[]
  eventCount: number
}

export default function PromoterList({ fighters, eventPromoters }: PromoterListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'fighters' | 'events'>('events')

  // Aggregate promoters from fighter data
  const promoterMap = new Map<string, Fighter[]>()
  for (const f of fighters) {
    if (f.promoter) {
      const key = f.promoter.trim()
      if (!promoterMap.has(key)) promoterMap.set(key, [])
      promoterMap.get(key)!.push(f)
    }
  }

  // Merge with event-level promoters
  const allNames = new Set([
    ...promoterMap.keys(),
    ...eventPromoters.map(p => p.name),
  ])

  const promoters: PromoterEntry[] = Array.from(allNames).map(name => ({
    name,
    fighters: promoterMap.get(name) || [],
    eventCount: eventPromoters.find(p => p.name === name)?.eventCount || 0,
  }))

  const filtered = promoters
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.fighters.some(f => `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'fighters': return b.fighters.length - a.fighters.length
        case 'events': return b.eventCount - a.eventCount
        default: return a.name.localeCompare(b.name)
      }
    })

  if (promoters.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🎤</div>
        <h2 className="text-lg font-semibold text-white/80 tracking-[0.2em] mb-2">NO PROMOTERS YET</h2>
        <p className="text-white/35 text-[13px] leading-relaxed tracking-wide">
          Promoters are captured from TDLR imports and fighter profiles
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
          placeholder="Search promoters or fighters..."
          className="flex-1 bg-white/[0.04] border border-white/[0.12] text-white text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800]/60 focus:ring-1 focus:ring-[#FFB800]/20 placeholder:text-white/25 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'fighters' | 'events')}
          className="bg-white/[0.04] border border-white/[0.12] text-white text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800]/60 rounded-md"
        >
          <option value="events">Sort: Most Events</option>
          <option value="fighters">Sort: Most Fighters</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <p className="text-white/30 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} PROMOTER{filtered.length !== 1 ? 'S' : ''}
      </p>

      <div className="grid gap-3">
        {filtered.map(promoter => (
          <div
            key={promoter.name}
            className="border border-white/[0.08] rounded-lg p-5 hover:border-white/[0.15] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold text-[15px] leading-tight tracking-wide">{promoter.name}</h3>
              <div className="flex gap-6 flex-shrink-0 ml-4 text-right">
                <div>
                  <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{promoter.eventCount}</span>
                  <p className="text-white/30 text-[10px] font-medium tracking-[0.15em]">EVENT{promoter.eventCount !== 1 ? 'S' : ''}</p>
                </div>
                <div>
                  <span className="text-white font-mono text-lg font-semibold tabular-nums">{promoter.fighters.length}</span>
                  <p className="text-white/30 text-[10px] font-medium tracking-[0.15em]">FIGHTER{promoter.fighters.length !== 1 ? 'S' : ''}</p>
                </div>
              </div>
            </div>
            {promoter.fighters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {promoter.fighters.map(f => (
                  <span
                    key={f.id}
                    className="text-[11px] bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded text-white/60 leading-none"
                  >
                    {f.firstName} {f.lastName}
                    <span className="text-white/25 ml-1 font-mono tabular-nums">
                      {f.record.wins}-{f.record.losses}-{f.record.draws}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
