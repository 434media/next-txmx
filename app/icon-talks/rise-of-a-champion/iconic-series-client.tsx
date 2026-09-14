'use client'

import Image from 'next/image'

const AWARDS = [
  {
    title: 'Visionary Icon Awards',
    recipients: ['Selina Barrios', 'Joshua "The Professor" Franco', 'Jesse "Bam" Rodriguez'],
  },
  { title: 'Humanitarian Icon Award', recipients: ['Sam Watson'] },
  { title: 'Icon Award', recipients: ['Jesse James Leija'] },
]

export default function IconicSeriesClient() {

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Image.
          Served through next/image rather than a CSS background: the source
          is a 5.5MB PNG, and as an inline style on a client component the URL
          was invisible to the browser's preload scanner, so the largest asset
          on the page was also the last one discovered. next/image resizes it
          to the viewport and converts it to WebP/AVIF. The wrapper is already
          `fixed inset-0`, which gives the same pinned backdrop the old
          `background-attachment: fixed` did. */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/BG.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/60 z-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section — artwork only. The story, the honorees and the
            gallery CTA sit together below so a past event does not open with
            a full empty viewport before anything actionable. */}
        <section className="px-4 mt-8 md:mt-0 pt-12 md:pt-20">
          <div className="w-full max-w-7xl mx-auto">
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
                  sizes="(max-width: 768px) 100vw, 896px"
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
                  sizes="(max-width: 768px) 100vw, 1024px"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Celebration + Honorees — side by side from lg up, stacked below it.
            The negative top margin closes the transparent gap under the
            champions artwork, as the event copy used to. */}
        <section className="px-4 -mt-20 md:-mt-32 pb-12 md:pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Section intro — full width and centered, so the title heads
                both columns instead of belonging to the left one. It fits on
                a single line from lg up, where the tracking also tightens:
                0.1em suits a small uppercase label but is too airy at 72px. */}
            <div className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-widest lg:tracking-wider leading-[1.05] uppercase">
                A Historic Celebration
              </h1>
              <div className="flex justify-center mt-6 md:mt-8">
                <div className="h-px bg-[#FFB800]/50 w-24 md:w-32"></div>
              </div>
            </div>

            {/* lg:items-start so both columns begin on the same line — the
                copy on the left and the HONOREES rule on the right share a
                top edge. The container caps at max-w-7xl, so a 13" laptop
                and a large monitor lay out alike; the extra width just
                becomes margin. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
              {/* Left — the event copy, and the gallery CTA */}
              <div className="text-center lg:text-left">
                {/* Column label, sized to match HONOREES opposite it. Both
                    columns open on a gold label at the same line, which is
                    what makes their shared top edge read as deliberate. */}
                <h2 className="text-sm md:text-lg text-[#FFB800] tracking-widest font-semibold uppercase mb-6 md:mb-8">
                  The Event
                </h2>

                <div className="text-sm md:text-base text-white/60 leading-relaxed space-y-4 lg:max-w-xl mx-auto lg:mx-0">
                  <p className="leading-relaxed tracking-wide">
                    This invitation-only experience honored four of the biggest names in the sport — all from San Antonio — as they were celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Media x 434 Media.
                  </p>
                  <p className="leading-relaxed tracking-wide">
                    The event brought together a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                  </p>
                </div>

                {/* Gallery CTA — the primary action for a past event. Set in the
                    same column and on the same left edge as the copy so it
                    reads as where that messaging leads, not a boxed aside. */}
                <div className="mt-10 md:mt-12">
                  <h2 className="text-[#FFB800] text-xs md:text-sm font-semibold tracking-widest uppercase mb-3">
                    Relive the Moments
                  </h2>
                  <p className="text-sm md:text-base text-white/60 leading-relaxed tracking-wide mb-7 lg:max-w-lg mx-auto lg:mx-0">
                    Browse exclusive photos from the Rise of a Champion celebration, featuring red carpet arrivals, championship moments, live performances, and the unforgettable reception.
                  </p>
                  <a
                    href="/icon-talks/rise-of-a-champion/gallery"
                    className="inline-block bg-[#FFB800] text-black hover:bg-[#FFB800]/90 font-semibold py-4 px-8 rounded-md transition-all duration-300 text-xs md:text-sm tracking-widest uppercase shadow-lg shadow-[#FFB800]/20 hover:shadow-[#FFB800]/30"
                  >
                    View Event Gallery
                  </a>
                </div>
              </div>

              {/* Right — Honorees, set directly on the page background */}
              <div>
                {/* Honorees Header */}
                <div className="text-center mb-8 md:mb-10">
                  <div className="flex items-center justify-center gap-4 md:gap-6">
                    <div className="h-px bg-[#FFB800]/40 w-12 md:w-16"></div>
                    <h2 className="text-sm md:text-lg text-[#FFB800] tracking-widest font-semibold uppercase">
                      HONOREES
                    </h2>
                    <div className="h-px bg-[#FFB800]/40 w-12 md:w-16"></div>
                  </div>
                </div>

                {/* Honorees List */}
                <div className="divide-y divide-white/10">
                  {AWARDS.map((award) => (
                    <div key={award.title} className="py-5 md:py-6 first:pt-0 last:pb-0 text-center">
                      <h3
                        className="text-[#FFB800] text-lg md:text-2xl tracking-widest mb-3 italic font-semibold"
                        style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}
                      >
                        {award.title}
                      </h3>
                      <div className="space-y-1.5">
                        {award.recipients.map((name) => (
                          <p key={name} className="text-white/80 text-sm md:text-base font-normal leading-relaxed">
                            {name}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
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
