# Airtable Integration for The 8 Count

## Overview

The 8 Count content management has been integrated with Airtable to allow the client to manage articles, training content, fight recaps, and community stories through a user-friendly interface.

**Note**: This integration uses a dedicated Airtable base separate from the existing newsletter base to ensure content management and email collection remain isolated and organized.

## Airtable Base Structure

### Dedicated Base for 8 Count
The 8 Count content uses its own Airtable base (configured via `AIRTABLE_8COUNT_BASE_ID`) separate from the newsletter base. This separation provides:
- **Clean organization**: Content and email lists stay separate
- **Independent management**: Different team members can manage different bases
- **Better security**: Granular access control per base
- **Reduced conflicts**: No risk of accidentally modifying newsletter data

### Table Name: `8count`

The Airtable base should contain a table called `8count` with the following fields:

#### Required Fields:
- **Title** (Single line text) - Article title
- **Slug** (Single line text) - URL-friendly identifier
- **Date** (Date) - Publication date
- **Type** (Single select) - Options: "fight-recap", "training", "news", "community"
- **Summary** (Long text) - Brief description/excerpt
- **Content** (Long text) - Full article content (supports markdown)
- **Authors** (Multiple select or Long text) - Comma-separated author names
- **Topics** (Multiple select or Long text) - Comma-separated topic tags
- **Published** (Checkbox) - Controls visibility (only published articles are shown)
- **Image** (Attachment) - Featured image for the article

## Environment Variables

Make sure these environment variables are set:

```bash
AIRTABLE_BASE_ID=your_newsletter_base_id_here  # Used for newsletter signup
AIRTABLE_8COUNT_BASE_ID=your_8count_base_id_here  # Dedicated base for 8 Count content
AIRTABLE_API_KEY=your_api_key_here
NEXT_PUBLIC_BASE_URL=your_site_url_here
```

**Important**: The 8 Count integration uses a separate Airtable base (`AIRTABLE_8COUNT_BASE_ID`) from the newsletter integration (`AIRTABLE_BASE_ID`) to keep content management and email signups isolated.

## How It Works

### Data Flow:
1. **API Route** (`/app/api/8count/route.ts`) fetches data from Airtable
2. **Utility Functions** (`/lib/8count-data.ts`) provide easy access with local fallback
3. **Pages** consume the data through these utility functions
4. **Caching** - API responses are cached for 5 minutes to improve performance

### Fallback System:
If Airtable is unavailable, the system automatically falls back to local data from `/data/8count-feed.ts`. This ensures the site remains functional even if there are API issues.

### Caching Strategy:
- **Server-side**: 5-minute cache on API responses
- **Client-side**: 5-minute in-memory cache in utility functions
- **CDN**: Public cache headers for optimal performance

## Content Management Workflow

1. **Create Article**: Add new row in Airtable `8count` table
2. **Set Type**: Choose from fight-recap, training, news, or community
3. **Add Content**: Fill in title, summary, and full content
4. **Tag Topics**: Add relevant topics for filtering
5. **Publish**: Check the "Published" checkbox to make it live
6. **Auto-refresh**: Changes appear on the site within 5 minutes due to caching

## Development

### Testing Locally:
- Ensure `.env.local` has correct Airtable credentials
- Run `npm run dev` - the system will fetch from Airtable or fallback to local data
- Check browser console for any Airtable connection issues

### Adding New Fields:
1. Add field to Airtable table
2. Update the `AirtableFeedItem` interface in `/app/api/8count/route.ts`
3. Update the mapping logic in the API route
4. Update the `FeedItem` type in `/data/8count-feed.ts` if needed

## Troubleshooting

### Common Issues:
- **"Airtable 8 Count configuration is missing"**: Ensure `AIRTABLE_8COUNT_BASE_ID` is set correctly
- **"Failed to fetch 8count data"**: Check Airtable API key and 8 Count base ID
- **Empty results**: Ensure articles have "Published" checkbox checked
- **Missing fields**: Verify Airtable table structure matches expected fields
- **Wrong base confusion**: Make sure you're using the 8 Count base, not the newsletter base
- **Slow loading**: Check if Airtable API rate limits are being hit

### Debugging:
- Check browser console for API errors
- Visit `/api/8count` directly to see raw API response
- Verify Airtable base permissions and API key scopes

## Performance Notes

- **Static Generation**: Article pages are statically generated at build time
- **ISR**: Consider implementing Incremental Static Regeneration for faster updates
- **Rate Limits**: Airtable has API rate limits - the caching helps stay within limits
- **Fallback**: Local data ensures site performance even if Airtable is slow