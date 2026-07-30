import { NextResponse } from "next/server"
import { firestore } from "../../../lib/firebase-admin"

/**
 * Rise of a Champion RSVP capture → `txmx` Firestore (`iconicSeriesRsvps`,
 * deduped by normalized email — shared with the gallery-access flow).
 */

/**
 * DISABLED 2026-07-30. The only form capturing data on the public site is the
 * newsletter (/api/newsletter). The Rise of a Champion RSVP form is retired.
 * The handler below is left intact so this can be switched back on by deleting
 * this guard.
 */
const ENDPOINT_DISABLED = true

function disabledResponse() {
  return NextResponse.json(
    { error: "This form is no longer accepting submissions" },
    { status: 410 },
  )
}

export async function POST(request: Request) {
  if (ENDPOINT_DISABLED) return disabledResponse()

  try {
    const { firstName, lastName, email, phone, invitedBy } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const ref = firestore.collection("iconicSeriesRsvps").doc(normalized)
    const now = new Date().toISOString()
    const snap = await ref.get()

    await ref.set(
      {
        firstName: firstName || "",
        lastName: lastName || "",
        email: normalized,
        phone: phone || "",
        invitedBy: invitedBy || "",
        attending: "Yes",
        updatedAt: now,
        ...(snap.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    )

    return NextResponse.json({ message: "RSVP submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[Rise of a Champion RSVP] Error submitting RSVP:", error)
    return NextResponse.json({ error: "An error occurred while submitting your RSVP" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
