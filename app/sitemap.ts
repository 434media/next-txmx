import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.txmxboxing.com'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/8count`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/fighters`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/scorecard`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
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
      url: `${baseUrl}/events/rise-of-a-champion`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events/rise-of-a-champion/gallery`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events/rise-of-a-champion/rsvp`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events/fight-night`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    const { getAllPublishedSlugs } = await import('./actions/eight-count')
    const slugs = await getAllPublishedSlugs()
    for (const slug of slugs) {
      dynamicRoutes.push({
        url: `${baseUrl}/8count/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // If Firestore is unavailable at build time, skip dynamic 8count entries.
  }

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
    const { getEvents } = await import('./actions/events')
    const events = await getEvents()
    for (const e of events) {
      if (!e.id) continue
      dynamicRoutes.push({
        url: `${baseUrl}/events/${e.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // If Firestore is unavailable at build time, skip dynamic event entries.
  }

  return [...staticRoutes, ...dynamicRoutes]
}
