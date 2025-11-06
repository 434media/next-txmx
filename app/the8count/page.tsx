import { getFeedItems, getFeedTypes, getFeedTopics } from "@/lib/8count-data"
import { The8CountClient } from "./client"

// Revalidate every 60 seconds to get fresh data from Airtable
export const revalidate = 60

export default async function The8CountPage() {
  // Fetch data from Airtable (with fallback to local data)
  const [feedItems, feedTypes, feedTopics] = await Promise.all([
    getFeedItems(),
    getFeedTypes(),
    getFeedTopics()
  ])

  return (
    <The8CountClient 
      feedItems={feedItems}
      feedTypes={feedTypes}
      feedTopics={feedTopics}
    />
  )
}
