import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TXMX Boxing - Texas-Mexico Boxing Media Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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

        {/* Main title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-2px',
            background: 'linear-gradient(180deg, #ffffff 0%, #cccccc 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
          }}
        >
          TXMX
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 300,
            letterSpacing: '12px',
            color: '#ffd700',
            marginTop: '-8px',
            display: 'flex',
          }}
        >
          BOXING
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: '#999999',
            marginTop: '32px',
            letterSpacing: '2px',
            display: 'flex',
          }}
        >
          TXMX | MEDIA PLATFORM
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 16,
            color: '#666666',
            letterSpacing: '4px',
            display: 'flex',
          }}
        >
          CONNECTING BRANDS WITH FIGHT FANS
        </div>

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
    { ...size }
  )
}
