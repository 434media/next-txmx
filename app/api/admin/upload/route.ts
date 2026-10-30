import { NextRequest, NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { getApps } from 'firebase-admin/app'
import '../../../../lib/firebase-admin'
import { getAdminSession } from '../../../../lib/admin-auth'

const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const ALLOWED_EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
}

// Vercel refuses a function request body over 4.5 MB before this code runs, so
// the limit sits just under it. The flyer uploader downscales larger images in
// the browser first.
const MAX_BYTES = 4 * 1024 * 1024

// A fight night id becomes part of a storage path, so it is held to a strict shape.
const FIGHT_NIGHT_ID = /^[A-Za-z0-9_-]{1,128}$/

const EXT_FOR_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
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
  // Admin only: 401 without a valid session, 403 if not on ADMIN_EMAILS.
  const session = await getAdminSession()
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: session.status })
  }

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

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4 MB' },
        { status: 400 }
      )
    }

    const app = getApps()[0]
    const bucket = getStorage(app).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)

    // Generate a safe filename. The extension comes from the validated content
    // type, never from the uploaded name.
    const ext = EXT_FOR_TYPE[contentType] || 'jpg'
    const folderParam = formData.get('folder') as string | null
    const allowedFolders = ['fighters', '8count', 'fan-cards', 'fightnights']
    const folder = folderParam && allowedFolders.includes(folderParam) ? folderParam : 'fighters'

    let safeName: string
    if (folder === 'fightnights') {
      // Fight night flyers (app/admin/flyer-uploader.tsx). They used to upload
      // from the browser straight into Storage, which needed Storage rules that
      // let ANY signed-in user write anywhere in the bucket, on a project with
      // public sign-up. Through this route only an allowlisted admin can write.
      const fightNightId = String(formData.get('fightNightId') ?? '')
      if (!FIGHT_NIGHT_ID.test(fightNightId)) {
        return NextResponse.json({ error: 'Invalid fight night' }, { status: 400 })
      }
      safeName = `fightnights/${fightNightId}/flyer-${Date.now()}.${ext}`
    } else {
      safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileRef = bucket.file(safeName)
    await fileRef.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
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
