import { NextResponse } from "next/server"
import Airtable from "airtable"

const airtableBaseId = process.env.AIRTABLE_ICONIC_SERIES_BASE_ID
const airtableApiKey = process.env.AIRTABLE_API_KEY

let base: any = null

if (airtableBaseId && airtableApiKey) {
  base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, subscribeToNewsletter } = await request.json()

    console.log("[Gallery Access] Received submission:", { firstName, lastName, email, subscribeToNewsletter })

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    if (!base) {
      console.error("Airtable configuration is missing")
      return NextResponse.json(
        { error: "Server configuration error. Please check Airtable settings." },
        { status: 500 },
      )
    }

    console.log("[Gallery Access] Checking for existing RSVP record...")

    // Properly escape email for Airtable formula: escape backslashes first, then single quotes
    const escapedEmail = email.replace(/\\/g, "\\\\").replace(/'/g, "\\'")

    const existingRecords = await base("RSVP")
      .select({
        filterByFormula: `{Email} = '${escapedEmail}'`,
        maxRecords: 1,
      })
      .firstPage()

    if (existingRecords && existingRecords.length > 0) {
      console.log("[Gallery Access] Found existing RSVP record:", existingRecords[0].id)

      if (subscribeToNewsletter) {
        await base("RSVP").update([
          {
            id: existingRecords[0].id,
            fields: {
              "Subscribe to 8 Count": "Yes",
            },
          },
        ])
        console.log("[Gallery Access] Updated existing RSVP record with 8 Count subscription")
      }
    } else {
      console.log("[Gallery Access] Creating new RSVP record...")

      await base("RSVP").create([
        {
          fields: {
            "First Name": firstName,
            "Last Name": lastName,
            Email: email,
            "Subscribe to 8 Count": subscribeToNewsletter ? "Yes" : "No",
          },
        },
      ])

      console.log("[Gallery Access] Created new RSVP record")
    }

    console.log("[Gallery Access] Successfully processed gallery access request")

    return NextResponse.json(
      {
        message: "Access granted successfully",
        isExistingUser: existingRecords && existingRecords.length > 0,
      },
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
