import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEightCountPostBySlug, getAllPublishedSlugs } from '../../actions/eight-count'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getEightCountPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found | The 8 Count' }
  }

  return {
    title: `${post.title} | The 8 Count`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    creator: post.author,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.txmxboxing.com/8count/${post.slug}`,
      siteName: 'TXMX Boxing',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImageUrl
        ? [{ url: post.coverImageUrl, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@txmx',
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
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
      canonical: `https://www.txmxboxing.com/8count/${post.slug}`,
    },
  }
}

export default async function EightCountPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getEightCountPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl || undefined,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TXMX Boxing',
      url: 'https://www.txmxboxing.com',
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `https://www.txmxboxing.com/8count/${post.slug}`,
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen bg-black font-sans">
        {/* Hero cover image */}
        <div className="relative w-full h-[70vh] md:h-[50vh] overflow-hidden">
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover object-top lg:object-[center_20%]"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-neutral-900 to-black" />
          )}

          {/* Gradient overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)',
            }}
          />

          {/* Title over image — matches the social card style */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 lg:px-20 pb-8 sm:pb-12">
            <div className="max-w-4xl mx-auto">
              {/* Back link */}
              <Link
                href="/8count"
                className="inline-flex items-center gap-2 text-white/40 text-xs font-medium tracking-widest uppercase hover:text-white/70 transition-colors mb-6"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                The 8 Count
              </Link>

              <h1 className="text-white text-3xl sm:text-5xl lg:text-7xl font-bold tracking-wide leading-[1.1] font-(family-name:--font-bebas-neue) uppercase mb-5">
                {post.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm tracking-wider font-light">
                <span className="font-medium">{post.author}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {post.tags.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    {post.tags.map((tag) => (
                      <span key={tag} className="uppercase tracking-[0.15em] text-white/25">
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <article className="relative px-6 sm:px-12 lg:px-20 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Excerpt / lead */}
            {post.excerpt && (
              <p className="text-white/60 text-lg sm:text-xl lg:text-2xl leading-[1.6] font-light mb-12 border-l-2 border-[#FFB800]/30 pl-6">
                {post.excerpt}
              </p>
            )}

            {/* HTML content from editor */}
            <div
              className="eightcount-prose text-white/75 text-base sm:text-lg lg:text-[19px] leading-[1.85] font-light
                [&_h2]:text-white [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:lg:text-4xl [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:leading-[1.15] [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:font-(family-name:--font-bebas-neue) [&_h2]:uppercase
                [&_h3]:text-white [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:lg:text-3xl [&_h3]:font-semibold [&_h3]:tracking-wide [&_h3]:leading-[1.2] [&_h3]:mt-12 [&_h3]:mb-5 [&_h3]:font-(family-name:--font-bebas-neue) [&_h3]:uppercase
                [&_p]:mb-6 [&_p]:leading-[1.85]
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:text-white/65
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:text-white/65
                [&_li]:mb-3 [&_li]:leading-[1.7]
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#FFB800]/20 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-white/45 [&_blockquote]:my-10 [&_blockquote]:text-lg [&_blockquote]:leading-[1.7]
                [&_a]:text-[#FFB800] [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-[#FFB800]/80 [&_a]:transition-colors
                [&_img]:max-w-full [&_img]:rounded-sm [&_img]:my-10
                [&_hr]:border-white/10 [&_hr]:my-12
                [&_strong]:text-white [&_strong]:font-normal
                [&_em]:text-white/60
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Footer nav */}
        <div className="border-t border-white/5 px-6 sm:px-12 lg:px-20 py-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link
              href="/8count"
              className="inline-flex items-center gap-2 text-white/40 text-xs font-medium tracking-widest uppercase hover:text-white/70 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to The 8 Count
            </Link>
            <p className="text-white/20 text-[10px] font-semibold tracking-[0.3em] uppercase">
              TXMX Boxing
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
