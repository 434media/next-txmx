import { ImageResponse } from 'next/og'
import { getEightCountPostBySlug } from '../../actions/eight-count'

export const alt = 'The 8 Count — TXMX Boxing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let title = 'The 8 Count'
  let excerpt = 'Your ringside feed — stories, updates, and behind-the-scenes coverage from the world of TXMX Boxing.'

  try {
    const post = await getEightCountPostBySlug(slug)
    if (post) {
      title = post.title
      excerpt = post.excerpt
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        {/* Gold accent border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #b8860b, #ffd700, #b8860b)',
            display: 'flex',
          }}
        />

        {/* Series label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '6px',
            color: '#ffd700',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          TXMX BOXING
        </div>

        {/* Divider */}
        <div
          style={{
            width: '60px',
            height: '2px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '32px',
            display: 'flex',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            display: 'flex',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '700px',
            display: 'flex',
          }}
        >
          {excerpt.length > 150 ? `${excerpt.slice(0, 150)}...` : excerpt}
        </div>

        {/* Bottom label */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: 13,
            letterSpacing: '4px',
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
          }}
        >
          THE 8 COUNT
        </div>

        {/* Bottom border */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #b8860b, #ffd700, #b8860b)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
