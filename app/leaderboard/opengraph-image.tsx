import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Leaderboard — Top-Ranked Fans | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'TXMX RANKINGS',
    title: 'Leaderboard',
    subtitle: 'Top Fans by Skill Points and Prediction Accuracy',
    tagline: 'SKILL POINTS • RANKINGS • ACCURACY',
  })
}
