import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'The Locker — Your Private Fan Space | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'YOUR PRIVATE FAN SPACE',
    title: 'The Locker',
    subtitle: 'Picks • Pledges • Activity • Notifications',
    tagline: 'EVERYTHING TXMX IN ONE PLACE',
  })
}
