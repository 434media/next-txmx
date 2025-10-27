"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

interface FilterOption {
  id: string
  label: string
  count: number
}

interface FeedFiltersProps {
  types: FilterOption[]
  topics: FilterOption[]
  selectedTypes: string[]
  selectedTopics: string[]
  onTypeToggle: (type: string) => void
  onTopicToggle: (topic: string) => void
  onClearFilters: () => void
}

export function FeedFilters({
  types,
  topics,
  selectedTypes,
  selectedTopics,
  onTypeToggle,
  onTopicToggle,
  onClearFilters,
}: FeedFiltersProps) {
  const [typeOpen, setTypeOpen] = useState(true)
  const [topicOpen, setTopicOpen] = useState(true)

  const hasActiveFilters = selectedTypes.length > 0 || selectedTopics.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-white/20 bg-black/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-mono text-xs">/</span>
            <span className="text-white font-mono text-sm uppercase tracking-wider">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-mono text-white/60 hover:text-white uppercase tracking-wider transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Type Filter */}
      <div className="border border-white/20 bg-black/40">
        <button
          onClick={() => setTypeOpen(!typeOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg
              width="14"
              height="12"
              viewBox="0 0 14 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/60 group-hover:text-white transition-colors"
            >
              <path
                d="M1 0H8V1H1V0ZM1 6V1H0V10H1V11H12V10H13V3H12V2H9V1H8V2H9V3H12V4H3V5H2V6H1ZM1 7V10H12V5H3V6H2V7H1Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-mono text-white uppercase tracking-wider">Type</span>
          </div>
          <motion.svg
            animate={{ rotate: typeOpen ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/60"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </motion.svg>
        </button>

        <AnimatePresence>
          {typeOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-2">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onTypeToggle(type.id)}
                    className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded transition-colors group"
                  >
                    <div
                      className={`w-4 h-4 border transition-colors ${
                        selectedTypes.includes(type.id)
                          ? "bg-white border-white"
                          : "border-white/30 group-hover:border-white/50"
                      }`}
                    >
                      {selectedTypes.includes(type.id) && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-black"
                        >
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex-1">
                      {type.label}
                    </span>
                    <span className="text-xs font-mono text-zinc-600">({type.count})</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Topic Filter */}
      <div className="border border-white/20 bg-black/40">
        <button
          onClick={() => setTopicOpen(!topicOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <svg
              width="14"
              height="12"
              viewBox="0 0 14 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/60 group-hover:text-white transition-colors"
            >
              <path
                d="M1 0H8V1H1V0ZM1 6V1H0V10H1V11H12V10H13V3H12V2H9V1H8V2H9V3H12V4H3V5H2V6H1ZM1 7V10H12V5H3V6H2V7H1Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-mono text-white uppercase tracking-wider">Topic</span>
          </div>
          <motion.svg
            animate={{ rotate: topicOpen ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/60"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </motion.svg>
        </button>

        <AnimatePresence>
          {topicOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-2 max-h-[400px] overflow-y-auto">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onTopicToggle(topic.id)}
                    className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded transition-colors group"
                  >
                    <div
                      className={`w-4 h-4 border transition-colors ${
                        selectedTopics.includes(topic.id)
                          ? "bg-white border-white"
                          : "border-white/30 group-hover:border-white/50"
                      }`}
                    >
                      {selectedTopics.includes(topic.id) && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-black"
                        >
                          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors flex-1">
                      {topic.label}
                    </span>
                    <span className="text-xs font-mono text-zinc-600">({topic.count})</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
