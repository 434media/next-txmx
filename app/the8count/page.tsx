"use client"

import { useState, useMemo } from "react"
import { Feed8CountItem } from "@/components/8count/feed-item"
import { FeedFilters } from "@/components/8count/feed-filters"
import { BoxingArt } from "@/components/8count/boxing-art"
import TXMXNewsletter from "@/components/txmx-newsletter"
import { feedItems, feedTypes, feedTopics } from "@/data/8count-feed"

export default function The8CountPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [showNewsletter, setShowNewsletter] = useState(true)

  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(item.type)
      const topicMatch =
        selectedTopics.length === 0 ||
        item.topics.some((topic) => selectedTopics.includes(topic.toLowerCase().replace(/\s+/g, "-")))
      return typeMatch && topicMatch
    })
  }, [selectedTypes, selectedTopics])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
    setSelectedTopics([])
  }

  const handleNewsletterClose = () => {
    setShowNewsletter(false)
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": "https://txmxboxing.com/the8count",
            name: "The 8 Count - TXMX Boxing",
            description:
              "Stories from the ring, the gym, and the streets. Fight analysis, training wisdom, and the culture that makes boxing the ultimate test of will.",
            url: "https://txmxboxing.com/the8count",
            publisher: {
              "@type": "Organization",
              name: "TXMX Boxing",
              logo: {
                "@type": "ImageObject",
                url: "https://txmxboxing.com/txmx-logo.svg",
              },
            },
            blogPost: feedItems.slice(0, 10).map((item) => ({
              "@type": "BlogPosting",
              headline: item.title,
              datePublished: item.date.replace(/\./g, "-"),
              author: item.authors.map((author) => ({
                "@type": "Person",
                name: author,
              })),
              description: item.summary,
              url: `https://txmxboxing.com/the8count/${item.slug}`,
            })),
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
            ],
          }),
        }}
      />

      <main className="pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-white">
                The 8 Count
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="w-2.5 h-2.5 bg-white" />
                <div className="w-2.5 h-2.5 bg-white" />
                <div className="w-2.5 h-2.5 bg-white" />
              </div>
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                The 8 Count
              </h1>
              <div
                className="px-3 py-1.5 bg-white text-black text-sm font-mono font-bold"
                aria-label={`${filteredItems.length} articles`}
              >
                {filteredItems.length}
              </div>
            </div>
            <p className="text-zinc-400 text-base sm:text-lg max-w-3xl leading-relaxed">
              Stories from the ring, the gym, and the streets. Fight analysis, training wisdom, and the culture that
              makes boxing the ultimate test of will.
            </p>
          </header>

          {/* Main Content Grid - Desktop: Side-by-side, Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Filters Sidebar - Desktop: Left, Mobile: Top */}
            <aside className="lg:col-span-3 order-1" aria-label="Filters">
              <div className="lg:sticky lg:top-24">
                <FeedFilters
                  types={feedTypes}
                  topics={feedTopics}
                  selectedTypes={selectedTypes}
                  selectedTopics={selectedTopics}
                  onTypeToggle={handleTypeToggle}
                  onTopicToggle={handleTopicToggle}
                  onClearFilters={handleClearFilters}
                />

                {/* Boxing Art - Desktop only */}
                <div className="mt-8 hidden lg:block">
                  <BoxingArt />
                </div>
              </div>
            </aside>

            {/* Main Content - Desktop: Right, Mobile: Middle */}
            <div className="lg:col-span-9 order-2 space-y-12">
              {/* Feed List */}
              <section aria-label="Articles">
                <div className="border border-white/20 bg-black/40">
                  <div className="border-b border-white/20 p-4 sm:p-6">
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-zinc-500">
                      <span className="text-white/60">/</span>
                      <span>Date</span>
                      <span className="hidden md:block">·</span>
                      <span className="hidden md:block">Title</span>
                      <span className="hidden md:block ml-auto">Type</span>
                    </div>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="p-12 sm:p-16 text-center">
                      <div className="text-6xl sm:text-7xl mb-6 opacity-30" role="img" aria-label="Boxing glove emoji">
                        🥊
                      </div>
                      <p className="text-zinc-400 text-lg mb-4">No stories match your filters</p>
                      <button
                        onClick={handleClearFilters}
                        className="text-white hover:text-zinc-400 underline text-sm"
                        type="button"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      {filteredItems.map((item) => (
                        <Feed8CountItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Newsletter Section - Inline mode */}
              {showNewsletter && (
                <section aria-label="Newsletter signup" className="mt-12">
                  <TXMXNewsletter showModal={true} onClose={handleNewsletterClose} mode="inline" context="8count" />
                </section>
              )}
            </div>
          </div>

          {/* Boxing Art - Mobile only, bottom of page */}
          <div className="mt-12 lg:hidden">
            <BoxingArt />
          </div>
        </div>
      </main>
    </>
  )
}
