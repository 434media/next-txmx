import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'TXMX Scorecard — Fan Engagement Platform | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'FAN ENGAGEMENT PLATFORM',
    title: 'TXMX Scorecard',
    subtitle: 'Picks • Polls • Pledges • Points • Black Card',
    tagline: 'THE OPERATING SYSTEM FOR FIGHT FANS',
    titleSize: 76,
  })
}
