/**
 * Short FAQ answering the first-timer's blocking questions. Uses native
 * <details>/<summary> so it works without any client JS.
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
    <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 mt-16 sm:mt-20">
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-block w-2 h-2 bg-amber-500" />
        <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase">
          Questions
        </p>
      </div>

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
    </section>
  )
}
