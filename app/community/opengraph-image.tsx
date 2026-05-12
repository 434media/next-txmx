import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Community — The Fan Feed for Texas Boxing | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'FAN COMMUNITY',
    title: 'Community',
    subtitle: 'Share Predictions • Hype Up Fighters • Connect with Fans',
    tagline: 'THE FAN FEED FOR TEXAS BOXING',
  })
}
