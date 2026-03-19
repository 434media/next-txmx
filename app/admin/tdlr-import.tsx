'use client'

import { useState, useRef } from 'react'
import { importTDLREvent } from '../actions/tdlr-import'

interface TDLRFighter {
  name: string
  city: string
  state: string
  boxerId: string
  weight: number
}

interface TDLRBout {
  boutNumber: number
  referee: string
  fighter1: TDLRFighter
  fighter2: TDLRFighter
  rounds: number
  result: string
  method: string
  scores: string[]
  weightClass: string | null
  titleFight: string | null
}

interface TDLREvent {
  date: string
  eventNumber: string
  city: string
  promoter: string
  venue: string
  address: string
  bouts: TDLRBout[]
}

interface ImportResult {
  eventId: string
  fightersCreated: number
  fightersUpdated: number
  boutsRecorded: number
  errors: string[]
}

export default function TDLRImport() {
  const [event, setEvent] = useState<TDLREvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setLoading(true)
    setError('')
    setEvent(null)
    setFileName(file.name)

    try {
      const response = await fetch('/api/tdlr-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF')
      }

      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      handleUpload(file)
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const methodColor = (method: string) => {
    switch (method) {
      case 'KO':
      case 'TKO':
        return 'text-red-400'
      case 'UD':
      case 'SD':
      case 'MD':
        return 'text-blue-400'
      default:
        return 'text-white/70'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200 ${
          loading
            ? 'border-[#FFB800]/50 bg-[#FFB800]/5'
            : 'border-white/20 hover:border-[#FFB800]/50 hover:bg-white/5'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {loading ? (
          <div className="space-y-3">
            <div className="animate-spin w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full mx-auto" />
            <p className="text-white/60 text-sm tracking-wide">
              Parsing {fileName}...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-12 h-12 text-white/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-white/80 text-sm tracking-wide font-bold">
              DROP TDLR PDF HERE
            </p>
            <p className="text-white/40 text-xs tracking-wide">
              or click to browse — Texas Dept. of Licensing and Regulation boxing results
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {event && (
        <div className="space-y-6">
          {/* Event Header */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-widest">
                  {event.venue}
                </h3>
                <p className="text-white/60 text-sm tracking-wide">
                  {event.address}
                </p>
              </div>
              <span className="text-[#FFB800] text-xs font-mono tracking-wider bg-[#FFB800]/10 px-3 py-1 rounded">
                EVENT #{event.eventNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-white/40 text-xs tracking-widest block">DATE</span>
                <span className="text-white font-mono">{event.date}</span>
              </div>
              <div>
                <span className="text-white/40 text-xs tracking-widest block">CITY</span>
                <span className="text-white">{event.city}</span>
              </div>
              <div>
                <span className="text-white/40 text-xs tracking-widest block">PROMOTER</span>
                <span className="text-white">{event.promoter}</span>
              </div>
              <div>
                <span className="text-white/40 text-xs tracking-widest block">BOUTS</span>
                <span className="text-white font-mono">{event.bouts.length}</span>
              </div>
            </div>
          </div>

          {/* Bout Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/40 tracking-widest">
              FIGHT RESULTS
            </h4>
            {event.bouts.map((bout) => (
              <div
                key={bout.boutNumber}
                className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-white/20 transition-colors"
              >
                {/* Bout Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-white/10 text-white/60 text-xs font-mono w-7 h-7 rounded flex items-center justify-center">
                      {bout.boutNumber}
                    </span>
                    {bout.titleFight && (
                      <span className="text-[#FFB800] text-xs font-bold tracking-widest bg-[#FFB800]/10 px-2 py-0.5 rounded">
                        {bout.titleFight.toUpperCase()}
                      </span>
                    )}
                    {bout.weightClass && (
                      <span className="text-white/40 text-xs tracking-wide capitalize">
                        {bout.weightClass}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold tracking-wider ${methodColor(bout.method)}`}>
                      {bout.method}
                    </span>
                    <span className="text-white/30 text-xs ml-2">
                      {bout.rounds}R • Ref: {bout.referee}
                    </span>
                  </div>
                </div>

                {/* Fighters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fighter 1 */}
                  <div className={`rounded-lg p-3 ${
                    bout.result.split(' by ')[0] === bout.fighter1.name.split(' ').pop()
                      ? 'bg-green-900/20 border border-green-500/20'
                      : 'bg-white/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-sm tracking-wide">
                          {bout.fighter1.name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {bout.fighter1.city}, {bout.fighter1.state}
                        </p>
                      </div>
                      <span className="text-white/60 text-xs font-mono">
                        {bout.fighter1.weight} lbs
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mt-1 font-mono">
                      ID: {bout.fighter1.boxerId}
                    </p>
                  </div>

                  {/* Fighter 2 */}
                  <div className={`rounded-lg p-3 ${
                    bout.result.split(' by ')[0] === bout.fighter2.name.split(' ').pop()
                      ? 'bg-green-900/20 border border-green-500/20'
                      : 'bg-white/5'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-sm tracking-wide">
                          {bout.fighter2.name}
                        </p>
                        <p className="text-white/40 text-xs">
                          {bout.fighter2.city}, {bout.fighter2.state}
                        </p>
                      </div>
                      <span className="text-white/60 text-xs font-mono">
                        {bout.fighter2.weight} lbs
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mt-1 font-mono">
                      ID: {bout.fighter2.boxerId}
                    </p>
                  </div>
                </div>

                {/* Result */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-white/80 text-sm">
                    <span className="text-white font-bold">{bout.result}</span>
                  </p>
                  {bout.scores.length > 0 && (
                    <div className="flex gap-4 mt-1">
                      {bout.scores.map((score, i) => (
                        <span key={i} className="text-white/40 text-xs font-mono">
                          {score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save + Reset */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setEvent(null)
                setFileName('')
                setImportResult(null)
                setError('')
                if (fileRef.current) fileRef.current.value = ''
              }}
              className="text-white/40 text-xs tracking-widest hover:text-white/60 transition-colors"
            >
              ← UPLOAD ANOTHER PDF
            </button>

            {!importResult && (
              <button
                onClick={async () => {
                  if (!event) return
                  setSaving(true)
                  setError('')
                  try {
                    const res = await importTDLREvent(event)
                    if (!res.success) {
                      setError(res.error || 'Import failed')
                    } else {
                      setImportResult(res.results)
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Import failed')
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="bg-[#FFB800] text-black font-bold text-sm tracking-widest px-6 py-3 rounded-lg hover:bg-[#FFB800]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                    SAVING...
                  </span>
                ) : (
                  'SAVE TO DATABASE'
                )}
              </button>
            )}
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="text-green-400 font-bold text-sm tracking-widest">
                  IMPORT COMPLETE
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-white/40 text-xs tracking-widest block">FIGHTERS CREATED</span>
                  <span className="text-white font-mono text-lg">{importResult.fightersCreated}</span>
                </div>
                <div>
                  <span className="text-white/40 text-xs tracking-widest block">FIGHTERS UPDATED</span>
                  <span className="text-white font-mono text-lg">{importResult.fightersUpdated}</span>
                </div>
                <div>
                  <span className="text-white/40 text-xs tracking-widest block">BOUTS RECORDED</span>
                  <span className="text-white font-mono text-lg">{importResult.boutsRecorded}</span>
                </div>
                <div>
                  <span className="text-white/40 text-xs tracking-widest block">EVENT ID</span>
                  <span className="text-white font-mono text-xs break-all">{importResult.eventId}</span>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="border-t border-white/10 pt-3">
                  <p className="text-red-400 text-xs tracking-widest font-bold mb-2">ERRORS</p>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-red-400/70 text-xs">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
