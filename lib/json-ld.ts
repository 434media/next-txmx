const SITE_URL = 'https://www.txmxboxing.com'

export function generateEventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Rise of a Champion - Iconic Series',
    description:
      'An exclusive invitation-only celebration honoring San Antonio\'s finest boxing champions - Jesse "Bam" Rodriguez, Mario "El Azteca" Barrios, Joshua "The Professor" Franco, and Jesse James Leija. Filmed live for national distribution.',
    startDate: '2025-12-03T18:00:00-06:00',
    endDate: '2025-12-03T23:00:00-06:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'San Antonio, TX',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'San Antonio',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
    image: [
      'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/ROAC.png',
      'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/champswhite.png',
    ],
    organizer: [
      {
        '@type': 'Organization',
        name: 'TXMX Boxing',
        url: SITE_URL,
      },
      {
        '@type': 'Organization',
        name: 'Icon Talks',
        url: 'https://www.icontalks.com',
      },
    ],
    performer: [
      { '@type': 'Person', name: 'Jesse "Bam" Rodriguez' },
      { '@type': 'Person', name: 'Mario "El Azteca" Barrios' },
      { '@type': 'Person', name: 'Joshua "The Professor" Franco' },
      { '@type': 'Person', name: 'Jesse James Leija' },
      { '@type': 'Person', name: 'Stephen Jackson' },
      { '@type': 'Person', name: 'Matt Barnes' },
      { '@type': 'Person', name: 'Sam Watson' },
    ],
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/LimitedAvailability',
      priceCurrency: 'USD',
      lowPrice: 10000,
      highPrice: 100000,
      url: `${SITE_URL}/icon-talks/rise-of-a-champion`,
    },
  }
}

export function generateBreadcrumbJsonLd(pageName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Iconic Series',
        item: `${SITE_URL}/icon-talks/rise-of-a-champion`,
      },
      ...(pageName === 'RSVP'
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: 'RSVP',
              item: `${SITE_URL}/icon-talks/rise-of-a-champion/rsvp`,
            },
          ]
        : pageName === 'Gallery'
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Gallery',
                item: `${SITE_URL}/icon-talks/rise-of-a-champion/gallery`,
              },
            ]
          : []),
    ],
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    '@id': `${SITE_URL}#organization`,
    name: 'TXMX Boxing',
    alternateName: ['TXMX', 'Texas-Mexico Boxing'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: 'https://storage.googleapis.com/groovy-ego-462522-v2.firebasestorage.app/iconic-series/TXMXDistressedTransparent.png',
      width: 1200,
      height: 600,
    },
    image: `${SITE_URL}/opengraph-image`,
    sport: 'Boxing',
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Texas' },
      { '@type': 'Country', name: 'Mexico' },
    ],
    sameAs: [
      'https://www.instagram.com/txmxboxing/',
      'https://www.youtube.com/@txmxboxing',
      'https://www.tiktok.com/@txmxboxing',
      'https://twitter.com/txmx',
    ],
    description:
      'TXMX Boxing is the home of Texas–Mexico boxing — Fight Nights, the free skill-based fan game played live at fight cards, plus verified TDLR-sourced fighter records and live event coverage celebrating the heritage of Texas and Mexico.',
  }
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: 'TXMX Boxing',
    alternateName: 'TXMX',
    description:
      'Texas–Mexico boxing — Fight Nights fan game, verified fighter records, TDLR-sanctioned event results, and live leaderboards.',
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/fighters?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateSiteNavigationJsonLd() {
  const items: Array<{ name: string; url: string }> = [
    { name: 'Fight Nights', url: `${SITE_URL}/fight-nights` },
    { name: 'Fighters', url: `${SITE_URL}/fighters` },
    { name: 'Leaderboard', url: `${SITE_URL}/leaderboard` },
    { name: 'Rise of a Champion', url: `${SITE_URL}/icon-talks/rise-of-a-champion` },
  ]
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'TXMX Boxing — Primary Navigation',
    itemListElement: items.map((it, i) => ({
      '@type': 'SiteNavigationElement',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  }
}

type FighterLike = {
  firstName: string
  lastName: string
  nickname?: string
  dateOfBirth?: string
  residence?: { city?: string; state?: string; country?: string }
  weightClass?: string
  stance?: string
  record: { wins: number; losses: number; draws: number; knockouts: number }
}

export function generateFighterJsonLd(fighter: FighterLike, slug: string) {
  const fullName = `${fighter.firstName} ${fighter.lastName}`.trim()
  const r = fighter.record
  const hometown = [fighter.residence?.city, fighter.residence?.state]
    .filter(Boolean)
    .join(', ')
  const description = [
    `Professional boxer${hometown ? ` from ${hometown}` : ''}.`,
    `Record: ${r.wins}-${r.losses}${r.draws > 0 ? `-${r.draws}` : ''} (${r.knockouts} KO).`,
    'TDLR-licensed; record sourced from official Texas bout filings.',
  ].join(' ')
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/fighters/${slug}#person`,
    name: fullName,
    alternateName: fighter.nickname || undefined,
    url: `${SITE_URL}/fighters/${slug}`,
    description,
    jobTitle: 'Professional Boxer',
    knowsAbout: ['Boxing', 'TDLR-Sanctioned Boxing', fighter.weightClass].filter(
      Boolean
    ),
    affiliation: { '@id': `${SITE_URL}#organization` },
    birthDate: fighter.dateOfBirth || undefined,
  }
}

type FightNightLike = {
  slug?: string
  id?: string
  title?: string
  subtitle?: string
  venue?: string
  city?: string
  address?: string
  date?: string
  doorsAt?: string
  firstBellAt?: string
  flyerUrl?: string
}

/**
 * SportsEvent structured data for a single fight night's public page.
 * Mixed attendance mode — fans play in person or online.
 */
export function generateFightNightJsonLd(fn: FightNightLike) {
  const url = `${SITE_URL}/fight-nights/${fn.slug || fn.id || ''}`
  const startDate = fn.firstBellAt || fn.doorsAt || fn.date || undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': `${url}#event`,
    name: fn.title || 'Fight Night',
    sport: 'Boxing',
    url,
    ...(startDate ? { startDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    ...(fn.flyerUrl ? { image: [fn.flyerUrl] } : {}),
    ...(fn.subtitle ? { description: fn.subtitle } : {}),
    location: {
      '@type': 'Place',
      name: fn.venue || fn.city || 'TBA',
      address: {
        '@type': 'PostalAddress',
        ...(fn.address ? { streetAddress: fn.address } : {}),
        ...(fn.city ? { addressLocality: fn.city } : {}),
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'TXMX Boxing',
      url: SITE_URL,
    },
  }
}
