import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../lib/og-template'

export const alt = 'TXMX Boxing — Get in the fight. The free fan game at every fight night.'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'LEVANTAMOS LOS PUÑOS',
    title: 'GET IN THE FIGHT',
    subtitle: 'The free fan game played live at every fight night',
    tagline: 'PICK WINNERS · CALL PROPS · CLIMB THE LEADERBOARD',
    titleSize: 104,
  })
}
