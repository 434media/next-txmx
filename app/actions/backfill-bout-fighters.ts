"use server"

import { firestore } from "../../lib/firebase-admin"
import { getFighters } from "./fighters"
import type { Fighter } from "../../lib/types/fighter"

function displayName(f: Fighter): string {
  return [f.firstName, f.lastName].filter(Boolean).join(" ").trim()
}

function recordString(f: Fighter): string {
  const r = f.record
  return r ? `${r.wins ?? 0}-${r.losses ?? 0}-${r.draws ?? 0}` : ""
}

/** Case/accent/punctuation-insensitive key for fuzzy name matching. Strips
 *  combining marks (after NFKD) BEFORE collapsing punctuation, so "Ramírez"
 *  normalizes to "ramirez" rather than splitting into "rami rez". */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export interface BackfillBoutFightersReport {
  dryRun: boolean
  fightNights: number
  boutsScanned: number
  boutsUpdated: number
  cornersMatched: number
  cornersUnmatched: number
  /** Distinct bout fighter names with no matching fighter record. */
  unmatched: string[]
}

/**
 * One-time / maintenance backfill: link existing fight-night bouts to fighter
 * records by name, snapshotting the fighter's id/slug/nickname/photo/record/KOs
 * onto the bout — the same fields the admin FighterPicker writes for new bouts,
 * so cards created before the fighter-link feature light up without manual
 * re-saves.
 *
 * - Matches `fighterNName` against each fighter's "First Last", normalized
 *   (case/accents/punctuation-insensitive).
 * - Skips corners already linked (has `fighterNId`) unless `force` is set.
 * - Also fills an empty gym / weight class from the matched fighter.
 * - `dryRun` reports what WOULD change without writing anything.
 */
export async function backfillBoutFighters(opts?: {
  dryRun?: boolean
  force?: boolean
}): Promise<BackfillBoutFightersReport> {
  const dryRun = !!opts?.dryRun
  const force = !!opts?.force

  const fighters = await getFighters()
  const byName = new Map<string, Fighter>()
  for (const f of fighters) {
    const key = norm(displayName(f))
    if (key) byName.set(key, f)
  }

  const report: BackfillBoutFightersReport = {
    dryRun,
    fightNights: 0,
    boutsScanned: 0,
    boutsUpdated: 0,
    cornersMatched: 0,
    cornersUnmatched: 0,
    unmatched: [],
  }
  const unmatchedSet = new Set<string>()

  const fnSnap = await firestore.collection("fightNights").get()
  for (const fnDoc of fnSnap.docs) {
    report.fightNights++
    const boutsSnap = await fnDoc.ref.collection("bouts").get()
    for (const boutDoc of boutsSnap.docs) {
      report.boutsScanned++
      const data = boutDoc.data() || {}
      const updates: Record<string, unknown> = {}

      for (const corner of ["fighter1", "fighter2"] as const) {
        const name = String(data[`${corner}Name`] || "").trim()
        if (!name) continue
        const alreadyLinked = !!data[`${corner}Id`]
        if (alreadyLinked && !force) continue

        const f = byName.get(norm(name))
        if (!f) {
          report.cornersUnmatched++
          unmatchedSet.add(name)
          continue
        }

        report.cornersMatched++
        updates[`${corner}Id`] = f.id || ""
        updates[`${corner}Slug`] = f.slug || ""
        updates[`${corner}Nickname`] = f.nickname || ""
        updates[`${corner}PhotoUrl`] = f.profileImageUrl || ""
        updates[`${corner}Record`] = recordString(f)
        updates[`${corner}Kos`] = f.record?.knockouts || 0
        if (!data[`${corner}Gym`] && f.gym) updates[`${corner}Gym`] = f.gym
        if (!data.weightClass && f.weightClass) updates.weightClass = f.weightClass
      }

      if (Object.keys(updates).length > 0) {
        report.boutsUpdated++
        if (!dryRun) {
          updates.updatedAt = new Date().toISOString()
          await boutDoc.ref.update(updates)
        }
      }
    }
  }

  report.unmatched = Array.from(unmatchedSet).sort()
  return report
}
