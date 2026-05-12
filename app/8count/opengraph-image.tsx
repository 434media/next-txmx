import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'The 8 Count — A Feed for Fight Fans | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'RINGSIDE NEWS FEED',
    title: 'The 8 Count',
    subtitle: 'A Feed for Fight Fans',
    tagline: 'STORIES • UPDATES • BEHIND THE SCENES',
  })
}
