"use server"

import { firestore } from "../../lib/firebase-admin"

export type PropStatus = "open" | "locked" | "settled" | "voided"
export type PropType = "match_winner" | "method" | "round" | "over_under"

export interface Prop {
  id: string
  eventId: string
  eventDate: string
  title: string
  description: string
  type: PropType
  options: PropOption[]
  status: PropStatus
  correctOptionId: string | null
  spReward: number
  tcReward: number
  isUnderdog: boolean
  createdAt: string
  updatedAt: string
  settledAt: string | null
}

export interface PropOption {
  id: string
  label: string
  description?: string
}

export interface PropPick {
  id: string
  propId: string
  userId: string
  optionId: string
  createdAt: string
  settled: boolean
  won: boolean | null
}

export async function getProps(status?: PropStatus): Promise<Prop[]> {
  let query = firestore.collection("props").orderBy("createdAt", "desc") as FirebaseFirestore.Query

  if (status) {
    query = query.where("status", "==", status)
  }

  const snapshot = await query.limit(100).get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prop[]
}

export async function getOpenProps(): Promise<Prop[]> {
  return getProps("open")
}

export async function getPropsByEvent(eventId: string): Promise<Prop[]> {
  const snapshot = await firestore
    .collection("props")
    .where("eventId", "==", eventId)
    .orderBy("createdAt", "asc")
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Prop[]
}

export async function createProp(
  data: Omit<Prop, "id" | "createdAt" | "updatedAt" | "settledAt" | "correctOptionId" | "status">
): Promise<{ success: boolean; id: string }> {
  const now = new Date().toISOString()
  const docRef = await firestore.collection("props").add({
    ...data,
    status: "open" as PropStatus,
    correctOptionId: null,
    settledAt: null,
    createdAt: now,
    updatedAt: now,
  })
  return { success: true, id: docRef.id }
}

export async function updatePropStatus(
  propId: string,
  status: PropStatus,
  correctOptionId?: string
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  }

  if (status === "settled" && correctOptionId) {
    updates.correctOptionId = correctOptionId
    updates.settledAt = new Date().toISOString()
  }

  await firestore.collection("props").doc(propId).update(updates)
  return { success: true }
}

export async function placePick(
  propId: string,
  userId: string,
  optionId: string
): Promise<{ success: boolean }> {
  const propRef = firestore.collection("props").doc(propId)
  const propSnap = await propRef.get()

  if (!propSnap.exists) throw new Error("Prop not found")

  const prop = propSnap.data() as Omit<Prop, "id">
  if (prop.status !== "open") throw new Error("This prop is no longer accepting picks")

  // Check option exists
  const validOption = prop.options.some((o) => o.id === optionId)
  if (!validOption) throw new Error("Invalid option")

  // Check for existing pick (one pick per user per prop)
  const existingSnap = await firestore
    .collection("picks")
    .where("propId", "==", propId)
    .where("userId", "==", userId)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    throw new Error("You already placed a pick on this prop")
  }

  const now = new Date().toISOString()
  await firestore.collection("picks").add({
    propId,
    userId,
    optionId,
    createdAt: now,
    settled: false,
    won: null,
  })

  return { success: true }
}

export async function getUserPicks(
  userId: string,
  limit = 50
): Promise<PropPick[]> {
  const snapshot = await firestore
    .collection("picks")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PropPick[]
}

export async function getUserPicksForProp(
  userId: string,
  propId: string
): Promise<PropPick | null> {
  const snapshot = await firestore
    .collection("picks")
    .where("userId", "==", userId)
    .where("propId", "==", propId)
    .limit(1)
    .get()

  if (snapshot.empty) return null
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PropPick
}

export async function settleProp(propId: string, correctOptionId: string) {
  const propRef = firestore.collection("props").doc(propId)
  const propSnap = await propRef.get()

  if (!propSnap.exists) throw new Error("Prop not found")

  const prop = { id: propSnap.id, ...propSnap.data() } as Prop
  if (prop.status === "settled") throw new Error("Prop already settled")

  // Mark the prop as settled
  await updatePropStatus(propId, "settled", correctOptionId)

  // Get all picks for this prop
  const picksSnap = await firestore
    .collection("picks")
    .where("propId", "==", propId)
    .get()

  const batch = firestore.batch()
  for (const pickDoc of picksSnap.docs) {
    const pick = pickDoc.data() as Omit<PropPick, "id">
    const won = pick.optionId === correctOptionId
    batch.update(pickDoc.ref, { settled: true, won })
  }
  await batch.commit()

  return {
    success: true,
    totalPicks: picksSnap.size,
    winners: picksSnap.docs.filter(
      (d) => (d.data() as Omit<PropPick, "id">).optionId === correctOptionId
    ).length,
  }
}
