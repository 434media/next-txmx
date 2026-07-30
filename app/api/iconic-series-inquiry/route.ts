import { NextResponse } from "next/server"
import { firestore } from "../../../lib/firebase-admin"
import { checkBotId } from "botid/server"

/**
 * Iconic Series partnership/inquiry capture → `txmx` Firestore
 * (`iconicSeriesInquiries`, one doc per submission).
 */

/**
 * DISABLED 2026-07-30. The only form capturing data on the public site is the
 * newsletter (/api/newsletter). The Iconic Series inquiry form is retired.
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
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { firstName, lastName, email, phone, company, message, inquiryType } =
      await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    await firestore.collection("iconicSeriesInquiries").add({
      firstName: firstName || "",
      lastName: lastName || "",
      email: email.trim().toLowerCase(),
      phone: phone || "",
      company: company || "",
      message: message || "",
      inquiryType: inquiryType || "Other",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ message: "Inquiry submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[Iconic Series Inquiry] Error submitting inquiry:", error)
    return NextResponse.json({ error: "An error occurred while submitting your inquiry" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
