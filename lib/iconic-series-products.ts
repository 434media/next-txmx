export interface SponsorPackage {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  availability?: string
  emoji?: string
}

export const SPONSOR_PACKAGES: SponsorPackage[] = [
  {
    id: 'contender-package',
    name: 'Contender Package',
    description: 'Ideal for founders, execs, or fans securing rare access',
    priceInCents: 500000, // $5,000
    availability: 'ONLY 4 AVAILABLE',
    emoji: '🥉',
    features: [
      '2 Tickets to Rise of a Champion (12/3 – Private Event)',
      '2 Tickets to Pitbull vs. Roach (Section 100 seating)',
      'VIP entry + name inclusion on guest list',
      'Meet & Greet with honorees + photo ops',
      'Concierge handling for add-ons (hotel, upgrades, etc.)'
    ]
  },
  {
    id: 'challenger-package',
    name: 'Challenger Package',
    description: 'Premium seating + elevated visibility',
    priceInCents: 1000000, // $10,000
    availability: 'ONLY 4 AVAILABLE',
    emoji: '🥈',
    features: [
      '2 VIP Tickets to Rise of a Champion',
      '2 Tickets to Pitbull vs. Roach (Section 22 premium seating)',
      'Meet & Greet + photo ops',
      'Name recognition from podium during ceremony',
      'Media inclusion across TXMX & 434 Media',
      'Concierge access for travel, stays & upgrades'
    ]
  },
  {
    id: 'champion-package',
    name: 'Champion Package',
    description: 'Make history — not watch from the sidelines',
    priceInCents: 1500000, // $15,000
    availability: 'ONLY 2 AVAILABLE',
    emoji: '🥇',
    features: [
      '2 VIP Tickets to Rise of a Champion',
      '2 Floor Seats to Pitbull vs. Roach (Rows 3–5)',
      'On-stage recognition as individual sponsor',
      'Photo ops + inclusion in Rise of a Champion series',
      'Priority concierge for hotel/stay/play options',
      'Featured media visibility via TXMX and 434 Media'
    ]
  },
  {
    id: 'corporate-package',
    name: 'Corporate Sponsor Package',
    description: 'Top-tier brand integration and positioning',
    priceInCents: 2000000, // $20,000+
    availability: 'ONLY 2 AVAILABLE',
    emoji: '💼',
    features: [
      '2 VIP Tickets to Rise of a Champion',
      '4 Fight Tickets: 2 Floor Seats (Rows 3–5) + 2 Section 100',
      'Brand logo on step & repeat, video backdrop, digital content',
      'Podium recognition as Corporate Sponsor',
      'Inclusion in Rise of a Champion series (sizzle + longform)',
      'VIP Meet & Greet with honorees',
      'Hospitality concierge support',
      'Priority access to private dinners + future TXMX events'
    ]
  }
]
