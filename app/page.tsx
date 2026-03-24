import type { Metadata } from "next"
import HeroSection from "../components/hero-section"
import { generateOrganizationJsonLd } from "../lib/json-ld"

export const metadata: Metadata = {
  title: 'TXMX Boxing | Boxing Media Platform',
  description: 'TXMX Boxing is a dynamic media platform connecting brands with passionate fight fans. Celebrating the rich cultural heritage of Texas and Mexico through exclusive boxing events, sponsorship opportunities, and champion storytelling.',
  openGraph: {
    title: 'TXMX Boxing | Boxing Media Platform',
    description: 'Connecting brands with passionate fight fans. Exclusive boxing events, sponsorship opportunities, and champion storytelling celebrating Texas and Mexico heritage.',
    url: 'https://www.txmxboxing.com',
  },
  twitter: {
    title: 'TXMX Boxing | Boxing Media Platform',
    description: 'Connecting brands with passionate fight fans through exclusive boxing events and champion storytelling.',
  },
  alternates: {
    canonical: 'https://www.txmxboxing.com',
  },
}

export default function TXMXLanding() {
  const organizationJsonLd = generateOrganizationJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main className="relative min-h-screen bg-black overflow-hidden font-sans">
        <HeroSection />
      </main>
    </>
  )
}
