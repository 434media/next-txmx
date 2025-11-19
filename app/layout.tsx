import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  metadataBase: new URL('https://www.txmxboxing.com'),
  title: 'TXMX Boxing',
  description: 'TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience. By celebrating the rich cultural heritage of Texas and Mexico, TXMX Boxing offers unique opportunities for brands to authentically engage with a community that is deeply rooted in both sport and culture.',
  openGraph: {
    title: 'TXMX Boxing',
    description: 'TXMX Boxing is a dynamic media platform designed to connect brands with a passionate fight fan audience.',
    url: 'https://www.txmxboxing.com',
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TXMX Boxing',
    description: 'TXMX Boxing - Connecting brands with passionate fight fans.',
    creator: '@txmx',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
