import { NextResponse } from "next/server"
import { firestore } from "../../../lib/firebase-admin"
import { checkBotId } from "botid/server"

/**
 * Iconic Series partnership/inquiry capture → `txmx` Firestore
 * (`iconicSeriesInquiries`, one doc per submission).
 */
export async function POST(request: Request) {
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
