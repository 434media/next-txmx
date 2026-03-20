'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import type { PromoterData } from '../actions/events'
import { upsertPromoter, updatePromoter, deletePromoter } from '../actions/events'

const inputClass =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
const labelClass = 'text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1'

interface PromoterListProps {
  fighters: Fighter[]
  eventPromoters: { name: string; eventCount: number }[]
  promoterDocs: PromoterData[]
  onUpdate?: (promoter: PromoterData) => void
  onDelete?: (id: string) => void
}

interface MergedPromoter {
  name: string
  doc: PromoterData | null
  fighters: Fighter[]
  eventCount: number
}

export default function PromoterList({ fighters, eventPromoters, promoterDocs, onUpdate, onDelete }: PromoterListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'fighters' | 'events'>('events')
  const [expandedName, setExpandedName] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PromoterData>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Aggregate promoters from fighter data
  const promoterMap = new Map<string, Fighter[]>()
  for (const f of fighters) {
    if (f.promoter) {
      const key = f.promoter.trim()
      if (!promoterMap.has(key)) promoterMap.set(key, [])
      promoterMap.get(key)!.push(f)
    }
  }

  // Build doc lookup by name
  const docsByName = new Map<string, PromoterData>()
  for (const doc of promoterDocs) {
    docsByName.set(doc.name, doc)
  }

  // Merge all promoter sources
  const allNames = new Set([
    ...promoterMap.keys(),
    ...eventPromoters.map(p => p.name),
    ...promoterDocs.map(d => d.name),
  ])

  const promoters: MergedPromoter[] = Array.from(allNames).map(name => ({
    name,
    doc: docsByName.get(name) || null,
    fighters: promoterMap.get(name) || [],
    eventCount: eventPromoters.find(p => p.name === name)?.eventCount || 0,
  }))

  const filtered = promoters
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.doc?.company || '').toLowerCase().includes(search.toLowerCase()) ||
      p.fighters.some(f => `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'fighters': return b.fighters.length - a.fighters.length
        case 'events': return b.eventCount - a.eventCount
        default: return a.name.localeCompare(b.name)
      }
    })

  const handleExpand = (promoter: MergedPromoter) => {
    if (expandedName === promoter.name) {
      setExpandedName(null)
      setEditData({})
    } else {
      setExpandedName(promoter.name)
      setEditData({
        name: promoter.name,
        company: promoter.doc?.company || '',
        city: promoter.doc?.city || '',
        state: promoter.doc?.state || '',
        email: promoter.doc?.email || '',
        phone: promoter.doc?.phone || '',
        website: promoter.doc?.website || '',
        instagram: promoter.doc?.instagram || '',
        notes: promoter.doc?.notes || '',
      })
    }
  }

  const handleSave = async (promoter: MergedPromoter) => {
    setSaving(true)
    try {
      if (promoter.doc) {
        await updatePromoter(promoter.doc.id, editData)
        onUpdate?.({ ...promoter.doc, ...editData } as PromoterData)
      } else {
        const res = await upsertPromoter(promoter.name, {
          ...editData,
          eventCount: promoter.eventCount,
        })
        if (res.success) {
          onUpdate?.({
            id: res.id,
            name: promoter.name,
            company: '',
            city: '',
            state: '',
            email: '',
            phone: '',
            website: '',
            instagram: '',
            notes: '',
            eventCount: promoter.eventCount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...editData,
          } as PromoterData)
        }
      }
      setExpandedName(null)
      setEditData({})
    } catch {
      // stay open
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (promoter: MergedPromoter) => {
    if (!promoter.doc) return
    setDeleting(promoter.doc.id)
    try {
      await deletePromoter(promoter.doc.id)
      onDelete?.(promoter.doc.id)
      setExpandedName(null)
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  if (promoters.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🎤</div>
        <h2 className="text-lg font-semibold text-gray-700 tracking-[0.2em] mb-2">NO PROMOTERS YET</h2>
        <p className="text-gray-400 text-[13px] leading-relaxed tracking-wide">
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
          placeholder="Search promoters, companies, or fighters..."
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'fighters' | 'events')}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
        >
          <option value="events">Sort: Most Events</option>
          <option value="fighters">Sort: Most Fighters</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <p className="text-gray-400 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} PROMOTER{filtered.length !== 1 ? 'S' : ''}
      </p>

      <div className="grid gap-3">
        {filtered.map(promoter => {
          const isExpanded = expandedName === promoter.name
          return (
            <div
              key={promoter.name}
              className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => handleExpand(promoter)}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-[15px] leading-tight tracking-wide">{promoter.name}</h3>
                  {promoter.doc?.company && (
                    <p className="text-gray-400 text-[11px] mt-0.5">{promoter.doc.company}</p>
                  )}
                  {promoter.doc?.city && (
                    <p className="text-gray-400 text-[11px]">{promoter.doc.city}, {promoter.doc.state}</p>
                  )}
                </div>
                <div className="flex gap-6 shrink-0 text-right">
                  <div>
                    <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{promoter.eventCount}</span>
                    <p className="text-gray-400 text-[10px] font-medium tracking-[0.15em]">EVENT{promoter.eventCount !== 1 ? 'S' : ''}</p>
                  </div>
                  <div>
                    <span className="text-gray-900 font-mono text-lg font-semibold tabular-nums">{promoter.fighters.length}</span>
                    <p className="text-gray-400 text-[10px] font-medium tracking-[0.15em]">FIGHTER{promoter.fighters.length !== 1 ? 'S' : ''}</p>
                  </div>
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
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">IDENTITY</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>NAME</label>
                        <input className={inputClass} value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>COMPANY</label>
                        <input className={inputClass} placeholder="Promotion company name" value={editData.company || ''} onChange={e => setEditData(d => ({ ...d, company: e.target.value }))} />
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
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">CONTACT</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>EMAIL</label>
                        <input className={inputClass} type="email" placeholder="email@example.com" value={editData.email || ''} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>PHONE</label>
                        <input className={inputClass} placeholder="(xxx) xxx-xxxx" value={editData.phone || ''} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>WEBSITE</label>
                        <input className={inputClass} placeholder="https://..." value={editData.website || ''} onChange={e => setEditData(d => ({ ...d, website: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">SOCIAL</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                  {promoter.fighters.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">FIGHTERS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {promoter.fighters.map(f => (
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
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {promoter.doc ? (
                      <button
                        onClick={() => handleDelete(promoter)}
                        disabled={deleting === promoter.doc!.id}
                        className="text-red-500 text-[11px] font-semibold tracking-[0.15em] border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === promoter.doc!.id ? 'DELETING...' : 'DELETE PROMOTER'}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-[10px] tracking-[0.15em]">NOT YET SAVED TO DB</span>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setExpandedName(null); setEditData({}) }}
                        className="text-gray-400 text-[11px] font-semibold tracking-[0.15em] px-3 py-1.5 hover:text-gray-500 transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => handleSave(promoter)}
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
