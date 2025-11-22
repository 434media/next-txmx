# Airtable Setup for Iconic Series

## Overview
This guide will help you create the necessary tables in your existing Airtable base to capture form submissions from the Iconic Series pages.

## Prerequisites
- Access to Airtable base: `appjhfV2ev2hb2hox`
- Admin or creator permissions on the base

---

## Table 1: Inquiries (Iconic Series Contact Form)

### 1. Access Your Airtable Base
1. Go to [airtable.com](https://airtable.com)
2. Open your workspace
3. Navigate to base `appjhfV2ev2hb2hox` (the same base used for newsletter signups)

### 2. Create Inquiries Table
1. Click the **+** button or "Add or import" to create a new table
2. Name the table: **Inquiries**
3. Delete any default fields Airtable creates

### 3. Add Required Fields

Create the following fields in this exact order:

#### Field 1: First Name
- **Field Type:** Single line text
- **Field Name:** `First Name`

#### Field 2: Last Name
- **Field Type:** Single line text
- **Field Name:** `Last Name`

#### Field 3: Email
- **Field Type:** Email
- **Field Name:** `Email`

#### Field 4: Phone
- **Field Type:** Phone number
- **Field Name:** `Phone`

#### Field 5: Company
- **Field Type:** Single line text
- **Field Name:** `Company`

#### Field 6: Message
- **Field Type:** Long text
- **Field Name:** `Message`
- Enable "Enable rich text formatting" (optional)

#### Field 7: Inquiry Type
- **Field Type:** Single select
- **Field Name:** `Inquiry Type`
- **Options:**
  - Custom Package
  - Optional Upgrade
  - Other
- Assign colors to each option (optional)

#### Field 8: Submission Date
- **Field Type:** Created time
- **Field Name:** `Submission Date`
- Airtable will automatically populate this when records are created

### 4. Verify Inquiries Table Configuration

Your Inquiries table should have exactly these 8 fields:
1. First Name (Single line text)
2. Last Name (Single line text)
3. Email (Email)
4. Phone (Phone number)
5. Company (Single line text)
6. Message (Long text)
7. Inquiry Type (Single select: Custom Package, Optional Upgrade, Other)
8. Submission Date (Created time)

---

## Table 2: RSVP (Rise of a Champion Event)

### 1. Create RSVP Table
1. In the same base, add another table
2. Name the table: **RSVP**
3. Delete any default fields Airtable creates

### 2. Add Required Fields for RSVP

#### Field 1: First Name
- **Field Type:** Single line text
- **Field Name:** `First Name`

#### Field 2: Last Name
- **Field Type:** Single line text
- **Field Name:** `Last Name`

#### Field 3: Email
- **Field Type:** Email
- **Field Name:** `Email`

#### Field 4: Phone
- **Field Type:** Phone number
- **Field Name:** `Phone`

#### Field 5: Invited By
- **Field Type:** Single select
- **Field Name:** `Invited By`
- **Options:**
  - ICONTALKS
  - TXMX BOXING
  - 434 MEDIA
  - J. Leija
  - S. Barrios
  - J. Rodriguez
  - J. Franco
  - S. Watson

#### Field 6: Attending
- **Field Type:** Single select
- **Field Name:** `Attending`
- **Options:**
  - Yes
  - No

#### Field 7: Submission Date
- **Field Type:** Created time
- **Field Name:** `Submission Date`
- Airtable will automatically populate this when records are created

### 3. Verify RSVP Table Configuration

Your RSVP table should have exactly these 7 fields:
1. First Name (Single line text)
2. Last Name (Single line text)
3. Email (Email)
4. Phone (Phone number)
5. Invited By (Single select)
6. Attending (Single select: Yes, No)
7. Submission Date (Created time)

---

## Testing the Integrations

### Test Inquiries Form

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3001/iconic-series (or whatever port your server is using)

3. Scroll down to the inquiry form

4. Fill out the form with test data:
   - Inquiry Type: Select any option
   - First Name: John
   - Last Name: Doe
   - Email: test@example.com
   - Phone: (555) 123-4567
   - Company: Test Company
   - Message: This is a test inquiry

5. Click "Send Message"

6. Check your Airtable "Inquiries" table for the new record

### Test RSVP Form

1. Navigate to http://localhost:3001/iconic-series/rise-of-a-champion

2. Scroll down to the RSVP form

3. Fill out the form with test data:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Phone: (555) 123-4567
   - Will you be attending?: Yes

4. Click "Confirm RSVP"

5. Check your Airtable "RSVP" table for the new record

---

## Optional: Create Views

You may want to create different views to organize your data:

### Inquiries Table Views

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

### RSVP Table Views

#### View 1: All RSVPs
- Default grid view showing all records

#### View 2: Confirmed Attendees
- Filter: `Attending` is `Yes`
- Sort: `Submission Date` (newest first)

#### View 3: Declined RSVPs
- Filter: `Attending` is `No`
- Sort: `Submission Date` (newest first)

#### View 4: Recent RSVPs
- Filter: `Submission Date` is within `the past week`
- Sort: `Submission Date` (newest first)

---

## Set Up Notifications (Optional)

### For Inquiries

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

### For RSVPs

To receive email notifications when new RSVPs come in:

1. Click **Automations** in the top toolbar
2. Click **Create automation**
3. Choose trigger: **When record matches conditions**
4. Set condition: When a record enters a view (choose "All RSVPs")
5. Add action: **Send an email**
6. Configure email:
   - To: Your email address
   - Subject: `New RSVP: {First Name} {Last Name} - {Attending}`
   - Message: Include fields like First Name, Last Name, Email, Phone, Attending
7. Test the automation
8. Turn it on

---

## Troubleshooting

### 403 Authorization Error
- Verify the base ID in `.env.local` is `appjhfV2ev2hb2hox`
- Ensure your API key has write access to this base
- Check that table names are exactly "Inquiries" and "RSVP" (case-sensitive)

### Form Submission Fails
- Check the browser console for errors
- Verify all environment variables are set correctly
- Restart the dev server after any `.env.local` changes

### Missing Fields in Airtable
- Ensure all fields are created with exact names (case-sensitive)
- Verify field types match the specifications above
- For "Attending" and "Inquiry Type" fields, ensure options are spelled exactly as specified

### INVALID_VALUE_FOR_COLUMN Error
- This usually means a Single Select field option doesn't match
- For Inquiries: Options must be "Custom Package", "Optional Upgrade", "Other"
- For RSVP: Options must be "Yes", "No"
- Check that field names match exactly (including spaces and capitalization)

---

## Environment Variables

Your `.env.local` should contain:

```env
AIRTABLE_ICONIC_SERIES_BASE_ID=appjhfV2ev2hb2hox
AIRTABLE_API_KEY=your_api_key_here
```

## API Endpoints

### Inquiries Form
- **Endpoint:** `/api/iconic-series-inquiry`
- **Table:** "Inquiries"
- **Page:** `/iconic-series`

### RSVP Form
- **Endpoint:** `/api/rise-of-a-champion-rsvp`
- **Table:** "RSVP"
- **Page:** `/iconic-series/rise-of-a-champion`

---

## Support

For issues with:
- **Airtable setup:** Check [Airtable support docs](https://support.airtable.com)
- **Inquiries API:** Review `/app/api/iconic-series-inquiry/route.ts`
- **Inquiries Form:** Review `/app/components/iconic-series/inquiry-form.tsx`
- **RSVP API:** Review `/app/api/rise-of-a-champion-rsvp/route.ts`
- **RSVP Form:** Review `/app/components/iconic-series/rsvp-form.tsx`

