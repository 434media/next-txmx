# SEO Implementation for Iconic Series Pages

## Overview
Simple, effective SEO optimization for the Rise of a Champion event pages using Next.js 15 App Router best practices.

## Current Implementation

### Pages
1. **`/iconic-series`** - Main event & sponsorship packages
2. **`/iconic-series/riseofachampion`** - RSVP page

### Architecture
```
app/iconic-series/
├── page.tsx                    # Server component with metadata export
├── iconic-series-client.tsx    # Client component with interactivity
├── opengraph-image.png         # Static OG image (1200x630)
└── riseofachampion/
    ├── page.tsx                # Server component with metadata export
    ├── riseofachampion-client.tsx  # Client component
    └── opengraph-image.png     # Static OG image (1200x630)
```

**Why this structure?**
- `page.tsx` files are server components that export metadata
- Client components are separate files (required when using 'use client' with metadata)
- Static PNG images for OpenGraph (simpler than dynamic generation)

## Metadata Configuration

### Iconic Series Page
```typescript
export const metadata: Metadata = {
  title: 'Rise of a Champion - Iconic Series | TXMX Boxing',
  description: '...',
  keywords: [...],
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://txmxboxing.com/iconic-series',
    images: [{
      url: 'https://txmxboxing.com/iconic-series/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: '...',
      type: 'image/png',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://txmxboxing.com/iconic-series/opengraph-image.png'],
  },
}
```

### Key Points
✅ Full absolute URLs for images (not relative paths)  
✅ Explicit image dimensions and metadata  
✅ Canonical URLs set  
✅ Keywords array for targeting  
✅ Robots directives configured

## JSON-LD Structured Data

Event pages include Schema.org structured data in `page.tsx`:

```tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@type": "Event",
    "name": "Rise of a Champion - Iconic Series",
    "startDate": "2025-12-03T18:00:00-06:00",
    "location": { "@type": "Place", "name": "San Antonio, TX" },
    "performers": [...],
    "organizers": [...]
  })}
</script>
```

Helper functions in `app/lib/json-ld.ts`:
- `generateEventJsonLd()` - Event details
- `generateBreadcrumbJsonLd()` - Site hierarchy
- `generateOrganizationJsonLd()` - Brand info

## Sitemap & Robots

**`app/sitemap.ts`** - Auto-generated XML sitemap:
```typescript
export default function sitemap() {
  return [
    { url: 'https://txmxboxing.com', priority: 1 },
    { url: 'https://txmxboxing.com/iconic-series', priority: 0.9 },
    ...
  ]
}
```

**`app/robots.ts`** - Crawl directives:
```typescript
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://txmxboxing.com/sitemap.xml',
  }
}
```

**`app/layout.tsx`** - MetadataBase:
```typescript
export const metadata = {
  metadataBase: new URL('https://txmxboxing.com'),
}
```

## SEO Benefits

✅ **Social Sharing** - Custom OG images, optimized for Facebook/Twitter/LinkedIn  
✅ **Search Visibility** - Rich snippets via JSON-LD, event schema, breadcrumbs  
✅ **Performance** - Static generation at build time, efficient crawling  
✅ **Local SEO** - San Antonio location, Texas boxing keywords, champion names  
✅ **Discovery** - Comprehensive keywords, semantic HTML, proper heading structure

## Testing

### Post-Deployment Checklist
1. Submit sitemap to Google Search Console: `https://txmxboxing.com/sitemap.xml`
2. Test OG images:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
3. Validate JSON-LD: https://search.google.com/test/rich-results
4. Run Lighthouse SEO audit (target 95+)

### URLs to Test
```
https://txmxboxing.com/iconic-series
https://txmxboxing.com/iconic-series/riseofachampion
https://txmxboxing.com/sitemap.xml
https://txmxboxing.com/robots.txt
```

## Keywords

**Primary:** Rise of a Champion, TXMX Boxing, San Antonio boxing, sponsorship packages  
**Secondary:** Jesse Rodriguez, Mario Barrios, Joshua Franco, Jesse James Leija, Icon Talks  
**Long-tail:** San Antonio boxing awards, TXMX sponsorship opportunities, Rise of a Champion RSVP

## Files

```
app/
├── iconic-series/
│   ├── page.tsx                       # Server component + metadata
│   ├── iconic-series-client.tsx       # Client component
│   ├── opengraph-image.png            # Static OG image
│   └── riseofachampion/
│       ├── page.tsx                   # Server component + metadata
│       ├── riseofachampion-client.tsx # Client component
│       └── opengraph-image.png        # Static OG image
├── lib/json-ld.ts                     # Structured data helpers
├── layout.tsx                         # MetadataBase config
├── sitemap.ts                         # Auto-generated sitemap
└── robots.ts                          # Crawl directives
```

## Monitoring

Track post-launch:
- Organic impressions & CTR (Google Search Console)
- Social share engagement
- RSVP conversion rate
- Sponsorship inquiries
- Core Web Vitals

---

**Last Updated:** November 18, 2025  
**Status:** ✅ Production Ready
