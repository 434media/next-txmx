import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'TXMX Black Card — Exclusive Fan Membership | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'EXCLUSIVE MEMBERSHIP',
    title: 'Black Card',
    subtitle: 'Prop Picks • Exclusive Events • Insider Access',
    tagline: 'PICKS • LEADERBOARD • REWARDS • ECONOMY',
  })
}
