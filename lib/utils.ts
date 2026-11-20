import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Clamp a caller-supplied `limit` (server actions are public endpoints, so the
 * argument is untrusted) to 1..max, falling back to `fallback` when it is not
 * a usable number.
 */
export function clampLimit(limit: unknown, fallback: number, max = 100): number {
  const n = Math.floor(Number(limit))
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(n, max)
}
