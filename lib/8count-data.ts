import type { FeedItem } from "../data/8count-feed"
import { feedItems as localFeedItems } from "../data/8count-feed"

let cachedData: FeedItem[] | null = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getFeedItems(): Promise<FeedItem[]> {
  // Check if we have valid cached data
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData
  }

  try {
    // Try to fetch from Airtable API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/8count`, {
      headers: {
        "Cache-Control": "no-cache"
      }
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.feedItems && Array.isArray(data.feedItems)) {
      // Update cache
      cachedData = data.feedItems
      cacheTime = Date.now()
      return data.feedItems
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