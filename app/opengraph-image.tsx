import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../lib/og-template'

export const alt = 'TXMX Boxing — THE OPERATING SYSTEM FOR FIGHT FANS'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'LEVANTAMOS LOS PUÑOS',
    title: 'THE OPERATING SYSTEM FOR FIGHT FANS',
    subtitle: 'The skill-based fan experience powered by TXMX Boxing',
    tagline: 'FOR THE FANS WHO STUDY THE GAME',
    titleSize: 80,
  })
}
