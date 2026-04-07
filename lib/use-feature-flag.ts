'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFeatureFlags, type FeatureFlagMap } from '@/app/actions/feature-flags'

/* ─── singleton cache shared by all hook instances ─── */
let cachedFlags: FeatureFlagMap | null = null
let fetchPromise: Promise<FeatureFlagMap> | null = null

function loadFlags(): Promise<FeatureFlagMap> {
  if (cachedFlags) return Promise.resolve(cachedFlags)
  if (!fetchPromise) {
    fetchPromise = getFeatureFlags().then(flags => {
      cachedFlags = flags
      fetchPromise = null
      return flags
    })
  }
  return fetchPromise
}

/** Bust the cache so next render re-fetches */
export function invalidateFeatureFlags() {
  cachedFlags = null
  fetchPromise = null
}

/* ─── hook: useFeatureFlag('quests') → boolean ─── */
export function useFeatureFlag(
  flagName: string,
  opts?: { isBlackCard?: boolean; userId?: string }
): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadFlags().then(flags => {
      if (cancelled) return
      const flag = flags[flagName]
      if (!flag || !flag.enabled) { setEnabled(false); return }
      if (flag.blackCardOnly && !opts?.isBlackCard) { setEnabled(false); return }
      if (flag.rolloutPercent < 100) {
        const uid = opts?.userId ?? ''
        const hash = simpleHash(uid + flagName)
        if ((hash % 100) >= flag.rolloutPercent) { setEnabled(false); return }
      }
      setEnabled(true)
    })
    return () => { cancelled = true }
  }, [flagName, opts?.isBlackCard, opts?.userId])

  return enabled
}

/* ─── hook: useFeatureFlags() → full map ─── */
export function useFeatureFlags(): FeatureFlagMap | null {
  const [flags, setFlags] = useState<FeatureFlagMap | null>(cachedFlags)

  const refresh = useCallback(() => {
    invalidateFeatureFlags()
    loadFlags().then(setFlags)
  }, [])

  useEffect(() => {
    loadFlags().then(setFlags)
  }, [])

  return flags
}

export { type FeatureFlagMap }

/* ─── deterministic hash (mirrors server) ─── */
function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
