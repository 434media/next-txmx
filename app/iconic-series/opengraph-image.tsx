import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Rise of a Champion - Iconic Series | TXMX Boxing'
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
          {/* Presenters */}
          <div
            style={{
              color: '#rgba(255, 255, 255, 0.7)',
              fontSize: 24,
              letterSpacing: '0.3em',
              marginBottom: 20,
              fontWeight: 300,
            }}
          >
            ICONTALKS x TXMX BOXING PRESENT
          </div>

          {/* Main Title */}
          <div
            style={{
              color: '#FFB800',
              fontSize: 80,
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
              fontSize: 48,
              fontWeight: 'bold',
              marginBottom: 20,
              letterSpacing: '0.02em',
            }}
          >
            ONE NIGHT. INVITATION ONLY.
          </div>

          {/* Champions */}
          <div
            style={{
              color: '#rgba(255, 255, 255, 0.9)',
              fontSize: 28,
              marginTop: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div>Jesse "Bam" Rodriguez • Mario Barrios</div>
            <div>Joshua Franco • Jesse James Leija</div>
          </div>

          {/* Date & Location */}
          <div
            style={{
              color: '#FFB800',
              fontSize: 32,
              fontWeight: 'bold',
              marginTop: 40,
              letterSpacing: '0.05em',
            }}
          >
            DECEMBER 3RD • SAN ANTONIO, TX
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              color: '#rgba(255, 255, 255, 0.6)',
              fontSize: 20,
            }}
          >
            Sponsorship Packages Available
          </div>

          {/* TXMX Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              color: '#FFB800',
              fontSize: 32,
              fontWeight: 'bold',
              letterSpacing: '0.1em',
            }}
          >
            TXMX BOXING
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
