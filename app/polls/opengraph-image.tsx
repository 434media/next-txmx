import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Fan Polls — Vote and Earn TX-Credits | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'FAN VOICE',
    title: 'Fan Polls',
    subtitle: 'Vote on Texas Boxing • Earn TX-Credits',
    tagline: 'YOUR VOICE • YOUR VOTE • YOUR CREDITS',
  })
}
