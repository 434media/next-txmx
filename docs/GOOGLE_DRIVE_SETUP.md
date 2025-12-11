# Google Drive Integration Setup

This guide will help you configure Google Drive API to pull event photos directly from your Google Workspace.

## Prerequisites

You already have:
- ✅ Service account created: `analytics-reader@434media-analytics-proxy.iam.gserviceaccount.com`
- ✅ Google Analytics Data API enabled
- ✅ JSON key file with credentials in `.env.local`

## Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure you're in the **434media-analytics-proxy** project (check top dropdown)
3. Go to [API Library](https://console.cloud.google.com/apis/library)
4. Search for: **Google Drive API**
5. Click on it and click **ENABLE**

## Step 2: Share Drive Folder with Service Account

1. Switch to your **@434media.com** Google Workspace account
2. Go to [Google Drive](https://drive.google.com)
3. Find your "Rise of a Champion" event photos folder
4. Right-click the folder → **Share**
5. Paste the service account email:
   ```
   analytics-reader@434media-analytics-proxy.iam.gserviceaccount.com
   ```
6. Set role: **Viewer**
7. **Uncheck** "Notify people" (it's a bot, no email needed)
8. Click **Share**

## Step 3: Get Folder ID

1. Open the shared folder in Google Drive
2. Look at the URL in your browser:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
                                            ^^^^^^^^^^^^^^^^
   ```
3. Copy the **FOLDER_ID_HERE** part

## Step 4: Add to .env.local

Open your `.env.local` file and add:

```bash
# Existing Analytics credentials (don't change these)
GOOGLE_SERVICE_ACCOUNT_EMAIL=analytics-reader@434media-analytics-proxy.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Add this new line:
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

Replace `your-folder-id-here` with the folder ID you copied in Step 3.

## Step 5: Organize Your Drive Folder (Optional)

The system automatically categorizes images based on folder names:

- **Folders containing**: "red-carpet", "red carpet" → Category: Red Carpet
- **Folders containing**: "champions", "honorees", "boxing" → Category: Champions
- **Folders containing**: "music", "performance", "entertainment" → Category: Music
- **Folders containing**: "reception", "party", "venue" → Category: Reception
- **All other folders** → Default: Reception

### Recommended Folder Structure:

```
📁 Rise of a Champion Photos (main folder)
  ├── 📁 Red Carpet
  ├── 📁 Champions
  ├── 📁 Music Performance
  └── 📁 Reception
```

The API will recursively scan all subfolders and automatically categorize images.

## Step 6: Restart Development Server

```bash
pnpm dev
```

## How It Works

1. **API Route**: `/api/gallery` fetches images from Google Drive
2. **Caching**: Images are cached for 1 hour to improve performance
3. **Fallback**: If API fails, placeholder images are used
4. **Auto-categorization**: Folder names determine image categories
5. **Direct Links**: Uses `drive.google.com/uc?export=view&id=` for direct image URLs

## Testing

1. Visit: `http://localhost:3000/riseofachampion/gallery`
2. You should see your Google Drive photos instead of placeholder images
3. Check browser console for any errors

## Troubleshooting

### "Failed to fetch images from Google Drive"
- Verify service account email is correct
- Check that folder is shared with service account
- Ensure GOOGLE_DRIVE_FOLDER_ID is correct

### "Missing Google service account credentials"
- Verify GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are in `.env.local`
- Check for proper newline formatting in GOOGLE_PRIVATE_KEY (use `\n`)

### Images not appearing
- Check image MIME types (must be image/jpeg, image/png, etc.)
- Verify images are not in trash
- Check browser network tab for 403/404 errors on image URLs

### Wrong categories
- Rename folders to include keywords: "red-carpet", "champions", "music", "reception"
- Clear cache and refresh

## Production Deployment

When deploying to Vercel/production:

1. Add all three environment variables to your hosting platform
2. Keep the same values from `.env.local`
3. Ensure service account still has access to the Drive folder
4. Images will be cached at CDN edge for fast loading

## Security Notes

- Service account only has **Viewer** access (read-only)
- Only the specific folder you share is accessible
- No one can modify or delete files through this integration
- Private key should never be committed to git (already in `.gitignore`)
