import { getFighters } from '../actions/fighters'
import { getVenues } from '../actions/venues'
import { getEventPromoters } from '../actions/events'
import AdminClient from './admin-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [fighters, venues, eventPromoters] = await Promise.all([
    getFighters(),
    getVenues(),
    getEventPromoters(),
  ])

  return <AdminClient initialFighters={fighters} initialVenues={venues} eventPromoters={eventPromoters} />
}
