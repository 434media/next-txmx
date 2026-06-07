'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface ComboboxOption {
  value: string
  label: string
  /** Muted secondary text shown to the right of the label. */
  hint?: string
  /** Tailwind bg-* class for a small leading status dot. */
  dotClass?: string
}

/**
 * The admin's one selection control: a button trigger (with chevron) that opens
 * a popover with a search box + filtered list, and an optional inline "create"
 * row when the query has no match. Covers small fixed lists (weight class,
 * status, night) and large/creatable databases (fighters, gyms) — so every
 * admin form uses the same dropdown UX.
 *
 * `value` is the current selection (an option value, or a free string like a
 * fighter name / catchweight). The trigger shows the matching option's label,
 * or the raw value if it isn't one of the options.
 */
export default function Combobox({
  value,
  options,
  onSelect,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  searchable,
  createSlot,
  className = '',
  ariaLabel,
}: {
  value: string
  options: ComboboxOption[]
  onSelect: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  /** Show the in-popover search box. Defaults to true once there are >7 options. */
  searchable?: boolean
  /** Rendered at the bottom when the query is non-empty and matches no option label. */
  createSlot?: (query: string, close: () => void) => ReactNode
  className?: string
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function close() {
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const showSearch = searchable ?? options.length > 7

  useEffect(() => {
    if (open && showSearch) inputRef.current?.focus()
  }, [open, showSearch])

  const selected = options.find((o) => o.value === value) || null
  const triggerLabel = selected ? selected.label : value

  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q)
      )
    : options
  const exact = options.some((o) => o.label.toLowerCase() === q)
  const showCreate = !!createSlot && q.length > 0 && !exact

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 text-gray-900 text-[13px] leading-tight px-3 py-2 rounded-md hover:border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/30 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.dotClass && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${selected.dotClass}`} />
          )}
          <span className={`truncate ${triggerLabel ? '' : 'text-gray-400'}`}>
            {triggerLabel || placeholder}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {showSearch && (
            <div className="p-1.5 border-b border-gray-100">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[13px] px-2.5 py-1.5 rounded-md focus:outline-none focus:border-gray-900 placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 && !showCreate && (
              <p className="px-3 py-2 text-[13px] text-gray-400">No results</p>
            )}

            {filtered.map((o) => {
              const isSel = o.value === value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onSelect(o.value)
                    close()
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                    isSel ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {o.dotClass && (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${o.dotClass}`} />
                  )}
                  <span className="truncate flex-1">{o.label}</span>
                  {o.hint && (
                    <span className="text-[11px] text-gray-400 truncate shrink-0">{o.hint}</span>
                  )}
                  {isSel && (
                    <svg
                      className="w-3.5 h-3.5 text-gray-900 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}

            {showCreate && createSlot && (
              <div className="border-t border-gray-100 px-3 py-2">
                {createSlot(query.trim(), close)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
