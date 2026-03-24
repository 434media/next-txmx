import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rise of a Champion - Iconic Series | TXMX Boxing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 40%, #0a0a0a 100%)',
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
          ICONIC SERIES
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>RISE OF A</span>
          <span
            style={{
              background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CHAMPION
          </span>
        </div>

        {/* Event details */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '32px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#cccccc',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            SAN ANTONIO, TX
          </div>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ffd700',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 18,
              color: '#cccccc',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            INVITATION ONLY
          </div>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ffd700',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 18,
              color: '#cccccc',
              letterSpacing: '2px',
              display: 'flex',
            }}
          >
            FILMED LIVE
          </div>
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
