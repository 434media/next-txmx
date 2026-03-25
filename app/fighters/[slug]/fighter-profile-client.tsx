"use client"

import Image from "next/image"
import Link from "next/link"
import type { Fighter, FightRecord } from "../../../lib/types/fighter"
import ShareButton from "../../../components/share-button"

interface FighterProfileClientProps {
  fighter: Fighter
  fights?: FightRecord[]
}

export default function FighterProfileClient({
  fighter,
  fights = [],
}: FighterProfileClientProps) {
  const name = `${fighter.firstName} ${fighter.lastName}`
  const record = `${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}`

  return (
    <main className="relative min-h-screen bg-black font-sans pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-white/30">
            <li>
              <Link href="/scorecard" className="hover:text-white/60 transition-colors">
                Scorecard
              </Link>
            </li>
            <li className="text-white/10">/</li>
            <li>
              <Link href="/fighters" className="hover:text-white/60 transition-colors">
                Fighters
              </Link>
            </li>
            <li className="text-white/10">/</li>
            <li className="text-white/50">{name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* Image */}
          <div className="relative w-full md:w-72 h-80 md:h-96 rounded-xl overflow-hidden bg-white/5 shrink-0">
            {fighter.profileImageUrl ? (
              <Image
                src={fighter.profileImageUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/15 text-7xl font-bold uppercase select-none">
                  {fighter.firstName[0]}
                  {fighter.lastName[0]}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-center">
            {fighter.nickname && (
              <p className="text-white/50 text-sm font-medium leading-6 mb-1">
                &ldquo;{fighter.nickname}&rdquo;
              </p>
            )}
            <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-wide leading-none mb-3 uppercase">
              {name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white/60 text-2xl font-bold tabular-nums">
                {record}
              </span>
              {fighter.record.knockouts > 0 && (
                <span className="text-white/50 text-sm font-medium leading-6">
                  {fighter.record.knockouts} KOs
                  {fighter.koPercentage
                    ? ` (${fighter.koPercentage}%)`
                    : ""}
                </span>
              )}
              <ShareButton
                url={`https://www.txmxboxing.com/fighters/${fighter.slug}`}
                title={`${name} | TXMX Boxing`}
                text={`Check out ${name} (${record}) on TXMX Boxing`}
                variant="compact"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {fighter.weightClass && (
                <Stat label="Weight Class" value={fighter.weightClass} />
              )}
              {fighter.status && (
                <Stat
                  label="Status"
                  value={fighter.status.charAt(0).toUpperCase() + fighter.status.slice(1)}
                />
              )}
              {fighter.region && <Stat label="Region" value={fighter.region} />}
              {fighter.stance && (
                <Stat
                  label="Stance"
                  value={fighter.stance.charAt(0).toUpperCase() + fighter.stance.slice(1)}
                />
              )}
              {fighter.height && (
                <Stat label="Height" value={fighter.height.imperial} />
              )}
              {fighter.reach && (
                <Stat label="Reach" value={fighter.reach.imperial} />
              )}
              {fighter.residence && (
                <Stat
                  label="Residence"
                  value={`${fighter.residence.city}, ${fighter.residence.state}`}
                />
              )}
              {fighter.gym && <Stat label="Gym" value={fighter.gym} />}
              {fighter.trainer && (
                <Stat label="Trainer" value={fighter.trainer} />
              )}
              {fighter.promoter && (
                <Stat label="Promoter" value={fighter.promoter} />
              )}
            </div>
          </div>
        </div>

        {/* Titles */}
        {fighter.titles && fighter.titles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">
              Titles
            </h2>
            <div className="flex flex-wrap gap-3">
              {fighter.titles.map((title, i) => (
                <div
                  key={i}
                  className={`border rounded-lg px-4 py-3 ${
                    title.current
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-white/10 bg-white/2"
                  }`}
                >
                  <p className="text-white text-sm font-semibold">
                    {title.org}
                  </p>
                  <p className="text-white/50 text-xs font-medium leading-5 mt-1">{title.title}</p>
                  {title.current && (
                    <p className="text-amber-500 text-[10px] font-semibold tracking-wider mt-1 uppercase">
                      Current
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bio */}
        {fighter.bio && (
          <section className="mb-12">
            <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">
              Bio
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
              {fighter.bio}
            </p>
          </section>
        )}

        {/* Social Links */}
        {fighter.social && Object.values(fighter.social).some(Boolean) && (
          <section className="mb-12">
            <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">
              Social
            </h2>
            <div className="flex flex-wrap gap-3">
              {fighter.social.instagram && (
                <SocialLink
                  href={`https://instagram.com/${fighter.social.instagram.replace("@", "")}`}
                  label="Instagram"
                />
              )}
              {fighter.social.twitter && (
                <SocialLink
                  href={`https://x.com/${fighter.social.twitter.replace("@", "")}`}
                  label="X"
                />
              )}
              {fighter.social.tiktok && (
                <SocialLink
                  href={`https://tiktok.com/@${fighter.social.tiktok.replace("@", "")}`}
                  label="TikTok"
                />
              )}
              {fighter.social.youtube && (
                <SocialLink href={fighter.social.youtube} label="YouTube" />
              )}
              {fighter.social.website && (
                <SocialLink href={fighter.social.website} label="Website" />
              )}
            </div>
          </section>
        )}

        {/* Advanced Stats */}
        {fights.length > 0 && <AdvancedStats fights={fights} />}

        {/* Fight History */}
        {fights.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">
              Fight History
            </h2>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              {fights.map((fight, i) => (
                <div
                  key={fight.id || i}
                  className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-white/2" : ""}`}
                >
                  <span
                    className={`shrink-0 w-7 h-7 flex items-center justify-center rounded text-[11px] font-bold ${
                      fight.result === "W"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : fight.result === "L"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-white/10 text-white/50"
                    }`}
                  >
                    {fight.result}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold truncate">
                      {fight.opponent}
                    </p>
                    <p className="text-white/40 text-[11px] font-medium">
                      {fight.method}{fight.round ? ` R${fight.round}` : ""} &middot; {fight.weightClass}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white/50 text-xs font-medium tabular-nums">
                      {fight.date}
                    </p>
                    {fight.titleFight && (
                      <p className="text-amber-500 text-[10px] font-semibold uppercase">Title</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Compare CTA */}
        <section className="mb-12">
          <Link
            href={`/compare`}
            className="block w-full text-center border border-white/10 rounded-lg py-4 text-white/50 text-xs font-semibold uppercase tracking-wider hover:text-white hover:border-white/20 transition-colors"
          >
            Compare {fighter.firstName} with Another Fighter
          </Link>
        </section>
      </div>
    </main>
  )
}

function AdvancedStats({ fights }: { fights: FightRecord[] }) {
  const methods: Record<string, number> = {}
  let winStreak = 0
  let currentStreak = 0
  let titleFights = 0

  for (const f of fights) {
    if (f.method) methods[f.method] = (methods[f.method] || 0) + 1
    if (f.titleFight) titleFights++
  }

  // Calculate current win streak (fights already sorted desc by date)
  for (const f of fights) {
    if (f.result === "W") {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate max win streak
  let tempStreak = 0
  for (const f of [...fights].reverse()) {
    if (f.result === "W") {
      tempStreak++
      if (tempStreak > winStreak) winStreak = tempStreak
    } else {
      tempStreak = 0
    }
  }

  const sorted = Object.entries(methods).sort((a, b) => b[1] - a[1])
  const maxMethod = sorted.length > 0 ? sorted[0][1] : 1

  return (
    <section className="mb-12">
      <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wider">
        Advanced Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="border border-white/10 rounded-lg p-4 bg-white/2">
          <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1">Win Streak</p>
          <p className="text-white text-xl font-bold tabular-nums">{currentStreak}</p>
          <p className="text-white/30 text-[10px]">current</p>
        </div>
        <div className="border border-white/10 rounded-lg p-4 bg-white/2">
          <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1">Best Streak</p>
          <p className="text-white text-xl font-bold tabular-nums">{winStreak}</p>
          <p className="text-white/30 text-[10px]">career</p>
        </div>
        <div className="border border-white/10 rounded-lg p-4 bg-white/2">
          <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1">Title Fights</p>
          <p className="text-white text-xl font-bold tabular-nums">{titleFights}</p>
        </div>
        <div className="border border-white/10 rounded-lg p-4 bg-white/2">
          <p className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-1">Total Bouts</p>
          <p className="text-white text-xl font-bold tabular-nums">{fights.length}</p>
        </div>
      </div>

      {/* Method Breakdown */}
      {sorted.length > 0 && (
        <div>
          <h3 className="text-white/40 text-[10px] font-semibold tracking-wider uppercase mb-3">
            Victory Method Breakdown
          </h3>
          <div className="space-y-2">
            {sorted.map(([method, count]) => (
              <div key={method} className="flex items-center gap-3">
                <span className="text-white/60 text-xs font-semibold w-10 shrink-0">{method}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/50 rounded-full"
                    style={{ width: `${(count / maxMethod) * 100}%` }}
                  />
                </div>
                <span className="text-white/40 text-xs font-bold tabular-nums w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/45 text-[10px] font-semibold tracking-wider uppercase leading-4 mb-1">
        {label}
      </p>
      <p className="text-white/80 text-sm font-semibold leading-6">{value}</p>
    </div>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-white/10 rounded-lg px-4 py-2 text-white/50 text-xs font-medium hover:text-white hover:border-white/20 transition-colors"
    >
      {label}
    </a>
  )
}
