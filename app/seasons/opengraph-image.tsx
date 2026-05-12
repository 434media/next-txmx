import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Seasons — Track Your TXMX Season | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'SEASON-LONG PROGRESSION',
    title: 'Seasons',
    subtitle: 'Tiers • Quests • Rewards • Hall of Fame',
    tagline: 'RIDE THE 16-WEEK SEASON',
  })
}
