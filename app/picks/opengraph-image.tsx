import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Prop Picks — Predict Bout Outcomes | TXMX Boxing'
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

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: '-2px',
            background: 'linear-gradient(180deg, #ffffff 0%, #cccccc 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
          }}
        >
          PROP PICKS
        </div>

        <div
          style={{
            fontSize: 24,
            color: '#999999',
            marginTop: '16px',
            letterSpacing: '4px',
            display: 'flex',
          }}
        >
          PREDICT BOUT OUTCOMES
        </div>

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
          PICK FIGHTERS • CALL ROUNDS • EARN POINTS
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
