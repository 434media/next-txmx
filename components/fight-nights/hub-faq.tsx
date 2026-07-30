import Link from "next/link"
import { Section } from "./section"

// Real TXMX fight-night photography for the background.
const FAQ_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/groovy-ego-462522-v2.firebasestorage.app/o/txmx%2Fsolution.jpg?alt=media"

/**
 * Short FAQ answering the first-timer's blocking questions, closing the page as
 * an image-as-background card: the photo fills the card, a left-weighted scrim
 * keeps the overlaid questions legible (so this card is a dark treatment — white
 * text over the darkened image). Uses native <details>/<summary> so it works
 * without client JS. Ends with a re-CTA back to the account form.
 */
const FAQS = [
  {
    q: "Is it free to play?",
    a: "Yes — completely free, and there's nothing to sign up for. Fan picks are closed for now; the cards, results, and leaderboards stay open to everyone.",
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
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 md:min-h-[480px]">
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FAQ_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Legibility scrim — darkest on the left where the questions sit, fading
            right so the photo still reads. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-black/90 via-black/70 to-black/40"
        />

        {/* Questions, overlaid */}
        <div className="relative px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="w-full max-w-xl">
            {/* Dark-treatment eyebrow (amber pops brighter over the photo). */}
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-2 h-2 bg-amber-500" />
              <p className="text-amber-400 text-[10px] font-bold tracking-[0.3em] uppercase">
                Fight Night Questions
              </p>
            </div>

            <div className="divide-y divide-white/15 border-t border-b border-white/15">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-white text-sm sm:text-base font-bold pr-6">
                      {f.q}
                    </span>
                    <span className="text-white/50 text-xl font-light shrink-0 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-white/70 text-sm font-medium leading-7 mt-3 pr-8">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            {/* Closing re-CTA. The old "#join" account band is gone, so this
                points back up at the explainer. */}
            <Link
              href="#how-it-works"
              className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:text-amber-400 transition-colors"
            >
              New here? See how it works
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
