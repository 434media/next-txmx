import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'TXMX Fight Nights — the free fan game. Pick winners, climb the leaderboard.'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'TXMX BOXING · THE FAN GAME',
    title: 'FIGHT NIGHTS',
    subtitle: 'Pick winners. Call props. Climb the leaderboard.',
    tagline: 'FREE TO PLAY · LIVE AT EVERY FIGHT CARD',
    titleSize: 116,
  })
}
