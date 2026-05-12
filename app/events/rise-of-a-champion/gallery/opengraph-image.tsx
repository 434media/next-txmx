import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../../lib/og-template'

export const runtime = 'edge'
export const alt = 'Event Gallery — Rise of a Champion | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'RISE OF A CHAMPION',
    title: 'Event Gallery',
    subtitle: 'Red Carpet • Championship Moments • Iconic Series',
    tagline: 'TXMX BOXING × ICON TALKS',
  })
}
