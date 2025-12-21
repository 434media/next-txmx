import { NextResponse } from "next/server"
import Airtable from "airtable"
import { checkBotId } from "botid/server"

const airtableBaseId = process.env.AIRTABLE_ICONIC_SERIES_BASE_ID
const airtableApiKey = process.env.AIRTABLE_API_KEY

let base: any = null

if (airtableBaseId && airtableApiKey) {
  base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
}

export async function POST(request: Request) {
  try {
    // Verify bot protection with BotID
    const verification = await checkBotId()

    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { firstName, lastName, email, phone, company, message, inquiryType } = await request.json()

    if (!base) {
      console.error("Airtable configuration is missing")
      return NextResponse.json({ error: "Server configuration error. Please check Airtable settings." }, { status: 500 })
    }

    // Create record in Airtable
    
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
