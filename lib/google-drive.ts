import { google } from 'googleapis'
import type { GalleryImage, GalleryCategory } from './gallery-images'

// Initialize Google Auth with service account
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
  try {
    const auth = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    // Get all files in the folder and subfolders
    const allFiles: DriveFile[] = []
    
    // Function to recursively get files from folders
    const getFilesRecursive = async (parentId: string, folderName?: string) => {
      console.log(`[Google Drive] Fetching files from folder: ${folderName || 'root'} (${parentId})`)
      
      const response = await drive.files.list({
        q: `'${parentId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, parents)',
        pageSize: 1000,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      })

      const files = response.data.files || []
      console.log(`[Google Drive] Found ${files.length} files in ${folderName || 'root'}`)

      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder' && file.id) {
          // Recursively get files from subfolder
          console.log(`[Google Drive] Found subfolder: ${file.name}`)
          await getFilesRecursive(file.id, file.name ?? undefined)
        } else if (file.mimeType?.startsWith('image/') && file.id) {
          // Add image file with folder context
          console.log(`[Google Drive] Found image: ${file.name} (${file.mimeType})`)
          allFiles.push({
            id: file.id,
            name: folderName ? `${folderName}/${file.name ?? 'Untitled'}` : file.name ?? 'Untitled',
            mimeType: file.mimeType,
            parents: file.parents ?? undefined,
          })
        }
      }
    }

    await getFilesRecursive(folderId)
    console.log(`[Google Drive] Total images found: ${allFiles.length}`)

    // Transform to GalleryImage format
    const images: GalleryImage[] = allFiles
      .filter((file): file is Required<DriveFile> => !!file.id)
      .map((file, index) => {
      // Get category from folder name or file name
      const category = getCategoryFromName(file.name ?? '')
      
      // Generate alt text from filename
      const altText = (file.name || 'Event photo')
        .split('/').pop() // Get filename without folder
        ?.replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
        .replace(/\d+/g, '') // Remove numbers
        .trim() || 'Event photo'

      return {
        id: `drive-${file.id}`,
        src: `/api/gallery/image?id=${file.id}`,
        alt: altText,
        category,
      }
    })

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
