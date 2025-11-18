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
    const { firstName, lastName, email, phone, attending } = await request.json()
    const turnstileToken = request.headers.get("cf-turnstile-response")
    const remoteIp = request.headers.get("CF-Connecting-IP")

    console.log('[Rise of a Champion RSVP] Received submission:', { firstName, lastName, email, attending, isDevelopment })

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
        console.log('[Rise of a Champion RSVP] Verifying Turnstile token...')
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
      console.log('[Rise of a Champion RSVP] Development mode - skipping Turnstile verification')
    }

    // Create record in Airtable
    console.log('[Rise of a Champion RSVP] Creating Airtable record...')
    
    await base("RSVP").create([
      {
        fields: {
          "First Name": firstName,
          "Last Name": lastName,
          Email: email,
          Phone: phone,
          Attending: attending,
        },
      },
    ])

    console.log('[Rise of a Champion RSVP] Successfully created Airtable record')

    return NextResponse.json(
      {
        message: "RSVP submitted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Rise of a Champion RSVP] Error submitting RSVP:', error)
    return NextResponse.json({ error: "An error occurred while submitting your RSVP" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
