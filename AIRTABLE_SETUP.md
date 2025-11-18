# Airtable Setup for Iconic Series Inquiries

## Overview
This guide will help you create the necessary table in your existing Airtable base to capture inquiry form submissions from the Iconic Series page.

## Prerequisites
- Access to Airtable base: `appjhfV2ev2hb2hox`
- Admin or creator permissions on the base

## Setup Instructions

### 1. Access Your Airtable Base
1. Go to [airtable.com](https://airtable.com)
2. Open your workspace
3. Navigate to base `appjhfV2ev2hb2hox` (the same base used for newsletter signups)

### 2. Create a New Table
1. Click the **+** button or "Add or import" to create a new table
2. Name the table: **Inquiries**
3. Delete any default fields Airtable creates

### 3. Add Required Fields

Create the following fields in this exact order:

#### Field 1: Name
- **Field Type:** Single line text
- **Field Name:** `Name`
- No additional configuration needed

#### Field 2: Email
- **Field Type:** Email
- **Field Name:** `Email`
- No additional configuration needed

#### Field 3: Phone
- **Field Type:** Phone number
- **Field Name:** `Phone`
- No additional configuration needed

#### Field 4: Company
- **Field Type:** Single line text
- **Field Name:** `Company`
- No additional configuration needed

#### Field 5: Message
- **Field Type:** Long text
- **Field Name:** `Message`
- Enable "Enable rich text formatting" (optional)

#### Field 6: Inquiry Type
- **Field Type:** Single select
- **Field Name:** `Inquiry Type`
- **Options:**
  - Custom Package
  - Optional Upgrade
  - Other
- Assign colors to each option (optional)

#### Field 7: Submission Date
- **Field Type:** Date
- **Field Name:** `Submission Date`
- **Date format:** Choose your preferred format (e.g., US: 11/18/2025)
- **Include time:** Yes (toggle ON)
- **Time format:** 12 hour or 24 hour (your preference)
- **GMT offset:** Use workspace timezone

### 4. Verify Configuration

Your table should have exactly these 7 fields:
1. Name (Single line text)
2. Email (Email)
3. Phone (Phone number)
4. Company (Single line text)
5. Message (Long text)
6. Inquiry Type (Single select)
7. Submission Date (Date)

### 5. Test the Integration

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3001/iconic-series (or whatever port your server is using)

3. Scroll down to the inquiry form

4. Fill out the form with test data:
   - Name: Test User
   - Email: test@example.com
   - Phone: (555) 123-4567
   - Company: Test Company
   - Message: This is a test inquiry
   - Inquiry Type: Select any option

5. Click "Send Message"

6. Check your Airtable "Inquiries" table for the new record

### 6. Optional: Create Views

You may want to create different views to organize inquiries:

#### View 1: All Inquiries
- Default grid view showing all records

#### View 2: Custom Package Requests
- Filter: `Inquiry Type` is `Custom Package`
- Sort: `Submission Date` (newest first)

#### View 3: Optional Upgrades
- Filter: `Inquiry Type` is `Optional Upgrade`
- Sort: `Submission Date` (newest first)

#### View 4: Recent Inquiries
- Filter: `Submission Date` is within `the past week`
- Sort: `Submission Date` (newest first)

### 7. Set Up Notifications (Optional)

To receive email notifications when new inquiries come in:

1. Click **Automations** in the top toolbar
2. Click **Create automation**
3. Choose trigger: **When record matches conditions**
4. Set condition: When a record enters a view (choose "All Inquiries")
5. Add action: **Send an email**
6. Configure email:
   - To: Your email address
   - Subject: `New Iconic Series Inquiry from {Name}`
   - Message: Include fields like Name, Email, Company, Inquiry Type, Message
7. Test the automation
8. Turn it on

## Troubleshooting

### 403 Authorization Error
- Verify the base ID in `.env.local` is `appjhfV2ev2hb2hox`
- Ensure your API key has write access to this base
- Check that the table is named exactly "Inquiries" (case-sensitive)

### Form Submission Fails
- Check the browser console for errors
- Verify all environment variables are set correctly
- Restart the dev server after any `.env.local` changes

### Missing Fields in Airtable
- Ensure all 7 fields are created with exact names (case-sensitive)
- Verify field types match the specifications above

## Environment Variables

Your `.env.local` should contain:

```env
AIRTABLE_ICONIC_SERIES_BASE_ID=appjhfV2ev2hb2hox
AIRTABLE_API_KEY=your_api_key_here
```

## API Endpoint

The form submits to: `/api/iconic-series-inquiry`

Form data is sent to the "Inquiries" table in the Airtable base.

## Support

For issues with:
- **Airtable setup:** Check [Airtable support docs](https://support.airtable.com)
- **API integration:** Review `/app/api/iconic-series-inquiry/route.ts`
- **Form component:** Review `/app/components/iconic-series/inquiry-form.tsx`
