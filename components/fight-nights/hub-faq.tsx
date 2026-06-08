import Link from "next/link"
import { Section, Eyebrow } from "./section"

// Real TXMX fight-night photography for the full-bleed band.
const FAQ_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fjune15th-9.jpg?alt=media"

/**
 * Short FAQ answering the first-timer's blocking questions, rendered as a
 * full-bleed band (photo left / questions right) to close the page. Uses native
 * <details>/<summary> so it works without any client JS. Ends with a re-CTA back
 * to the account form so a now-convinced reader can act without scrolling up.
 */
const FAQS = [
  {
    q: "Is it free to play?",
    a: "Yes — completely free. Create an account, make your picks, and you're in. No purchase, no catch.",
  },
  {
    q: "Do I have to be at the venue?",
    a: "No. Play live from the venue or from your couch — everyone competes on the same leaderboard in real time.",
  },
  {
    q: "How do I win a prize?",
    a: "Earn points for correct fight picks and prop calls. Whoever finishes on top of that night's board takes home the prize.",
  },
  {
    q: "When do my picks lock?",
    a: "Each bout's picks lock the moment that fight goes live. Get your call in before the bell.",
  },
  {
    q: "Do points carry over?",
    a: "Yes. Every night's points stack into your all-time standing, so you climb the season-long leaderboard across events.",
  },
]

export default function HubFaq() {
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 md:min-h-[460px]">
        {/* Photo — left */}
        <div className="relative order-1 min-h-80 md:min-h-0 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FAQ_IMAGE}
            alt="TXMX fighters in the ring on fight night"
            className="absolute inset-0"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Questions — right */}
        <div className="order-2 p-8 sm:p-10 flex flex-col justify-center">
          <div className="w-full">
            <Eyebrow tone="amber">Questions</Eyebrow>

            <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-neutral-900 text-sm sm:text-base font-bold pr-6">
                      {f.q}
                    </span>
                    <span className="text-neutral-400 text-xl font-light shrink-0 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-neutral-600 text-sm font-medium leading-7 mt-3 pr-8">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            {/* Closing re-CTA — back to the account form. */}
            <Link
              href="#join"
              className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 hover:text-amber-600 transition-colors self-start"
            >
              Still in? Create your free account
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}
