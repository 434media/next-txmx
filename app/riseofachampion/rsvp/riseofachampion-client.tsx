'use client'

import Image from 'next/image'
import RsvpForm from '../../components/iconic-series/rsvp-form'

export default function RiseOfAChampionClient() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/BG.png)',
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
        <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-4 py-12 md:py-16 md:pt-20">
          <div className="w-full md:max-w-7xl md:mx-auto">
            {/* Desktop Layout */}
            <div className="hidden md:flex md:flex-col md:items-center md:justify-center">
              {/* Presenters Text Above Logo */}
              <p className="text-white/70 text-xs md:text-sm tracking-[0.3em] mb-2 font-light uppercase">
                ICONTALKS x TXMX Boxing Present
              </p>
              
              {/* Hero Logo at Top - touching the champions image */}
              <div className="w-full max-w-4xl mb-0 pb-0 -mt-24">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/ROAC.png"
                  alt="Rise of a Champion"
                  width={1200}
                  height={400}
                  className="w-full block"
                  priority
                />
              </div>

              {/* Champions Image Below - touching the logo */}
              <div className="w-full max-w-5xl -mt-88">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/awardsv6.png"
                  alt="San Antonio Champions"
                  width={1200}
                  height={600}
                  className="w-full block"
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden w-screen -mx-4 relative pt-4">
              {/* Hero Image - Full Width */}
              <div className="relative w-full">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/vip-invite-mobile.png"
                  alt="Rise of a Champion"
                  width={800}
                  height={400}
                  className="w-full block"
                  priority
                />
                
                {/* Presenters Text Overlay - Positioned at top of image */}
                <div className="absolute top-1 left-0 right-0 text-center px-4">
                  <p className="text-white/80 text-xs tracking-[0.3em] font-light uppercase drop-shadow-lg">
                    ICONTALKS x TXMX Boxing Present
                  </p>
                </div>
              </div>

              {/* Mobile Event Info - positioned below hero with negative margin */}
              <div className="px-4 relative z-10">
                {/* Event Description */}
                <div className="mt-10 text-base text-white/90 leading-relaxed space-y-4 text-left">
                  <p className="leading-relaxed">
                    This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Media x 434 Media.
                  </p>
                  <p className="font-bold text-[#FFB800] text-lg tracking-wide">
                    RSVP below to confirm your attendance.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Event Info - positioned below hero */}
            <div className="hidden md:block text-center -mt-40 space-y-6">
              {/* Event Title */}
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-8xl font-bold text-white/80 tracking-[0.1em] leading-[1.1]">
                  VIP INVITE
                </h1>
                <p className="text-white/90 text-xl tracking-[0.2em] uppercase font-light">
                  DEC 3, Tobin Center, 7p - 10p
                </p>
                <p className="text-white/90 text-xl tracking-[0.2em] uppercase font-light">
                  ATTIRE: FASHIONABLY CHIC
                </p>
              </div>

              {/* Event Description */}
              <div className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed space-y-4">
                <p className="leading-relaxed">
                  This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Media x 434 Media.
                </p>
                <p className="font-bold text-[#FFB800] text-xl tracking-wide">
                  RSVP below to confirm your attendance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP Section */}
        <section className="py-2 md:py-6 px-4 -mt-6 md:-mt-10">
          <div className="max-w-7xl md:max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-10 rounded-sm">
              <div className="md:text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-[#FFB800] mb-4 tracking-wide">
                  🎟️ CONFIRM YOUR ATTENDANCE
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed">
                  Wednesday, December 3rd | Filmed Live | San Antonio, TX
                </p>
              </div>
              <RsvpForm />
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
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-434.png"
                    alt="434 Media"
                    width={80}
                    height={80}
                    className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.icontalks.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-icon.png"
                    alt="Icon ICAN"
                    width={80}
                    height={80}
                    className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.instagram.com/samwatsongolfclassic/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-WATSON.png"
                    alt="Team Watson"
                    width={80}
                    height={80}
                    className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.lifedriven.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-driven.png"
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
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-434.png"
                    alt="434 Media"
                    width={140}
                    height={140}
                    className="h-20 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.icontalks.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-icon.png"
                    alt="Icon ICAN"
                    width={140}
                    height={140}
                    className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.instagram.com/samwatsongolfclassic/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-WATSON.png"
                    alt="Team Watson"
                    width={140}
                    height={140}
                    className="h-20 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="https://www.lifedriven.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Image
                    src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/flyers-63-driven.png"
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
