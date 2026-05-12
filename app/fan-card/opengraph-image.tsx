import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'Fan Card — Your TXMX Identity | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'YOUR TXMX IDENTITY',
    title: 'Fan Card',
    subtitle: 'Rank • Stats • Badges • Quests',
    tagline: 'ROOKIE • CONTENDER • CHAMPION • HALL OF FAME',
  })
}
