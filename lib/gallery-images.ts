// Rise of a Champion Event Gallery Images
//
// Served from 434's Cloud Storage, not Google Drive. Every photo was copied
// once into the private sources bucket, and its web sizes were published to the
// public media bucket under records/rise-of-a-champion/gallery/v1/ by
// 434-context's `04 Build/build_gallery.py`, which also writes
// gallery-manifest.json. That file is generated — never hand-edited.
import manifest from './gallery-manifest.json'

// TypeScript types for gallery images
export type GalleryCategory = "all" | "red-carpet" | "honorees" | "music" | "reception"

export interface GalleryImage {
  id: string
  alt: string
  category: Exclude<GalleryCategory, "all">
  /** The photo's dimensions as displayed (after orientation), for its aspect ratio before load. */
  width: number
  height: number
  /** URL prefix; each size lives at `${base}/${width}.webp` and `.jpg`. */
  base: string
  /** Delivered widths, ascending. Never upscaled, so a narrow source ends at its own width. */
  widths: number[]
}

// The manifest stores each image's path relative to one shared base URL.
export const GALLERY: GalleryImage[] = manifest.images.map((im) => ({
  id: im.id,
  alt: im.alt,
  category: im.category as GalleryImage["category"],
  width: im.width,
  height: im.height,
  base: manifest.base + im.path,
  widths: im.widths,
}))

// The RSVP page's background strip reads this. It has always been empty and
// stays so: showing gallery photos there is a separate decision.
export const GALLERY_IMAGES: GalleryImage[] = []

/** `srcset` over every delivered width, in WebP or the JPEG fallback. */
export function gallerySrcSet(image: GalleryImage, ext: "webp" | "jpg"): string {
  return image.widths.map((w) => `${image.base}/${w}.${ext} ${w}w`).join(", ")
}

/** The smallest delivered JPEG at least `width` wide, or the largest there is. */
export function galleryImageSrc(image: GalleryImage, width: number): string {
  const w = image.widths.find((d) => d >= width) ?? image.widths[image.widths.length - 1]
  return `${image.base}/${w}.jpg`
}

/**
 * The download: the largest JPEG (2048 px, or the photo's own width when it is
 * narrower). Its Content-Disposition: attachment was set when the object was
 * created, so a plain link saves the file instead of opening it.
 */
export function galleryDownloadSrc(image: GalleryImage): string {
  return `${image.base}/${image.widths[image.widths.length - 1]}.jpg`
}
