# Airtable Integration Guide for The 8 Count

## Overview

This document outlines the Airtable integration for The 8 Count blog system in the TXMX Boxing website. The integration uses Airtable as a content management system (CMS) for managing boxing articles, with a fallback to local data when Airtable is unavailable.

## Airtable Base Structure

**Base Name:** `thefeeds`  
**Table Name:** `8count`

## Required Airtable Fields

Based on the analysis of the existing code structure and data models, the following fields must be created in the Airtable `8count` table:

### Core Content Fields

| Field Name | Field Type | Required | Description | Example |
|------------|------------|----------|-------------|---------|
| `Title` | Single line text | ✅ | Article headline | "Fury vs Usyk II: The Rematch That Will Define a Generation" |
| `Slug` | Single line text | ✅ | URL-friendly identifier | "fury-vs-usyk-rematch-breakdown" |
| `Date` | Date | ✅ | Publication date | "2025-01-20" |
| `Summary` | Long text | ✅ | Article summary/excerpt | "A comprehensive breakdown of the highly anticipated rematch..." |
| `Content` | Long text | ✅ | Full article content (supports markdown) | Full article body with paragraphs |

### Categorization Fields

| Field Name | Field Type | Required | Options/Format | Description |
|------------|------------|----------|----------------|-------------|
| `Type` | Single select | ✅ | `fight-recap`, `training`, `news`, `community` | Article category |
| `Topics` | Multiple select or Long text | ✅ | Comma-separated or multi-select | Article tags/topics |
| `Authors` | Multiple select or Long text | ✅ | Comma-separated or multi-select | Article authors |

### Media & Metadata Fields

| Field Name | Field Type | Required | Description | Example |
|------------|------------|----------|-------------|---------|
| `Image` | Attachment | ❌ | Featured article image | Upload boxing-related images |
| `Read Time` | Number | ❌ | Estimated reading time in minutes | 8 |
| `Published` | Checkbox | ✅ | Controls article visibility | ✅ (checked = published) |

## Field Configuration Details

### Type Field Options
Create a single select field with these exact options:
- `fight-recap`
- `training` 
- `news`
- `community`

### Topics Field Options
If using Multiple Select, create options for:
- `Technique`
- `Champions`
- `History`
- `Equipment`
- `Nutrition`
- `Psychology`
- `Legends`
- `Upcoming`
- `Training`
- `Community`

*Alternative: Use Long text field with comma-separated values*

### Authors Field
- **Option 1:** Multiple select with author names
- **Option 2:** Long text field with comma-separated author names

Example format: `Marcus Stone, Elena Rodriguez`

## Environment Variables

The following environment variables must be configured:

```env
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_8COUNT_BASE_ID=your_base_id
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## API Integration Details

### Endpoint
- **URL:** `/api/8count`
- **Method:** GET
- **Response:** JSON with `feedItems` array

### Data Flow
1. **Primary:** Fetch from Airtable API
2. **Fallback:** Use local data if Airtable fails
3. **Cache:** 5-minute server-side cache
4. **Filter:** Only published articles (`Published = TRUE()`)
5. **Sort:** Date descending (newest first)

### Error Handling
- Graceful degradation to local data
- Console warnings for debugging
- 5-minute cache to reduce API calls

## Content Management Workflow

### Adding New Articles
1. Create new record in Airtable `8count` table
2. Fill all required fields
3. Upload featured image (optional)
4. Set appropriate Type and Topics
5. Check "Published" when ready to go live
6. Article appears on website within 5 minutes

### Content Guidelines

#### Slug Format
- Use lowercase letters, numbers, and hyphens only
- Must be unique across all articles
- Example: `fury-vs-usyk-rematch-breakdown`

#### Date Format
- Use YYYY-MM-DD format
- Or use Airtable's date picker
- Displays as YYYY.MM.DD on frontend

#### Content Formatting
- Long text fields support line breaks
- Use double line breaks for paragraphs
- Rich text formatting handled by frontend

## SEO & Schema Integration

The system automatically generates:
- **Open Graph** meta tags from Title, Summary, and Image
- **Twitter Card** meta tags
- **JSON-LD structured data** for articles and breadcrumbs
- **Canonical URLs** for each article
- **Author and publication metadata**

## Performance Considerations

### Caching Strategy
- **Server-side:** 5-minute cache in data layer
- **CDN-level:** Public cache with stale-while-revalidate
- **Build-time:** Static generation for existing articles

### Image Optimization
- Airtable images served directly from CDN
- Responsive image sizing handled by frontend
- Fallback images for articles without featured images

## Deployment Checklist

### Airtable Setup
- [ ] Create `thefeeds` base
- [ ] Create `8count` table with all required fields
- [ ] Configure field types and options as specified
- [ ] Add sample content for testing
- [ ] Generate API key with appropriate permissions

### Environment Configuration
- [ ] Set `AIRTABLE_API_KEY` in production
- [ ] Set `AIRTABLE_8COUNT_BASE_ID` in production
- [ ] Set `NEXT_PUBLIC_BASE_URL` for production domain
- [ ] Test API endpoint locally

### Content Migration (if applicable)
- [ ] Export existing local data
- [ ] Import into Airtable table
- [ ] Verify data integrity
- [ ] Test frontend rendering

## Troubleshooting

### Common Issues

1. **Articles not appearing:** Check `Published` field is checked
2. **API errors:** Verify environment variables and API key permissions
3. **Image not loading:** Ensure image is properly uploaded to Airtable
4. **Topics not displaying:** Check comma-separated format or multi-select values
5. **Slug conflicts:** Ensure all slugs are unique

### Testing Checklist
- [ ] Articles load on main page (`/the8count`)
- [ ] Individual article pages work (`/the8count/[slug]`)
- [ ] Filtering by type and topics functions
- [ ] Fallback to local data when Airtable unavailable
- [ ] SEO meta tags and structured data present
- [ ] Images display correctly
- [ ] Mobile responsive design works

## Future Enhancements

Potential improvements to consider:
- **Webhook integration** for real-time updates
- **Draft/Preview functionality** for content review
- **Comment system** integration
- **Related articles algorithm** improvement
- **Analytics tracking** for popular topics
- **Multi-language support** for international content

## Support

For technical issues with the integration:
1. Check Airtable API status
2. Verify environment variables
3. Review server logs for error details
4. Test with local data fallback
5. Contact development team for assistance