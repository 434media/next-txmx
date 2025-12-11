import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Initialize Google Auth
const getAuth = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !privateKey) {
    throw new Error('Missing Google service account credentials')
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
  }

  try {
    const auth = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    // Get the file as a stream
    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' }
    )

    // Get file metadata to determine content type
    const metadata = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
      supportsAllDrives: true,
    })

    const contentType = metadata.data.mimeType || 'image/jpeg'

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.data as any) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error fetching image from Drive:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
