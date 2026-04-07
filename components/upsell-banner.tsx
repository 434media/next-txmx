'use client'

import Link from 'next/link'

interface UpsellBannerProps {
  /** Short headline */
  headline: string
  /** Supporting copy */
  message: string
  /** CTA label — defaults to "Get the Black Card" */
  cta?: string
  /** Compact single-line variant */
  compact?: boolean
}

export default function UpsellBanner({
  headline,
  message,
  cta = 'Get the Black Card — $14.99/mo',
  compact = false,
}: UpsellBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4 border border-amber-500/20 rounded-xl bg-amber-500/5 px-5 py-3">
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">{headline}</p>
          <p className="text-white/40 text-[10px] leading-4 truncate">{message}</p>
        </div>
        <Link
          href="/checkout"
          className="shrink-0 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-widest uppercase transition-colors"
        >
          Upgrade
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center py-8 border border-amber-500/20 rounded-xl bg-amber-500/5">
      <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-4" />
      <p className="text-white text-sm font-semibold leading-6 mb-2">{headline}</p>
      <p className="text-white/40 text-xs leading-5 max-w-sm mx-auto mb-5">{message}</p>
      <Link
        href="/checkout"
        className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-widest uppercase transition-colors"
      >
        {cta}
      </Link>
    </div>
  )
}
