'use client'

import { useState } from 'react'
import { Button } from '../ui/button'

export default function RsvpForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    invitedBy: 'ICONTALKS',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/rise-of-a-champion-rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('[RSVP Form] Submission failed:', data)
        throw new Error(data.error || 'Failed to submit RSVP')
      }

      console.log('[RSVP Form] Submission successful')
      setSubmitted(true)
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        invitedBy: 'ICONTALKS'
      })
      

    } catch (err) {
      console.error('Error submitting RSVP:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-[#FFB800] mb-3">RSVP Confirmed!</h3>
        <p className="text-white/80 text-base mb-6">
          We've received your RSVP and look forward to seeing you at the event.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
        >
          Submit Another RSVP
        </Button>
      </div>
    )
  }

  return (
    <>
      
      <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="invitedBy" className="block text-sm font-medium text-white/90 mb-2">
          Invited by *
        </label>
        <select
          id="invitedBy"
          required
          value={formData.invitedBy}
          onChange={(e) => setFormData({ ...formData, invitedBy: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
        >
          <option value="ICONTALKS">ICONTALKS</option>
          <option value="TXMX BOXING">TXMX BOXING</option>
          <option value="434 MEDIA">434 MEDIA</option>
          <option value="J. Leija">J. Leija</option>
          <option value="S. Barrios">S. Barrios</option>
          <option value="J. Rodriguez">J. Rodriguez</option>
          <option value="J. Franco">J. Franco</option>
          <option value="S. Watson">S. Watson</option>
        </select>
      </div>



      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#FFB800] text-black hover:bg-[#FFB800]/90 font-semibold py-4 text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
      </Button>
      
      <p className="text-xs text-white/50 text-center mt-4 uppercase tracking-widest">
        ATTIRE: FASHIONABLY CHIC
      </p>


    </form>
    </>
  )
}
