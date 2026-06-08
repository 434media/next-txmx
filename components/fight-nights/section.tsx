import type { ReactNode } from "react"

const EYEBROW_TONE = {
  amber: { dot: "bg-amber-500", text: "text-amber-600" },
  emerald: { dot: "bg-emerald-500", text: "text-emerald-600" },
  neutral: { dot: "bg-neutral-900", text: "text-neutral-900" },
  red: { dot: "bg-red-500", text: "text-red-600" },
} as const

export type EyebrowTone = keyof typeof EYEBROW_TONE

/**
 * Section eyebrow — the dot + 10px / 0.3em uppercase label that heads every
 * section on the Fight Nights surfaces. Centralized so the dot color, text
 * color, size, and letter-spacing can never drift between sections again.
 *
 * `tone` carries the semantic color: amber = action/info, emerald =
 * completed/success, red = live, neutral = data. `pulse` animates the dot for
 * live states. Margin defaults to `mb-5` (the section-eyebrow standard);
 * override via `className` for tighter card-internal headers.
 */
export function Eyebrow({
  tone = "amber",
  pulse = false,
  mb = "mb-5",
  className = "",
  children,
}: {
  tone?: EyebrowTone
  pulse?: boolean
  /** Bottom-margin utility. Defaults to the section-eyebrow standard (`mb-5`);
   *  pass a single margin class (e.g. `mb-2`, `mb-0`) for tighter contexts. */
  mb?: string
  className?: string
  children: ReactNode
}) {
  const t = EYEBROW_TONE[tone]
  return (
    <div className={`flex items-center gap-2 ${mb} ${className}`}>
      <span
        className={`inline-block w-2 h-2 ${t.dot} ${pulse ? "animate-pulse" : ""}`}
      />
      <p className={`${t.text} text-[10px] font-bold tracking-[0.3em] uppercase`}>
        {children}
      </p>
    </div>
  )
}

/**
 * Standard content-section wrapper — owns the page's container width, horizontal
 * padding, top margin, and scroll-margin so every section shares one rhythm and
 * none of those values can drift. `width="narrow"` is the reading-width variant
 * (used by the FAQ). Pass an `id` for anchor targeting.
 *
 * Full-bleed bands (the hero, "Happening Next") intentionally opt out of this
 * wrapper.
 */
export function Section({
  id,
  width = "default",
  className = "",
  children,
}: {
  id?: string
  width?: "default" | "narrow"
  className?: string
  children: ReactNode
}) {
  const maxW = width === "narrow" ? "max-w-3xl" : "max-w-6xl"
  return (
    <section
      id={id}
      className={`scroll-mt-24 ${maxW} mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20 ${className}`}
    >
      {children}
    </section>
  )
}
