import type { MetadataRoute } from "next"
import { feedItems } from "@/data/8count-feed"

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Article pages
  const articles = feedItems.map((item) => ({
    url: `${baseUrl}/the8count/${item.slug}`,
    lastModified: new Date(item.date.replace(/\./g, "-")),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...routes, ...articles]
}
