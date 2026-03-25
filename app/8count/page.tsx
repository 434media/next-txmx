import type { Metadata } from "next"
import Link from "next/link"
import { getEightCountPosts, type EightCountPost } from "../actions/eight-count"
import EightCountVideo from "./eightcount-video"

export const dynamic = 'force-dynamic'

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

function PostCard({ post }: { post: EightCountPost }) {
  return (
    <Link
      href={`/8count/${post.slug}`}
      className="group relative block overflow-hidden rounded-sm bg-black"
    >
      {/* Card image — tall portrait ratio like the social media card */}
      <div className="relative aspect-4/5 overflow-hidden">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-neutral-900 to-black" />
        )}

        {/* Dark gradient overlay from bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)',
          }}
        />

        {/* Title overlay — bold, uppercase, like the social card */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="text-white text-xl sm:text-2xl font-bold leading-tight tracking-wide uppercase font-(family-name:--font-bebas-neue) mb-3">
            {post.title}
          </h2>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Tags strip */}
      {post.tags.length > 0 && (
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold tracking-[0.15em] text-white/30 uppercase"
            >
              {tag}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-white/20 tracking-wider">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : ''}
          </span>
        </div>
      )}
    </Link>
  )
}

export default async function EightCountPage() {
  let posts: EightCountPost[] = []
  try {
    posts = await getEightCountPosts('published', 50)
  } catch {
    // If Firestore is unavailable, show empty feed
  }

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
              coverage from the world of TXMX Boxing.
            </p>
            {posts.length > 0 && (
              <a
                href="#feed"
                className="inline-flex items-center gap-2 text-white/50 text-xs font-medium tracking-widest uppercase hover:text-white/80 transition-colors"
              >
                <span className="inline-block w-8 h-px bg-white/20" />
                Scroll to feed
              </a>
            )}
            {posts.length === 0 && (
              <div className="flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-white/20" />
                <p className="text-white/30 text-xs font-medium tracking-widest leading-relaxed uppercase">
                  New rounds dropping soon
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side — Video */}
        <EightCountVideo />
      </section>

      {/* Feed Section */}
      {posts.length > 0 && (
        <section id="feed" className="relative px-4 sm:px-8 lg:px-16 py-16 sm:py-24">
          {/* Section header */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className="flex items-center gap-4 mb-2">
              <span className="inline-block w-10 h-px bg-white/20" />
              <p className="text-white/30 text-[10px] font-semibold tracking-[0.3em] uppercase">
                Latest
              </p>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-bold tracking-wide leading-none font-(family-name:--font-bebas-neue) uppercase">
              The Feed
            </h2>
          </div>

          {/* Post grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
