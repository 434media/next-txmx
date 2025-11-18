import { NextResponse } from "next/server"
import Airtable from "airtable"
import axios from "axios"
import crypto from "crypto"

const isDevelopment = process.env.NODE_ENV === "development"

const airtableBaseId = process.env.AIRTABLE_ICONIC_SERIES_BASE_ID
const airtableApiKey = process.env.AIRTABLE_API_KEY
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY

let base: any = null

if (airtableBaseId && airtableApiKey) {
  base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, company, message, inquiryType } = await request.json()
    const turnstileToken = request.headers.get("cf-turnstile-response")
    const remoteIp = request.headers.get("CF-Connecting-IP")

    console.log('[Iconic Series Inquiry] Received submission:', { firstName, lastName, email, inquiryType, isDevelopment })

    if (!base) {
      console.error("Airtable configuration is missing")
      return NextResponse.json({ error: "Server configuration error. Please check Airtable settings." }, { status: 500 })
    }

    if (!isDevelopment) {
      if (!turnstileSecretKey) {
        console.error("Turnstile secret key is not defined")
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
      }

      // Verify Turnstile token
      if (turnstileToken) {
        console.log('[Iconic Series Inquiry] Verifying Turnstile token...')
        const idempotencyKey = crypto.randomUUID()
        const turnstileVerification = await axios.post(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          new URLSearchParams({
            secret: turnstileSecretKey,
            response: turnstileToken,
            remoteip: remoteIp || "",
            idempotency_key: idempotencyKey,
          }),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
        )

        if (!turnstileVerification.data.success) {
          const errorCodes = turnstileVerification.data["error-codes"] || []
          console.error("Turnstile verification failed:", errorCodes)
          return NextResponse.json({ error: "Turnstile verification failed", errorCodes }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: "Turnstile token is missing" }, { status: 400 })
      }
    } else {
      console.log('[Iconic Series Inquiry] Development mode - skipping Turnstile verification')
    }

    // Create record in Airtable
    console.log('[Iconic Series Inquiry] Creating Airtable record...')
    
    await base("Inquiries").create([
      {
        fields: {
          "First Name": firstName,
          "Last Name": lastName,
          Email: email,
          Phone: phone,
          Company: company || "",
          Message: message,
          "Inquiry Type": inquiryType || "Other",
        },
      },
    ])

    console.log('[Iconic Series Inquiry] Successfully created Airtable record')

    return NextResponse.json(
      {
        message: "Inquiry submitted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Iconic Series Inquiry] Error submitting inquiry:', error)
    return NextResponse.json({ error: "An error occurred while submitting your inquiry" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
