import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Prop Picks — Predict Bout Outcomes | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'BLACK CARD EXCLUSIVE',
    title: 'Prop Picks',
    subtitle: 'Predict the Method, Round, and Winner',
    tagline: 'PICK FIGHTERS • CALL ROUNDS • EARN POINTS',
  })
}
