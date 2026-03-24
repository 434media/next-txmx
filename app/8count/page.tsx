import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The 8 Count | A Feed for Fight Fans",
  description:
    "The 8 Count is your ringside feed — stories, updates, and behind-the-scenes coverage from the world of TXMX Boxing. News, breakdowns, and exclusive content for fight fans.",
  keywords: [
    'The 8 Count',
    'boxing news feed',
    'fight fan content',
    'TXMX Boxing news',
    'boxing stories',
    'behind the scenes boxing',
    'San Antonio boxing news',
    'boxing updates',
    'combat sports content',
  ],
  authors: [{ name: 'TXMX Boxing' }],
  creator: 'TXMX Boxing',
  openGraph: {
    title: "The 8 Count — A Feed for Fight Fans | TXMX Boxing",
    description:
      "Your ringside feed — stories, updates, and behind-the-scenes coverage from the world of TXMX Boxing.",
    url: "https://www.txmxboxing.com/8count",
    siteName: 'TXMX Boxing',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "The 8 Count | TXMX Boxing",
    description:
      "Your ringside feed — stories, updates, and behind-the-scenes coverage from the world of TXMX Boxing.",
    creator: '@txmx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.txmxboxing.com/8count",
  },
}

export default function EightCountPage() {
  return (
    <main className="relative min-h-screen bg-black font-sans">
      {/* Hero Section */}
      <section className="relative h-dvh flex items-stretch overflow-hidden">
        {/* Left Side — Text Content */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-12 lg:px-20">
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.1) 40%, transparent 55%)",
            }}
          />
          <div className="relative z-10 max-w-lg">
            <p className="text-white/40 text-xs font-semibold tracking-[0.3em] leading-relaxed uppercase mb-4">
              TXMX Boxing
            </p>
            <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold tracking-wide leading-none mb-6 font-(family-name:--font-bebas-neue) uppercase">
              The 8 Count
            </h1>
            <p className="text-white/60 text-sm sm:text-base font-medium leading-relaxed max-w-md mb-8">
              Your ringside feed. Stories, updates, and behind-the-scenes
              coverage from the world of TXMX Boxing. New rounds
              dropping soon.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-white/20" />
              <p className="text-white/30 text-xs font-medium tracking-widest leading-relaxed uppercase">
                Coming Soon
              </p>
            </div>
          </div>
        </div>

        {/* Right Side — Video */}
        <div className="absolute inset-0 md:relative md:w-1/2 bg-black">
          <video
            src="https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2FBruno%20Eddie%20Reel.mp4?alt=media"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 15%, transparent 35%)",
            }}
          />
        </div>
      </section>
    </main>
  )
}
