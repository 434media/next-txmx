import { NextResponse } from "next/server"
import Airtable from "airtable"

const airtable8CountBaseId = process.env.AIRTABLE_8COUNT_BASE_ID
const airtableApiKey = process.env.AIRTABLE_API_KEY

if (!airtable8CountBaseId || !airtableApiKey) {
  throw new Error("Airtable 8 Count configuration is missing")
}

const base = new Airtable({ apiKey: airtableApiKey }).base(airtable8CountBaseId)

export interface AirtableFeedItem {
  id: string
  slug: string
  date: string
  title: string
  type: "fight-recap" | "training" | "news" | "community"
  summary: string
  content: string
  authors: string[]
  topics: string[]
  readTime?: number
  image?: string
  published?: boolean
}

export async function GET() {
  try {
    const records = await base("8count")
      .select({
        // Sort by date descending (newest first)
        sort: [{ field: "Date", direction: "desc" }],
        // Only fetch published articles
        filterByFormula: "{Published} = TRUE()"
      })
      .all()

    const feedItems: AirtableFeedItem[] = records.map((record) => {
      const fields = record.fields as any

      // Parse authors from comma-separated string or array
      let authors: string[] = []
      if (fields.Authors) {
        if (Array.isArray(fields.Authors)) {
          authors = fields.Authors
        } else if (typeof fields.Authors === "string") {
          authors = fields.Authors.split(",").map((author: string) => author.trim())
        }
      }

      // Parse topics from comma-separated string or array
      let topics: string[] = []
      if (fields.Topics) {
        if (Array.isArray(fields.Topics)) {
          topics = fields.Topics
        } else if (typeof fields.Topics === "string") {
          topics = fields.Topics.split(",").map((topic: string) => topic.trim())
        }
      }

      return {
        id: record.id,
        slug: fields.Slug || "",
        date: fields.Date || "",
        title: fields.Title || "",
        type: fields.Type?.toLowerCase() || "news",
        summary: fields.Summary || "",
        content: fields.Content || "",
        authors,
        topics,
        readTime: fields["Read Time"] || undefined,
        image: fields.Image?.[0]?.url || undefined,
        published: fields.Published || false
      }
    })

    // Cache for 5 minutes
    return NextResponse.json(
      { feedItems },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      }
    )
  } catch (error) {
    console.error("Error fetching 8count data from Airtable:", error)
    return NextResponse.json(
      { error: "Failed to fetch 8count data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}