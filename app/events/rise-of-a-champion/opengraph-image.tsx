import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../lib/og-template'

export const alt = 'Rise of a Champion — Iconic Series | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'ICONIC SERIES',
    title: 'Rise of a Champion',
    subtitle: 'San Antonio, TX • Invitation Only • Filmed Live',
    tagline: 'TXMX BOXING × ICON TALKS',
    titleSize: 70,
  })
}
