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
  type: "fight-recap" | "training" | "news" | "community" | "newsletter"
  summary: string
  content: string
  authors: string[]
  topics: string[]
  readTime?: number
  image?: string
  published?: boolean
  newsletterContent?: string // JSON string for newsletter content
}

export async function GET() {
  try {
    // Get all records without filtering or sorting to avoid field name issues
    // We'll handle filtering and sorting in the application layer
    const records = await base("8count").select().all()

    const feedItems: AirtableFeedItem[] = records.map((record) => {
      const fields = record.fields as any

      // Parse authors from comma-separated string or array
      let authors: string[] = []
      if (fields.Authors || fields.authors) {
        const authorsField = fields.Authors || fields.authors
        if (Array.isArray(authorsField)) {
          authors = authorsField
        } else if (typeof authorsField === "string") {
          authors = authorsField.split(",").map((author: string) => author.trim())
        }
      }

      // Parse topics from comma-separated string or array
      let topics: string[] = []
      if (fields.Topics || fields.topics) {
        const topicsField = fields.Topics || fields.topics
        if (Array.isArray(topicsField)) {
          topics = topicsField
        } else if (typeof topicsField === "string") {
          topics = topicsField.split(",").map((topic: string) => topic.trim())
        }
      }

      // Handle date field - try multiple possible field names, prioritizing published_date
      let date = ""
      if (fields.published_date) {
        date = fields.published_date
      } else if (fields["published_date"]) {
        date = fields["published_date"]
      } else if (fields.Date) {
        date = fields.Date
      } else if (fields.date) {
        date = fields.date
      } else if (fields["Publication Date"]) {
        date = fields["Publication Date"]
      } else if (fields.Created) {
        date = fields.Created
      } else {
        // Fallback to current date if no date field found
        date = new Date().toISOString().split('T')[0].replace(/-/g, '.')
      }

      return {
        id: record.id,
        slug: fields.Slug || fields.slug || "",
        date: date,
        title: fields.Title || fields.title || "",
        type: (fields.Type || fields.type || "news").toLowerCase(),
        summary: fields.Summary || fields.summary || "",
        content: fields.Content || fields.content || "",
        authors,
        topics,
        readTime: fields["Read Time"] || fields.readTime || undefined,
        image: fields.Image?.[0]?.url || fields.image?.[0]?.url || undefined,
        published: fields.Published !== false, // Default to true if field doesn't exist
        newsletterContent: fields["Newsletter Content"] || fields.newsletterContent || undefined
      }
    })

    // Filter and sort in JavaScript
    const publishedItems = feedItems.filter(item => item.published && item.title && item.slug)
    
    // Sort by date in JavaScript (most recent first)
    const sortedFeedItems = publishedItems.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, "-")).getTime()
      const dateB = new Date(b.date.replace(/\./g, "-")).getTime()
      return dateB - dateA // Most recent first
    })

    // Cache for 1 minute only to allow for quicker updates
    return NextResponse.json(
      { feedItems: sortedFeedItems },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
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