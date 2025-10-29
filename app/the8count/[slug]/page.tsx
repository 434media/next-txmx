import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getFeedItems, getFeedItemBySlug } from "@/lib/8count-data"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const feedItems = await getFeedItems()
  return feedItems.map((item) => ({
    slug: item.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getFeedItemBySlug(params.slug)

  if (!article) {
    return {
      title: "Article Not Found - The 8 Count",
      description: "The article you're looking for could not be found.",
    }
  }

  const publishedDate = article.date.replace(/\./g, "-")
  const url = `https://txmxboxing.com/the8count/${article.slug}`

  return {
    title: `${article.title} | The 8 Count - TXMX Boxing`,
    description: article.summary,
    keywords: ["boxing", "TXMX", "The 8 Count", article.type, ...article.topics, ...article.authors].join(", "),
    authors: article.authors.map((name) => ({ name })),
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      siteName: "TXMX Boxing - The 8 Count",
      locale: "en_US",
      type: "article",
      publishedTime: publishedDate,
      authors: article.authors,
      tags: article.topics,
      images: [
        {
          url: article.image || "https://txmxboxing.com/og-image-8count.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.image || "https://txmxboxing.com/og-image-8count.jpg"],
      creator: "@txmxboxing",
    },
    alternates: {
      canonical: url,
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
}

export default async function ArticlePage({ params }: PageProps) {
  const [article, feedItems] = await Promise.all([
    getFeedItemBySlug(params.slug),
    getFeedItems()
  ])

  if (!article) {
    notFound()
  }

  const typeLabels = {
    "fight-recap": "Fight Recap",
    training: "Training",
    news: "News",
    community: "Community",
  }

  const publishedDate = article.date.replace(/\./g, "-")
  const readableDate = new Date(publishedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.summary,
            image: article.image || "https://txmxboxing.com/og-image-8count.jpg",
            datePublished: publishedDate,
            dateModified: publishedDate,
            author: article.authors.map((author) => ({
              "@type": "Person",
              name: author,
            })),
            publisher: {
              "@type": "Organization",
              name: "TXMX Boxing",
              logo: {
                "@type": "ImageObject",
                url: "https://txmxboxing.com/txmx-logo.svg",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://txmxboxing.com/the8count/${article.slug}`,
            },
            articleBody: article.content,
            keywords: article.topics.join(", "),
            wordCount: article.content.split(" ").length,
            timeRequired: `PT${article.readTime || 5}M`,
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://txmxboxing.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "The 8 Count",
                item: "https://txmxboxing.com/the8count",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.title,
                item: `https://txmxboxing.com/the8count/${article.slug}`,
              },
            ],
          }),
        }}
      />

      <main className="pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>/</li>
              <li>
                <Link href="/the8count" className="hover:text-white transition-colors">
                  The 8 Count
                </Link>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-white truncate">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <Link
            href="/the8count"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono uppercase tracking-wider">Back to The 8 Count</span>
          </Link>

          {/* Article */}
          <article>
            {/* Article Header */}
            <header className="border-b border-white/20 pb-8 mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 text-xs font-mono uppercase border border-white/30 bg-white/10 text-white">
                  {typeLabels[article.type]}
                </span>
                <time dateTime={publishedDate} className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">{article.date}</span>
                </time>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {article.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 text-xs font-mono bg-white/5 text-zinc-400 border border-zinc-700 uppercase"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <User className="w-4 h-4" />
                <span className="text-white/60 font-mono uppercase text-xs tracking-wider">By</span>
                <span>{article.authors.join(", ")}</span>
              </div>
            </header>

            {/* Article Image */}
            {article.image && (
              <div className="mb-8">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover border border-white/20"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-xl text-zinc-300 leading-relaxed mb-8 font-light border-l-2 border-white/20 pl-6">
                {article.summary}
              </div>

              <div className="text-zinc-400 leading-relaxed space-y-6 whitespace-pre-line">{article.content}</div>
            </div>

            {/* Article Footer */}
            <footer className="mt-16 pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">Share This Story</p>
                  <div className="flex gap-4">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=https://txmxboxing.com/the8count/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                      aria-label="Share on X (Twitter)"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=https://txmxboxing.com/the8count/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <Link
                  href="/the8count"
                  className="px-6 py-3 bg-white hover:bg-white/90 text-black font-bold uppercase text-sm transition-colors border border-white/20"
                >
                  More Stories →
                </Link>
              </div>
            </footer>
          </article>

          {/* Related Articles */}
          <section className="mt-16 pt-8 border-t border-white/20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-black text-white mb-6 uppercase">
              Related Stories
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {feedItems
                .filter(
                  (item) =>
                    item.slug !== article.slug &&
                    (item.type === article.type || item.topics.some((topic) => article.topics.includes(topic))),
                )
                .slice(0, 4)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/the8count/${item.slug}`}
                    className="block border border-white/20 bg-black/40 hover:bg-white/5 transition-colors group overflow-hidden"
                  >
                    {item.image && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-xs font-mono text-zinc-500 mb-2">{item.date}</div>
                      <h3 className="text-base font-bold text-white group-hover:text-zinc-300 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">{item.summary}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
