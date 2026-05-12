import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Event Gallery - Rise of a Champion | TXMX Boxing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
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
            background: 'linear-gradient(90deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b)',
            display: 'flex',
          }}
        />

        {/* Gallery grid icon representation */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                background: `linear-gradient(${45 + i * 30}deg, #333333, #555555)`,
                border: '2px solid #ffd700',
                display: 'flex',
              }}
            />
          ))}
        </div>

        {/* Series label */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '6px',
            color: '#ffd700',
            marginBottom: '12px',
            display: 'flex',
          }}
        >
          RISE OF A CHAMPION
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#ffffff',
            display: 'flex',
          }}
        >
          EVENT GALLERY
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: '#999999',
            marginTop: '20px',
            letterSpacing: '3px',
            display: 'flex',
          }}
        >
          EXCLUSIVE RED CARPET & CHAMPIONSHIP MOMENTS
        </div>

        {/* Presenters */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '8px',
            fontSize: 14,
            color: '#888888',
            letterSpacing: '3px',
          }}
        >
          <span>TXMX BOXING</span>
          <span style={{ color: '#ffd700' }}>×</span>
          <span>ICON TALKS</span>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #b8860b, #ffd700, #daa520, #ffd700, #b8860b)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
