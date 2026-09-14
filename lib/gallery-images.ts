// Rise of a Champion Event Gallery Images
// Images loaded from Google Drive API
export const GALLERY_IMAGES: GalleryImage[] = []


// TypeScript types for gallery images
export type GalleryCategory = "all" | "red-carpet" | "honorees" | "music" | "reception"

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: Exclude<GalleryCategory, "all">
}

/**
 * Build the proxy URL for a gallery image at a given render width.
 *
 * Without a width the proxy streams the Drive original (15MB median, 67MB at
 * the top end) — right for the download button, far too heavy for a grid tile.
 * With one it serves a resized Drive thumbnail instead. Widths must be on the
 * proxy's allowlist (400 / 600 / 1200 / 1600 / 2048).
 */
export function galleryImageSrc(src: string, width?: number): string {
  if (!width) return src
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
}

/**
 * Build the proxy URL that downloads the full-resolution original.
 *
 * The proxy answers this with Content-Disposition: attachment so the browser
 * streams it to disk itself — see the download handler in the image modal.
 */
export function galleryDownloadSrc(src: string): string {
  return `${src}${src.includes('?') ? '&' : '?'}download=1`
}
