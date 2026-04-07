"use server"

import { firestore } from "../../lib/firebase-admin"

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

export async function getOrCreateUser(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null
): Promise<UserRecord> {
  const ref = firestore.collection("users").doc(uid)
  const snap = await ref.get()

  if (snap.exists) {
    return snap.data() as UserRecord
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

export async function getUserByUid(
  uid: string
): Promise<UserRecord | null> {
  const snap = await firestore.collection("users").doc(uid).get()
  if (!snap.exists) return null
  return snap.data() as UserRecord
}

export async function getUserByStripeCustomerId(
  customerId: string
): Promise<UserRecord | null> {
  const snap = await firestore
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get()

  if (snap.empty) return null
  return snap.docs[0].data() as UserRecord
}

export async function updateUserSubscription(
  uid: string,
  data: {
    subscriptionStatus: UserRecord["subscriptionStatus"]
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
) {
  const ref = firestore.collection("users").doc(uid)
  await ref.update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateUserPoints(
  uid: string,
  field: "skillPoints" | "txCredits" | "loyaltyPoints",
  delta: number
) {
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
  const snap = await firestore
    .collection("users")
    .where("legacyRank", "!=", null)
    .get()
  return snap.docs.map(d => d.data() as UserRecord)
}

export async function searchUsers(query: string, limit = 20): Promise<UserRecord[]> {
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
