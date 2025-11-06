import type { FeedItem } from "../data/8count-feed"
import { feedItems as localFeedItems } from "../data/8count-feed"

interface AirtableFeedItem {
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
  newsletterContent?: string
}

let cachedData: FeedItem[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 1 * 60 * 1000 // 1 minute for faster updates

export async function getFeedItems(): Promise<FeedItem[]> {
  // Check if we have valid cached data
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData
  }

  try {
    // Try to fetch from Airtable API with cache busting
    const cacheBuster = Date.now()
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/8count?_=${cacheBuster}`, {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.feedItems && Array.isArray(data.feedItems)) {
      // Transform Airtable data to match FeedItem interface
      const transformedItems: FeedItem[] = data.feedItems.map((item: AirtableFeedItem) => {
        let newsletterContent = undefined
        
        // Parse newsletter content if it exists and is valid JSON
        if (item.newsletterContent) {
          try {
            newsletterContent = JSON.parse(item.newsletterContent)
          } catch (error) {
            console.warn(`Failed to parse newsletter content for item ${item.id}:`, error)
          }
        }

        return {
          id: item.id,
          date: item.date,
          title: item.title,
          type: item.type,
          summary: item.summary,
          authors: item.authors,
          topics: item.topics,
          link: `/the8count/${item.slug}`,
          slug: item.slug,
          ogImage: item.image || "/images/feed/default-og.png",
          content: item.content,
          image: item.image,
          readTime: item.readTime,
          published: item.published,
          newsletterContent,
        }
      })
      
      // Update cache
      cachedData = transformedItems
      cacheTime = Date.now()
      return transformedItems
    }
    
    throw new Error("Invalid data format from API")
  } catch (error) {
    console.warn("Failed to fetch from Airtable, falling back to local data:", error)
    
    // Fallback to local data
    cachedData = localFeedItems
    cacheTime = Date.now()
    return localFeedItems
  }
}

export async function getFeedItemBySlug(slug: string): Promise<FeedItem | undefined> {
  const items = await getFeedItems()
  return items.find(item => item.slug === slug)
}

// Helper function to clear cache (useful during development)
export function clearCache() {
  cachedData = null
  cacheTime = 0
}

// Helper function to count items by type
export async function countByType(type: FeedItem["type"]): Promise<number> {
  const items = await getFeedItems()
  return items.filter((item) => item.type === type).length
}

// Helper function to count items by topic
export async function countByTopic(topic: string): Promise<number> {
  const items = await getFeedItems()
  return items.filter((item) => item.topics.some((t: string) => t.toLowerCase() === topic.toLowerCase())).length
}

// Generate feed types with actual counts
export async function getFeedTypes() {
  return [
    { id: "fight-recap", label: "Fight Recap", count: await countByType("fight-recap") },
    { id: "training", label: "Training", count: await countByType("training") },
    { id: "news", label: "News", count: await countByType("news") },
    { id: "community", label: "Community", count: await countByType("community") },
    { id: "newsletter", label: "Newsletter", count: await countByType("newsletter") },
    { id: "video", label: "Video", count: await countByType("video") },
    { id: "article", label: "Article", count: await countByType("article") },
    { id: "podcast", label: "Podcast", count: await countByType("podcast") },
  ]
}

// Generate feed topics with actual counts
export async function getFeedTopics() {
  return [
    { id: "technique", label: "Technique", count: await countByTopic("Technique") },
    { id: "champions", label: "Champions", count: await countByTopic("Champions") },
    { id: "history", label: "History", count: await countByTopic("History") },
    { id: "equipment", label: "Equipment", count: await countByTopic("Equipment") },
    { id: "nutrition", label: "Nutrition", count: await countByTopic("Nutrition") },
    { id: "psychology", label: "Psychology", count: await countByTopic("Psychology") },
    { id: "legends", label: "Legends", count: await countByTopic("Legends") },
    { id: "upcoming", label: "Upcoming", count: await countByTopic("Upcoming") },
    { id: "training", label: "Training", count: await countByTopic("Training") },
    { id: "community", label: "Community", count: await countByTopic("Community") },
  ]
}