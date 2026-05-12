import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../lib/og-template'

export const alt = 'Compare Fighters — Side-by-Side Stats | TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return renderTxmxOg({
    eyebrow: 'HEAD TO HEAD',
    title: 'Compare Fighters',
    subtitle: 'Records, KO Percentages, and Career Stats',
    tagline: 'STACK THEM UP. LET THE TALE OF THE TAPE SPEAK.',
    titleSize: 74,
  })
}
