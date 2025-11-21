export function generateEventJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Rise of a Champion - Iconic Series',
    description: 'An exclusive invitation-only celebration honoring San Antonio\'s finest boxing champions - Jesse "Bam" Rodriguez, Mario "El Azteca" Barrios, Joshua "The Professor" Franco, and Jesse James Leija. Filmed live for national distribution.',
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
      'https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/ROAC.png',
      'https://ampd-asset.s3.us-east-2.amazonaws.com/iconic-series/champswhite.png',
    ],
    organizer: [
      {
        '@type': 'Organization',
        name: 'TXMX Boxing',
        url: 'https://www.txmxboxing.com',
      },
      {
        '@type': 'Organization',
        name: 'Icon Talks',
        url: 'https://www.icontalks.com',
      },
    ],
    performer: [
      {
        '@type': 'Person',
        name: 'Jesse "Bam" Rodriguez',
      },
      {
        '@type': 'Person',
        name: 'Mario "El Azteca" Barrios',
      },
      {
        '@type': 'Person',
        name: 'Joshua "The Professor" Franco',
      },
      {
        '@type': 'Person',
        name: 'Jesse James Leija',
      },
      {
        '@type': 'Person',
        name: 'Stephen Jackson',
      },
      {
        '@type': 'Person',
        name: 'Matt Barnes',
      },
      {
        '@type': 'Person',
        name: 'Sam Watson',
      },
    ],
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/LimitedAvailability',
      priceCurrency: 'USD',
      lowPrice: 10000,
      highPrice: 100000,
      url: 'https://www.txmxboxing.com/riseofachampion',
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
        item: 'https://www.txmxboxing.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Iconic Series',
        item: 'https://www.txmxboxing.com/riseofachampion',
      },
      ...(pageName === 'RSVP'
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: 'RSVP',
              item: 'https://www.txmxboxing.com/riseofachampion/rsvp',
            },
          ]
        : []),
    ],
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TXMX Boxing',
    url: 'https://www.txmxboxing.com',
    logo: 'https://www.txmxboxing.com/opengraph-image.png',
    sameAs: [
      'https://www.instagram.com/txmxboxing',
      'https://twitter.com/txmx',
    ],
    description: 'TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.',
  }
}
