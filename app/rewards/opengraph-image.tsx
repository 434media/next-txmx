import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'Rewards — Earn and Redeem TX-Credits | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'TXMX ECONOMY',
    title: 'Rewards',
    subtitle: 'Earn TX-Credits • Redeem Real Drops',
    tagline: 'POINTS THAT PAY OFF',
  })
}
