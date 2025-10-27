"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import type { FeedItem } from "@/data/8count-feed"

interface FeedItemProps {
  item: FeedItem
}

export function Feed8CountItem({ item }: FeedItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const typeStyles = {
    "fight-recap": "bg-white/10 text-white border-white/30",
    training: "bg-white/10 text-white border-white/30",
    news: "bg-white/10 text-white border-white/30",
    community: "bg-white/10 text-white border-white/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-zinc-800 first:border-t-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 md:gap-6 py-5 px-6 hover:bg-white/5 transition-colors text-left group"
      >
        <div className="flex items-center gap-2 min-w-[100px] md:min-w-[120px]">
          <div className="w-1.5 h-1.5 bg-white group-hover:opacity-70 transition-opacity" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{item.date}</span>
        </div>

        <h3 className="text-base md:text-lg font-bold text-zinc-100 group-hover:text-white transition-colors flex-1 leading-tight">
          {item.title}
        </h3>

        <div
          className={`px-3 py-1 text-xs font-mono uppercase border ${typeStyles[item.type]} rounded hidden md:block whitespace-nowrap`}
        >
          {item.type.replace("-", " ")}
        </div>

        <div className="text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0V16M0 8H16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 space-y-6 border-l border-white/20 ml-6 pl-8 md:ml-[136px] md:pl-10">
              <div>
                <span className="text-xs font-mono text-white/60 uppercase tracking-wider block mb-3">Summary</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.summary}</p>
              </div>

              <div>
                <span className="text-xs font-mono text-white/60 uppercase tracking-wider block mb-3">
                  {item.authors.length > 1 ? "Authors" : "Author"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.authors.map((author) => (
                    <span key={author} className="text-sm text-zinc-300">
                      {author}
                    </span>
                  ))}
                </div>
              </div>

              {item.topics.length > 0 && (
                <div>
                  <span className="text-xs font-mono text-white/60 uppercase tracking-wider block mb-3">Topics</span>
                  <div className="flex flex-wrap gap-2">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 text-xs font-mono bg-white/5 text-zinc-400 border border-zinc-700 uppercase"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.readTime && <div className="text-xs text-zinc-500 font-mono">{item.readTime} min read</div>}

              <Link
                href={`/the8count/${item.slug}`}
                className="inline-block px-6 py-3 bg-white hover:bg-white/90 text-black font-bold uppercase text-sm transition-colors border border-white/20"
              >
                Read Full Story →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
