'use server'

import { firestore } from '@/lib/firebase-admin'

/* ─── types ─── */
export interface FeatureFlag {
  enabled: boolean
  rolloutPercent: number   // 0-100, 100 = everyone
  blackCardOnly: boolean
  description: string
}

export type FeatureFlagMap = Record<string, FeatureFlag>

/* ─── Firestore path ─── */
const FLAGS_DOC = 'system/featureFlags'

/* ─── defaults shipped with app ─── */
const DEFAULT_FLAGS: FeatureFlagMap = {
  quests:        { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'Quest engine & badge rewards' },
  fanCard:       { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'Fan Card profile page' },
  rewardsStore:  { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'Rewards store & redemption' },
  locker:        { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'User locker (avatars, badges, titles)' },
  seasons:       { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'Seasonal leaderboard resets' },
  community:     { enabled: false, rolloutPercent: 100, blackCardOnly: false, description: 'Community feed (MVP)' },
}

/* ─── read ─── */
export async function getFeatureFlags(): Promise<FeatureFlagMap> {
  const snap = await firestore.doc(FLAGS_DOC).get()
  if (!snap.exists) return { ...DEFAULT_FLAGS }
  const data = snap.data() as Record<string, unknown>
  // merge defaults for any flags not yet in Firestore
  const merged = { ...DEFAULT_FLAGS }
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      merged[key] = val as FeatureFlag
    }
  }
  return merged
}

/* ─── write single flag ─── */
export async function setFeatureFlag(name: string, flag: FeatureFlag): Promise<void> {
  if (!name || typeof name !== 'string') throw new Error('Invalid flag name')
  if (flag.rolloutPercent < 0 || flag.rolloutPercent > 100) throw new Error('rolloutPercent must be 0-100')
  await firestore.doc(FLAGS_DOC).set({ [name]: flag }, { merge: true })
}

/* ─── delete a flag (remove from doc) ─── */
export async function deleteFeatureFlag(name: string): Promise<void> {
  if (!name) throw new Error('Invalid flag name')
  const { FieldValue } = await import('firebase-admin/firestore')
  await firestore.doc(FLAGS_DOC).update({ [name]: FieldValue.delete() })
}

/* ─── check (server-side) ─── */
export async function isFeatureEnabled(
  flagName: string,
  opts?: { userId?: string; isBlackCard?: boolean }
): Promise<boolean> {
  const flags = await getFeatureFlags()
  const flag = flags[flagName]
  if (!flag || !flag.enabled) return false
  if (flag.blackCardOnly && !opts?.isBlackCard) return false
  if (flag.rolloutPercent < 100) {
    // deterministic hash on userId so same user always gets same result
    const uid = opts?.userId ?? ''
    const hash = simpleHash(uid + flagName)
    if ((hash % 100) >= flag.rolloutPercent) return false
  }
  return true
}

/* ─── deterministic hash for rollout bucketing ─── */
function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
