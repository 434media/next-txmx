import { NextResponse } from "next/server"
import Airtable from "airtable"


const isDevelopment = process.env.NODE_ENV === "development"

const airtableBaseId = process.env.AIRTABLE_ICONIC_SERIES_BASE_ID
const airtableApiKey = process.env.AIRTABLE_API_KEY

let base: any = null

if (airtableBaseId && airtableApiKey) {
  base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, invitedBy } = await request.json()


    console.log('[Rise of a Champion RSVP] Received submission:', { firstName, lastName, email, invitedBy, isDevelopment })

    if (!base) {
      console.error("Airtable configuration is missing")
      return NextResponse.json({ error: "Server configuration error. Please check Airtable settings." }, { status: 500 })
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
          "Invited By": invitedBy,
          "Attending": "Yes",
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
