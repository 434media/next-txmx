import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RSVP - Rise of a Champion | TXMX Boxing'
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
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#ffffff',
            display: 'flex',
          }}
        >
          RSVP
        </div>

        {/* Divider */}
        <div
          style={{
            width: '120px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
            marginTop: '20px',
            marginBottom: '20px',
            display: 'flex',
          }}
        />

        {/* Event details */}
        <div
          style={{
            fontSize: 22,
            color: '#cccccc',
            letterSpacing: '3px',
            display: 'flex',
          }}
        >
          SAN ANTONIO, TX
        </div>

        <div
          style={{
            fontSize: 18,
            color: '#999999',
            marginTop: '12px',
            letterSpacing: '4px',
            display: 'flex',
          }}
        >
          INVITATION ONLY • FILMED LIVE
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: '36px',
            padding: '12px 40px',
            border: '2px solid #ffd700',
            borderRadius: '4px',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '4px',
            color: '#ffd700',
            display: 'flex',
          }}
        >
          CONFIRM YOUR ATTENDANCE
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
