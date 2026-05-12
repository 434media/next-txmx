import { getEventById } from '../../actions/events'
import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../lib/og-template'

export const runtime = 'edge'
export const alt = 'Boxing Event | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

function formatEventDate(iso: string): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  })
}

export default async function Image({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  let title = 'Boxing Event'
  let subtitle: string | undefined
  let tagline = 'TDLR-SANCTIONED EVENT'

  try {
    const event = await getEventById(eventId)
    if (event) {
      const dateLabel = formatEventDate(event.date)
      const place = [event.venue, event.city].filter(Boolean).join(' • ')
      title = event.promoter ? `${event.promoter}` : 'Texas Boxing Event'
      subtitle = [dateLabel, place].filter(Boolean).join(' • ')
      if (event.boutCount) {
        tagline = `${event.boutCount} BOUTS • TDLR-SANCTIONED`
      }
    }
  } catch {
    // Fall through to defaults
  }

  return renderTxmxOg({
    eyebrow: 'TXMX EVENT',
    title: title.length > 40 ? `${title.slice(0, 40)}…` : title,
    subtitle,
    tagline,
    titleSize: title.length > 22 ? 60 : 76,
  })
}
