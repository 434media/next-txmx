import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import { google } from 'googleapis'
import { getAuth, isValidDriveFileId } from '@/lib/google-drive'
import { contentDisposition } from '@/lib/content-disposition.mjs'

// Widths the gallery may ask for. An allowlist keeps the CDN cache from
// fragmenting across arbitrary sizes and bounds what a caller can make us
// pull from Drive.
const ALLOWED_WIDTHS = new Set([400, 600, 1200, 1600, 2048])

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'public, max-age=31536000',
  'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  if (!isValidDriveFileId(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
  }

  const widthParam = searchParams.get('w')
  let width: number | null = null
  if (widthParam !== null) {
    const parsed = Number(widthParam)
    if (!ALLOWED_WIDTHS.has(parsed)) {
      return NextResponse.json(
        { error: `Unsupported width. Allowed: ${[...ALLOWED_WIDTHS].join(', ')}` },
        { status: 400 }
      )
    }
    width = parsed
  }

  const asDownload = searchParams.get('download') === '1'

  try {
    const auth = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    // A sized request is served from Drive's own thumbnail renderer. The
    // originals are camera-native JPEGs (15MB median, up to 67MB) — well past
    // Vercel's 4.5MB buffered-response cap, and orders of magnitude more than
    // a grid tile needs. thumbnailLink is short-lived, so it is resolved per
    // request rather than cached.
    if (width !== null) {
      const { data } = await drive.files.get({
        fileId,
        fields: 'thumbnailLink, mimeType, name',
        supportsAllDrives: true,
      })

      if (data.thumbnailLink) {
        // Drive encodes the size as a trailing `=s<N>`; swap in the one we want.
        const thumbUrl = data.thumbnailLink.replace(/=s\d+(-[a-z]+)?$/, '') + `=s${width}`
        const thumbRes = await fetch(thumbUrl)

        if (thumbRes.ok && thumbRes.body) {
          const headers = new Headers({
            ...CACHE_HEADERS,
            'Content-Type': thumbRes.headers.get('content-type') || 'image/jpeg',
          })
          if (asDownload) {
            headers.set('Content-Disposition', contentDisposition(data.name, fileId))
          }
          return new NextResponse(thumbRes.body, { headers })
        }
      }
      // No thumbnail available (or it failed) — fall through to the original.
    }

    const metadata = await drive.files.get({
      fileId,
      fields: 'mimeType, name, size',
      supportsAllDrives: true,
    })

    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' }
    )

    const contentType = metadata.data.mimeType || 'image/jpeg'

    // Streamed rather than buffered: these originals would otherwise be held
    // whole in function memory and exceed the buffered-response size limit.
    const body = Readable.toWeb(response.data as Readable) as ReadableStream<Uint8Array>

    const headers = new Headers({ ...CACHE_HEADERS, 'Content-Type': contentType })
    if (metadata.data.size) headers.set('Content-Length', String(metadata.data.size))
    if (asDownload) {
      headers.set('Content-Disposition', contentDisposition(metadata.data.name, fileId))
    }

    return new NextResponse(body, { headers })
  } catch (error) {
    console.error('Error fetching image from Drive:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
