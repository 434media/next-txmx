import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.txmxboxing.com'),
  title: {
    default: 'TXMX Boxing | Boxing Media Platform',
    template: '%s | TXMX Boxing',
  },
  description: 'TXMX Boxing is a dynamic media platform connecting brands with passionate fight fans. Celebrating the rich cultural heritage of Texas and Mexico through exclusive boxing events, sponsorship opportunities, and champion storytelling.',
  keywords: [
    'TXMX Boxing',
    'Texas boxing',
    'Mexico boxing',
    'boxing media platform',
    'fight fan audience',
    'boxing sponsorship',
    'San Antonio boxing',
    'boxing events',
    'brand partnerships',
    'combat sports media',
    'The 8 Count',
    'boxing scorecard',
    'fighter records',
    'boxing news feed',
  ],
  authors: [{ name: 'TXMX Boxing' }],
  creator: 'TXMX Boxing',
  publisher: 'TXMX Boxing',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TXMX Boxing | Boxing Media Platform',
    description: 'Connecting brands with passionate fight fans. Exclusive boxing events, sponsorship opportunities, and champion storytelling celebrating Texas and Mexico heritage.',
    url: 'https://www.txmxboxing.com',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TXMX Boxing | Boxing Media Platform',
    description: 'Connecting brands with passionate fight fans through exclusive boxing events and champion storytelling.',
    creator: '@txmx',
    site: '@txmx',
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
    canonical: 'https://www.txmxboxing.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
