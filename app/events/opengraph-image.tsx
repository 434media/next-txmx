import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const runtime = 'edge'
export const alt = 'Events — TDLR-Sanctioned Texas Boxing Cards | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'TEXAS BOXING EVENTS',
    title: 'Fight Cards & Results',
    subtitle: 'Upcoming Shows • Verified Records • Past Results',
    tagline: 'TDLR-SANCTIONED • OFFICIAL DATA',
    titleSize: 72,
  })
}
