import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const LOGO_URL =
  'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/TXMXDistressedTransparent.png'

async function fetchLogoDataUri(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_URL, { cache: 'force-cache' })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const base64 = Buffer.from(buf).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch {
    return null
  }
}

export type TxmxOgOptions = {
  eyebrow?: string
  title: string
  subtitle?: string
  tagline?: string
  titleSize?: number
}

export async function renderTxmxOg({
  eyebrow = 'TXMX BOXING',
  title,
  subtitle,
  tagline,
  titleSize = 84,
}: TxmxOgOptions) {
  const logoSrc = await fetchLogoDataUri()

  return new ImageResponse(
    (
      <div
        style={{
          background:
            'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
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

        {logoSrc ? (
          <img
            src={logoSrc}
            alt="TXMX"
            width={260}
            height={130}
            style={{
              objectFit: 'contain',
              marginBottom: '24px',
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: '-2px',
              color: '#ffffff',
              marginBottom: '24px',
              display: 'flex',
            }}
          >
            TXMX
          </div>
        )}

        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '8px',
            color: '#ffd700',
            marginBottom: '20px',
            display: 'flex',
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontSize: titleSize,
            fontWeight: 900,
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.05,
            background: 'linear-gradient(180deg, #ffffff 0%, #cccccc 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            maxWidth: '1000px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: 24,
              color: '#999999',
              marginTop: '20px',
              letterSpacing: '4px',
              display: 'flex',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {tagline ? (
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: 15,
              color: '#666666',
              letterSpacing: '4px',
              display: 'flex',
            }}
          >
            {tagline}
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #b8860b, #ffd700, #b8860b)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...OG_SIZE }
  )
}
