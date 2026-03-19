import { google } from 'googleapis'
import type { GalleryImage, GalleryCategory } from './gallery-images'

const isDev = process.env.NODE_ENV === 'development'

// Shared Google Auth — used by all Drive operations
export const getAuth = () => {
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

// Validate Google Drive file IDs (alphanumeric, hyphens, underscores)
const DRIVE_FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/
export const isValidDriveFileId = (id: string): boolean =>
  id.length > 0 && id.length <= 128 && DRIVE_FILE_ID_PATTERN.test(id)

// In-memory cache for image list
let cachedImages: GalleryImage[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Map Google Drive folder names to app categories
const categoryMap: Record<string, Exclude<GalleryCategory, 'all'>> = {
  'red-carpet': 'red-carpet',
  'red carpet': 'red-carpet',
  'redcarpet': 'red-carpet',
  'champions': 'honorees',
  'honorees': 'honorees',
  'boxing': 'honorees',
  'music': 'music',
  'performance': 'music',
  'entertainment': 'music',
  'reception': 'reception',
  'party': 'reception',
  'venue': 'reception',
}

// Determine category from folder name or file name
const getCategoryFromName = (name: string): Exclude<GalleryCategory, 'all'> => {
  const lowerName = name.toLowerCase()
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerName.includes(key)) {
      return value
    }
  }
  
  return 'reception' // default category
}

interface DriveFile {
  id?: string | null
  name?: string | null
  mimeType?: string | null
  parents?: string[] | null
}

// Fetch all images from a Google Drive folder and its subfolders
export async function getImagesFromDrive(folderId: string): Promise<GalleryImage[]> {
  // Return cached result if still valid
  if (cachedImages && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    if (isDev) console.log('[Google Drive] Returning cached images')
    return cachedImages
  }

  try {
    const auth = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    const allFiles: DriveFile[] = []
    
    // Recursively get files with pagination support
    const getFilesRecursive = async (parentId: string, folderName?: string) => {
      if (isDev) console.log(`[Google Drive] Fetching files from folder: ${folderName || 'root'} (${parentId})`)
      
      let pageToken: string | undefined

      do {
        const response = await drive.files.list({
          q: `'${parentId}' in parents and trashed=false`,
          fields: 'nextPageToken, files(id, name, mimeType, parents)',
          pageSize: 1000,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        })

        const files = response.data.files || []
        if (isDev) console.log(`[Google Drive] Found ${files.length} files in ${folderName || 'root'}`)

        for (const file of files) {
          if (file.mimeType === 'application/vnd.google-apps.folder' && file.id) {
            if (isDev) console.log(`[Google Drive] Found subfolder: ${file.name}`)
            await getFilesRecursive(file.id, file.name ?? undefined)
          } else if (file.mimeType?.startsWith('image/') && file.id) {
            allFiles.push({
              id: file.id,
              name: folderName ? `${folderName}/${file.name ?? 'Untitled'}` : file.name ?? 'Untitled',
              mimeType: file.mimeType,
              parents: file.parents ?? undefined,
            })
          }
        }

        pageToken = response.data.nextPageToken ?? undefined
      } while (pageToken)
    }

    await getFilesRecursive(folderId)
    if (isDev) console.log(`[Google Drive] Total images found: ${allFiles.length}`)

    // Transform to GalleryImage format
    const images: GalleryImage[] = allFiles
      .filter((file): file is Required<DriveFile> => !!file.id)
      .map((file) => {
      const category = getCategoryFromName(file.name ?? '')
      
      const altText = (file.name || 'Event photo')
        .split('/').pop()
        ?.replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\d+/g, '')
        .trim() || 'Event photo'

      return {
        id: `drive-${file.id}`,
        src: `/api/gallery/image?id=${file.id}`,
        alt: altText,
        category,
      }
    })

    // Update cache
    cachedImages = images
    cacheTimestamp = Date.now()

    return images
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error)
    throw new Error('Failed to fetch images from Google Drive')
  }
}

// Get a specific image's download URL
export async function getImageDownloadUrl(fileId: string): Promise<string> {
  try {
    const auth = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    const response = await drive.files.get({
      fileId,
      fields: 'webContentLink',
    })

    return response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`
  } catch (error) {
    console.error('Error getting download URL:', error)
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
}
