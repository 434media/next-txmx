'use client'

import { useState } from 'react'
import { addFighter } from '../actions/fighters'
import { WEIGHT_CLASSES, TITLE_ORGS } from '../../lib/types/fighter'
import type { Fighter, FighterTitle } from '../../lib/types/fighter'

interface AddFighterFormProps {
  onSuccess: (fighter: Fighter) => void
}

const inputClass =
  'w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 text-sm font-medium leading-5 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] placeholder:text-gray-400 rounded-md'
const labelClass = 'block text-[11px] leading-4 font-semibold text-gray-600 tracking-[0.12em] mb-1.5 uppercase'
const sectionClass = 'border border-gray-200 rounded-lg p-6 space-y-4'
const sectionTitleClass = 'text-lg leading-6 font-semibold text-[#FFB800] tracking-[0.14em] mb-4 uppercase'

export default function AddFighterForm({ onSuccess }: AddFighterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titles, setTitles] = useState<FighterTitle[]>([])
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUploadedImageUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const fd = new FormData(form)

    const data = {
      firstName: (fd.get('firstName') as string).trim(),
      lastName: (fd.get('lastName') as string).trim(),
      birthName: (fd.get('birthName') as string)?.trim() || undefined,
      nickname: (fd.get('nickname') as string)?.trim() || undefined,
      sex: (fd.get('sex') as 'male' | 'female') || 'male',
      dateOfBirth: (fd.get('dateOfBirth') as string) || undefined,
      height: (fd.get('heightImperial') as string)
        ? {
            imperial: fd.get('heightImperial') as string,
            metric: Number(fd.get('heightMetric')) || 0,
          }
        : undefined,
      reach: (fd.get('reachImperial') as string)
        ? {
            imperial: fd.get('reachImperial') as string,
            metric: Number(fd.get('reachMetric')) || 0,
          }
        : undefined,
      stance: (fd.get('stance') as 'orthodox' | 'southpaw' | 'switch') || undefined,
      birthPlace: (fd.get('birthCity') as string)
        ? {
            city: fd.get('birthCity') as string,
            state: fd.get('birthState') as string,
            country: fd.get('birthCountry') as string,
          }
        : undefined,
      residence: (fd.get('residenceCity') as string)
        ? {
            city: fd.get('residenceCity') as string,
            state: fd.get('residenceState') as string,
            country: fd.get('residenceCountry') as string,
          }
        : undefined,
      region: (fd.get('region') as 'TX' | 'MX' | 'OTHER') || 'TX',
      weightClass: fd.get('weightClass') as string,
      status: (fd.get('status') as 'active' | 'inactive' | 'retired') || 'active',
      record: {
        wins: Number(fd.get('wins')) || 0,
        losses: Number(fd.get('losses')) || 0,
        draws: Number(fd.get('draws')) || 0,
        knockouts: Number(fd.get('knockouts')) || 0,
      },
      debutDate: (fd.get('debutDate') as string) || undefined,
      careerStart: (fd.get('careerStart') as string) || undefined,
      careerEnd: (fd.get('careerEnd') as string) || undefined,
      titles: titles.length > 0 ? titles : undefined,
      gym: (fd.get('gym') as string)?.trim() || undefined,
      trainer: (fd.get('trainer') as string)?.trim() || undefined,
      manager: (fd.get('manager') as string)?.trim() || undefined,
      promoter: (fd.get('promoter') as string)?.trim() || undefined,
      profileImageUrl: uploadedImageUrl || (fd.get('profileImageUrl') as string)?.trim() || undefined,
      highlightVideoUrl: (fd.get('highlightVideoUrl') as string)?.trim() || undefined,
      social: {
        instagram: (fd.get('instagram') as string)?.trim() || undefined,
        twitter: (fd.get('twitter') as string)?.trim() || undefined,
        tiktok: (fd.get('tiktok') as string)?.trim() || undefined,
        youtube: (fd.get('youtube') as string)?.trim() || undefined,
        website: (fd.get('website') as string)?.trim() || undefined,
      },
      bio: (fd.get('bio') as string)?.trim() || undefined,
      featuredOnTXMX: fd.get('featuredOnTXMX') === 'on',
    }

    if (!data.firstName || !data.lastName) {
      setError('First name and last name are required')
      setIsSubmitting(false)
      return
    }

    if (!data.weightClass) {
      setError('Weight class is required')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await addFighter(data)
      if (result.success) {
        onSuccess({
          ...data,
          id: result.id,
          slug: result.slug!,
          bouts: data.record.wins + data.record.losses + data.record.draws,
          koPercentage: data.record.wins > 0
            ? Math.round((data.record.knockouts / data.record.wins) * 10000) / 100
            : 0,
        })
        form.reset()
        setTitles([])
        setUploadedImageUrl(null)
      } else {
        setError(result.error || 'Failed to add fighter')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTitle = () => {
    setTitles(prev => [...prev, { org: 'WBC', title: '', current: true }])
  }

  const removeTitle = (index: number) => {
    setTitles(prev => prev.filter((_, i) => i !== index))
  }

  const updateTitle = (index: number, field: keyof FighterTitle, value: string | boolean) => {
    setTitles(prev =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Identity */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input name="firstName" required className={inputClass} placeholder="Jesse" />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input name="lastName" required className={inputClass} placeholder="Rodriguez" />
          </div>
          <div>
            <label className={labelClass}>Birth Name</label>
            <input name="birthName" className={inputClass} placeholder="Jesse James Rodríguez Franco" />
          </div>
          <div>
            <label className={labelClass}>Nickname / Alias</label>
            <input name="nickname" className={inputClass} placeholder="Bam" />
          </div>
        </div>
      </section>

      {/* Physical */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Physical</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Sex</label>
            <select name="sex" className={inputClass}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input name="dateOfBirth" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stance</label>
            <select name="stance" className={inputClass}>
              <option value="">Select...</option>
              <option value="orthodox">Orthodox</option>
              <option value="southpaw">Southpaw</option>
              <option value="switch">Switch</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Height (Imperial)</label>
            <input name="heightImperial" className={inputClass} placeholder={`5'4"`} />
          </div>
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input name="heightMetric" type="number" className={inputClass} placeholder="163" />
          </div>
          <div>
            <label className={labelClass}>Reach (Imperial)</label>
            <input name="reachImperial" className={inputClass} placeholder={`67"`} />
          </div>
          <div>
            <label className={labelClass}>Reach (cm)</label>
            <input name="reachMetric" type="number" className={inputClass} placeholder="170" />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Location</h2>
        <div>
          <label className={labelClass}>Region *</label>
          <select name="region" required className={inputClass + ' max-w-xs'}>
            <option value="TX">TX — Texas</option>
            <option value="MX">MX — Mexico</option>
            <option value="OTHER">OTHER — Outside TX/MX</option>
          </select>
        </div>
        <p className="text-xs text-gray-400 tracking-wide uppercase mt-4 mb-2">Birth Place</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="birthCity" className={inputClass} placeholder="San Antonio" />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="birthState" className={inputClass} placeholder="TX" />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input name="birthCountry" className={inputClass} placeholder="USA" />
          </div>
        </div>
        <p className="text-xs text-gray-400 tracking-wide uppercase mt-4 mb-2">Residence</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="residenceCity" className={inputClass} placeholder="San Antonio" />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="residenceState" className={inputClass} placeholder="TX" />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input name="residenceCountry" className={inputClass} placeholder="USA" />
          </div>
        </div>
      </section>

      {/* Boxing Record */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Boxing Record</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Weight Class *</label>
            <select name="weightClass" required className={inputClass}>
              <option value="">Select...</option>
              {WEIGHT_CLASSES.map(wc => (
                <option key={wc} value={wc.toLowerCase()}>
                  {wc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Debut Date</label>
            <input name="debutDate" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Career Start Year</label>
            <input name="careerStart" className={inputClass} placeholder="2013" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Wins</label>
            <input name="wins" type="number" min="0" defaultValue="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Losses</label>
            <input name="losses" type="number" min="0" defaultValue="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Draws</label>
            <input name="draws" type="number" min="0" defaultValue="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>KOs (wins by KO)</label>
            <input name="knockouts" type="number" min="0" defaultValue="0" className={inputClass} />
          </div>
        </div>
      </section>

      {/* Titles */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass + ' mb-0!'}>Titles</h2>
          <button
            type="button"
            onClick={addTitle}
            className="text-xs font-bold tracking-widest text-[#FFB800] hover:text-amber-600 transition-colors"
          >
            + ADD TITLE
          </button>
        </div>
        {titles.length === 0 && (
          <p className="text-gray-400 text-sm">No titles added</p>
        )}
        {titles.map((title, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 p-3 rounded-md">
            <div>
              <label className={labelClass}>Organization</label>
              <select
                value={title.org}
                onChange={e => updateTitle(i, 'org', e.target.value)}
                className={inputClass}
              >
                {TITLE_ORGS.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Title Name</label>
              <input
                value={title.title}
                onChange={e => updateTitle(i, 'title', e.target.value)}
                className={inputClass}
                placeholder="World Super Flyweight"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={title.current}
                  onChange={e => updateTitle(i, 'current', e.target.checked)}
                  className="accent-[#FFB800]"
                />
                Current
              </label>
              <button
                type="button"
                onClick={() => removeTitle(i)}
                className="text-red-600 hover:text-red-700 text-xs font-bold ml-auto"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Team */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Gym</label>
            <input name="gym" className={inputClass} placeholder="Robert Garcia Boxing Academy" />
          </div>
          <div>
            <label className={labelClass}>Trainer</label>
            <input name="trainer" className={inputClass} placeholder="Robert Garcia" />
          </div>
          <div>
            <label className={labelClass}>Manager</label>
            <input name="manager" className={inputClass} placeholder="" />
          </div>
          <div>
            <label className={labelClass}>Promoter</label>
            <input name="promoter" className={inputClass} placeholder="Top Rank" />
          </div>
        </div>
      </section>

      {/* Social Media & Web */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Social Media & Web</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Instagram Handle</label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input name="instagram" className={inputClass} placeholder="bamrodriguez_" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Twitter / X Handle</label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input name="twitter" className={inputClass} placeholder="bamrodriguez" />
            </div>
          </div>
          <div>
            <label className={labelClass}>TikTok Handle</label>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-1">@</span>
              <input name="tiktok" className={inputClass} placeholder="" />
            </div>
          </div>
          <div>
            <label className={labelClass}>YouTube Channel</label>
            <input name="youtube" className={inputClass} placeholder="https://youtube.com/@..." />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Website</label>
            <input name="website" className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </section>

      {/* Media */}
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Media & Bio</h2>

        {/* Profile Image Upload */}
        <div>
          <label className={labelClass}>Profile Image</label>
          <div className="flex items-start gap-4">
            {/* Preview */}
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#FFB800]/50"
              />
            )}
            <div className="flex-1 space-y-2">
              {/* File Upload */}
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#FFB800]/50 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">
                  {isUploading ? 'Uploading...' : uploadedImageUrl ? 'Change image' : 'Upload image (JPEG, PNG, WebP)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              {uploadError && (
                <p className="text-red-600 text-xs">{uploadError}</p>
              )}
              {/* OR paste URL */}
              <p className="text-gray-400 text-xs text-center">— or paste a URL —</p>
              <input name="profileImageUrl" className={inputClass} placeholder="https://storage.googleapis.com/..." />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Highlight Video URL</label>
          <input name="highlightVideoUrl" className={inputClass} placeholder="https://youtube.com/..." />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            name="bio"
            rows={4}
            className={inputClass + ' resize-none'}
            placeholder="Fighter bio / description..."
          />
        </div>
        <label className="flex items-center gap-3 mt-2 cursor-pointer">
          <input
            name="featuredOnTXMX"
            type="checkbox"
            className="accent-[#FFB800] w-4 h-4"
          />
          <span className="text-sm text-gray-700 font-medium tracking-wide">Featured on TXMX Boxing</span>
        </label>
      </section>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#FFB800] text-black px-8 py-3 font-bold text-sm tracking-widest hover:bg-[#FFB800]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md"
        >
          {isSubmitting ? 'ADDING...' : 'ADD FIGHTER'}
        </button>
      </div>
    </form>
  )
}
