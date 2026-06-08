import type { Metadata } from "next"
import HeroSection from "../components/hero-section"
import {
  generateOrganizationJsonLd,
  generateSiteNavigationJsonLd,
  generateWebSiteJsonLd,
} from "../lib/json-ld"

export const metadata: Metadata = {
  title: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
  description: 'TXMX Boxing is the home of Texas–Mexico boxing. Play Fight Nights — the free fan game at every fight card: pick winners, call props, and climb the live leaderboard. Plus verified fighter records and event coverage.',
  openGraph: {
    title: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
    description: 'Play Fight Nights — the free fan game at every TXMX fight card. Pick winners, call props, and climb the live leaderboard, in person or online.',
    url: 'https://www.txmxboxing.com',
  },
  twitter: {
    title: 'TXMX Boxing | Texas–Mexico Boxing & Fight Nights',
    description: 'The free fan game at every TXMX fight card — pick winners, climb the leaderboard. Live, in person or online.',
  },
  alternates: {
    canonical: 'https://www.txmxboxing.com',
  },
}

export default function TXMXLanding() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationJsonLd(),
      generateWebSiteJsonLd(),
      generateSiteNavigationJsonLd(),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <main className="relative min-h-screen bg-black overflow-hidden font-sans">
        <HeroSection />
      </main>
    </>
  )
}
