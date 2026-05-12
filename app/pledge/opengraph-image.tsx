import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Gym Pledge — Back a Texas Boxing Gym | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: '16-WEEK SEASON',
    title: 'Gym Pledge',
    subtitle: 'Back a Texas Boxing Gym • Earn Loyalty Points',
    tagline: 'PLEDGE • EARN LOYALTY POINTS • REP YOUR GYM',
  })
}
