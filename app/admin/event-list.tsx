'use client'

import { useState, useCallback } from 'react'
import type { TXMXEvent, AdminEventBout } from '../actions/events'
import type { Fighter } from '../../lib/types/fighter'
import { updateEvent, deleteEvent, addEvent, getAdminEventBouts, updateBout, deleteBout, addBout } from '../actions/events'

const inputClass =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
const labelClass = 'text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1'

interface EventListProps {
  events: TXMXEvent[]
  fighters: Fighter[]
  onAdd?: (event: TXMXEvent) => void
  onUpdate?: (event: TXMXEvent) => void
  onDelete?: (id: string) => void
}

export default function EventList({ events, fighters, onAdd, onUpdate, onDelete }: EventListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'promoter' | 'city' | 'bouts'>('date')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<TXMXEvent>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Add event state
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ eventNumber: '', date: '', city: '', promoter: '', venue: '', address: '', boutCount: 0 })
  const [addingEvent, setAddingEvent] = useState(false)

  // Bout state
  const [bouts, setBouts] = useState<AdminEventBout[]>([])
  const [boutsLoading, setBoutsLoading] = useState(false)
  const [editingBoutIdx, setEditingBoutIdx] = useState<number | null>(null)
  const [boutEdit, setBoutEdit] = useState<Partial<AdminEventBout>>({})
  const [boutSaving, setBoutSaving] = useState(false)
  const [boutDeleting, setBoutDeleting] = useState<number | null>(null)
  const [addingBout, setAddingBout] = useState(false)
  const [newBout, setNewBout] = useState({
    fighter1Id: '', fighter2Id: '', weightClass: '', scheduledRounds: 0,
    method: '', referee: '', result: '', titleFight: false,
  })
  const [newBoutSaving, setNewBoutSaving] = useState(false)

  // Fighter search for add-bout
  const [f1Search, setF1Search] = useState('')
  const [f2Search, setF2Search] = useState('')

  const filtered = events
    .filter(e =>
      search === '' ||
      e.promoter.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.eventNumber.includes(search) ||
      e.date.includes(search)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'promoter': return a.promoter.localeCompare(b.promoter)
        case 'city': return a.city.localeCompare(b.city)
        case 'bouts': return b.boutCount - a.boutCount
        default: return b.date.localeCompare(a.date)
      }
    })

  const loadBouts = useCallback(async (eventNumber: string) => {
    setBoutsLoading(true)
    try {
      const data = await getAdminEventBouts(eventNumber)
      setBouts(data)
    } finally {
      setBoutsLoading(false)
    }
  }, [])

  const handleExpand = (event: TXMXEvent) => {
    if (expandedId === event.id) {
      setExpandedId(null)
      setEditData({})
      setBouts([])
      setEditingBoutIdx(null)
      setAddingBout(false)
    } else {
      setExpandedId(event.id)
      setEditData({
        date: event.date,
        promoter: event.promoter,
        venue: event.venue,
        city: event.city,
        address: event.address,
        boutCount: event.boutCount,
        eventNumber: event.eventNumber,
      })
      setEditingBoutIdx(null)
      setAddingBout(false)
      if (event.eventNumber) loadBouts(event.eventNumber)
    }
  }

  const handleSave = async (event: TXMXEvent) => {
    setSaving(true)
    try {
      await updateEvent(event.id, editData)
      const updated = { ...event, ...editData }
      onUpdate?.(updated as TXMXEvent)
      setExpandedId(null)
      setEditData({})
      setBouts([])
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteEvent(id)
      onDelete?.(id)
      setExpandedId(null)
      setBouts([])
    } finally {
      setDeleting(null)
    }
  }

  // Bout handlers
  const handleBoutEdit = (idx: number) => {
    setEditingBoutIdx(idx)
    const b = bouts[idx]
    setBoutEdit({
      weightClass: b.weightClass,
      scheduledRounds: b.scheduledRounds,
      method: b.method,
      referee: b.referee,
      result: b.result,
      winnerResolution: b.winnerResolution,
      scores: b.scores,
      titleFight: b.titleFight,
      boutNumber: b.boutNumber,
    })
  }

  const handleBoutSave = async (idx: number) => {
    const bout = bouts[idx]
    setBoutSaving(true)
    try {
      await updateBout(bout.fighter1Id, bout.fighter2Id, bout.docId, {
        weightClass: boutEdit.weightClass,
        scheduledRounds: boutEdit.scheduledRounds,
        method: boutEdit.method,
        referee: boutEdit.referee,
        result: boutEdit.result,
        winnerResolution: boutEdit.winnerResolution,
        scores: boutEdit.scores,
        titleFight: boutEdit.titleFight,
        boutNumber: boutEdit.boutNumber,
      })
      // Refresh bouts
      const event = events.find(e => e.id === expandedId)
      if (event) await loadBouts(event.eventNumber)
      setEditingBoutIdx(null)
    } finally {
      setBoutSaving(false)
    }
  }

  const handleBoutDelete = async (idx: number) => {
    const bout = bouts[idx]
    if (!confirm(`Delete bout #${bout.boutNumber}: ${bout.fighter1} vs ${bout.fighter2}?`)) return
    setBoutDeleting(idx)
    try {
      await deleteBout(bout.fighter1Id, bout.fighter2Id, bout.docId)
      const event = events.find(e => e.id === expandedId)
      if (event) await loadBouts(event.eventNumber)
    } finally {
      setBoutDeleting(null)
    }
  }

  const handleAddBout = async (event: TXMXEvent) => {
    const f1 = fighters.find(f => f.id === newBout.fighter1Id)
    const f2 = fighters.find(f => f.id === newBout.fighter2Id)
    if (!f1?.id || !f2?.id) return
    setNewBoutSaving(true)
    try {
      const boutNumber = bouts.length + 1
      await addBout(
        event.eventNumber,
        event.id,
        event.date,
        f1.id,
        `${f1.firstName} ${f1.lastName}`,
        f2.id,
        `${f2.firstName} ${f2.lastName}`,
        boutNumber,
        {
          weightClass: newBout.weightClass,
          scheduledRounds: newBout.scheduledRounds,
          method: newBout.method,
          referee: newBout.referee,
          result: newBout.result,
          titleFight: newBout.titleFight,
        }
      )
      await loadBouts(event.eventNumber)
      setAddingBout(false)
      setNewBout({ fighter1Id: '', fighter2Id: '', weightClass: '', scheduledRounds: 0, method: '', referee: '', result: '', titleFight: false })
      setF1Search('')
      setF2Search('')
    } finally {
      setNewBoutSaving(false)
    }
  }

  const filterFighters = (query: string) => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return fighters.filter(f =>
      f.id && `${f.firstName} ${f.lastName}`.toLowerCase().includes(q)
    ).slice(0, 8)
  }

  return (
    <div>
      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search events by promoter, venue, city, date, or event #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-gray-50 border border-gray-200 text-gray-600 text-[13px] leading-tight px-3 py-2.5 focus:outline-none focus:border-[#FFB800] rounded-md appearance-none cursor-pointer"
        >
          <option value="date">Sort by Date</option>
          <option value="promoter">Sort by Promoter</option>
          <option value="city">Sort by City</option>
          <option value="bouts">Sort by Bouts</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-[10px] font-semibold text-gray-300 tracking-[0.2em] mb-4">
        {filtered.length} EVENT{filtered.length !== 1 ? 'S' : ''}
      </p>

      {/* Add Event button & form */}
      {!showAddEvent ? (
        <button
          onClick={() => setShowAddEvent(true)}
          className="mb-5 flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-200 rounded-lg text-[12px] font-semibold text-gray-400 hover:border-[#FFB800] hover:text-[#FFB800] transition-colors w-full justify-center"
        >
          <span className="text-lg leading-none">+</span> Add Event
        </button>
      ) : (
        <div className="mb-5 border border-[#FFB800]/40 rounded-lg bg-amber-50/30 p-4">
          <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] mb-3">NEW EVENT</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>EVENT NUMBER</label>
              <input type="text" value={newEvent.eventNumber} onChange={e => setNewEvent(n => ({ ...n, eventNumber: e.target.value }))} placeholder="e.g. 43510" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DATE</label>
              <input type="date" value={newEvent.date} onChange={e => setNewEvent(n => ({ ...n, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PROMOTER</label>
              <input type="text" value={newEvent.promoter} onChange={e => setNewEvent(n => ({ ...n, promoter: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>VENUE</label>
              <input type="text" value={newEvent.venue} onChange={e => setNewEvent(n => ({ ...n, venue: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CITY</label>
              <input type="text" value={newEvent.city} onChange={e => setNewEvent(n => ({ ...n, city: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>ADDRESS</label>
              <input type="text" value={newEvent.address} onChange={e => setNewEvent(n => ({ ...n, address: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>BOUT COUNT</label>
              <input type="number" min={0} value={newEvent.boutCount || ''} onChange={e => setNewEvent(n => ({ ...n, boutCount: parseInt(e.target.value) || 0 }))} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={async () => {
                if (!newEvent.eventNumber || !newEvent.date) return
                setAddingEvent(true)
                try {
                  const { event } = await addEvent(newEvent)
                  onAdd?.(event)
                  setShowAddEvent(false)
                  setNewEvent({ eventNumber: '', date: '', city: '', promoter: '', venue: '', address: '', boutCount: 0 })
                  // Auto-expand the new event with add-bout form open
                  setExpandedId(event.id)
                  setEditData({
                    date: event.date,
                    promoter: event.promoter,
                    venue: event.venue,
                    city: event.city,
                    address: event.address,
                    boutCount: event.boutCount,
                    eventNumber: event.eventNumber,
                  })
                  setBouts([])
                  setAddingBout(true)
                } finally {
                  setAddingEvent(false)
                }
              }}
              disabled={!newEvent.eventNumber || !newEvent.date || addingEvent}
              className="px-5 py-2 bg-[#FFB800] text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50"
            >
              {addingEvent ? 'Creating...' : 'Create Event & Add Bouts'}
            </button>
            <button
              onClick={() => { setShowAddEvent(false); setNewEvent({ eventNumber: '', date: '', city: '', promoter: '', venue: '', address: '', boutCount: 0 }) }}
              className="px-4 py-2 text-gray-400 text-[12px] font-medium tracking-wider hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Event list */}
      <div className="space-y-1.5">
        {filtered.map(event => {
          const isExpanded = expandedId === event.id
          const isDeleting = deleting === event.id

          return (
            <div key={event.id} className={`border rounded-lg transition-colors ${isExpanded ? 'border-[#FFB800]/40 bg-amber-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
              {/* Summary row */}
              <button
                onClick={() => handleExpand(event)}
                className="w-full text-left px-4 py-3 flex items-center gap-4 cursor-pointer"
              >
                <div className="w-24 shrink-0">
                  <p className="text-[13px] font-semibold text-gray-700 tabular-nums">{event.date || 'No date'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{event.promoter || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-400 truncate">{event.venue}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-medium text-gray-600">{event.city}</p>
                  <p className="text-[10px] text-gray-300 tabular-nums">{event.boutCount} bout{event.boutCount !== 1 ? 's' : ''} · #{event.eventNumber}</p>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-300 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4">
                  {/* Event edit fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>DATE</label>
                      <input type="date" value={editData.date || ''} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>PROMOTER</label>
                      <input type="text" value={editData.promoter || ''} onChange={e => setEditData(d => ({ ...d, promoter: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>VENUE</label>
                      <input type="text" value={editData.venue || ''} onChange={e => setEditData(d => ({ ...d, venue: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>CITY</label>
                      <input type="text" value={editData.city || ''} onChange={e => setEditData(d => ({ ...d, city: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>ADDRESS</label>
                      <input type="text" value={editData.address || ''} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>BOUT COUNT</label>
                      <input type="number" min={0} value={editData.boutCount ?? 0} onChange={e => setEditData(d => ({ ...d, boutCount: parseInt(e.target.value) || 0 }))} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>EVENT NUMBER</label>
                      <input type="text" value={editData.eventNumber || ''} onChange={e => setEditData(d => ({ ...d, eventNumber: e.target.value }))} className={inputClass} />
                    </div>
                  </div>

                  {/* Source & Created info */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                    {event.source && <p className="text-[10px] text-gray-300 tracking-wide">Source: {event.source}</p>}
                    {event.createdAt && <p className="text-[10px] text-gray-300 tracking-wide">Created: {new Date(event.createdAt).toLocaleDateString()}</p>}
                    <p className="text-[10px] text-gray-300 tracking-wide font-mono">ID: {event.id}</p>
                  </div>

                  {/* Event actions */}
                  <div className="mt-5 flex items-center gap-3">
                    <button onClick={() => handleSave(event)} disabled={saving} className="px-5 py-2 bg-[#FFB800] text-white text-[12px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setExpandedId(null); setEditData({}); setBouts([]); setEditingBoutIdx(null); setAddingBout(false) }} className="px-4 py-2 text-gray-400 text-[12px] font-medium tracking-wider hover:text-gray-600 transition-colors">
                      Cancel
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => handleDelete(event.id)} disabled={isDeleting} className="px-4 py-2 text-red-400 text-[12px] font-medium tracking-wider hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                      {isDeleting ? 'Deleting...' : 'Delete Event'}
                    </button>
                  </div>

                  {/* ─── BOUTS SECTION ─── */}
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em]">
                        BOUTS {!boutsLoading && `(${bouts.length})`}
                      </p>
                      {!addingBout && (
                        <button
                          onClick={() => { setAddingBout(true); setEditingBoutIdx(null) }}
                          className="text-[11px] font-semibold text-[#FFB800] hover:text-[#E5A600] tracking-wider transition-colors"
                        >
                          + Add Bout
                        </button>
                      )}
                    </div>

                    {boutsLoading && (
                      <p className="text-[12px] text-gray-400 animate-pulse py-4">Loading bouts...</p>
                    )}

                    {/* Bout list */}
                    {!boutsLoading && bouts.length === 0 && !addingBout && (
                      <p className="text-[12px] text-gray-300 py-4">No bouts found for this event.</p>
                    )}

                    {!boutsLoading && (
                      <div className="space-y-1">
                        {bouts.map((bout, idx) => {
                          const isEditingThis = editingBoutIdx === idx
                          const isDeletingThis = boutDeleting === idx

                          return (
                            <div key={`${bout.docId}-${idx}`} className={`border rounded-md transition-colors ${isEditingThis ? 'border-[#FFB800]/30 bg-amber-50/20' : 'border-gray-100'}`}>
                              {/* Bout summary row */}
                              <div className="flex items-center gap-3 px-3 py-2">
                                <span className="text-[10px] font-mono text-gray-300 w-5 shrink-0">#{bout.boutNumber}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] text-gray-800 truncate">
                                    <span className={bout.result === 'W' ? 'font-semibold' : ''}>{bout.fighter1}</span>
                                    <span className="text-gray-300 mx-1.5">vs</span>
                                    <span className={bout.result === 'L' ? 'font-semibold' : ''}>{bout.fighter2}</span>
                                  </p>
                                </div>
                                {bout.weightClass && <span className="text-[10px] text-gray-400 shrink-0">{bout.weightClass}</span>}
                                {bout.method && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{bout.method}</span>}
                                {bout.result && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${bout.result === 'W' ? 'bg-green-50 text-green-600' : bout.result === 'L' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{bout.result}</span>}
                                {bout.titleFight && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded shrink-0">TITLE</span>}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => isEditingThis ? setEditingBoutIdx(null) : handleBoutEdit(idx)} className="text-[10px] text-gray-400 hover:text-[#FFB800] px-1.5 py-1 transition-colors">
                                    {isEditingThis ? 'Close' : 'Edit'}
                                  </button>
                                  <button onClick={() => handleBoutDelete(idx)} disabled={isDeletingThis} className="text-[10px] text-gray-300 hover:text-red-500 px-1.5 py-1 transition-colors disabled:opacity-50">
                                    {isDeletingThis ? '...' : 'Del'}
                                  </button>
                                </div>
                              </div>

                              {/* Bout edit form */}
                              {isEditingThis && (
                                <div className="border-t border-gray-100 px-3 py-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    <div>
                                      <label className={labelClass}>BOUT #</label>
                                      <input type="number" min={1} value={boutEdit.boutNumber ?? ''} onChange={e => setBoutEdit(d => ({ ...d, boutNumber: parseInt(e.target.value) || 0 }))} className={inputClass} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>WEIGHT CLASS</label>
                                      <input type="text" value={boutEdit.weightClass || ''} onChange={e => setBoutEdit(d => ({ ...d, weightClass: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>ROUNDS</label>
                                      <input type="number" min={0} value={boutEdit.scheduledRounds ?? ''} onChange={e => setBoutEdit(d => ({ ...d, scheduledRounds: parseInt(e.target.value) || 0 }))} className={inputClass} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>RESULT (F1)</label>
                                      <select value={boutEdit.result || ''} onChange={e => setBoutEdit(d => ({ ...d, result: e.target.value }))} className={inputClass}>
                                        <option value="">–</option>
                                        <option value="W">W (Fighter 1 Wins)</option>
                                        <option value="L">L (Fighter 1 Loses)</option>
                                        <option value="D">D (Draw)</option>
                                        <option value="NC">NC (No Contest)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className={labelClass}>METHOD</label>
                                      <input type="text" value={boutEdit.method || ''} onChange={e => setBoutEdit(d => ({ ...d, method: e.target.value }))} placeholder="UD, KO, TKO, SD..." className={inputClass} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>WINNER RESOLUTION</label>
                                      <input type="text" value={boutEdit.winnerResolution || ''} onChange={e => setBoutEdit(d => ({ ...d, winnerResolution: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                      <label className={labelClass}>REFEREE</label>
                                      <input type="text" value={boutEdit.referee || ''} onChange={e => setBoutEdit(d => ({ ...d, referee: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div className="flex items-end pb-1">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={boutEdit.titleFight || false} onChange={e => setBoutEdit(d => ({ ...d, titleFight: e.target.checked }))} className="accent-[#FFB800]" />
                                        <span className="text-[11px] text-gray-600">Title Fight</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => handleBoutSave(idx)} disabled={boutSaving} className="px-4 py-1.5 bg-[#FFB800] text-white text-[11px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50">
                                      {boutSaving ? 'Saving...' : 'Save Bout'}
                                    </button>
                                    <button onClick={() => setEditingBoutIdx(null)} className="px-3 py-1.5 text-gray-400 text-[11px] tracking-wider hover:text-gray-600 transition-colors">
                                      Cancel
                                    </button>
                                    <p className="text-[9px] text-gray-300 ml-auto font-mono">
                                      {bout.fighter1Id.slice(0, 8)}… vs {bout.fighter2Id.slice(0, 8)}… · doc:{bout.docId}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Add bout form */}
                    {addingBout && (
                      <div className="mt-3 border border-[#FFB800]/30 rounded-md bg-amber-50/20 p-4">
                        <p className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] mb-3">NEW BOUT</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          {/* Fighter 1 search */}
                          <div className="relative">
                            <label className={labelClass}>FIGHTER 1 (RED CORNER)</label>
                            {newBout.fighter1Id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-gray-800 font-medium">
                                  {fighters.find(f => f.id === newBout.fighter1Id)?.firstName} {fighters.find(f => f.id === newBout.fighter1Id)?.lastName}
                                </span>
                                <button onClick={() => { setNewBout(n => ({ ...n, fighter1Id: '' })); setF1Search('') }} className="text-[10px] text-red-400 hover:text-red-600">✕</button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={f1Search}
                                  onChange={e => setF1Search(e.target.value)}
                                  placeholder="Search fighters..."
                                  className={inputClass}
                                />
                                {f1Search.length >= 2 && (
                                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {filterFighters(f1Search).map(f => (
                                      <button
                                        key={f.id}
                                        onClick={() => { setNewBout(n => ({ ...n, fighter1Id: f.id || '' })); setF1Search('') }}
                                        className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-amber-50 transition-colors"
                                      >
                                        {f.firstName} {f.lastName}
                                        {f.residence?.city && <span className="text-gray-400 ml-1">· {f.residence.city}</span>}
                                      </button>
                                    ))}
                                    {filterFighters(f1Search).length === 0 && (
                                      <p className="px-3 py-2 text-[11px] text-gray-400">No fighters found</p>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Fighter 2 search */}
                          <div className="relative">
                            <label className={labelClass}>FIGHTER 2 (BLUE CORNER)</label>
                            {newBout.fighter2Id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-gray-800 font-medium">
                                  {fighters.find(f => f.id === newBout.fighter2Id)?.firstName} {fighters.find(f => f.id === newBout.fighter2Id)?.lastName}
                                </span>
                                <button onClick={() => { setNewBout(n => ({ ...n, fighter2Id: '' })); setF2Search('') }} className="text-[10px] text-red-400 hover:text-red-600">✕</button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={f2Search}
                                  onChange={e => setF2Search(e.target.value)}
                                  placeholder="Search fighters..."
                                  className={inputClass}
                                />
                                {f2Search.length >= 2 && (
                                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {filterFighters(f2Search).map(f => (
                                      <button
                                        key={f.id}
                                        onClick={() => { setNewBout(n => ({ ...n, fighter2Id: f.id || '' })); setF2Search('') }}
                                        className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-amber-50 transition-colors"
                                      >
                                        {f.firstName} {f.lastName}
                                        {f.residence?.city && <span className="text-gray-400 ml-1">· {f.residence.city}</span>}
                                      </button>
                                    ))}
                                    {filterFighters(f2Search).length === 0 && (
                                      <p className="px-3 py-2 text-[11px] text-gray-400">No fighters found</p>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          <div>
                            <label className={labelClass}>WEIGHT CLASS</label>
                            <input type="text" value={newBout.weightClass} onChange={e => setNewBout(n => ({ ...n, weightClass: e.target.value }))} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>ROUNDS</label>
                            <input type="number" min={0} value={newBout.scheduledRounds || ''} onChange={e => setNewBout(n => ({ ...n, scheduledRounds: parseInt(e.target.value) || 0 }))} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>RESULT (F1)</label>
                            <select value={newBout.result} onChange={e => setNewBout(n => ({ ...n, result: e.target.value }))} className={inputClass}>
                              <option value="">–</option>
                              <option value="W">W (Fighter 1 Wins)</option>
                              <option value="L">L (Fighter 1 Loses)</option>
                              <option value="D">D (Draw)</option>
                              <option value="NC">NC (No Contest)</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>METHOD</label>
                            <input type="text" value={newBout.method} onChange={e => setNewBout(n => ({ ...n, method: e.target.value }))} placeholder="UD, KO, TKO, SD..." className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>REFEREE</label>
                            <input type="text" value={newBout.referee} onChange={e => setNewBout(n => ({ ...n, referee: e.target.value }))} className={inputClass} />
                          </div>
                          <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={newBout.titleFight} onChange={e => setNewBout(n => ({ ...n, titleFight: e.target.checked }))} className="accent-[#FFB800]" />
                              <span className="text-[11px] text-gray-600">Title Fight</span>
                            </label>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => handleAddBout(event)}
                            disabled={!newBout.fighter1Id || !newBout.fighter2Id || newBoutSaving}
                            className="px-5 py-2 bg-[#FFB800] text-white text-[11px] font-semibold tracking-wider rounded-md hover:bg-[#E5A600] transition-colors disabled:opacity-50"
                          >
                            {newBoutSaving ? 'Adding...' : 'Add Bout'}
                          </button>
                          <button
                            onClick={() => { setAddingBout(false); setF1Search(''); setF2Search(''); setNewBout({ fighter1Id: '', fighter2Id: '', weightClass: '', scheduledRounds: 0, method: '', referee: '', result: '', titleFight: false }) }}
                            className="px-4 py-2 text-gray-400 text-[11px] tracking-wider hover:text-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
