'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '../components/ui/button'
import { SPONSOR_PACKAGES } from '../lib/iconic-series-products'
import SponsorCheckout from '../components/iconic-series/sponsor-checkout'
import CustomPackageForm from '../components/iconic-series/custom-package-form'
import InquiryForm from '../components/iconic-series/inquiry-form'

export default function IconicSeriesClient() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

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
                <div className="space-y-2 mb-6">
                  <h1 className="text-[2.75rem] font-bold text-white tracking-tight leading-[1.1] text-center">
                    ONE NIGHT. <span className='block mt-1'>INVITATION ONLY.</span>
                  </h1>
                </div>

                {/* Event Description */}
                <div className="mt-16 text-base text-white/90 leading-relaxed space-y-4 text-left">
                  <p className="leading-relaxed">
                    This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Talks x 434 Media.
                  </p>
                  <p className="font-bold text-white text-lg tracking-wide">
                    No public tickets. No open guest list.
                  </p>
                  <p className="leading-relaxed">
                    This experience is offered exclusively to a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                  </p>
                  <p className="font-bold text-[#FFB800] text-lg tracking-wide">
                    Packages are limited.
                  </p>
                  <p className="leading-relaxed">
                    Review options below and secure your access to this historic event.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Event Info - positioned below hero */}
            <div className="hidden md:block text-center mt-8 space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                  ONE NIGHT. INVITATION ONLY.
                </h1>
              </div>

              {/* Event Description */}
              <div className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed space-y-4">
                <p className="leading-relaxed">
                  This invitation-only experience honors four of the biggest names in the sport — all from San Antonio — as they're celebrated in their hometown and captured live for the nationally distributed series <span className="text-[#FFB800] font-semibold italic">Rise of a Champion</span>, powered by TXMX Boxing and produced by ICON Talks x 434 Media.
                </p>
                <p className="font-bold text-white text-xl tracking-wide">
                  No public tickets. No open guest list.
                </p>
                <p className="leading-relaxed">
                  This experience is offered exclusively to a curated room of athletes, entertainers, and industry leaders to celebrate greatness and build meaningful connections.
                </p>
                <p className="font-bold text-[#FFB800] text-xl tracking-wide">
                  Packages are limited.
                </p>
                <p className="leading-relaxed">
                  Review options below and secure your access to this historic event.
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
              <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed tracking-wide font-light mb-2">
                You are cordially invited to celebrate San Antonio's finest
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-2">
                <div className="h-px bg-[#FFB800]/40 w-12 md:w-24"></div>
                <h2 className="text-2xl md:text-3xl text-[#FFB800] tracking-[0.35em] font-bold uppercase">
                  HONOREES
                </h2>
                <div className="h-px bg-[#FFB800]/40 w-12 md:w-24"></div>
              </div>
              
            </div>

            {/* Honorees List */}
            <div className="space-y-10 md:space-y-14">
              {/* Visionary Icon Awards - First Group */}
              <div className="text-left md:text-center border-b border-white/10 pb-10">
                <h3 className="text-[#FFB800] text-2xl md:text-4xl tracking-wide mb-5 md:mb-7 italic font-bold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Visionary Icon Awards
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                    • Jesse "Bam" Rodriguez
                  </p>
                  <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                    • Mario "El Azteca" Barrios
                  </p>
                  <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                    • Joshua "The Professor" Franco
                  </p>
                </div>
              </div>

              {/* Visionary Icon Awards - Second Group */}
              <div className="text-left md:text-center border-b border-white/10 pb-10">
                <h3 className="text-[#FFB800] text-2xl md:text-4xl tracking-wide mb-5 md:mb-7 italic font-bold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Visionary Icon Awards
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                    • Stephen Jackson
                  </p>
                  <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                    • Matt Barnes
                  </p>
                </div>
              </div>

              {/* Humanitarian Icon Award */}
              <div className="text-left md:text-center border-b border-white/10 pb-10">
                <h3 className="text-[#FFB800] text-2xl md:text-4xl tracking-wide mb-5 md:mb-7 italic font-bold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Humanitarian Icon Award
                </h3>
                <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                  • Sam Watson
                </p>
              </div>

              {/* Icon Award */}
              <div className="text-left md:text-center pb-8">
                <h3 className="text-[#FFB800] text-2xl md:text-4xl tracking-wide mb-5 md:mb-7 italic font-bold" style={{ fontFamily: '"Lucida Calligraphy", cursive, serif' }}>
                  Icon Award
                </h3>
                <p className="text-white text-lg md:text-2xl font-normal leading-tight">
                  • Jesse James Leija
                </p>
              </div>
            </div>

            {/* Decorative Bottom Border */}
            <div className="flex items-center justify-center mt-4 md:mt-2">
              <div className="h-px bg-gradient-to-r from-transparent via-[#FFB800]/30 to-transparent w-full max-w-md"></div>
            </div>
          </div>
        </section>

        {/* Sponsor Packages */}
        <section className="py-2 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold md:text-center text-[#FFB800] mb-3 tracking-wide">
              🎟️ SPONSORSHIP PACKAGES
            </h2>
            <div className="md:text-center text-white/80 text-base mb-12 max-w-3xl mx-auto leading-relaxed">
              <p className="font-bold text-lg md:text-xl text-white mb-2">Wednesday, December 3rd | Filmed Live | San Antonio, TX</p>
              <p className="text-sm md:text-base text-white/70">Includes promoter-level access to Pitbull vs. Roach at Frost Bank Center, Dec 6</p>
            </div>

            {selectedPackage ? (
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => {
                    setSelectedPackage(null)
                    setPaymentSuccess(false)
                  }}
                  variant="outline"
                  className="mb-8 text-white border-white/20 hover:bg-white/10"
                >
                  ← Back to Packages
                </Button>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-sm">
                  <h3 className="text-2xl font-bold text-[#FFB800] mb-6">
                    {paymentSuccess ? 'Thank You!' : 'Complete Your Sponsorship'}
                  </h3>
                  <SponsorCheckout 
                    packageId={selectedPackage} 
                    onSuccess={() => setPaymentSuccess(true)}
                  />
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
                      className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-[#FFB800] transition-all duration-300 flex flex-col"
                    >
                      <div className="text-4xl mb-3">{pkg.emoji}</div>
                      <h3 className="text-2xl font-bold text-[#FFB800] mb-2 tracking-wide">
                        {formatPrice(pkg.priceInCents)}{pkg.id === 'corporate-package' ? '+' : ''}
                      </h3>
                      <p className="text-xl font-semibold text-white mb-2 leading-tight">{pkg.name}</p>
                      {pkg.availability && (
                        <p className="text-xs text-[#FFB800] font-bold mb-4 uppercase tracking-wider">
                          {pkg.availability}
                        </p>
                      )}
                      <p className="text-white/70 mb-5 text-sm italic leading-relaxed">{pkg.description}</p>
                      
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
                      
                      {/* Stripe Payment Badge - Mobile Only */}
                      <div className="md:hidden mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-col items-center gap-1 text-white/50 text-xs">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Powered by Stripe</span>
                          </div>
                          <span className="text-white/40 text-[10px]">256-bit SSL encryption</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Security Section - Desktop Only */}
                <div className="hidden md:block max-w-7xl mx-auto mb-10">
                  <div className="">
                    <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">All payments powered by Stripe</span>
                      <span className="mx-2">•</span>
                      <span>256-bit SSL encryption</span>
                    </div>
                  </div>
                </div>

                {/* Inquiries & Upgrades Section */}
                <div className="max-w-7xl md:max-w-4xl mx-auto mb-12">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      {/* Left Side - Inquiries & Upgrades Info */}
                      <div>
                        <h3 className="text-2xl font-bold text-[#FFB800] mb-6 tracking-wide">
                          🔁 Optional Upgrades
                        </h3>
                        
                        <p className="text-white/60 text-xs uppercase tracking-wider font-medium mb-6">
                          Available for All Packages
                        </p>
                        
                        <ul className="space-y-4 text-white/80 text-sm">
                          <li className="flex items-start leading-relaxed">
                            <span className="text-[#FFB800] mr-3 text-lg">•</span>
                            <span>Ticket upgrades (available upon request)</span>
                          </li>
                          <li className="flex items-start leading-relaxed">
                            <span className="text-[#FFB800] mr-3 text-lg">•</span>
                            <span>Hotel & experience add-ons via concierge</span>
                          </li>
                          <li className="flex items-start leading-relaxed">
                            <span className="text-[#FFB800] mr-3 text-lg">•</span>
                            <span>Custom media integrations by request</span>
                          </li>
                        </ul>
                        
                        <div className="mt-8 pt-6 border-t border-white/10">
                          <p className="text-white/70 text-sm leading-relaxed max-w-xs tracking-tight">
                            For inquiries about upgrades or alternative payment methods (check/ACH), please use the contact form.
                          </p>
                        </div>
                      </div>

                      {/* Right Side - Contact Form */}
                      <div>
                        <h3 className="text-2xl font-bold text-[#FFB800] mb-6 tracking-wide">
                          ✉️ Contact Us
                        </h3>
                        <InquiryForm />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}

                <div className="w-full md:-mx-8 lg:-mx-0 mb-0">
                  {/* Mobile Background */}
                  <div 
                    className="md:hidden relative w-screen -mx-4 min-h-[520px] flex flex-col items-start justify-between overflow-hidden mb-0"
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
                      <h3 className="text-[2rem] font-bold text-white mb-5 tracking-wide leading-tight">
                        ACT FAST. SEATS ARE LIMITED.
                      </h3>
                      <p className="text-white text-lg mb-3 tracking-tight leading-relaxed font-bold">
                        This is a once-in-a-lifetime access moment.
                      </p>
                      <p className="text-white/90 text-sm leading-relaxed">
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
