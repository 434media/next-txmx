import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RSVP - Rise of a Champion | December 3rd, San Antonio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'repeating-linear-gradient(45deg, #FFB800 0, #FFB800 1px, transparent 0, transparent 50%)',
            backgroundSize: '10px 10px',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* RSVP Badge */}
          <div
            style={{
              backgroundColor: '#FFB800',
              color: 'black',
              fontSize: 36,
              fontWeight: 'bold',
              padding: '20px 60px',
              borderRadius: 8,
              marginBottom: 40,
              letterSpacing: '0.15em',
            }}
          >
            🎟️ RSVP NOW
          </div>

          {/* Main Title */}
          <div
            style={{
              color: '#FFB800',
              fontSize: 72,
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              marginBottom: 30,
              textTransform: 'uppercase',
            }}
          >
            RISE OF A CHAMPION
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: 'white',
              fontSize: 42,
              fontWeight: 'bold',
              marginBottom: 30,
              letterSpacing: '0.02em',
            }}
          >
            CONFIRM YOUR ATTENDANCE
          </div>

          {/* Event Details */}
          <div
            style={{
              color: '#rgba(255, 255, 255, 0.9)',
              fontSize: 32,
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 15,
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#FFB800' }}>
              Wednesday, December 3rd
            </div>
            <div>Filmed Live • San Antonio, TX</div>
          </div>

          {/* Honorees */}
          <div
            style={{
              color: '#rgba(255, 255, 255, 0.8)',
              fontSize: 24,
              marginTop: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div>Honoring San Antonio&apos;s Boxing Legends</div>
            <div style={{ fontSize: 20, color: '#rgba(255, 255, 255, 0.6)' }}>
              Jesse Rodriguez • Mario Barrios • Joshua Franco • Jesse James Leija
            </div>
          </div>

          {/* Presenters */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              color: '#rgba(255, 255, 255, 0.5)',
              fontSize: 20,
              letterSpacing: '0.2em',
            }}
          >
            ICONTALKS x TXMX BOXING
          </div>

          {/* Bottom Info */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              color: '#rgba(255, 255, 255, 0.6)',
              fontSize: 22,
            }}
          >
            Invitation Only Event • Limited Seats Available
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
