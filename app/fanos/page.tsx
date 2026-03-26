import type { Metadata } from "next"
import FanosDeck from "./fanos-deck"

export const metadata: Metadata = {
  title: "FanOS \u2014 Own the Action | The Fandom Operating System",
  description:
    "FanOS is the operating system for global combat sports fandom. Turning passive spectators into active, ranked, and rewarded participants. $6M+ Year 1 revenue. ~75% blended margins. TX State-verified pilot.",
  keywords: [
    "FanOS",
    "fandom operating system",
    "combat sports",
    "boxing predictions",
    "fan engagement platform",
    "NIL pool",
    "Black Card",
    "TXMX Boxing",
    "Texas boxing",
    "skill-based engagement",
  ],
  authors: [{ name: "TXMX Boxing" }],
  creator: "TXMX Boxing",
  openGraph: {
    title: "FanOS \u2014 Own the Action",
    description:
      "The operating system for global combat sports fandom. Predictions, rankings, rewards, and a self-sustaining engagement economy.",
    url: "https://www.txmxboxing.com/fanos",
    siteName: "TXMX Boxing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FanOS \u2014 Own the Action",
    description:
      "Turning passive spectators into active, ranked, and rewarded participants.",
    creator: "@txmx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/fanos",
  },
}

export default function FanosPage() {
  return <FanosDeck />
}
