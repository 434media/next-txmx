"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Fighter } from "../../lib/types/fighter"

interface CompareClientProps {
  fighters: Fighter[]
}

export default function CompareClient({ fighters }: CompareClientProps) {
  const [fighterA, setFighterA] = useState<Fighter | null>(null)
  const [fighterB, setFighterB] = useState<Fighter | null>(null)

  return (
    <div className="space-y-10">
      {/* Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FighterPicker
          label="Fighter A"
          color="amber"
          fighters={fighters}
          selected={fighterA}
          onSelect={setFighterA}
          excludeId={fighterB?.id}
        />
        <FighterPicker
          label="Fighter B"
          color="blue"
          fighters={fighters}
          selected={fighterB}
          onSelect={setFighterB}
          excludeId={fighterA?.id}
        />
      </div>

      {/* Comparison */}
      {fighterA && fighterB && (
        <ComparisonView a={fighterA} b={fighterB} />
      )}

      {/* Empty state */}
      {(!fighterA || !fighterB) && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-5">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <p className="text-white/40 text-sm font-semibold">
            {!fighterA && !fighterB
              ? "Pick two fighters above to compare"
              : "Select the second fighter to begin"}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Picker ────────────────────────────────────── */

function FighterPicker({
  label,
  color,
  fighters,
  selected,
  onSelect,
  excludeId,
}: {
  label: string
  color: "amber" | "blue"
  fighters: Fighter[]
  selected: Fighter | null
  onSelect: (f: Fighter | null) => void
  excludeId?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const accentBorder = color === "amber" ? "border-amber-500/30" : "border-blue-500/30"
  const accentText = color === "amber" ? "text-amber-500" : "text-blue-400"
  const accentDot = color === "amber" ? "bg-amber-500" : "bg-blue-500"

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return fighters
      .filter((f) => {
        if (f.id === excludeId) return false
        const text = `${f.firstName} ${f.lastName} ${f.nickname || ""}`.toLowerCase()
        return text.includes(q)
      })
      .slice(0, 8)
  }, [query, fighters, excludeId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (selected) {
    return (
      <div className={`border ${accentBorder} rounded-xl p-5 bg-white/3`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block w-2 h-2 rounded-full ${accentDot}`} />
          <p className={`${accentText} text-[10px] font-bold tracking-[0.2em] uppercase`}>
            {label}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
            {selected.profileImageUrl ? (
              <Image
                src={selected.profileImageUrl}
                alt={`${selected.firstName} ${selected.lastName}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-lg font-bold">
                {selected.firstName[0]}
                {selected.lastName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold uppercase truncate">
              {selected.firstName} {selected.lastName}
            </p>
            <p className="text-white/60 text-xs font-medium">
              {selected.record.wins}-{selected.record.losses}-{selected.record.draws} &middot; {selected.weightClass}
            </p>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-white/40 hover:text-white transition-colors p-1"
            aria-label="Remove fighter"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${open && query.trim() ? "z-30" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block w-2 h-2 rounded-full ${accentDot}`} />
        <p className={`${accentText} text-[10px] font-bold tracking-[0.2em] uppercase`}>
          {label}
        </p>
      </div>
      <input
        type="text"
        placeholder="Search fighters..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true)
        }}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-medium placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-colors"
      />
      {open && query.trim().length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden shadow-2xl max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            results.map((f) => (
              <li key={f.id}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(f)
                    setQuery("")
                    setOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <div className="relative w-9 h-9 rounded-lg bg-white/5 overflow-hidden shrink-0">
                    {f.profileImageUrl ? (
                      <Image
                        src={f.profileImageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate uppercase">
                      {f.firstName} {f.lastName}
                    </p>
                    <p className="text-white/50 text-[11px] truncate">
                      {f.record.wins}-{f.record.losses}-{f.record.draws} &middot; {f.weightClass}
                    </p>
                  </div>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-white/40 text-xs font-medium text-center">
              No fighters found for &ldquo;{query}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

/* ─── Comparison View ───────────────────────────── */

function ComparisonView({ a, b }: { a: Fighter; b: Fighter }) {
  const rows = buildRows(a, b)
  const totalBoutsA = a.record.wins + a.record.losses + a.record.draws
  const totalBoutsB = b.record.wins + b.record.losses + b.record.draws

  return (
    <div className="space-y-8">
      {/* Head to head cards with VS */}
      <div className="relative grid grid-cols-2 gap-4">
        <FighterCard fighter={a} side="left" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
            <span className="text-white/60 text-[10px] font-black tracking-wider">VS</span>
          </div>
        </div>
        <FighterCard fighter={b} side="right" />
      </div>

      {/* Stat Bars */}
      <section>
        <h3 className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          Head-to-Head Stats
        </h3>
        <div className="space-y-4">
          <StatBar label="Wins" valA={a.record.wins} valB={b.record.wins} />
          <StatBar label="Losses" valA={a.record.losses} valB={b.record.losses} invert />
          <StatBar label="KOs" valA={a.record.knockouts} valB={b.record.knockouts} />
          <StatBar
            label="KO %"
            valA={a.koPercentage ?? 0}
            valB={b.koPercentage ?? 0}
            suffix="%"
          />
          <StatBar label="Total Bouts" valA={totalBoutsA} valB={totalBoutsB} />
          {(a.rounds || b.rounds) && (
            <StatBar label="Rounds" valA={a.rounds ?? 0} valB={b.rounds ?? 0} />
          )}
        </div>
      </section>

      {/* Attribute Table */}
      <section>
        <h3 className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          Physical &amp; Career
        </h3>
        <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3.5 ${
                i % 2 === 0 ? "bg-white/2" : ""
              }`}
            >
              <p className="text-white/80 text-sm font-semibold text-left truncate">
                {row.valA}
              </p>
              <p className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase px-4 text-center min-w-[90px]">
                {row.label}
              </p>
              <p className="text-white/80 text-sm font-semibold text-right truncate">
                {row.valB}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Profile links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/fighters/${a.slug}`}
          className="group text-center border border-amber-500/20 rounded-lg py-3.5 text-amber-500/80 text-xs font-bold uppercase tracking-wider hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
        >
          View {a.firstName}&apos;s Profile
        </Link>
        <Link
          href={`/fighters/${b.slug}`}
          className="group text-center border border-blue-500/20 rounded-lg py-3.5 text-blue-400/80 text-xs font-bold uppercase tracking-wider hover:text-blue-300 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
        >
          View {b.firstName}&apos;s Profile
        </Link>
      </div>
    </div>
  )
}

/* ─── Fighter Card ──────────────────────────────── */

function FighterCard({ fighter, side }: { fighter: Fighter; side: "left" | "right" }) {
  const name = `${fighter.firstName} ${fighter.lastName}`
  const borderColor = side === "left" ? "border-amber-500/20" : "border-blue-500/20"
  const accentColor = side === "left" ? "text-amber-500/60" : "text-blue-400/60"

  return (
    <div className={`border ${borderColor} rounded-xl p-5 bg-white/3 flex flex-col items-center text-center`}>
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/5 mb-4 ring-2 ring-white/5">
        {fighter.profileImageUrl ? (
          <Image
            src={fighter.profileImageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl font-bold">
            {fighter.firstName[0]}{fighter.lastName[0]}
          </div>
        )}
      </div>
      <h3 className="text-white text-sm sm:text-base font-bold uppercase leading-tight mb-1">
        {name}
      </h3>
      {fighter.nickname && (
        <p className="text-white/50 text-xs mb-2">&ldquo;{fighter.nickname}&rdquo;</p>
      )}
      <p className="text-white text-xl sm:text-2xl font-black tabular-nums mb-1">
        {fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}
      </p>
      <p className={`${accentColor} text-[11px] font-bold tracking-wider uppercase`}>
        {fighter.weightClass} &middot; {fighter.region}
      </p>
    </div>
  )
}

/* ─── Stat Bar ──────────────────────────────────── */

function StatBar({
  label,
  valA,
  valB,
  suffix = "",
  invert = false,
}: {
  label: string
  valA: number
  valB: number
  suffix?: string
  invert?: boolean
}) {
  const max = Math.max(valA, valB, 1)
  const pctA = (valA / max) * 100
  const pctB = (valB / max) * 100

  // For most stats, higher is better. For "Losses", lower is better (invert).
  const aLeads = invert ? valA < valB : valA > valB
  const bLeads = invert ? valB < valA : valB > valA
  const tied = valA === valB

  const barColorA = tied ? "bg-white/20" : aLeads ? "bg-amber-500" : "bg-amber-500/30"
  const barColorB = tied ? "bg-white/20" : bLeads ? "bg-blue-500" : "bg-blue-500/30"
  const textColorA = tied ? "text-white/60" : aLeads ? "text-amber-500" : "text-white/50"
  const textColorB = tied ? "text-white/60" : bLeads ? "text-blue-400" : "text-white/50"

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      {/* A side */}
      <div className="flex items-center gap-2.5">
        <span className={`${textColorA} text-sm font-bold tabular-nums w-14 text-right shrink-0`}>
          {suffix === "%" ? valA.toFixed(1) : valA}{suffix}
        </span>
        <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColorA} rounded-full transition-all duration-500`}
            style={{ width: `${pctA}%`, marginLeft: "auto" }}
          />
        </div>
      </div>

      {/* Label */}
      <span className="text-white/50 text-[10px] font-bold tracking-[0.15em] uppercase w-24 text-center">
        {label}
      </span>

      {/* B side */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColorB} rounded-full transition-all duration-500`}
            style={{ width: `${pctB}%` }}
          />
        </div>
        <span className={`${textColorB} text-sm font-bold tabular-nums w-14 text-left shrink-0`}>
          {suffix === "%" ? valB.toFixed(1) : valB}{suffix}
        </span>
      </div>
    </div>
  )
}

/* ─── Helpers ───────────────────────────────────── */

function buildRows(a: Fighter, b: Fighter) {
  const rows: { label: string; valA: string; valB: string }[] = []

  const add = (label: string, getVal: (f: Fighter) => string | undefined) => {
    const va = getVal(a) || "—"
    const vb = getVal(b) || "—"
    if (va !== "—" || vb !== "—") rows.push({ label, valA: va, valB: vb })
  }

  add("Height", (f) => f.height?.imperial)
  add("Reach", (f) => f.reach?.imperial)
  add("Stance", (f) => f.stance ? f.stance.charAt(0).toUpperCase() + f.stance.slice(1) : undefined)
  add("Status", (f) => f.status.charAt(0).toUpperCase() + f.status.slice(1))
  add("Age", (f) => {
    if (!f.dateOfBirth) return undefined
    const age = Math.floor(
      (Date.now() - new Date(f.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )
    return `${age}`
  })
  add("Residence", (f) =>
    f.residence ? `${f.residence.city}, ${f.residence.state}` : undefined
  )
  add("Gym", (f) => f.gym)
  add("Trainer", (f) => f.trainer)
  add("Promoter", (f) => f.promoter)
  add("Career Start", (f) => f.debutDate || f.careerStart)
  add("Titles", (f) =>
    f.titles && f.titles.length > 0
      ? f.titles.filter((t) => t.current).map((t) => t.org).join(", ") || `${f.titles.length} past`
      : undefined
  )

  return rows
}
