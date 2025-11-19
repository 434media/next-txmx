import { Metadata } from 'next'
import RiseOfAChampionClient from './riseofachampion-client'
import { generateEventJsonLd, generateBreadcrumbJsonLd, generateOrganizationJsonLd } from '../../lib/json-ld'

export const metadata: Metadata = {
  title: 'RSVP - Rise of a Champion | TXMX Boxing x Icon Talks',
  description: 'Confirm your attendance for the exclusive Rise of a Champion event on December 3rd in San Antonio, TX. An invitation-only celebration honoring Jesse "Bam" Rodriguez, Mario Barrios, Joshua Franco, and Jesse James Leija. Filmed live for national distribution.',
  keywords: [
    'Rise of a Champion RSVP',
    'TXMX Boxing Event',
    'Icon Talks',
    'San Antonio Boxing',
    'Jesse Bam Rodriguez',
    'Mario El Azteca Barrios',
    'Joshua The Professor Franco',
    'Jesse James Leija',
    'Boxing Event RSVP',
    'December 3rd Event',
    'Invitation Only',
    'San Antonio Champions',
    'Stephen Jackson',
    'Matt Barnes',
    'Sam Watson',
    'Humanitarian Icon Award',
    'Visionary Icon Awards'
  ],
  authors: [{ name: 'TXMX Boxing' }, { name: 'Icon Talks' }],
  creator: 'TXMX Boxing x Icon Talks',
  publisher: 'TXMX Boxing',
  openGraph: {
    title: 'RSVP - Rise of a Champion | December 3rd, San Antonio',
    description: 'Confirm your attendance for this exclusive invitation-only celebration of San Antonio\'s boxing legends. Filmed live for the nationally distributed Rise of a Champion series. One night. Invitation only.',
    url: 'https://txmxboxing.com/iconic-series/riseofachampion',
    siteName: 'TXMX Boxing',
    images: [
      {
        url: 'https://txmxboxing.com/iconic-series/riseofachampion/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'RSVP - Rise of a Champion | December 3rd, San Antonio',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSVP - Rise of a Champion | December 3rd, San Antonio',
    description: 'Confirm your attendance for this exclusive celebration of San Antonio\'s boxing legends. One night. Invitation only. Filmed live.',
    images: ['https://txmxboxing.com/iconic-series/riseofachampion/opengraph-image.png'],
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
    canonical: '/iconic-series/riseofachampion',
  },
}

export default function RiseOfAChampionPage() {
  const eventJsonLd = generateEventJsonLd()
  const breadcrumbJsonLd = generateBreadcrumbJsonLd('RSVP')
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
      <RiseOfAChampionClient />
    </>
  )
}
