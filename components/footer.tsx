"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Enter your email to join the fight")
      inputRef.current?.focus()
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address")
      inputRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setEmail("")
        setSuccess(true)
        // Reset after 5s so users who scroll back see the form again
        setTimeout(() => setSuccess(false), 5000)
      } else {
        throw new Error(data.error || "Failed to join")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Subtle amber glow accent in the top-left, brand color without shouting */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ── HERO CTA: brand statement + newsletter ──────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 pt-20 pb-16 lg:pt-28 lg:pb-20 border-b border-white/10">
          {/* Brand statement (3 of 5 cols) */}
          <div className="lg:col-span-3">
            <p className="text-amber-500 text-[11px] font-bold tracking-[0.3em] uppercase mb-5">
              TXMX Boxing
            </p>
            <h2 className="text-white text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase">
              Levantamos
              <br />
              <span className="text-white/35">Los Puños</span>
            </h2>
            <p className="mt-6 text-white/55 text-sm sm:text-base font-semibold leading-7 max-w-md">
              Made from blood, sweat, and tears. The boxing media platform
              built for the fans who study the game.
            </p>
          </div>

          {/* Newsletter (2 of 5 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <p className="text-white/45 text-[10px] font-bold tracking-[0.3em] uppercase mb-3">
              The 8 Count
            </p>
            <h3 className="text-white text-xl sm:text-2xl font-bold tracking-tight leading-tight mb-3">
              Join the fight night list.
            </h3>
            <p className="text-white/55 text-sm font-medium leading-6 mb-5 max-w-sm">
              Exclusive drops, fight-card alerts, and early access to The 8 Count —
              a feed for fight fans.
            </p>

            {success ? (
              <div className="flex items-center gap-3 px-4 py-3 border border-emerald-500/30 bg-emerald-500/5 rounded-md">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-emerald-400 text-[10px] font-bold tracking-[0.25em] uppercase leading-none mb-1">
                    Somos Boxeo
                  </p>
                  <p className="text-white/65 text-xs font-medium leading-5">
                    You're on the list. Keep an eye on your inbox.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setError(null)
                      setEmail(e.target.value)
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={submitting}
                    aria-label="Email address"
                    aria-describedby={error ? "footer-newsletter-error" : undefined}
                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-md text-white text-sm font-medium placeholder:text-white/35 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="shrink-0 px-4 py-2.5 bg-white text-black text-xs font-bold tracking-[0.15em] uppercase rounded-md hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Joining…" : "Join"}
                  </button>
                </div>
                {error && (
                  <p
                    id="footer-newsletter-error"
                    role="alert"
                    className="text-red-400 text-xs font-medium leading-5"
                  >
                    {error}
                  </p>
                )}
                <p className="text-white/35 text-[10px] leading-relaxed">
                  Free. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ── SITEMAP COLUMNS ───────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 py-14 border-b border-white/10">
          {/* Events */}
          <div>
            <p className="text-white text-[11px] font-bold tracking-[0.25em] uppercase mb-4">
              Events
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="/events/fight-night">Fight Night</FooterLink>
              <FooterLink href="/events/rise-of-a-champion">Rise of a Champion</FooterLink>
            </ul>
          </div>

          {/* Coming Soon */}
          <div>
            <p className="text-white text-[11px] font-bold tracking-[0.25em] uppercase mb-4">
              Coming Soon
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="/scorecard">
                Scorecard
                <PreviewBadge />
              </FooterLink>
              <FooterLink href="/8count">
                The 8 Count
                <PreviewBadge />
              </FooterLink>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white text-[11px] font-bold tracking-[0.25em] uppercase mb-4">
              Shop
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="https://434media.com/shop" external>
                434 Media Shop
              </FooterLink>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <p className="text-white text-[11px] font-bold tracking-[0.25em] uppercase mb-4">
              Follow Us
            </p>
            <ul className="space-y-2.5">
              <FooterLink href="https://www.instagram.com/txmxboxing/" external>
                Instagram
              </FooterLink>
              <FooterLink href="https://www.youtube.com/@txmxboxing/shorts" external>
                YouTube
              </FooterLink>
              <FooterLink href="https://www.tiktok.com/@txmxboxing" external>
                TikTok
              </FooterLink>
            </ul>
          </div>
        </section>

        {/* ── FINE PRINT ────────────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-6">
          <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed">
            © {currentYear} TXMX Boxing. All rights reserved.
          </p>
          <p className="text-white/40 text-[11px] font-medium tracking-wide leading-relaxed">
            Built by{" "}
            <a
              href="https://434media.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 font-semibold tracking-widest hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
            >
              434 MEDIA
              <ArrowUpRight className="w-3 h-3" strokeWidth={2.25} />
            </a>
          </p>
        </section>
      </div>
    </footer>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function FooterLink({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
}) {
  const className =
    "inline-flex items-center gap-1.5 text-white/55 text-[13px] font-medium leading-relaxed hover:text-white transition-colors duration-200 group"

  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
          <ArrowUpRight
            className="w-3 h-3 text-white/30 group-hover:text-white/70 group-hover:-translate-y-px group-hover:translate-x-px transition-all duration-200"
            strokeWidth={2.25}
          />
        </a>
      </li>
    )
  }

  return (
    <li>
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  )
}

function PreviewBadge() {
  return (
    <span className="inline-flex items-center text-amber-400 text-[9px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 leading-none">
      Preview
    </span>
  )
}
