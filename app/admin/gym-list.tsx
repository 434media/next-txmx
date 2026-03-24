'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import type { GymData } from '../actions/gyms'
import { addGym, updateGym, deleteGym } from '../actions/gyms'

const inputClass =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
const labelClass = 'text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-1'

interface GymListProps {
  fighters: Fighter[]
  gymDocs: GymData[]
  onAdd?: (gym: GymData) => void
  onUpdate?: (gym: GymData) => void
  onDelete?: (id: string) => void
}

const EMPTY_GYM: Omit<GymData, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  phone: '',
  website: '',
  instagram: '',
  facebook: '',
  twitter: '',
  tiktok: '',
  youtube: '',
  notes: '',
}

export default function GymList({ fighters, gymDocs, onAdd, onUpdate, onDelete }: GymListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'fighters'>('name')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<GymData>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addData, setAddData] = useState<Omit<GymData, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_GYM)
  const [adding, setAdding] = useState(false)

  // Build a map of gym name → fighters for display
  const fightersByGym = new Map<string, Fighter[]>()
  for (const f of fighters) {
    if (f.gym) {
      const key = f.gym.trim().toLowerCase()
      if (!fightersByGym.has(key)) fightersByGym.set(key, [])
      fightersByGym.get(key)!.push(f)
    }
  }

  const getFightersForGym = (name: string) =>
    fightersByGym.get(name.trim().toLowerCase()) || []

  const filtered = gymDocs
    .filter(g =>
      search === '' ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase()) ||
      g.state.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'fighters') {
        return getFightersForGym(b.name).length - getFightersForGym(a.name).length
      }
      return a.name.localeCompare(b.name)
    })

  const handleExpand = (gym: GymData) => {
    if (expandedId === gym.id) {
      setExpandedId(null)
      setEditData({})
    } else {
      setExpandedId(gym.id)
      setEditData({
        name: gym.name,
        address: gym.address || '',
        city: gym.city || '',
        state: gym.state || '',
        country: gym.country || '',
        phone: gym.phone || '',
        website: gym.website || '',
        instagram: gym.instagram || '',
        facebook: gym.facebook || '',
        twitter: gym.twitter || '',
        tiktok: gym.tiktok || '',
        youtube: gym.youtube || '',
        notes: gym.notes || '',
      })
    }
  }

  const handleSave = async (gym: GymData) => {
    setSaving(true)
    try {
      await updateGym(gym.id, editData)
      onUpdate?.({ ...gym, ...editData } as GymData)
      setExpandedId(null)
      setEditData({})
    } catch {
      // stay open on error
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gym? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteGym(id)
      onDelete?.(id)
      setExpandedId(null)
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  const handleAdd = async () => {
    if (!addData.name.trim()) return
    setAdding(true)
    try {
      const result = await addGym(addData)
      if (result.success) {
        const newGym: GymData = {
          ...addData,
          id: result.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        onAdd?.(newGym)
        setAddData(EMPTY_GYM)
        setShowAddForm(false)
      }
    } catch {
      // ignore
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search gyms by name, city, or state..."
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'fighters')}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
        >
          <option value="name">Sort: Name</option>
          <option value="fighters">Sort: Most Fighters</option>
        </select>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#FFB800] text-black text-[11px] font-semibold tracking-[0.15em] px-4 py-2 rounded-md hover:bg-[#FFB800]/90 transition-colors whitespace-nowrap"
        >
          {showAddForm ? 'CANCEL' : '+ ADD GYM'}
        </button>
      </div>

      {/* Add Gym Form */}
      {showAddForm && (
        <div className="border border-amber-300 bg-amber-50/30 rounded-lg p-5 space-y-5">
          <h3 className="text-[11px] font-semibold text-amber-600 tracking-[0.2em]">NEW GYM</h3>

          <div>
            <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">DETAILS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>NAME *</label>
                <input className={inputClass} value={addData.name} onChange={e => setAddData(d => ({ ...d, name: e.target.value }))} placeholder="Boxing Academy" />
              </div>
              <div>
                <label className={labelClass}>PHONE</label>
                <input className={inputClass} value={addData.phone} onChange={e => setAddData(d => ({ ...d, phone: e.target.value }))} placeholder="(xxx) xxx-xxxx" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">ADDRESS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className={labelClass}>STREET ADDRESS</label>
                <input className={inputClass} value={addData.address} onChange={e => setAddData(d => ({ ...d, address: e.target.value }))} placeholder="123 Main St" />
              </div>
              <div>
                <label className={labelClass}>CITY</label>
                <input className={inputClass} value={addData.city} onChange={e => setAddData(d => ({ ...d, city: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>STATE</label>
                <input className={inputClass} value={addData.state} onChange={e => setAddData(d => ({ ...d, state: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>COUNTRY</label>
                <input className={inputClass} value={addData.country} onChange={e => setAddData(d => ({ ...d, country: e.target.value }))} placeholder="US" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">SOCIAL</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>WEBSITE</label>
                <input className={inputClass} value={addData.website} onChange={e => setAddData(d => ({ ...d, website: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>INSTAGRAM</label>
                <input className={inputClass} value={addData.instagram} onChange={e => setAddData(d => ({ ...d, instagram: e.target.value }))} placeholder="@handle" />
              </div>
              <div>
                <label className={labelClass}>FACEBOOK</label>
                <input className={inputClass} value={addData.facebook} onChange={e => setAddData(d => ({ ...d, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className={labelClass}>TWITTER / X</label>
                <input className={inputClass} value={addData.twitter} onChange={e => setAddData(d => ({ ...d, twitter: e.target.value }))} placeholder="@handle" />
              </div>
              <div>
                <label className={labelClass}>TIKTOK</label>
                <input className={inputClass} value={addData.tiktok} onChange={e => setAddData(d => ({ ...d, tiktok: e.target.value }))} placeholder="@handle" />
              </div>
              <div>
                <label className={labelClass}>YOUTUBE</label>
                <input className={inputClass} value={addData.youtube} onChange={e => setAddData(d => ({ ...d, youtube: e.target.value }))} placeholder="https://youtube.com/@..." />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>NOTES</label>
            <textarea
              className={`${inputClass} min-h-[60px] resize-y`}
              value={addData.notes}
              onChange={e => setAddData(d => ({ ...d, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setAddData(EMPTY_GYM); setShowAddForm(false) }}
              className="text-gray-400 text-[11px] font-semibold tracking-[0.15em] px-3 py-1.5 hover:text-gray-500 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleAdd}
              disabled={adding || !addData.name.trim()}
              className="bg-[#FFB800] text-black text-[11px] font-semibold tracking-[0.15em] px-5 py-1.5 rounded hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50"
            >
              {adding ? 'ADDING...' : 'ADD GYM'}
            </button>
          </div>
        </div>
      )}

      <p className="text-gray-400 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} GYM{filtered.length !== 1 ? 'S' : ''}
      </p>

      {/* Gym list */}
      {gymDocs.length === 0 && !showAddForm ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-5">🏋️</div>
          <h2 className="text-lg font-semibold text-gray-700 tracking-[0.2em] mb-2">NO GYMS YET</h2>
          <p className="text-gray-400 text-[13px] leading-relaxed tracking-wide mb-6">
            Add gyms to the database and assign fighters to them
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#FFB800] text-black text-[11px] font-semibold tracking-[0.15em] px-5 py-2 rounded-md hover:bg-[#FFB800]/90 transition-colors"
          >
            + ADD FIRST GYM
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(gym => {
            const isExpanded = expandedId === gym.id
            const gymFighters = getFightersForGym(gym.name)

            return (
              <div
                key={gym.id}
                className={`border rounded-lg transition-colors ${
                  isExpanded ? 'border-amber-300 bg-amber-50/10' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => handleExpand(gym)}
                  className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-semibold text-[15px] leading-tight tracking-wide">{gym.name}</h3>
                    {(gym.city || gym.state) && (
                      <p className="text-gray-400 text-[13px] leading-relaxed mt-0.5">
                        {[gym.city, gym.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {(gym.instagram || gym.website) && (
                      <div className="flex gap-2 mt-1">
                        {gym.instagram && (
                          <span className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">IG: {gym.instagram}</span>
                        )}
                        {gym.website && (
                          <span className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 truncate max-w-[200px]">🌐</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[#FFB800] font-mono text-lg font-semibold tabular-nums">{gymFighters.length}</span>
                    <p className="text-gray-400 text-[10px] font-medium tracking-[0.15em]">FIGHTER{gymFighters.length !== 1 ? 'S' : ''}</p>
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
                    {/* Fighters at this gym */}
                    {gymFighters.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-2">FIGHTERS</p>
                        <div className="flex flex-wrap gap-1.5">
                          {gymFighters.map(f => (
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

                    {/* Location */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">LOCATION</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>NAME</label>
                          <input className={inputClass} value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>PHONE</label>
                          <input className={inputClass} placeholder="(xxx) xxx-xxxx" value={editData.phone || ''} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>STREET ADDRESS</label>
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
                        <div>
                          <label className={labelClass}>COUNTRY</label>
                          <input className={inputClass} value={editData.country || ''} onChange={e => setEditData(d => ({ ...d, country: e.target.value }))} placeholder="US" />
                        </div>
                      </div>
                    </div>

                    {/* Social */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">SOCIAL &amp; ONLINE</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>WEBSITE</label>
                          <input className={inputClass} placeholder="https://..." value={editData.website || ''} onChange={e => setEditData(d => ({ ...d, website: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>INSTAGRAM</label>
                          <input className={inputClass} placeholder="@handle" value={editData.instagram || ''} onChange={e => setEditData(d => ({ ...d, instagram: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>FACEBOOK</label>
                          <input className={inputClass} placeholder="https://facebook.com/..." value={editData.facebook || ''} onChange={e => setEditData(d => ({ ...d, facebook: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>TWITTER / X</label>
                          <input className={inputClass} placeholder="@handle" value={editData.twitter || ''} onChange={e => setEditData(d => ({ ...d, twitter: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>TIKTOK</label>
                          <input className={inputClass} placeholder="@handle" value={editData.tiktok || ''} onChange={e => setEditData(d => ({ ...d, tiktok: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelClass}>YOUTUBE</label>
                          <input className={inputClass} placeholder="https://youtube.com/@..." value={editData.youtube || ''} onChange={e => setEditData(d => ({ ...d, youtube: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-[10px] font-semibold text-amber-600 tracking-[0.2em] mb-3">NOTES</p>
                      <textarea
                        className={`${inputClass} min-h-[60px] resize-y`}
                        placeholder="Additional notes..."
                        value={editData.notes || ''}
                        onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDelete(gym.id)}
                        disabled={deleting === gym.id}
                        className="text-red-500 text-[11px] font-semibold tracking-[0.15em] border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === gym.id ? 'DELETING...' : 'DELETE GYM'}
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setExpandedId(null); setEditData({}) }}
                          className="text-gray-400 text-[11px] font-semibold tracking-[0.15em] px-3 py-1.5 hover:text-gray-500 transition-colors"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => handleSave(gym)}
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
      )}
    </div>
  )
}
