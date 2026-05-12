import { getEightCountPostBySlug } from '../../actions/eight-count'
import { OG_CONTENT_TYPE, OG_SIZE, renderTxmxOg } from '../../../lib/og-template'

export const runtime = 'edge'
export const alt = 'The 8 Count — TXMX Boxing'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let title = 'The 8 Count'
  let excerpt =
    'Your ringside feed — stories, updates, and behind-the-scenes coverage from TXMX Boxing.'

  try {
    const post = await getEightCountPostBySlug(slug)
    if (post) {
      title = post.title
      excerpt = post.excerpt
    }
  } catch {
    // Fall through to defaults
  }

  return renderTxmxOg({
    eyebrow: 'THE 8 COUNT',
    title: title.length > 60 ? `${title.slice(0, 60)}…` : title,
    subtitle: excerpt.length > 120 ? `${excerpt.slice(0, 120)}…` : excerpt,
    tagline: 'TXMXBOXING.COM/8COUNT',
    titleSize: 56,
  })
}
