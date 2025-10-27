import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The 8 Count - TXMX Boxing | Fight Analysis, Training & Boxing Culture",
  description:
    "Stories from the ring, the gym, and the streets. Fight analysis, training wisdom, and the culture that makes boxing the ultimate test of will. Your essential boxing feed.",
  keywords: [
    "boxing blog",
    "fight analysis",
    "boxing training",
    "boxing news",
    "boxing culture",
    "TXMX boxing",
    "the 8 count",
    "boxing stories",
    "fight fans",
    "boxing community",
    "boxing technique",
    "boxing history",
  ],
  openGraph: {
    title: "The 8 Count - TXMX Boxing",
    description:
      "Stories from the ring, the gym, and the streets. Fight analysis, training wisdom, and the culture that makes boxing the ultimate test of will.",
    url: "https://txmxboxing.com/the8count",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://txmxboxing.com/og-image-8count.jpg",
        width: 1200,
        height: 630,
        alt: "The 8 Count - TXMX Boxing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The 8 Count - TXMX Boxing",
    description:
      "Stories from the ring, the gym, and the streets. Fight analysis, training wisdom, and the culture that makes boxing the ultimate test of will.",
    images: ["https://txmxboxing.com/og-image-8count.jpg"],
    creator: "@txmxboxing",
  },
  alternates: {
    canonical: "https://txmxboxing.com/the8count",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function The8CountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
