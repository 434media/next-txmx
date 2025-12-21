'use client'

import { useState } from 'react'
import { Button } from '../ui/button'

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'Other'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/iconic-series-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit inquiry')
      }

      setSubmitted(true)
      setFormData({ 
        firstName: '', 
        lastName: '', 
        company: '', 
        email: '', 
        phone: '', 
        message: '',
        inquiryType: 'Other'
      })
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-[#FFB800] mb-3">Thank You!</h3>
        <p className="text-white/80 text-base mb-6">
          We've received your inquiry and will be in touch shortly.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
        >
          Submit Another Inquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="inquiryType" className="block text-sm font-medium text-white/90 mb-2">
            Inquiry Type *
          </label>
          <select
            id="inquiryType"
            required
            value={formData.inquiryType}
            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          >
            <option value="Custom Package">Custom Package</option>
            <option value="Optional Upgrade">Optional Upgrade</option>
            <option value="Other">Other</option>
          </select>
        </div>

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
          <label htmlFor="company" className="block text-sm font-medium text-white/90 mb-2">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about your inquiry..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-sm focus:outline-none focus:border-[#FFB800] transition-colors resize-none"
          />
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
          {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
      </form>
  )
}
