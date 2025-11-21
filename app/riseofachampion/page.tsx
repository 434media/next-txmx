import { Metadata } from 'next'
import IconicSeriesClient from './iconic-series-client'
import { generateEventJsonLd, generateBreadcrumbJsonLd, generateOrganizationJsonLd } from '../lib/json-ld'

export const metadata: Metadata = {
  title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
  description: 'Join us for an exclusive invitation-only celebration honoring San Antonio\'s finest boxing champions - Jesse "Bam" Rodriguez, Mario "El Azteca" Barrios, Joshua "The Professor" Franco, and Jesse James Leija. Filmed live for national distribution. December 3rd in San Antonio, TX.',
  keywords: [
    'Rise of a Champion',
    'TXMX Boxing',
    'Icon Talks',
    'San Antonio Boxing',
    'Jesse Bam Rodriguez',
    'Selina Barrios',
    'Joshua Franco',
    'Jesse James Leija',
    'Boxing Event',
    'Sponsorship Packages',
    'Boxing Champions',
    'Texas Boxing',
    'Invitation Only Event',
    'Sam Watson'
  ],
  authors: [{ name: 'TXMX Boxing' }, { name: 'Icon Talks' }],
  creator: 'TXMX Boxing x Icon Talks',
  publisher: 'TXMX Boxing',
  other: {
    'image': 'https://www.txmxboxing.com/riseofachampion/opengraph-image.png',
  },
  openGraph: {
    title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
    description: 'An exclusive invitation-only experience honoring four of San Antonio\'s greatest boxing champions. Filmed live for national distribution. Sponsorship packages available.',
    url: 'https://www.txmxboxing.com/riseofachampion',
    siteName: 'TXMX Boxing',
    images: [
      {
        url: 'https://www.txmxboxing.com/riseofachampion/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Rise of a Champion - Iconic Series | TXMX Boxing',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
    description: 'An exclusive invitation-only experience honoring San Antonio\'s greatest boxing champions. December 3rd. Sponsorship packages available.',
    images: ['https://www.txmxboxing.com/riseofachampion/opengraph-image.png'],
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
    canonical: 'https://www.txmxboxing.com/riseofachampion',
  },
}

export default function IconicSeriesPage() {
  const eventJsonLd = generateEventJsonLd()
  const breadcrumbJsonLd = generateBreadcrumbJsonLd('Iconic Series')
  const organizationJsonLd = generateOrganizationJsonLd()

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <IconicSeriesClient />
    </>
  )
}
