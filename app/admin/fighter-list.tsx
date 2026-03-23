'use client'

import { useState } from 'react'
import type { Fighter } from '../../lib/types/fighter'
import { WEIGHT_CLASSES } from '../../lib/types/fighter'
import { deleteFighter, updateFighter } from '../actions/fighters'

interface FighterListProps {
  fighters: Fighter[]
  onDelete: (id: string) => void
  onUpdate: (updated: Fighter) => void
}

const inputClass =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] font-medium leading-5 px-3 py-2 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md'
const labelClass = 'block text-[11px] leading-4 font-semibold text-gray-500 tracking-[0.12em] mb-1'

export default function FighterList({ fighters, onDelete, onUpdate }: FighterListProps) {
  const [search, setSearch] = useState('')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterWeight, setFilterWeight] = useState<string>('all')
  const [filterSex, setFilterSex] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Fighter>>({})
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 25

  const filtered = fighters
    .filter(f => {
      const matchesSearch =
        search === '' ||
        `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        f.nickname?.toLowerCase().includes(search.toLowerCase()) ||
        f.residence?.city?.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = filterRegion === 'all' || f.region === filterRegion
      const matchesStatus = filterStatus === 'all' || f.status === filterStatus
      const matchesWeight = filterWeight === 'all' || f.weightClass === filterWeight
      const matchesSex = filterSex === 'all' || f.sex === filterSex
      return matchesSearch && matchesRegion && matchesStatus && matchesWeight && matchesSex
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.lastName.localeCompare(b.lastName)
        case 'wins':
          return b.record.wins - a.record.wins
        case 'bouts':
          return (b.bouts || 0) - (a.bouts || 0)
        case 'ko':
          return (b.koPercentage || 0) - (a.koPercentage || 0)
        case 'weight':
          return WEIGHT_CLASSES.indexOf(a.weightClass as typeof WEIGHT_CLASSES[number]) -
                 WEIGHT_CLASSES.indexOf(b.weightClass as typeof WEIGHT_CLASSES[number])
        default:
          return 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Collect unique weight classes from current fighters for the filter
  const activeWeightClasses = [...new Set(fighters.map(f => f.weightClass))].sort(
    (a, b) => WEIGHT_CLASSES.indexOf(a as typeof WEIGHT_CLASSES[number]) -
              WEIGHT_CLASSES.indexOf(b as typeof WEIGHT_CLASSES[number])
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteFighter(id)
      onDelete(id)
      if (editingId === id) setEditingId(null)
    } catch {
      alert('Failed to delete fighter')
    } finally {
      setDeletingId(null)
    }
  }

  const startEditing = (fighter: Fighter) => {
    setEditingId(fighter.id!)
    setUploadError(null)
    setEditData({
      firstName: fighter.firstName,
      lastName: fighter.lastName,
      nickname: fighter.nickname || '',
      sex: fighter.sex,
      weightClass: fighter.weightClass,
      status: fighter.status,
      region: fighter.region,
      stance: fighter.stance,
      dateOfBirth: fighter.dateOfBirth || '',
      record: { ...fighter.record },
      residence: fighter.residence ? { ...fighter.residence } : { city: '', state: '', country: '' },
      gym: fighter.gym || '',
      trainer: fighter.trainer || '',
      promoter: fighter.promoter || '',
      bio: fighter.bio || '',
      profileImageUrl: fighter.profileImageUrl || '',
      social: {
        instagram: fighter.social?.instagram || '',
        twitter: fighter.social?.twitter || '',
        tiktok: fighter.social?.tiktok || '',
        youtube: fighter.social?.youtube || '',
        website: fighter.social?.website || '',
      },
    })
  }

  const handleImageUpload = async (file: File) => {
    if (!editingId) return

    setUploadError(null)
    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to upload image')
      }

      const data = await res.json()
      setEditData(d => ({ ...d, profileImageUrl: data.url }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!editingId) return
    setSavingId(editingId)
    try {
      // Recalculate derived fields
      const record = editData.record!
      const bouts = record.wins + record.losses + record.draws
      const koPercentage = record.wins > 0
        ? Math.round((record.knockouts / record.wins) * 10000) / 100
        : 0

      const updatePayload: Partial<Fighter> = {
        ...editData,
        bouts,
        koPercentage,
      }

      // Clean empty strings
      if (!updatePayload.nickname) delete updatePayload.nickname
      if (!updatePayload.dateOfBirth) delete updatePayload.dateOfBirth
      if (!updatePayload.gym) delete updatePayload.gym
      if (!updatePayload.trainer) delete updatePayload.trainer
      if (!updatePayload.promoter) delete updatePayload.promoter
      if (!updatePayload.bio) delete updatePayload.bio
      if (!updatePayload.profileImageUrl) delete updatePayload.profileImageUrl
      if (updatePayload.social) {
        const social = {
          instagram: updatePayload.social.instagram?.trim() || undefined,
          twitter: updatePayload.social.twitter?.trim() || undefined,
          tiktok: updatePayload.social.tiktok?.trim() || undefined,
          youtube: updatePayload.social.youtube?.trim() || undefined,
          website: updatePayload.social.website?.trim() || undefined,
        }

        if (!social.instagram && !social.twitter && !social.tiktok && !social.youtube && !social.website) {
          delete updatePayload.social
        } else {
          updatePayload.social = social
        }
      }
      if (updatePayload.residence && !updatePayload.residence.city) delete updatePayload.residence

      await updateFighter(editingId, updatePayload)

      // Update local state
      const existing = fighters.find(f => f.id === editingId)
      if (existing) {
        onUpdate({ ...existing, ...updatePayload, bouts, koPercentage })
      }
      setEditingId(null)
    } catch {
      alert('Failed to update fighter')
    } finally {
      setSavingId(null)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'inactive': return 'text-yellow-600'
      case 'retired': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  const regionLabel = (region: string) => {
    switch (region) {
      case 'TX': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'MX': return 'bg-green-50 text-green-600 border-green-300'

      default: return 'bg-gray-100 text-gray-500 border-gray-300'
    }
  }

  if (fighters.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-5">🥊</div>
        <h2 className="text-lg font-semibold text-gray-700 tracking-[0.2em] mb-2">NO FIGHTERS YET</h2>
        <p className="text-gray-400 text-[13px] leading-relaxed tracking-wide">
          Add your first fighter to start building the database
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            placeholder="Search by name, nickname, or city..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-4 py-2.5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]/30 placeholder:text-gray-400 rounded-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterWeight}
            onChange={e => { setFilterWeight(e.target.value); setCurrentPage(1) }}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
          >
            <option value="all">All Weight Classes</option>
            {activeWeightClasses.map(wc => (
              <option key={wc} value={wc}>{wc}</option>
            ))}
          </select>
          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setCurrentPage(1) }}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
          >
            <option value="all">All Regions</option>
            <option value="TX">TX</option>
            <option value="MX">MX</option>
            <option value="OTHER">OTHER</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
          <select
            value={filterSex}
            onChange={e => { setFilterSex(e.target.value); setCurrentPage(1) }}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
          >
            <option value="all">All Divisions</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 focus:outline-none focus:border-[#FFB800] rounded-md"
          >
            <option value="name">Sort: Name</option>
            <option value="wins">Sort: Most Wins</option>
            <option value="bouts">Sort: Most Bouts</option>
            <option value="ko">Sort: KO %</option>
            <option value="weight">Sort: Weight Class</option>
          </select>
        </div>
      </div>

      <p className="text-gray-400 text-[11px] font-medium tracking-[0.15em]">
        {filtered.length} FIGHTER{filtered.length !== 1 ? 'S' : ''}
        {totalPages > 1 && (
          <span className="ml-2">• PAGE {currentPage} OF {totalPages}</span>
        )}
      </p>

      {/* Fighter Cards */}
      <div className="grid gap-3">
        {paginated.map(fighter => {
          const isEditing = editingId === fighter.id

          return (
            <div
              key={fighter.id}
              className={`border rounded-lg overflow-hidden transition-colors ${
                isEditing
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Card Header — clickable to open profile */}
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setEditingId(null)
                  } else {
                    startEditing(fighter)
                  }
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                {/* Profile Image or Placeholder */}
                {fighter.profileImageUrl ? (
                  <img
                    src={fighter.profileImageUrl}
                    alt={`${fighter.firstName} ${fighter.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold">
                    {fighter.firstName[0]}{fighter.lastName?.[0]}
                  </div>
                )}

                {/* Name & Quick Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-gray-900 font-semibold text-[15px] leading-tight tracking-wide truncate">
                      {fighter.firstName} {fighter.lastName}
                    </h3>
                    {fighter.nickname && (
                      <span className="text-amber-600 text-[11px] font-medium hidden sm:inline">
                        &quot;{fighter.nickname}&quot;
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-gray-400 text-[11px] leading-none">{fighter.weightClass}</span>
                    <span className={`text-[10px] leading-none px-1.5 py-0.5 rounded border ${regionLabel(fighter.region)}`}>
                      {fighter.region}
                    </span>
                    <span className={`text-[11px] leading-none ${statusColor(fighter.status)}`}>
                      {fighter.status.toUpperCase()}
                    </span>
                    {fighter.residence && (
                      <span className="text-gray-400 text-[11px] leading-none hidden sm:inline">
                        {fighter.residence.city}, {fighter.residence.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* Record */}
                <div className="hidden sm:flex items-center gap-1 text-[13px] font-semibold font-mono tabular-nums">
                  <span className="text-green-600">{fighter.record.wins}</span>
                  <span className="text-gray-300">-</span>
                  <span className="text-red-600">{fighter.record.losses}</span>
                  <span className="text-gray-300">-</span>
                  <span className="text-gray-400">{fighter.record.draws}</span>
                  <span className="text-gray-300 ml-1 text-[10px]">({fighter.record.knockouts} KO)</span>
                </div>

                {/* Expand Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isEditing ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Edit Profile */}
              {isEditing && (
                <div className="border-t border-gray-200 p-5 space-y-5">
                  {/* Mobile Record */}
                  <div className="sm:hidden flex items-center gap-2 text-sm font-bold mb-2">
                    <span className="text-green-600">{fighter.record.wins}W</span>
                    <span className="text-red-600">{fighter.record.losses}L</span>
                    <span className="text-gray-500">{fighter.record.draws}D</span>
                    <span className="text-gray-400">({fighter.record.knockouts} KO)</span>
                  </div>

                  {/* Profile Picture */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">PROFILE PICTURE</h4>
                    <div className="flex items-start gap-4">
                      <div className="relative group w-20 h-20">
                        {editData.profileImageUrl ? (
                          <img
                            src={editData.profileImageUrl}
                            alt={`${editData.firstName || fighter.firstName} ${editData.lastName || fighter.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-xl">
                            {(editData.firstName?.[0] || fighter.firstName[0])}{(editData.lastName?.[0] || fighter.lastName?.[0])}
                          </div>
                        )}

                        <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <label className="text-[10px] font-semibold tracking-widest text-white cursor-pointer hover:text-[#FFB800] transition-colors uppercase">
                            {isUploadingImage ? 'Uploading...' : editData.profileImageUrl ? 'Change' : 'Add'}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={isUploadingImage}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) void handleImageUpload(file)
                                e.currentTarget.value = ''
                              }}
                              className="hidden"
                            />
                          </label>

                          {editData.profileImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setUploadError(null)
                                setEditData(d => ({ ...d, profileImageUrl: '' }))
                              }}
                              className="text-[10px] font-semibold tracking-widest text-red-200 hover:text-red-100 transition-colors uppercase"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-1">
                        <p className="text-[11px] text-gray-500 tracking-wide">Hover image to add, change, or delete.</p>
                        {uploadError && <p className="text-red-600 text-xs mt-1">{uploadError}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Identity */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">IDENTITY</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input
                          value={editData.firstName || ''}
                          onChange={e => setEditData(d => ({ ...d, firstName: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                          value={editData.lastName || ''}
                          onChange={e => setEditData(d => ({ ...d, lastName: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nickname</label>
                        <input
                          value={editData.nickname || ''}
                          onChange={e => setEditData(d => ({ ...d, nickname: e.target.value }))}
                          className={inputClass}
                          placeholder="El Gallo"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          value={editData.dateOfBirth || ''}
                          onChange={e => setEditData(d => ({ ...d, dateOfBirth: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Boxing Details */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">BOXING</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className={labelClass}>Weight Class</label>
                        <select
                          value={editData.weightClass || ''}
                          onChange={e => setEditData(d => ({ ...d, weightClass: e.target.value }))}
                          className={inputClass}
                        >
                          {WEIGHT_CLASSES.map(wc => (
                            <option key={wc} value={wc}>{wc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={editData.status || 'active'}
                          onChange={e => setEditData(d => ({ ...d, status: e.target.value as Fighter['status'] }))}
                          className={inputClass}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Stance</label>
                        <select
                          value={editData.stance || ''}
                          onChange={e => setEditData(d => ({ ...d, stance: e.target.value as Fighter['stance'] }))}
                          className={inputClass}
                        >
                          <option value="">—</option>
                          <option value="orthodox">Orthodox</option>
                          <option value="southpaw">Southpaw</option>
                          <option value="switch">Switch</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Sex</label>
                        <select
                          value={editData.sex || 'male'}
                          onChange={e => setEditData(d => ({ ...d, sex: e.target.value as Fighter['sex'] }))}
                          className={inputClass}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Region</label>
                        <select
                          value={editData.region || 'TX'}
                          onChange={e => setEditData(d => ({ ...d, region: e.target.value as Fighter['region'] }))}
                          className={inputClass}
                        >
                          <option value="TX">TX</option>
                          <option value="MX">MX</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Record */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">RECORD</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={labelClass}>Wins</label>
                        <input
                          type="number"
                          min={0}
                          value={editData.record?.wins ?? 0}
                          onChange={e => setEditData(d => ({
                            ...d,
                            record: { ...d.record!, wins: Number(e.target.value) || 0 }
                          }))}
                          className={inputClass + ' font-mono text-green-600'}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Losses</label>
                        <input
                          type="number"
                          min={0}
                          value={editData.record?.losses ?? 0}
                          onChange={e => setEditData(d => ({
                            ...d,
                            record: { ...d.record!, losses: Number(e.target.value) || 0 }
                          }))}
                          className={inputClass + ' font-mono text-red-600'}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Draws</label>
                        <input
                          type="number"
                          min={0}
                          value={editData.record?.draws ?? 0}
                          onChange={e => setEditData(d => ({
                            ...d,
                            record: { ...d.record!, draws: Number(e.target.value) || 0 }
                          }))}
                          className={inputClass + ' font-mono'}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Knockouts</label>
                        <input
                          type="number"
                          min={0}
                          value={editData.record?.knockouts ?? 0}
                          onChange={e => setEditData(d => ({
                            ...d,
                            record: { ...d.record!, knockouts: Number(e.target.value) || 0 }
                          }))}
                          className={inputClass + ' font-mono text-[#FFB800]'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">LOCATION</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>City</label>
                        <input
                          value={editData.residence?.city || ''}
                          onChange={e => setEditData(d => ({
                            ...d,
                            residence: { ...d.residence!, city: e.target.value }
                          }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>State</label>
                        <input
                          value={editData.residence?.state || ''}
                          onChange={e => setEditData(d => ({
                            ...d,
                            residence: { ...d.residence!, state: e.target.value }
                          }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Country</label>
                        <input
                          value={editData.residence?.country || ''}
                          onChange={e => setEditData(d => ({
                            ...d,
                            residence: { ...d.residence!, country: e.target.value }
                          }))}
                          className={inputClass}
                          placeholder="US"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">TEAM</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Gym</label>
                        <input
                          value={editData.gym || ''}
                          onChange={e => setEditData(d => ({ ...d, gym: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Trainer</label>
                        <input
                          value={editData.trainer || ''}
                          onChange={e => setEditData(d => ({ ...d, trainer: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Promoter</label>
                        <input
                          value={editData.promoter || ''}
                          onChange={e => setEditData(d => ({ ...d, promoter: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div>
                    <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-3">SOCIAL</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Instagram</label>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-1">@</span>
                          <input
                            value={editData.social?.instagram || ''}
                            onChange={e => setEditData(d => ({
                              ...d,
                              social: { ...d.social, instagram: e.target.value },
                            }))}
                            className={inputClass}
                            placeholder="fighterhandle"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Twitter / X</label>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-1">@</span>
                          <input
                            value={editData.social?.twitter || ''}
                            onChange={e => setEditData(d => ({
                              ...d,
                              social: { ...d.social, twitter: e.target.value },
                            }))}
                            className={inputClass}
                            placeholder="fighterhandle"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>TikTok</label>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-1">@</span>
                          <input
                            value={editData.social?.tiktok || ''}
                            onChange={e => setEditData(d => ({
                              ...d,
                              social: { ...d.social, tiktok: e.target.value },
                            }))}
                            className={inputClass}
                            placeholder="fighterhandle"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>YouTube</label>
                        <input
                          value={editData.social?.youtube || ''}
                          onChange={e => setEditData(d => ({
                            ...d,
                            social: { ...d.social, youtube: e.target.value },
                          }))}
                          className={inputClass}
                          placeholder="https://youtube.com/@..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Website</label>
                        <input
                          value={editData.social?.website || ''}
                          onChange={e => setEditData(d => ({
                            ...d,
                            social: { ...d.social, website: e.target.value },
                          }))}
                          className={inputClass}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea
                      value={editData.bio || ''}
                      onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                      rows={3}
                      className={inputClass + ' resize-none'}
                      placeholder="Fighter bio..."
                    />
                  </div>

                  {/* Titles (read-only display) */}
                  {fighter.titles && fighter.titles.length > 0 && (
                    <div>
                      <h4 className="text-[11px] leading-4 font-semibold text-amber-600 tracking-[0.16em] mb-2">TITLES</h4>
                      <div className="flex flex-wrap gap-2">
                        {fighter.titles.map((t, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${
                              t.current
                                ? 'bg-amber-100 text-[#FFB800] border border-amber-300'
                                : 'bg-gray-50 text-gray-500 border border-gray-200'
                            }`}
                          >
                            🏆 {t.org} {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TDLR ID display */}
                  {(fighter as Fighter & { tdlrBoxerId?: string }).tdlrBoxerId && (
                    <p className="text-gray-400 text-xs font-mono">
                      TDLR Boxer ID: {(fighter as Fighter & { tdlrBoxerId?: string }).tdlrBoxerId}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDelete(fighter.id!, `${fighter.firstName} ${fighter.lastName}`)}
                      disabled={deletingId === fighter.id}
                      className="text-[11px] font-semibold tracking-[0.15em] text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors px-3 py-1.5 border border-red-200 rounded hover:border-red-300"
                    >
                      {deletingId === fighter.id ? 'DELETING...' : 'DELETE FIGHTER'}
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[11px] font-semibold tracking-[0.15em] text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={savingId === fighter.id || isUploadingImage}
                        className="text-[11px] font-semibold tracking-[0.15em] bg-[#FFB800] text-black px-5 py-1.5 rounded hover:bg-[#FFB800]/90 disabled:opacity-50 transition-colors"
                      >
                        {isUploadingImage ? 'UPLOADING IMAGE...' : savingId === fighter.id ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setEditingId(null) }}
            disabled={currentPage === 1}
            className="text-[11px] font-semibold tracking-[0.15em] px-4 py-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← PREV
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1]) > 1) acc.push('ellipsis')
                acc.push(p)
                return acc
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e${i}`} className="text-gray-300 text-xs px-1">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => { setCurrentPage(item); setEditingId(null) }}
                    className={`text-[11px] font-semibold w-8 h-8 rounded-md transition-colors ${
                      currentPage === item
                        ? 'bg-[#FFB800] text-black'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setEditingId(null) }}
            disabled={currentPage === totalPages}
            className="text-[11px] font-semibold tracking-[0.15em] px-4 py-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}
