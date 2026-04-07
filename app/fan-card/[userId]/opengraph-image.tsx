import { ImageResponse } from 'next/og'
import { getFanCardSummary } from '@/app/actions/fan-card'

export const alt = 'TXMX Fan Card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const RANK_COLORS: Record<string, { accent: string; bg: string }> = {
  hall_of_fame: { accent: '#a855f7', bg: '#1a0a2e' },
  champion: { accent: '#fbbf24', bg: '#1a1400' },
  contender: { accent: '#0ea5e9', bg: '#0a1628' },
  rookie: { accent: '#666666', bg: '#111111' },
}

const RANK_LABELS: Record<string, string> = {
  hall_of_fame: 'HALL OF FAME',
  champion: 'CHAMPION',
  contender: 'CONTENDER',
  rookie: 'ROOKIE',
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default async function Image({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const data = await getFanCardSummary(userId)

  if (!data) {
    // Fallback for unknown user
    return new ImageResponse(
      (
        <div
          style={{
            background: '#000',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ color: '#666', fontSize: 32, display: 'flex' }}>Fan Card Not Found</div>
        </div>
      ),
      { ...size }
    )
  }

  const rank = RANK_COLORS[data.rank] || RANK_COLORS.rookie
  const rankLabel = RANK_LABELS[data.rank] || 'ROOKIE'
  const displayName = data.displayName || 'Anonymous'
  const isBlackCard = data.subscriptionStatus === 'active'

  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, #000000 0%, ${rank.bg} 50%, #000000 100%)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '48px 60px',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, transparent, ${rank.accent}, transparent)`,
            display: 'flex',
          }}
        />

        {/* Header: TXMX branding + rank */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>TXMX</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#ffd700', letterSpacing: '6px' }}>FAN CARD</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: rank.accent,
                letterSpacing: '3px',
                border: `1px solid ${rank.accent}40`,
                padding: '4px 12px',
                borderRadius: '4px',
                display: 'flex',
              }}
            >
              {rankLabel}
            </div>
            {isBlackCard && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fbbf24',
                  letterSpacing: '3px',
                  border: '1px solid #fbbf2440',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  display: 'flex',
                }}
              >
                BLACK CARD
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div style={{ display: 'flex', marginTop: '40px', alignItems: 'center', gap: '20px' }}>
          {/* Avatar circle */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `2px solid ${rank.accent}60`,
              background: `${rank.accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: `${rank.accent}80`,
            }}
          >
            {displayName[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', textTransform: 'uppercase' as const }}>
              {displayName.length > 20 ? displayName.slice(0, 20) + '…' : displayName}
            </span>
            {data.gymPledge && (
              <span style={{ fontSize: 14, color: '#a855f7', marginTop: '4px', display: 'flex' }}>
                Pledged to {data.gymPledge}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', marginTop: 'auto', gap: '0', flex: 1, alignItems: 'flex-end', paddingBottom: '16px' }}>
          {/* Currencies */}
          <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: '2px' }}>SKILL POINTS</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#0ea5e9', marginTop: '4px' }}>{fmtNum(data.skillPoints)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: '2px' }}>TX-CREDITS</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{fmtNum(data.txCredits)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: '2px' }}>LOYALTY</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#a855f7', marginTop: '4px' }}>{fmtNum(data.loyaltyPoints)}</span>
            </div>
          </div>

          {/* Pick record */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: '2px' }}>RECORD</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#22c55e' }}>{data.wins}</span>
              <span style={{ fontSize: 20, color: '#444' }}>-</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#ef4444' }}>{data.losses}</span>
              {data.winRate > 0 && (
                <span style={{ fontSize: 18, color: '#fbbf24', fontWeight: 700, marginLeft: '8px' }}>
                  {data.winRate}%
                </span>
              )}
            </div>
            {data.badgeCount > 0 && (
              <span style={{ fontSize: 12, color: '#555', marginTop: '4px', display: 'flex' }}>
                🏅 {data.badgeCount} badge{data.badgeCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, transparent, ${rank.accent}, transparent)`,
            display: 'flex',
          }}
        />

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '60px',
            fontSize: 11,
            color: '#333',
            letterSpacing: '3px',
            display: 'flex',
          }}
        >
          TXMXBOXING.COM
        </div>
      </div>
    ),
    { ...size }
  )
}
