import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/actions/', '/admin/'],
    },
    sitemap: 'https://www.txmxboxing.com/sitemap.xml',
  }
}
