import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.txmxboxing.com'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/fighters`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/fight-nights`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/picks`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/polls`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/pledge`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/locker`, lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${baseUrl}/rewards`, lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${baseUrl}/seasons`, lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    { url: `${baseUrl}/fan-card`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/fanos`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/checkout`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${baseUrl}/icon-talks/rise-of-a-champion`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/icon-talks/rise-of-a-champion/gallery`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/icon-talks/rise-of-a-champion/rsvp`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    const { getFighters } = await import('./actions/fighters')
    const fighters = await getFighters()
    for (const f of fighters) {
      if (!f.slug) continue
      dynamicRoutes.push({
        url: `${baseUrl}/fighters/${f.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // If Firestore is unavailable at build time, skip dynamic fighter entries.
  }

  try {
    const { getFightNights } = await import('./actions/fightnight')
    const nights = await getFightNights()
    for (const fn of nights) {
      dynamicRoutes.push({
        url: `${baseUrl}/fight-nights/${fn.slug || fn.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch {
    // If Firestore is unavailable at build time, skip dynamic fight-night entries.
  }

  return [...staticRoutes, ...dynamicRoutes]
}
