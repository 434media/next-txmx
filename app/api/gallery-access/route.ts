import { NextResponse } from "next/server"
import { firestore } from "../../../lib/firebase-admin"

/**
 * Gallery unlock capture → `txmx` Firestore. Shares the `iconicSeriesRsvps`
 * collection (keyed by normalized email) with the RSVP flow: an existing RSVP
 * just gets its 8 Count subscription flag set; otherwise a new record is made.
 */
export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, subscribeToNewsletter } = await request.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const ref = firestore.collection("iconicSeriesRsvps").doc(normalized)
    const now = new Date().toISOString()
    const snap = await ref.get()
    const isExistingUser = snap.exists

    if (isExistingUser) {
      if (subscribeToNewsletter) {
        await ref.set({ subscribeTo8Count: "Yes", updatedAt: now }, { merge: true })
      }
    } else {
      await ref.set({
        firstName,
        lastName,
        email: normalized,
        subscribeTo8Count: subscribeToNewsletter ? "Yes" : "No",
        createdAt: now,
        updatedAt: now,
      })
    }

    return NextResponse.json(
      { message: "Access granted successfully", isExistingUser },
      { status: 200 },
    )
  } catch (error) {
    console.error("[Gallery Access] Error submitting form:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
