"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { GALLERY_IMAGES, type GalleryImage, type GalleryCategory } from "../../../lib/gallery-images"
import GalleryUnlockForm from "../../../components/gallery/gallery-unlock-form"
import ImageModal from "../../../components/gallery/image-modal"

export default function GalleryClient() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("all")

  useEffect(() => {
    const unlocked = sessionStorage.getItem("galleryUnlocked")
    if (unlocked === "true") {
      setIsUnlocked(true)
    }
    setIsLoading(false)
  }, [])

  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  const handleImageClick = (image: GalleryImage) => {
    if (isUnlocked) {
      setSelectedImage(image)
    }
  }

  const handleNext = () => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id)
    const nextIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1
    setSelectedImage(filteredImages[nextIndex])
  }

  const handlePrevious = () => {
    if (!selectedImage) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id)
    const previousIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1
    setSelectedImage(filteredImages[previousIndex])
  }

  // Filter images based on selected category
  const filteredImages = selectedCategory === "all" 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === selectedCategory)

  const categories = [
    { id: "all" as GalleryCategory, label: "All Photos", count: GALLERY_IMAGES.length },
    { id: "red-carpet" as GalleryCategory, label: "Red Carpet", count: GALLERY_IMAGES.filter(img => img.category === "red-carpet").length },
    { id: "champions" as GalleryCategory, label: "Champions", count: GALLERY_IMAGES.filter(img => img.category === "champions").length },
    { id: "music" as GalleryCategory, label: "Music", count: GALLERY_IMAGES.filter(img => img.category === "music").length },
    { id: "reception" as GalleryCategory, label: "Reception", count: GALLERY_IMAGES.filter(img => img.category === "reception").length },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-black pb-20 md:pt-16 relative min-h-screen">
        {!isUnlocked ? (
        /* Locked State - Form over background images */
        <>
          {/* Background Grid - Fixed behind content */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 opacity-30">
              {GALLERY_IMAGES.slice(0, 20).map((image) => (
                <div key={image.id} className="aspect-square relative">
                  <Image
                    src={image.src}
                    alt="Preview"
                    fill
                    className="object-cover blur-[2px]"
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              ))}
            </div>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          </div>

          {/* Content on top of background */}
          <div className="relative z-20 py-20 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link
              href="/riseofachampion"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#FFB800] text-sm mb-8 transition-colors relative z-30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Event
            </Link>

            {/* Logo */}
            <div className="text-center">
              <Image
                src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/ROAC.png"
                alt="Rise of a Champion"
                width={400}
                height={120}
                className="w-full max-w-md mx-auto"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center -mt-2">
              EVENT GALLERY
            </h1>

            {/* Description */}
            <p className="text-white/70 text-center mb-3">
              Relive the unforgettable moments from our celebration of San Antonio's boxing legends.
            </p>
            
            <p className="text-[#FFB800] text-center mb-10 font-semibold">
              {GALLERY_IMAGES.length} exclusive photos • Free access
            </p>

            {/* Unlock Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 md:p-8 mb-12">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFB800]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Unlock Gallery</h2>
                <p className="text-white/60 text-sm">
                  Enter your info below to view and download photos
                </p>
              </div>
              <GalleryUnlockForm onUnlock={handleUnlock} />
            </div>
          </div>
        </div>
        </>
      ) : (
        /* Unlocked State - Simple grid */
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Back Link */}
            <Link
              href="/riseofachampion"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#FFB800] text-sm mb-8 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Event
            </Link>

            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-sm mb-4">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-400 text-sm font-semibold">Gallery Unlocked</span>
              </div>
              
              {/* Logo */}
              <div className="-mt-10 flex justify-center">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/ROAC.png"
                  alt="Rise of a Champion"
                  width={200}
                  height={60}
                  className="w-auto h-6"
                />
              </div>
              
              <p className="-mt-10 text-white/60">Click any photo to view full size</p>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? "bg-[#FFB800] text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Count */}
            <div className="text-center mb-6">
              <p className="text-white/50 text-sm">
                Showing {filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
              {filteredImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className="aspect-square bg-white/5 rounded-lg overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center border-t border-white/10 pt-8">
              <p className="text-white/40 text-xs md:text-sm mb-6 uppercase tracking-[0.2em] font-light">Presented by</p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-434.png"
                  alt="434 Media"
                  width={80}
                  height={40}
                    className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                />
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-icon.png"
                  alt="Icon to iCan"
                  width={80}
                  height={40}
                  className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-WATSON.png"
                  alt="Team Watson"
                  width={80}
                  height={40}
                  className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                />
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-driven.png"
                  alt="Life Driven"
                  width={80}
                  height={40}
                  className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  )
}
