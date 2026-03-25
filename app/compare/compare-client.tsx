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
          fighters={fighters}
          selected={fighterA}
          onSelect={setFighterA}
          excludeId={fighterB?.id}
        />
        <FighterPicker
          label="Fighter B"
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
          <p className="text-white/30 text-sm font-medium">
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
  fighters,
  selected,
  onSelect,
  excludeId,
}: {
  label: string
  fighters: Fighter[]
  selected: Fighter | null
  onSelect: (f: Fighter | null) => void
  excludeId?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
      <div className="border border-white/10 rounded-xl p-4 bg-white/3">
        <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-3">
          {label}
        </p>
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
              <div className="w-full h-full flex items-center justify-center text-white/15 text-lg font-bold">
                {selected.firstName[0]}
                {selected.lastName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold uppercase truncate">
              {selected.firstName} {selected.lastName}
            </p>
            <p className="text-white/50 text-xs font-medium">
              {selected.record.wins}-{selected.record.losses}-{selected.record.draws} &middot; {selected.weightClass}
            </p>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-white/30 hover:text-white/60 transition-colors"
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
    <div ref={ref} className="relative">
      <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-2">
        {label}
      </p>
      <input
        type="text"
        placeholder="Search fighters..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.trim() && setOpen(true)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shadow-xl max-h-72 overflow-y-auto">
          {results.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => {
                  onSelect(f)
                  setQuery("")
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div className="relative w-8 h-8 rounded bg-white/5 overflow-hidden shrink-0">
                  {f.profileImageUrl ? (
                    <Image
                      src={f.profileImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-xs font-bold">
                      {f.firstName[0]}{f.lastName[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate uppercase">
                    {f.firstName} {f.lastName}
                  </p>
                  <p className="text-white/40 text-[11px] truncate">
                    {f.record.wins}-{f.record.losses}-{f.record.draws} &middot; {f.weightClass}
                  </p>
                </div>
              </button>
            </li>
          ))}
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
      {/* Head to head cards */}
      <div className="grid grid-cols-2 gap-4">
        <FighterCard fighter={a} side="left" />
        <FighterCard fighter={b} side="right" />
      </div>

      {/* Stat Bars */}
      <section>
        <h3 className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-4">
          Head-to-Head Stats
        </h3>
        <div className="space-y-3">
          <StatBar label="Wins" valA={a.record.wins} valB={b.record.wins} />
          <StatBar label="Losses" valA={a.record.losses} valB={b.record.losses} />
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
        <h3 className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-4">
          Physical &amp; Career
        </h3>
        <div className="border border-white/10 rounded-xl overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 ${
                i % 2 === 0 ? "bg-white/2" : ""
              }`}
            >
              <p className="text-white/70 text-sm font-medium text-left truncate">
                {row.valA}
              </p>
              <p className="text-white/30 text-[11px] font-semibold tracking-wider uppercase px-4 text-center">
                {row.label}
              </p>
              <p className="text-white/70 text-sm font-medium text-right truncate">
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
          className="text-center border border-white/10 rounded-lg py-3 text-white/50 text-xs font-semibold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors"
        >
          View {a.firstName}&apos;s Profile
        </Link>
        <Link
          href={`/fighters/${b.slug}`}
          className="text-center border border-white/10 rounded-lg py-3 text-white/50 text-xs font-semibold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors"
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
  return (
    <div className="border border-white/10 rounded-xl p-5 bg-white/2 flex flex-col items-center text-center">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/5 mb-4">
        {fighter.profileImageUrl ? (
          <Image
            src={fighter.profileImageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/15 text-3xl font-bold">
            {fighter.firstName[0]}{fighter.lastName[0]}
          </div>
        )}
      </div>
      <h3 className="text-white text-sm sm:text-base font-bold uppercase leading-tight mb-1">
        {name}
      </h3>
      {fighter.nickname && (
        <p className="text-white/40 text-xs mb-2">&ldquo;{fighter.nickname}&rdquo;</p>
      )}
      <p className="text-white/60 text-xl sm:text-2xl font-bold tabular-nums mb-1">
        {fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}
      </p>
      <p className="text-white/40 text-[11px] font-medium">
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
}: {
  label: string
  valA: number
  valB: number
  suffix?: string
}) {
  const max = Math.max(valA, valB, 1)
  const pctA = (valA / max) * 100
  const pctB = (valB / max) * 100

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* A side */}
      <div className="flex items-center gap-2">
        <span className="text-white/70 text-sm font-bold tabular-nums w-14 text-right shrink-0">
          {suffix === "%" ? valA.toFixed(1) : valA}{suffix}
        </span>
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500/60 rounded-full transition-all duration-500"
            style={{ width: `${pctA}%`, marginLeft: "auto" }}
          />
        </div>
      </div>

      {/* Label */}
      <span className="text-white/30 text-[10px] font-semibold tracking-wider uppercase w-20 text-center">
        {label}
      </span>

      {/* B side */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/60 rounded-full transition-all duration-500"
            style={{ width: `${pctB}%` }}
          />
        </div>
        <span className="text-white/70 text-sm font-bold tabular-nums w-14 text-left shrink-0">
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
