import type { MetadataRoute } from "next"
import { getFeedItems } from "@/lib/8count-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://txmxboxing.com"

  // Main pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/the8count`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]

  // Fetch articles from Airtable
  const feedItems = await getFeedItems()

  // Article pages
  const articles = feedItems.map((item) => ({
    url: `${baseUrl}/the8count/${item.slug}`,
    lastModified: new Date(item.date.replace(/\./g, "-")),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...routes, ...articles]
}
