const { google } = require('googleapis');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

async function testDriveAccess() {
  const email = envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = envVars.GOOGLE_PRIVATE_KEY;
  const folderId = envVars.GOOGLE_DRIVE_FOLDER_ID;

  console.log('Testing Google Drive Access...');
  console.log('Service Account:', email);
  console.log('Folder ID:', folderId);
  console.log('');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Skip folder validation, go straight to listing (List API works, Get API doesn't)
    console.log('Listing files in folder...');
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size)',
      pageSize: 100,
    });

    const files = response.data.files || [];
    console.log(`✓ Found ${files.length} items (files + folders):`);
    
    const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const images = files.filter(f => f.mimeType?.startsWith('image/'));
    const others = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder' && !f.mimeType?.startsWith('image/'));
    
    console.log(`  📁 Folders: ${folders.length}`);
    folders.forEach(f => console.log(`    - ${f.name}`));
    
    console.log(`  🖼️  Images: ${images.length}`);
    images.forEach(f => console.log(`    - ${f.name}`));
    
    if (others.length > 0) {
      console.log(`  📄 Other files: ${others.length}`);
      others.forEach(f => console.log(`    - ${f.name} (${f.mimeType})`));
    }

    if (files.length === 0) {
      console.log('');
      console.log('⚠️  Folder is empty or service account lacks permissions');
      console.log('');
      console.log('Next steps:');
      console.log('1. Make sure folder contains files');
      console.log('2. Share folder with:', email);
      console.log('3. Grant "Viewer" access');
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.code === 404) {
      console.log('');
      console.log('⚠️  Folder not found or not shared with service account');
      console.log('');
      console.log('To fix:');
      console.log('1. Open Google Drive folder');
      console.log('2. Right-click → Share');
      console.log('3. Add:', email);
      console.log('4. Role: Viewer');
    }
  }
}

testDriveAccess();
