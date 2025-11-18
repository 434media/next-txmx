import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/actions/'],
    },
    sitemap: 'https://txmxboxing.com/sitemap.xml',
  }
}
