import type { Metadata } from "next"
import GalleryClient from "./gallery-client"

export const metadata: Metadata = {
  title: "Event Gallery | Rise of a Champion | TXMX Boxing",
  description:
    "View and download exclusive photos from the Rise of a Champion event - an invitation-only celebration honoring San Antonio's boxing legends Jesse \"Bam\" Rodriguez, Selina Barrios, Joshua Franco, and Jesse James Leija. Filmed live on December 3rd, 2024 at the Tobin Center by TXMX Boxing x Icon Talks.",
  keywords: [
    'Rise of a Champion Gallery',
    'TXMX Boxing Photos',
    'San Antonio Boxing Event',
    'Jesse Bam Rodriguez Photos',
    'Selina Barrios',
    'Joshua Franco',
    'Jesse James Leija',
    'Icon Talks Event',
    'Boxing Event Gallery',
    'Red Carpet Photos',
    'Championship Celebration',
  ],
  authors: [{ name: 'TXMX Boxing' }, { name: 'Icon Talks' }],
  creator: 'TXMX Boxing x Icon Talks',
  publisher: 'TXMX Boxing',
  openGraph: {
    title: "Event Gallery | Rise of a Champion | TXMX Boxing",
    description: "Relive the unforgettable moments from Rise of a Champion - an exclusive celebration honoring San Antonio's boxing legends. View exclusive photos from red carpet arrivals, championship moments, and live performances.",
    url: "https://www.txmxboxing.com/riseofachampion/gallery",
    siteName: "TXMX Boxing",
    images: [
      {
        url: 'https://www.txmxboxing.com/riseofachampion/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Rise of a Champion Event Gallery',
      },
    ],
    locale: 'en_US',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Gallery | Rise of a Champion',
    description: "Exclusive photos from the Rise of a Champion celebration honoring San Antonio's boxing legends.",
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
    canonical: 'https://www.txmxboxing.com/riseofachampion/gallery',
  },
}

export default function GalleryPage() {
  return <GalleryClient />
}
