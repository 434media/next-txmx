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
