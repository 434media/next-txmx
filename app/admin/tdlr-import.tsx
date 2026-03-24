'use client'

import { useState, useRef, useCallback } from 'react'
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

type BatchItemStatus = 'pending' | 'parsing' | 'parsed' | 'saving' | 'done' | 'error'

interface BatchItem {
  file: File
  status: BatchItemStatus
  event?: TDLREvent
  result?: ImportResult
  error?: string
}

interface TDLRImportProps {
  onImportComplete?: () => void
}

export default function TDLRImport({ onImportComplete }: TDLRImportProps) {
  // Single-file mode state
  const [event, setEvent] = useState<TDLREvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Batch mode state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [batchRunning, setBatchRunning] = useState(false)
  const batchFileRef = useRef<HTMLInputElement>(null)

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
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    )
    if (files.length === 0) {
      setError('Please upload PDF files')
      return
    }
    if (files.length === 1) {
      handleUpload(files[0])
    } else {
      startBatch(files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type === 'application/pdf'
    )
    if (files.length > 0) {
      startBatch(files)
    }
  }

  const startBatch = (files: File[]) => {
    setEvent(null)
    setImportResult(null)
    setError('')
    setBatchItems(
      files.map((file) => ({ file, status: 'pending' as BatchItemStatus }))
    )
  }

  const runBatch = useCallback(async () => {
    setBatchRunning(true)

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]
      if (item.status !== 'pending') continue

      // Parse
      setBatchItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'parsing' } : it))
      )

      let parsedEvent: TDLREvent
      try {
        const response = await fetch('/api/tdlr-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/pdf' },
          body: item.file,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to parse PDF')
        parsedEvent = data
      } catch (err) {
        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: 'error', error: err instanceof Error ? err.message : 'Parse failed' }
              : it
          )
        )
        continue
      }

      setBatchItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: 'parsed', event: parsedEvent } : it
        )
      )

      // Save
      setBatchItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'saving' } : it))
      )

      try {
        const res = await importTDLREvent(parsedEvent)
        if (!res.success) throw new Error(res.error || 'Import failed')
        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: 'done', result: res.results } : it
          )
        )
      } catch (err) {
        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, status: 'error', error: err instanceof Error ? err.message : 'Import failed' }
              : it
          )
        )
      }
    }

    setBatchRunning(false)
    onImportComplete?.()
  }, [batchItems, onImportComplete])

  const methodColor = (method: string) => {
    switch (method) {
      case 'KO':
      case 'TKO':
        return 'text-red-600'
      case 'UD':
      case 'SD':
      case 'MD':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const batchTotals = batchItems.reduce(
    (acc, item) => {
      if (item.result) {
        acc.fightersCreated += item.result.fightersCreated
        acc.fightersUpdated += item.result.fightersUpdated
        acc.boutsRecorded += item.result.boutsRecorded
        acc.errors += item.result.errors.length
      }
      return acc
    },
    { fightersCreated: 0, fightersUpdated: 0, boutsRecorded: 0, errors: 0 }
  )

  const batchDone = batchItems.filter((i) => i.status === 'done').length
  const batchFailed = batchItems.filter((i) => i.status === 'error').length
  const batchFinished = !batchRunning && batchItems.length > 0 && batchItems.every((i) => i.status === 'done' || i.status === 'error')

  // ─── Batch Mode UI ───
  if (batchItems.length > 0) {
    return (
      <div className="space-y-6">
        {/* Batch Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-widest">
              BATCH IMPORT
            </h3>
            <p className="text-gray-400 text-xs tracking-wide mt-1">
              {batchItems.length} PDF{batchItems.length !== 1 ? 's' : ''} queued
              {batchRunning && ` — processing ${batchDone + batchFailed + 1} of ${batchItems.length}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!batchRunning && !batchFinished && (
              <button
                onClick={runBatch}
                className="bg-[#FFB800] text-black font-bold text-sm tracking-widest px-6 py-3 rounded-lg hover:bg-[#FFB800]/90 transition-colors"
              >
                IMPORT ALL
              </button>
            )}
            <button
              onClick={() => {
                setBatchItems([])
                if (batchFileRef.current) batchFileRef.current.value = ''
              }}
              disabled={batchRunning}
              className="text-gray-400 text-xs tracking-widest hover:text-gray-500 transition-colors disabled:opacity-50"
            >
              {batchFinished ? '← START OVER' : '← CANCEL'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {batchRunning && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#FFB800] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((batchDone + batchFailed) / batchItems.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Batch Summary (when finished) */}
        {batchFinished && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h4 className="text-green-600 font-bold text-sm tracking-widest">
                BATCH IMPORT COMPLETE
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">EVENTS</span>
                <span className="text-gray-900 font-mono text-lg">{batchDone}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">FIGHTERS CREATED</span>
                <span className="text-gray-900 font-mono text-lg">{batchTotals.fightersCreated}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">FIGHTERS UPDATED</span>
                <span className="text-gray-900 font-mono text-lg">{batchTotals.fightersUpdated}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">BOUTS RECORDED</span>
                <span className="text-gray-900 font-mono text-lg">{batchTotals.boutsRecorded}</span>
              </div>
              {batchFailed > 0 && (
                <div>
                  <span className="text-red-400 text-xs tracking-widest block">FAILED</span>
                  <span className="text-red-600 font-mono text-lg">{batchFailed}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File List */}
        <div className="space-y-2">
          {batchItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm border transition-colors ${
                item.status === 'done'
                  ? 'bg-green-50 border-green-200'
                  : item.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : item.status === 'parsing' || item.status === 'saving'
                  ? 'bg-amber-50 border-[#FFB800]/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-gray-400 font-mono text-xs w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-700 truncate">{item.file.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {item.status === 'pending' && (
                  <span className="text-gray-400 text-xs tracking-wider">QUEUED</span>
                )}
                {item.status === 'parsing' && (
                  <span className="flex items-center gap-2 text-[#FFB800] text-xs tracking-wider">
                    <span className="animate-spin w-3 h-3 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                    PARSING
                  </span>
                )}
                {item.status === 'parsed' && (
                  <span className="text-blue-600 text-xs tracking-wider">PARSED</span>
                )}
                {item.status === 'saving' && (
                  <span className="flex items-center gap-2 text-[#FFB800] text-xs tracking-wider">
                    <span className="animate-spin w-3 h-3 border-2 border-[#FFB800] border-t-transparent rounded-full" />
                    SAVING
                  </span>
                )}
                {item.status === 'done' && item.result && (
                  <span className="text-green-600 text-xs tracking-wider">
                    ✓ {item.result.boutsRecorded} bouts
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="text-red-500 text-xs tracking-wider truncate max-w-48" title={item.error}>
                    ✗ {item.error}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Single File Mode UI ───
  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200 ${
          loading
            ? 'border-[#FFB800]/50 bg-amber-50'
            : 'border-gray-300 hover:border-[#FFB800]/50 hover:bg-gray-50'
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
            <p className="text-gray-500 text-sm tracking-wide">
              Parsing {fileName}...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-gray-700 text-sm tracking-wide font-bold">
              DROP TDLR PDF(s) HERE
            </p>
            <p className="text-gray-400 text-xs tracking-wide">
              drop one for preview, or multiple to batch import
            </p>
          </div>
        )}
      </div>

      {/* Batch Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={() => batchFileRef.current?.click()}
          className="text-gray-500 text-xs tracking-widest hover:text-gray-700 transition-colors border border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400"
        >
          SELECT MULTIPLE PDFs FOR BATCH IMPORT
        </button>
        <input
          ref={batchFileRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleBatchFileChange}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {event && (
        <div className="space-y-6">
          {/* Event Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-widest">
                  {event.venue}
                </h3>
                <p className="text-gray-500 text-sm tracking-wide">
                  {event.address}
                </p>
              </div>
              <span className="text-[#FFB800] text-xs font-mono tracking-wider bg-amber-50 px-3 py-1 rounded">
                EVENT #{event.eventNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">DATE</span>
                <span className="text-gray-900 font-mono">{event.date}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">CITY</span>
                <span className="text-gray-900">{event.city}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">PROMOTER</span>
                <span className="text-gray-900">{event.promoter}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs tracking-widest block">BOUTS</span>
                <span className="text-gray-900 font-mono">{event.bouts.length}</span>
              </div>
            </div>
          </div>

          {/* Bout Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 tracking-widest">
              FIGHT RESULTS
            </h4>
            {event.bouts.map((bout) => (
              <div
                key={bout.boutNumber}
                className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                {/* Bout Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-500 text-xs font-mono w-7 h-7 rounded flex items-center justify-center">
                      {bout.boutNumber}
                    </span>
                    {bout.titleFight && (
                      <span className="text-[#FFB800] text-xs font-bold tracking-widest bg-amber-50 px-2 py-0.5 rounded">
                        {bout.titleFight.toUpperCase()}
                      </span>
                    )}
                    {bout.weightClass && (
                      <span className="text-gray-400 text-xs tracking-wide capitalize">
                        {bout.weightClass}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold tracking-wider ${methodColor(bout.method)}`}>
                      {bout.method}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {bout.rounds}R • Ref: {bout.referee}
                    </span>
                  </div>
                </div>

                {/* Fighters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fighter 1 */}
                  <div className={`rounded-lg p-3 ${
                    bout.result.split(' by ')[0] === bout.fighter1.name.split(' ').pop()
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-bold text-sm tracking-wide">
                          {bout.fighter1.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {bout.fighter1.city}, {bout.fighter1.state}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs font-mono">
                        {bout.fighter1.weight} lbs
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 font-mono">
                      ID: {bout.fighter1.boxerId}
                    </p>
                  </div>

                  {/* Fighter 2 */}
                  <div className={`rounded-lg p-3 ${
                    bout.result.split(' by ')[0] === bout.fighter2.name.split(' ').pop()
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-bold text-sm tracking-wide">
                          {bout.fighter2.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {bout.fighter2.city}, {bout.fighter2.state}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs font-mono">
                        {bout.fighter2.weight} lbs
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 font-mono">
                      ID: {bout.fighter2.boxerId}
                    </p>
                  </div>
                </div>

                {/* Result */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-700 text-sm">
                    <span className="text-gray-900 font-bold">{bout.result}</span>
                  </p>
                  {bout.scores.length > 0 && (
                    <div className="flex gap-4 mt-1">
                      {bout.scores.map((score, i) => (
                        <span key={i} className="text-gray-400 text-xs font-mono">
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
              className="text-gray-400 text-xs tracking-widest hover:text-gray-500 transition-colors"
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
                      onImportComplete?.()
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
            <div className="bg-green-50 border border-green-300 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h4 className="text-green-600 font-bold text-sm tracking-widest">
                  IMPORT COMPLETE
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 text-xs tracking-widest block">FIGHTERS CREATED</span>
                  <span className="text-gray-900 font-mono text-lg">{importResult.fightersCreated}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs tracking-widest block">FIGHTERS UPDATED</span>
                  <span className="text-gray-900 font-mono text-lg">{importResult.fightersUpdated}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs tracking-widest block">BOUTS RECORDED</span>
                  <span className="text-gray-900 font-mono text-lg">{importResult.boutsRecorded}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs tracking-widest block">EVENT ID</span>
                  <span className="text-gray-900 font-mono text-xs break-all">{importResult.eventId}</span>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-red-600 text-xs tracking-widest font-bold mb-2">ERRORS</p>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-red-500 text-xs">{err}</p>
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
