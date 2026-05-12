import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'FanOS — The Fandom Operating System | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'FANDOM OPERATING SYSTEM',
    title: 'FanOS',
    subtitle: 'Predictions • Rankings • Rewards • Engagement Economy',
    tagline: 'OWN THE ACTION',
  })
}
