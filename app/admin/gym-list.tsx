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
        <h2 className="text-lg font-semibold text-gray-700 tracking-[0.2em] mb-2">NO GYMS YET</h2>
        <p className="text-gray-400 text-[13px] leading-relaxed tracking-wide">
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
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'fighters')}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
        >
          <option value="fighters">Sort: Most Fighters</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <p className="text-gray-400 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} GYM{filtered.length !== 1 ? 'S' : ''} • {ungrouped.length} UNASSIGNED
      </p>

      <div className="grid gap-3">
        {filtered.map(gym => (
          <div
            key={gym.name}
            className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-gray-900 font-semibold text-[15px] leading-tight tracking-wide">{gym.name}</h3>
                {gym.cities.length > 0 && (
                  <p className="text-gray-400 text-[11px] mt-1">{gym.cities.join(' • ')}</p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{gym.fighters.length}</span>
                <p className="text-gray-400 text-[10px] font-medium tracking-[0.15em]">FIGHTER{gym.fighters.length !== 1 ? 'S' : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {gym.fighters.map(f => (
                <span
                  key={f.id}
                  className="text-[11px] bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-500 leading-none"
                >
                  {f.firstName} {f.lastName}
                  <span className="text-gray-300 ml-1 font-mono tabular-nums">
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
