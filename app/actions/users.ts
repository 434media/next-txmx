"use server"

import { firestore } from "../../lib/firebase-admin"
import { verifyFanIdToken } from "../../lib/fan-auth"
import { requireAdmin } from "../../lib/admin-auth"

export interface UserRecord {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  subscriptionStatus: "none" | "active" | "canceled" | "past_due"
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  gymPledge: string | null
  gymPledgeLockedUntil: string | null
  skillPoints: number
  txCredits: number
  loyaltyPoints: number
  rank: "rookie" | "contender" | "champion" | "hall_of_fame"
  /** Permanent rank floor — prevents rank from ever dropping below this */
  legacyRank: "rookie" | "contender" | "champion" | "hall_of_fame" | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

const RANK_ORDER: Record<string, number> = {
  rookie: 0,
  contender: 1,
  champion: 2,
  hall_of_fame: 3,
}

function computeRank(
  sp: number,
  legacyRank?: string | null
): "rookie" | "contender" | "champion" | "hall_of_fame" {
  let spRank: "rookie" | "contender" | "champion" | "hall_of_fame"
  if (sp >= 100_000) spRank = "hall_of_fame"
  else if (sp >= 25_000) spRank = "champion"
  else if (sp >= 5_000) spRank = "contender"
  else spRank = "rookie"

  // Legacy rank acts as a floor — take whichever is higher
  if (legacyRank && RANK_ORDER[legacyRank] > RANK_ORDER[spRank]) {
    return legacyRank as "rookie" | "contender" | "champion" | "hall_of_fame"
  }
  return spRank
}

/**
 * Create or backfill the caller's own `users/{uid}` record.
 *
 * Identity (uid, email, photo) comes only from the verified ID token — a
 * server action's arguments can be forged, so a client-sent uid would let
 * anyone create or read any user's record. The one caller-supplied value is
 * `displayName`, the name the fan typed at sign-up, applied only to their own
 * record and only where it is still empty.
 */
export async function getOrCreateUser(
  idToken: string,
  displayNameHint: string | null = null
): Promise<UserRecord> {
  const decoded = await verifyFanIdToken(idToken)
  if (!decoded) throw new Error("Not signed in")
  const uid = decoded.uid
  const email = decoded.email || null
  const photoURL = decoded.picture || null
  // Walk-in guests sign in with a custom token whose claims carry
  // `displayName`; provider sign-ins carry `name`.
  const claimName = typeof decoded.displayName === "string" ? decoded.displayName : null
  const hint = typeof displayNameHint === "string" ? displayNameHint.trim().slice(0, 80) : ""
  const displayName = hint || decoded.name || claimName || null

  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()

  if (snap.exists) {
    // Backfill any profile fields still null when this caller now knows them.
    // Race we have to handle: the walk-in flow signs the user in with a custom
    // token, which immediately triggers onAuthStateChanged → /api/auth/profile,
    // and that path verifies a token with no Firebase Auth profile yet so
    // displayName/email/photoURL come through null. The walk-in form then
    // calls this with the real name — without backfill, the null wins and the
    // leaderboard shows "Anonymous" forever.
    const current = snap.data() as UserRecord
    const updates: Partial<UserRecord> = {}
    if (!current.displayName && displayName) updates.displayName = displayName
    if (!current.email && email) updates.email = email
    if (!current.photoURL && photoURL) updates.photoURL = photoURL
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString()
      await ref.update(updates)
      return { ...current, ...updates }
    }
    return current
  }

  const now = new Date().toISOString()
  const user: UserRecord = {
    uid,
    email,
    displayName,
    photoURL,
    subscriptionStatus: "none",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    gymPledge: null,
    gymPledgeLockedUntil: null,
    skillPoints: 0,
    txCredits: 0,
    loyaltyPoints: 0,
    rank: "rookie",
    legacyRank: null,
    isVerified: false,
    createdAt: now,
    updatedAt: now,
  }

  await ref.set(user)
  return user
}

export async function updateUserPoints(
  uid: string,
  field: "skillPoints" | "txCredits" | "loyaltyPoints",
  delta: number
) {
  await requireAdmin()
  const ref = firestore.collection("users").doc(uid)

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error("User not found")

    const data = snap.data() as UserRecord
    const newValue = (data[field] || 0) + delta
    if (newValue < 0 && field === "txCredits") {
      throw new Error("Insufficient TX-Credits")
    }

    const updates: Record<string, unknown> = {
      [field]: Math.max(0, newValue),
      updatedAt: new Date().toISOString(),
    }

    // Recompute rank if SP changed
    if (field === "skillPoints") {
      updates.rank = computeRank(newValue, data.legacyRank)
    }

    tx.update(ref, updates)
  })
}

export async function setGymPledge(uid: string, gymId: string) {
  await requireAdmin()
  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()

  if (!snap.exists) throw new Error("User not found")

  const data = snap.data() as UserRecord

  // Check if pledge is locked
  if (data.gymPledgeLockedUntil) {
    const lockDate = new Date(data.gymPledgeLockedUntil)
    if (lockDate > new Date()) {
      throw new Error("Gym pledge is locked for the current season")
    }
  }

  // Lock for 16 weeks
  const lockedUntil = new Date()
  lockedUntil.setDate(lockedUntil.getDate() + 16 * 7)

  await ref.update({
    gymPledge: gymId,
    gymPledgeLockedUntil: lockedUntil.toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// ── Verified Accounts ────────────────────────────────────

export async function setUserVerified(uid: string, verified: boolean): Promise<void> {
  await requireAdmin()
  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()
  if (!snap.exists) throw new Error("User not found")
  await ref.update({ isVerified: verified, updatedAt: new Date().toISOString() })
}

// ── Legacy Rank ──────────────────────────────────────────

export async function setUserLegacyRank(
  uid: string,
  legacyRank: "rookie" | "contender" | "champion" | "hall_of_fame" | null
): Promise<void> {
  await requireAdmin()
  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()
  if (!snap.exists) throw new Error("User not found")
  const data = snap.data() as UserRecord
  const newRank = computeRank(data.skillPoints, legacyRank)
  await ref.update({
    legacyRank,
    rank: newRank,
    updatedAt: new Date().toISOString(),
  })
}

export async function getLegacyUsers(): Promise<UserRecord[]> {
  await requireAdmin()
  const snap = await firestore
    .collection("users")
    .where("legacyRank", "!=", null)
    .get()
  return snap.docs.map(d => d.data() as UserRecord)
}

export async function searchUsers(query: string, limit = 20): Promise<UserRecord[]> {
  await requireAdmin()
  // Firestore doesn't support full-text search, so fetch recent users and filter client-side
  const snap = await firestore
    .collection("users")
    .orderBy("updatedAt", "desc")
    .limit(200)
    .get()

  const q = query.toLowerCase()
  return snap.docs
    .map(d => d.data() as UserRecord)
    .filter(u =>
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    )
    .slice(0, limit)
}

export async function getVerifiedUsers(): Promise<UserRecord[]> {
  await requireAdmin()
  const snap = await firestore
    .collection("users")
    .where("isVerified", "==", true)
    .get()

  return snap.docs.map(d => d.data() as UserRecord)
}

export interface LeaderboardEntry {
  uid: string
  displayName: string | null
  photoURL: string | null
  skillPoints: number
  rank: UserRecord["rank"]
  gymPledge: string | null
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  await requireAdmin()
  const snapshot = await firestore
    .collection("users")
    .orderBy("skillPoints", "desc")
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data() as UserRecord
    return {
      uid: doc.id,
      displayName: data.displayName,
      photoURL: data.photoURL,
      skillPoints: data.skillPoints,
      rank: data.rank,
      gymPledge: data.gymPledge,
    }
  })
}

// ── Profile Photo ────────────────────────────────────────

export async function updateUserPhoto(uid: string, photoURL: string | null): Promise<void> {
  await requireAdmin()
  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()
  if (!snap.exists) throw new Error("User not found")
  await ref.update({ photoURL, updatedAt: new Date().toISOString() })
}
