import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Fighter Directory — TDLR-Licensed Texas Boxers | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'TDLR-LICENSED ROSTER',
    title: 'Fighter Directory',
    subtitle: 'Texas Boxers • Records • Profiles • Stats',
    tagline: 'SEARCH THE OFFICIAL TXMX ROSTER',
    titleSize: 76,
  })
}
