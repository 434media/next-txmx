import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
  description: 'Join us for an exclusive invitation-only celebration honoring San Antonio\'s finest boxing champions - Jesse "Bam" Rodriguez, Mario "El Azteca" Barrios, Joshua "The Professor" Franco, and Jesse James Leija. Filmed live for national distribution. December 3rd in San Antonio, TX.',
  keywords: [
    'Rise of a Champion',
    'TXMX Boxing',
    'Icon Talks',
    'San Antonio Boxing',
    'Jesse Bam Rodriguez',
    'Mario Barrios',
    'Joshua Franco',
    'Jesse James Leija',
    'Boxing Event',
    'Sponsorship Packages',
    'Boxing Champions',
    'Texas Boxing',
    'Invitation Only Event',
    'Stephen Jackson',
    'Matt Barnes',
    'Sam Watson'
  ],
  authors: [{ name: 'TXMX Boxing' }, { name: 'Icon Talks' }],
  creator: 'TXMX Boxing x Icon Talks',
  publisher: 'TXMX Boxing',
  openGraph: {
    title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
    description: 'An exclusive invitation-only experience honoring four of San Antonio\'s greatest boxing champions. Filmed live for national distribution. Sponsorship packages available.',
    url: 'https://txmxboxing.com/iconic-series',
    siteName: 'TXMX Boxing',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Rise of a Champion - San Antonio Boxing Champions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
    description: 'An exclusive invitation-only experience honoring San Antonio\'s greatest boxing champions. December 3rd. Sponsorship packages available.',
    images: ['/twitter-image.jpg'],
    creator: '@txmx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://txmxboxing.com/iconic-series',
  },
}
