export default function FightNightPlaybook() {
  const steps = [
    {
      step: "01",
      title: "Sign In",
      desc: "Use Google or email — 15 seconds. No subscription needed for tonight.",
      color: "text-amber-500",
    },
    {
      step: "02",
      title: "Check In",
      desc: "Enter the 4-digit code from the ring announcer to qualify for the BOXR Station prize.",
      color: "text-red-400",
    },
    {
      step: "03",
      title: "Pick Winners",
      desc: "Tap a fighter for each bout. Picks lock when the bout starts. Correct picks earn Skill Points.",
      color: "text-blue-400",
    },
    {
      step: "04",
      title: "Climb the Board",
      desc: "Watch the leaderboard move live after each bout. Top finisher tonight wins the venue prize.",
      color: "text-emerald-400",
    },
  ]

  return (
    <section id="playbook" className="relative border-b border-white/10 scroll-mt-20 bg-zinc-950/40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block w-2 h-2 bg-amber-500" />
          <p className="text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
            Tonight's Playbook
          </p>
        </div>
        <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] mb-3 max-w-xl">
          Four steps to<br />
          <span className="text-white/50">a shot at the prize</span>
        </h2>
        <p className="text-white/65 text-sm font-semibold leading-7 mb-12 max-w-lg">
          The crowd plays in real time. Pick correctly, climb the board, walk out with the prize.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {steps.map((item) => (
            <div key={item.step} className="bg-black p-7 sm:p-8">
              <p className={`${item.color} text-[10px] font-bold tracking-[0.3em] uppercase mb-3 opacity-80`}>
                Step {item.step}
              </p>
              <h3 className="text-white text-xl font-black uppercase tracking-tight leading-tight mb-3">
                {item.title}
              </h3>
              <p className="text-white/70 text-sm font-semibold leading-6">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
