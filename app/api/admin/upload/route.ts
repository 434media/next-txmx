import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { getApps } from 'firebase-admin/app'
import '../../../../lib/firebase-admin'

const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
}

function resolveContentType(file: File): string | null {
  // Use MIME type if the browser provides a valid one
  const mime = file.type?.split(';')[0]?.trim().toLowerCase()
  if (mime && ALLOWED_MIME_PREFIXES.includes(mime)) return mime

  // Fall back to file extension
  const ext = file.name?.split('.').pop()?.toLowerCase() || ''
  return ALLOWED_EXTENSIONS[ext] || null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type using MIME type or extension fallback
    const contentType = resolveContentType(file)
    if (!contentType) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type || 'unknown'}". Allowed: JPEG, PNG, WebP, AVIF` },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    const app = getApps()[0]
    const bucket = getStorage(app).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)

    // Generate a safe filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const folderParam = formData.get('folder') as string | null
    const allowedFolders = ['fighters', '8count']
    const folder = folderParam && allowedFolders.includes(folderParam) ? folderParam : 'fighters'
    const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileRef = bucket.file(safeName)
    await fileRef.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    })

    // Make publicly accessible
    await fileRef.makePublic()

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${safeName}`

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
