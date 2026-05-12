import { getFighterBySlug } from '../../actions/fighters'
import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../lib/og-template'

// Node.js runtime — this OG image reads from Firestore via firebase-admin,
// which depends on `process` and isn't edge-compatible.
export const alt = 'Fighter Profile | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let eyebrow = 'TXMX FIGHTER PROFILE'
  let title = 'Fighter Profile'
  let subtitle: string | undefined
  let tagline = 'TDLR-LICENSED • OFFICIAL RECORD'

  try {
    const fighter = await getFighterBySlug(slug)
    if (fighter) {
      const fullName = `${fighter.firstName} ${fighter.lastName}`.trim()
      title = fullName || title
      if (fighter.nickname) {
        eyebrow = `"${fighter.nickname.toUpperCase()}"`
      }
      const r = fighter.record
      if (r) {
        let rec = `${r.wins}-${r.losses}`
        if (r.draws > 0) rec += `-${r.draws}`
        subtitle = `RECORD: ${rec} • ${r.knockouts} KO`
      }
      tagline = 'TXMXBOXING.COM/FIGHTERS'
    }
  } catch {
    // Fall through to defaults
  }

  return renderTxmxOg({
    eyebrow,
    title: title.length > 32 ? `${title.slice(0, 32)}…` : title,
    subtitle,
    tagline,
    titleSize: title.length > 18 ? 64 : 84,
  })
}
