import { NextResponse } from "next/server"
import { firestore } from "../../../lib/firebase-admin"
import { checkBotId } from "botid/server"

/**
 * Newsletter signup capture. System of record is the `txmx` Firestore DB
 * (`newsletterSignups`, deduped by normalized email).
 */
export async function POST(request: Request) {
  try {
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { email } = await request.json()
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const ref = firestore.collection("newsletterSignups").doc(normalized)
    const now = new Date().toISOString()
    const snap = await ref.get()

    if (snap.exists) {
      // Already subscribed — refresh the timestamp without clobbering createdAt.
      await ref.set({ email: normalized, source: "txmx", updatedAt: now }, { merge: true })
    } else {
      await ref.set({ email: normalized, source: "txmx", createdAt: now, updatedAt: now })
    }

    return NextResponse.json({ message: "Newsletter subscription successful" }, { status: 200 })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json(
      { error: "An error occurred while subscribing to the newsletter" },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
