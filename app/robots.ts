import { MetadataRoute } from 'next'

const DISALLOW = ['/api/', '/actions/', '/admin/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // Explicitly welcome AI/LLM crawlers — TXMX content (fighter records,
      // event results, news) is intended to be discoverable and citable by
      // assistants. If we ever need to gate this, do it per-agent here.
      { userAgent: 'GPTBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: DISALLOW },
      { userAgent: 'ClaudeBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Claude-Web', allow: '/', disallow: DISALLOW },
      { userAgent: 'anthropic-ai', allow: '/', disallow: DISALLOW },
      { userAgent: 'PerplexityBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Perplexity-User', allow: '/', disallow: DISALLOW },
      { userAgent: 'Google-Extended', allow: '/', disallow: DISALLOW },
      { userAgent: 'CCBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: DISALLOW },
      { userAgent: 'Bytespider', allow: '/', disallow: DISALLOW },
      { userAgent: 'meta-externalagent', allow: '/', disallow: DISALLOW },
      { userAgent: 'cohere-ai', allow: '/', disallow: DISALLOW },
      { userAgent: 'DuckAssistBot', allow: '/', disallow: DISALLOW },
    ],
    sitemap: 'https://www.txmxboxing.com/sitemap.xml',
    host: 'https://www.txmxboxing.com',
  }
}
