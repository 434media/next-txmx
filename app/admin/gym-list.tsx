'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'

interface GymListProps {
  fighters: Fighter[]
}

interface GymEntry {
  name: string
  fighters: Fighter[]
  cities: string[]
}

export default function GymList({ fighters }: GymListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'fighters'>('fighters')

  // Aggregate gyms from fighter data
  const gymMap = new Map<string, Fighter[]>()
  for (const f of fighters) {
    if (f.gym) {
      const key = f.gym.trim()
      if (!gymMap.has(key)) gymMap.set(key, [])
      gymMap.get(key)!.push(f)
    }
  }

  const gyms: GymEntry[] = Array.from(gymMap.entries()).map(([name, fighters]) => ({
    name,
    fighters,
    cities: [...new Set(fighters.map(f => f.residence?.city).filter(Boolean) as string[])],
  }))

  const filtered = gyms
    .filter(g =>
      search === '' ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.cities.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
      g.fighters.some(f => `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'fighters') return b.fighters.length - a.fighters.length
      return a.name.localeCompare(b.name)
    })

  const ungrouped = fighters.filter(f => !f.gym)

  if (gyms.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🏋️</div>
        <h2 className="text-lg font-semibold text-white/80 tracking-[0.2em] mb-2">NO GYMS YET</h2>
        <p className="text-white/35 text-[13px] leading-relaxed tracking-wide">
          Assign gyms to fighters in their profiles to populate this list
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
          placeholder="Search gyms, cities, or fighters..."
          className="flex-1 bg-white/[0.04] border border-white/[0.12] text-white text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800]/60 focus:ring-1 focus:ring-[#FFB800]/20 placeholder:text-white/25 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'fighters')}
          className="bg-white/[0.04] border border-white/[0.12] text-white text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800]/60 rounded-md"
        >
          <option value="fighters">Sort: Most Fighters</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <p className="text-white/30 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} GYM{filtered.length !== 1 ? 'S' : ''} • {ungrouped.length} UNASSIGNED
      </p>

      <div className="grid gap-3">
        {filtered.map(gym => (
          <div
            key={gym.name}
            className="border border-white/[0.08] rounded-lg p-5 hover:border-white/[0.15] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-[15px] leading-tight tracking-wide">{gym.name}</h3>
                {gym.cities.length > 0 && (
                  <p className="text-white/30 text-[11px] mt-1">{gym.cities.join(' • ')}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{gym.fighters.length}</span>
                <p className="text-white/30 text-[10px] font-medium tracking-[0.15em]">FIGHTER{gym.fighters.length !== 1 ? 'S' : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {gym.fighters.map(f => (
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
          </div>
        ))}
      </div>
    </div>
  )
}
