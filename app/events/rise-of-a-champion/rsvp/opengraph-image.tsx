import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../../lib/og-template'

export const runtime = 'edge'
export const alt = 'RSVP — Rise of a Champion | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'RISE OF A CHAMPION',
    title: 'Confirm Your Seat',
    subtitle: 'San Antonio, TX • Invitation Only • Filmed Live',
    tagline: 'TXMX BOXING × ICON TALKS',
    titleSize: 70,
  })
}
