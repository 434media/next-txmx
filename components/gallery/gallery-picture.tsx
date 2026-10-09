"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { gallerySrcSet, galleryImageSrc, type GalleryImage } from "../../lib/gallery-images"

interface GalleryPictureProps {
  image: GalleryImage
  alt: string
  sizes: string
  /** Width the fallback `src` should be at least, for browsers without srcset. */
  fallbackWidth: number
  className?: string
  style?: CSSProperties
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
  onLoad?: () => void
  onError?: () => void
}

// The gallery's sizes are already encoded (WebP with a JPEG fallback at quality
// 82, Display and Design Standard 3.0), so they are served as delivered rather
// than re-encoded through next/image's optimizer.
export default function GalleryPicture({
  image, alt, sizes, fallbackWidth, className, style, loading = "lazy", fetchPriority, onLoad, onError,
}: GalleryPictureProps) {
  // A server-rendered image can finish before React attaches onLoad, and then
  // the load event is never seen — the tile's spinner would stay on a photo that
  // is already showing. next/image covered this; here it is checked on mount.
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = ref.current
    if (img?.complete) {
      if (img.naturalWidth > 0) onLoad?.()
      else onError?.()
    }
    // Only on mount: later loads arrive through the handlers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <picture>
      <source type="image/webp" srcSet={gallerySrcSet(image, "webp")} sizes={sizes} />
      <img
        ref={ref}
        src={galleryImageSrc(image, fallbackWidth)}
        srcSet={gallerySrcSet(image, "jpg")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  )
}
