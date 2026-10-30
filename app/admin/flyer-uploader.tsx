"use client"

import { useState, useRef, useCallback } from "react"

interface FlyerUploaderProps {
  fightNightId: string
  currentUrl: string
  onUploaded: (url: string) => void
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB, what an admin may pick
// What the server accepts: Vercel refuses a request body over 4.5 MB.
const UPLOAD_LIMIT = 4 * 1024 * 1024

/**
 * Flyers upload through /api/admin/upload, which checks the admin allowlist and
 * writes with the server's credentials. They used to go from the browser
 * straight into Firebase Storage, which needed Storage rules letting any
 * signed-in user write anywhere in the bucket, on a project with public sign-up.
 *
 * An image over the server's limit is downscaled here first: re-encoded as JPEG
 * (Safari cannot encode WebP from a canvas), at most 3000 px on its long side,
 * stepping quality and then size down until it fits. A GIF is not, because that
 * would drop its animation.
 */
async function fitForUpload(file: File): Promise<File> {
  if (file.size <= UPLOAD_LIMIT) return file
  if (file.type === "image/gif") {
    throw new Error("GIFs must be under 4 MB. Export a smaller one, or use a JPG or PNG.")
  }
  const bitmap = await createImageBitmap(file)
  let scale = Math.min(1, 3000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) break
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.9, 0.8, 0.7]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
      if (blob && blob.size <= UPLOAD_LIMIT) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
      }
    }
    scale *= 0.8
  }
  throw new Error("Couldn't shrink this image under 4 MB. Try a smaller file.")
}

/** POST to the admin upload route, reporting progress (fetch cannot). */
function uploadFlyer(file: File, fightNightId: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)
    form.append("folder", "fightnights")
    form.append("fightNightId", fightNightId)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/admin/upload")
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let data: { url?: string; error?: string } = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // fall through to the status message
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url)
      else reject(new Error(data.error || `Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."))
    xhr.send(form)
  })
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

      try {
        const ready = await fitForUpload(file)
        const url = await uploadFlyer(ready, fightNightId, setProgress)
        onUploaded(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
      }
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
              ? "border-gray-900 bg-amber-50/40"
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
              className="h-full bg-gray-900 transition-all duration-200"
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
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] px-3 py-2 rounded-md focus:outline-none focus:border-gray-900"
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
