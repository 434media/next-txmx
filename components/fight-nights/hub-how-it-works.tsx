/**
 * Hub "how the game works" — ports the slug page's 3-step explainer to the
 * parent page (which previously never explained the game) and adds a scoring
 * strip. Scoring numbers are derived from the shared lib/scoring constants — the
 * same source of truth the server settlement logic uses — so the copy can never
 * drift from the actual rules.
 */
import {
  MATCH_WIN_POINTS,
  DEFAULT_PROP_POINTS,
  UNDERDOG_MULTIPLIER,
} from "../../lib/scoring"

const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    desc: "One tap with Google, or sign up with email. Free — and it follows you to every TXMX fight night.",
  },
  {
    step: "02",
    title: "Pick Winners & Call Props",
    desc: "Tap a fighter for each bout, call the props, vote the polls. Picks lock when the bell rings.",
  },
  {
    step: "03",
    title: "Climb the Leaderboard",
    desc: "Correct calls earn points. Watch the board move live after each fight — finish on top for the prize.",
  },
]

const SCORING = [
  { value: `+${MATCH_WIN_POINTS}`, unit: "pts", label: "Correct fight pick" },
  {
    value: `+${DEFAULT_PROP_POINTS}`,
    unit: "pts",
    label: "Prop call — points set per prop",
  },
  { value: `×${UNDERDOG_MULTIPLIER}`, unit: "payout", label: "Underdog prop bonus" },
]

export default function HubHowItWorks() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-2 h-2 bg-amber-500" />
        <p className="text-amber-600 text-[10px] font-bold tracking-[0.25em] uppercase">
          How It Works
        </p>
      </div>
      <h2 className="text-neutral-900 text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3">
        Three steps to<br />
        <span className="text-neutral-400">a shot at the prize.</span>
      </h2>
      <p className="text-neutral-600 text-sm font-semibold leading-7 mb-10 max-w-lg">
        The whole crowd plays in real time — online or in person, same
        leaderboard. Free to play.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
        {STEPS.map((item) => (
          <div key={item.step} className="bg-white p-6 sm:p-7">
            <p className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-2.5">
              Step {item.step}
            </p>
            <h3 className="text-neutral-900 text-lg font-black uppercase tracking-tight leading-tight mb-2.5">
              {item.title}
            </h3>
            <p className="text-neutral-600 text-sm font-medium leading-6">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Scoring */}
      <div className="mt-8">
        <p className="text-neutral-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
          How Points Work
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200 rounded-xl overflow-hidden border border-neutral-200">
          {SCORING.map((s) => (
            <div key={s.label} className="bg-white p-5 sm:p-6">
              <p className="text-neutral-900 font-black tabular-nums leading-none">
                <span className="text-2xl sm:text-3xl">{s.value}</span>{" "}
                <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">
                  {s.unit}
                </span>
              </p>
              <p className="text-neutral-500 text-xs font-medium leading-5 mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-neutral-400 text-xs font-medium leading-5 mt-4 max-w-xl">
          Polls are just for fun — no points, pure crowd opinion. Points carry
          across every fight night into your all-time standing.
        </p>
      </div>
    </section>
  )
}
