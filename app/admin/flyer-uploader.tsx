"use client"

import { useState, useRef, useCallback } from "react"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "../../lib/firebase-client"

interface FlyerUploaderProps {
  fightNightId: string
  currentUrl: string
  onUploaded: (url: string) => void
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg"
  if (mime === "image/png") return "png"
  if (mime === "image/webp") return "webp"
  if (mime === "image/gif") return "gif"
  return "bin"
}

export default function FlyerUploader({
  fightNightId,
  currentUrl,
  onUploaded,
}: FlyerUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [manualUrl, setManualUrl] = useState("")

  const handleFile = useCallback(
    async (file: File) => {
      setError("")
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("File must be JPG, PNG, WebP, or GIF")
        return
      }
      if (file.size > MAX_BYTES) {
        setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`)
        return
      }

      setUploading(true)
      setProgress(0)

      const ext = extFromMime(file.type)
      const path = `fightnights/${fightNightId}/flyer-${Date.now()}.${ext}`
      const fileRef = storageRef(storage, path)

      const task = uploadBytesResumable(fileRef, file, {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      })

      task.on(
        "state_changed",
        (snap) => {
          setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        },
        (err) => {
          setError(err.message)
          setUploading(false)
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref)
            onUploaded(url)
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to read URL")
          } finally {
            setUploading(false)
          }
        }
      )
    },
    [fightNightId, onUploaded]
  )

  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-400 tracking-[0.15em] block mb-2">
        FLYER IMAGE
      </label>

      {/* Drop zone OR current preview */}
      {currentUrl ? (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Flyer preview"
            className="w-full max-h-72 object-contain bg-white"
          />
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <p className="text-[10px] text-gray-500 truncate flex-1">{currentUrl}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[11px] font-semibold text-gray-700 hover:text-gray-900 px-2.5 py-1 border border-gray-200 rounded hover:bg-white transition-colors shrink-0"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onUploaded("")}
              className="text-[11px] font-semibold text-gray-400 hover:text-red-500 px-2.5 py-1 transition-colors shrink-0"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg px-6 py-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#FFB800] bg-amber-50/40"
              : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-8 h-8 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-[13px] font-semibold text-gray-700 mb-1">
            Drop an image, or click to browse
          </p>
          <p className="text-[11px] text-gray-400">JPG, PNG, WebP, or GIF · Max 10 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          // reset input so re-selecting the same file fires onChange
          if (inputRef.current) inputRef.current.value = ""
        }}
        className="hidden"
      />

      {/* Progress */}
      {uploading && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-gray-500 font-medium">Uploading…</span>
            <span className="text-gray-700 font-semibold tabular-nums">{progress}%</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFB800] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-2 text-red-600 text-xs font-medium">{error}</p>}

      {/* Fallback: paste a URL manually */}
      <details className="mt-3">
        <summary className="text-[11px] font-medium text-gray-400 cursor-pointer hover:text-gray-600">
          Or paste a URL manually
        </summary>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] px-3 py-2 rounded-md focus:outline-none focus:border-[#FFB800]"
          />
          <button
            type="button"
            disabled={!manualUrl.trim()}
            onClick={() => {
              onUploaded(manualUrl.trim())
              setManualUrl("")
            }}
            className="px-3 py-2 bg-gray-900 text-white text-[11px] font-semibold rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            Set
          </button>
        </div>
      </details>
    </div>
  )
}
