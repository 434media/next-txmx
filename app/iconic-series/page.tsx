'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '../components/ui/button'
import { SPONSOR_PACKAGES } from '../lib/iconic-series-products'
import SponsorCheckout from '../components/iconic-series/sponsor-checkout'
import CustomPackageForm from '../components/iconic-series/custom-package-form'

export default function IconicSeriesPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

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
              <div className="w-full max-w-5xl -mt-52">
                <Image
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/champswhite.png"
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
                  src="https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/mobile-hero2.png"
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
              <div className="-mt-32 px-4 relative z-10">
                {/* Event Title */}
                <div className="space-y-2 mb-4">
                  <h1 className="text-4xl font-bold text-white tracking-tight leading-tight text-center">
                    ONE NIGHT. <span className='block'>INVITATION ONLY.</span>
                  </h1>
                </div>

                {/* Event Description */}
                <div className="mt-16 text-sm text-white/90 leading-relaxed space-y-3 text-left">
                  <p className="leading-relaxed">
                    This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, produced by 434 Media and powered by TXMX Boxing x ICON Talks.
                  </p>
                  <p className="font-semibold text-white text-base tracking-wide">
                    No public tickets. No open guest list.
                  </p>
                  <p className="leading-relaxed">
                    This experience is offered exclusively to a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                  </p>
                  <p className="font-semibold text-[#FFB800] text-base tracking-wide">
                    Packages are limited and moving.
                  </p>
                  <p className="leading-relaxed">
                    Review options below and secure your access to this historic event.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Event Info - positioned below hero */}
            <div className="hidden md:block text-center mt-8 space-y-5">
              {/* Event Title */}
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                  ONE NIGHT. INVITATION ONLY.
                </h1>
              </div>

              {/* Event Description */}
              <div className="text-base md:text-lg text-white/90 max-w-4xl mx-auto leading-relaxed space-y-3">
                <p className="leading-relaxed">
                  This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, produced by 434 Media and powered by TXMX Boxing x ICON Talks.
                </p>
                <p className="font-semibold text-white text-lg tracking-wide">
                  No public tickets. No open guest list.
                </p>
                <p className="leading-relaxed">
                  This experience is offered exclusively to a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                </p>
                <p className="font-semibold text-[#FFB800] text-lg tracking-wide">
                  Packages are limited and moving.
                </p>
                <p className="leading-relaxed">
                  Review options below and secure your access to this historic event.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsor Packages */}
        <section className="py-2 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold md:text-center text-[#FFB800] mb-2 tracking-wide">
              🎟️ SPONSORSHIP PACKAGES
            </h2>
            <div className="md:text-center text-white/80 text-base mb-10 max-w-3xl mx-auto leading-relaxed">
              <p className="font-semibold text-lg text-white mb-1">Wednesday, December 3rd | Filmed Live | San Antonio, TX</p>
              <p className="text-sm text-white/70">Includes promoter-level access to Pitbull vs. Roach at Frost Bank Center, Dec 6</p>
            </div>

            {selectedPackage ? (
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => setSelectedPackage(null)}
                  variant="outline"
                  className="mb-8 text-white border-white/20 hover:bg-white/10"
                >
                  ← Back to Packages
                </Button>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-sm">
                  <h3 className="text-2xl font-bold text-[#FFB800] mb-6">
                    Complete Your Sponsorship
                  </h3>
                  <SponsorCheckout packageId={selectedPackage} />
                </div>
              </div>
            ) : showCustomForm ? (
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => setShowCustomForm(false)}
                  variant="outline"
                  className="mb-8 text-white border-white/20 hover:bg-white/10"
                >
                  ← Back to Packages
                </Button>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-sm">
                  <h3 className="text-3xl font-bold text-[#FFB800] mb-4 text-center">
                    Custom Package Inquiry
                  </h3>
                  <p className="text-white/80 text-center mb-8">
                    Looking for a tailored sponsorship opportunity? Let us create a custom package for you.
                  </p>
                  <CustomPackageForm />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {SPONSOR_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:border-[#FFB800] transition-all duration-300 flex flex-col"
                    >
                      <div className="text-3xl mb-2">{pkg.emoji}</div>
                      <h3 className="text-xl font-bold text-[#FFB800] mb-1.5 tracking-wide">
                        {formatPrice(pkg.priceInCents)}{pkg.id === 'corporate-package' ? '+' : ''}
                      </h3>
                      <p className="text-lg font-semibold text-white mb-1.5 leading-tight">{pkg.name}</p>
                      {pkg.availability && (
                        <p className="text-[10px] text-[#FFB800] font-bold mb-3 uppercase tracking-wider">
                          {pkg.availability}
                        </p>
                      )}
                      <p className="text-white/70 mb-4 text-xs italic leading-relaxed">{pkg.description}</p>
                      
                      <ul className="space-y-1.5 mb-5 flex-grow text-xs leading-relaxed">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="text-white/90 flex items-start">
                            <span className="text-[#FFB800] mr-2 flex-shrink-0">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => setSelectedPackage(pkg.id)}
                        className="w-full bg-[#FFB800] text-black hover:bg-[#FFB800]/90 font-bold py-3 mt-auto text-sm tracking-wide"
                      >
                        Select Package
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Optional Upgrades */}
                <div className="max-w-4xl mx-auto mb-10 p-5 bg-white/5 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-bold text-[#FFB800] mb-3 md:text-center tracking-wide">
                    🔁 Optional Upgrades (All Packages Eligible)
                  </h3>
                  <ul className="space-y-1.5 text-white/90 text-sm">
                    <li className="flex items-start leading-relaxed">
                      <span className="text-[#FFB800] mr-3">•</span>
                      <span>Floor Row 1 ticket upgrades (available upon request)</span>
                    </li>
                    <li className="flex items-start leading-relaxed">
                      <span className="text-[#FFB800] mr-3">•</span>
                      <span>Hotel & experience add-ons via concierge</span>
                    </li>
                    <li className="flex items-start leading-relaxed">
                      <span className="text-[#FFB800] mr-3">•</span>
                      <span>Custom media integrations by request</span>
                    </li>
                  </ul>
                </div>

                {/* Call to Action */}

                <div className="w-full md:-mx-8 lg:-mx-0 -mb-12 md:-mb-12">
                  {/* Mobile Background */}
                  <div 
                    className="md:hidden relative w-screen -mx-4 min-h-[520px] flex flex-col items-start justify-between overflow-hidden"
                    style={{
                      backgroundImage: 'url(https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/mobile-footer2.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5"></div>
                    
                    {/* Top Content */}
                    <div className="relative z-10 px-6 py-16 w-full text-left">
                      <h3 className="text-3xl font-bold text-white mb-4 tracking-wide text-left">
                        ACT FAST. SEATS ARE LIMITED.
                      </h3>
                      <p className="text-white text-xl mb-2 leading-relaxed font-semibold text-left">
                        This is a once-in-a-lifetime access moment.
                      </p>
                      <p className="text-white/90 text-base leading-relaxed text-left">
                        Choose your package. Lock it in. Be part of history.
                      </p>
                    </div>

                    <div className="relative z-10 w-full px-6 pb-8">
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
                  </div>

                  {/* Desktop Background */}
                  <div 
                    className="hidden md:flex relative w-full min-h-[660px] flex-col items-center justify-between overflow-hidden"
                    style={{
                      backgroundImage: 'url(https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/Bottom.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5"></div>
                    
                    {/* Top Content */}
                    <div className="relative z-10 text-center px-4 py-12 max-w-3xl mx-auto">
                      <h3 className="text-4xl font-bold text-white mb-4 tracking-wide">
                        ACT FAST. SEATS ARE LIMITED.
                      </h3>
                      <p className="text-white text-2xl mb-2 leading-relaxed font-semibold">
                        This is a once-in-a-lifetime access moment.
                      </p>
                      <p className="text-white/90 text-lg leading-relaxed">
                        Choose your package. Lock it in. Be part of history.
                      </p>
                    </div>

                    <div className="relative z-10 w-full px-8 pb-12">
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
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
