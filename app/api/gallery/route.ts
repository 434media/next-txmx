import { NextResponse } from 'next/server'
import { getImagesFromDrive } from '@/lib/google-drive'

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!folderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID not configured' },
        { status: 500 }
      )
    }

    // Fetch images from Google Drive
    const images = await getImagesFromDrive(folderId)

    // Return with cache headers
    return NextResponse.json(images, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 24}`,
      },
    })
  } catch (error) {
    console.error('Gallery API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch gallery images',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
