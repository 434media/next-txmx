import { Metadata } from 'next'
import RiseOfAChampionClient from './riseofachampion-client'
import { generateEventJsonLd, generateBreadcrumbJsonLd, generateOrganizationJsonLd } from '../../../lib/json-ld'

export const metadata: Metadata = {
  title: 'RSVP - Rise of a Champion',
  description: 'Confirm your attendance for the exclusive Rise of a Champion event in San Antonio, TX. An invitation-only celebration honoring Jesse "Bam" Rodriguez, Selina Barrios, Joshua Franco, and Jesse James Leija. Filmed live for national distribution by TXMX Boxing x Icon Talks.',
  keywords: [
    'Rise of a Champion RSVP',
    'TXMX Boxing Event',
    'Icon Talks',
    'San Antonio Boxing',
    'Jesse Bam Rodriguez',
    'Selina Barrios',
    'Joshua The Professor Franco',
    'Jesse James Leija',
    'Boxing Event RSVP',
    'Invitation Only',
    'San Antonio Champions',
    'Sam Watson',
    'Humanitarian Icon Award',
    'Visionary Icon Awards',
  ],
  authors: [{ name: 'TXMX Boxing' }, { name: 'Icon Talks' }],
  creator: 'TXMX Boxing x Icon Talks',
  publisher: 'TXMX Boxing',
  openGraph: {
    title: 'RSVP - Rise of a Champion | San Antonio, TX',
    description: 'Confirm your attendance for this exclusive invitation-only celebration of San Antonio\'s boxing legends. Filmed live for the nationally distributed Rise of a Champion series. One night. Invitation only.',
    url: 'https://www.txmxboxing.com/riseofachampion/rsvp',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSVP - Rise of a Champion | San Antonio, TX',
    description: 'Confirm your attendance for this exclusive celebration of San Antonio\'s boxing legends. One night. Invitation only. Filmed live.',
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
    canonical: 'https://www.txmxboxing.com/riseofachampion/rsvp',
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
