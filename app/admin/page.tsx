import type { Metadata } from 'next'
import { getFighters } from '../actions/fighters'
import { getVenues } from '../actions/venues'
import { getEventPromoters, getPromoters, getEvents } from '../actions/events'
import { getGyms } from '../actions/gyms'
import AdminClient from './admin-client'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  try {
    const [fighters, venues, eventPromoters, promoterDocs, gyms, events] = await Promise.all([
      getFighters(),
      getVenues(),
      getEventPromoters(),
      getPromoters(),
      getGyms(),
      getEvents(),
    ])

    return <AdminClient initialFighters={fighters} initialVenues={venues} eventPromoters={eventPromoters} initialPromoterDocs={promoterDocs} initialGyms={gyms} initialEvents={events} />
  } catch (error) {
    console.error('Admin page error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-[0.2em]">DATABASE ERROR</h1>
          <p className="text-gray-400 text-[13px] leading-relaxed">
            {message.includes('Missing Firebase')
              ? 'Firebase environment variables are not configured for this deployment. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your Vercel project settings.'
              : `Failed to load admin data: ${message}`}
          </p>
        </div>
      </div>
    )
  }
}
