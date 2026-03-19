'use client'

import Image from 'next/image'
import { GALLERY_IMAGES } from '../../lib/gallery-images'

export default function IconicSeriesClient() {

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/BG.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/60 z-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 mt-8 md:mt-0 py-12 md:py-16 md:pt-20">
          <div className="w-full max-w-7xl mx-auto">
            {/* Unified Responsive Layout */}
            <div className="flex flex-col items-center justify-center">
              {/* Presenters Text Above Logo */}
              <p className="text-white/50 text-xs md:text-sm tracking-widest mb-2 font-semibold uppercase text-center leading-relaxed">
                ICONTALKS x TXMX Boxing Present
              </p>
              
              {/* Hero Logo - Responsive */}
              <div className="w-full max-w-xl md:max-w-4xl mb-0 pb-0 -mt-8 md:-mt-24">
                <Image
                  src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/ROAC.png"
                  alt="Rise of a Champion"
                  width={1200}
                  height={400}
                  className="w-full block"
                  priority
                />
              </div>

              {/* Champions Image - Responsive */}
              <div className="w-full max-w-2xl md:max-w-5xl -mt-36 md:-mt-88">
                <Image
                  src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/awardsv6.png"
                  alt="San Antonio Champions"
                  width={1200}
                  height={600}
                  className="w-full block"
                />
              </div>
            </div>

            {/* Event Info - Unified Responsive Section */}
            <div className="text-center -mt-20 md:-mt-32 space-y-6 md:space-y-8">
              {/* Event Title */}
              <div className="space-y-2 md:space-y-3">
                <h1 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-semibold text-white/90 tracking-widest leading-relaxed uppercase">
                  A HISTORIC CELEBRATION
                </h1>
              </div>

              {/* Event Description */}
              <div className="text-xs md:text-base lg:text-lg text-white/60 max-w-3xl mx-auto leading-relaxed space-y-4 px-2 md:px-4">
                <p className="leading-relaxed tracking-wide">
                  This invitation-only experience honored four of the biggest names in the sport — all from San Antonio — as they were celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Media x 434 Media.
                </p>
                <p className="leading-relaxed tracking-wide">
                  The event brought together a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Honorees Section */}
        <section className="py-12 md:py-16 px-4 -mt-10 md:-mt-10">
          <div className="max-w-4xl mx-auto">
            {/* Invitation Header */}
            <div className="text-center mb-12 md:mb-16">
              <p className="text-white/40 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed tracking-widest font-semibold mb-2 uppercase">
                Celebrating San Antonio's Finest
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-2">
                <div className="h-px bg-[#FFB800]/40 w-12 md:w-24"></div>
                <h2 className="text-sm md:text-lg text-[#FFB800] tracking-widest font-semibold uppercase">
                  HONOREES
                </h2>
                <div className="h-px bg-[#FFB800]/40 w-12 md:w-24"></div>
              </div>
              
            </div>

            {/* Honorees List */}
            <div className="space-y-10 md:space-y-14">
              {/* Visionary Icon Awards - First Group */}
              <div className="text-center border-b border-white/10 pb-10">
                <h3 className="text-[#FFB800] text-base md:text-2xl tracking-widest mb-4 md:mb-5 italic font-semibold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Visionary Icon Awards
                </h3>
                <div className="space-y-2">
                  <p className="text-white/80 text-sm md:text-lg font-normal leading-relaxed">
                    • Selina Barrios
                  </p>
                  <p className="text-white/80 text-sm md:text-lg font-normal leading-relaxed">
                    • Joshua "The Professor" Franco
                  </p>
                  <p className="text-white/80 text-sm md:text-lg font-normal leading-relaxed">
                    • Jesse "Bam" Rodriguez
                  </p>
                </div>
              </div>

              {/* Humanitarian Icon Award */}
              <div className="text-center border-b border-white/10 pb-10">
                <h3 className="text-[#FFB800] text-base md:text-2xl tracking-widest mb-4 md:mb-5 italic font-semibold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Humanitarian Icon Award
                </h3>
                <p className="text-white/80 text-sm md:text-lg font-normal leading-relaxed">
                  • Sam Watson
                </p>
              </div>

              {/* Icon Award */}
              <div className="text-center pb-8">
                <h3 className="text-[#FFB800] text-base md:text-2xl tracking-widest mb-4 md:mb-5 italic font-semibold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Icon Award
                </h3>
                <p className="text-white/80 text-sm md:text-lg font-normal leading-relaxed">
                  • Jesse James Leija
                </p>
              </div>
            </div>

            {/* Decorative Bottom Border */}
            <div className="flex items-center justify-center mt-4 md:mt-2">
              <div className="h-px bg-linear-to-r from-transparent via-[#FFB800]/30 to-transparent w-full max-w-md"></div>
            </div>
          </div>
        </section>

        {/* Gallery CTA Section */}
        <section className="py-2 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-sm text-center">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 gap-0.5 opacity-20">
                    {GALLERY_IMAGES.slice(0, 12).map((image) => (
                      <div key={image.id} className="aspect-square relative">
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          className="object-cover blur-[3px]"
                          sizes="(max-width: 768px) 33vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-black/70" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-sm md:text-lg font-semibold text-[#FFB800] mb-3 tracking-widest uppercase leading-relaxed">
                    Relive the Moments
                  </h3>
                  <p className="text-white/60 text-xs md:text-base mb-6 leading-relaxed tracking-wide">
                    Browse exclusive photos from the Rise of a Champion celebration, featuring red carpet arrivals, championship moments, live performances, and the unforgettable reception.
                  </p>
                  <a 
                    href="/riseofachampion/gallery"
                    className="inline-block bg-[#FFB800] text-black hover:bg-[#FFB800]/90 font-semibold py-3 px-6 rounded-md transition-all text-xs md:text-sm tracking-widest uppercase"
                  >
                    View Event Gallery →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Logos Section */}
                <section className="py-12 px-4">
                  <div className="max-w-7xl mx-auto">
                    {/* Mobile Logos */}
                    <div className="md:hidden">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <a href="https://www.434media.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-434.png"
                            alt="434 Media"
                            width={80}
                            height={80}
                            className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.icontalks.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-icon.png"
                            alt="Icon ICAN"
                            width={80}
                            height={80}
                            className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.instagram.com/samwatsongolfclassic/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-WATSON.png"
                            alt="Team Watson"
                            width={80}
                            height={80}
                            className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.lifedriven.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-driven.png"
                            alt="LIFEONMY"
                            width={80}
                            height={80}
                            className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                      </div>
                    </div>
        
                    {/* Desktop Logos */}
                    <div className="hidden md:block">
                      <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 items-center">
                        <a href="https://www.434media.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-434.png"
                            alt="434 Media"
                            width={140}
                            height={140}
                            className="h-20 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.icontalks.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-icon.png"
                            alt="Icon ICAN"
                            width={140}
                            height={140}
                            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.instagram.com/samwatsongolfclassic/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-WATSON.png"
                            alt="Team Watson"
                            width={140}
                            height={140}
                            className="h-20 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                        <a href="https://www.lifedriven.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Image
                            src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/flyers-63-driven.png"
                            alt="LIFEONMY"
                            width={140}
                            height={140}
                            className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
      </div>
    </div>
  )
}
