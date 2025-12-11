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
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

async function testSharedDrives() {
  const email = envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = envVars.GOOGLE_PRIVATE_KEY;
  const folderId = envVars.GOOGLE_DRIVE_FOLDER_ID;

  console.log('Testing Shared Drives Access...');
  console.log('Service Account:', email);
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
    // List all shared drives the service account has access to
    console.log('1. Checking Shared Drives access...');
    const sharedDrives = await drive.drives.list({
      pageSize: 100,
    });

    const drives = sharedDrives.data.drives || [];
    console.log(`✓ Service account has access to ${drives.length} Shared Drive(s):`);
    
    if (drives.length === 0) {
      console.log('');
      console.log('❌ No Shared Drives found!');
      console.log('');
      console.log('To fix:');
      console.log('1. Go to Google Drive → Shared drives');
      console.log('2. Right-click "434 Media Shared Drive" → Manage members');
      console.log('3. Add:', email);
      console.log('4. Role: Viewer (or Content Manager)');
      console.log('5. Wait 2-3 minutes for permissions to propagate');
      return;
    }

    drives.forEach((drive, i) => {
      console.log(`  ${i + 1}. ${drive.name} (ID: ${drive.id})`);
    });
    console.log('');

    // Now check if we can list files using the folder ID with supportsAllDrives
    console.log('2. Listing files in Rise of a Champion folder...');
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, driveId)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];
    console.log(`✓ Found ${files.length} items:`);
    
    if (files.length === 0) {
      console.log('');
      console.log('Folder is empty. Check that:');
      console.log('1. The "Rise of a Champion" folder contains files/subfolders');
      console.log('2. Files are not in trash');
      console.log('3. You\'re looking at the right folder:');
      console.log(`   https://drive.google.com/drive/folders/${folderId}`);
    } else {
      const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
      const images = files.filter(f => f.mimeType?.startsWith('image/'));
      
      console.log(`  📁 Folders: ${folders.length}`);
      folders.forEach(f => console.log(`    - ${f.name}`));
      
      console.log(`  🖼️  Images: ${images.length}`);
      images.forEach(f => console.log(`    - ${f.name}`));
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.code === 403) {
      console.log('');
      console.log('❌ Permission denied!');
      console.log('');
      console.log('This usually means:');
      console.log('1. Service account not added to Shared Drive as member');
      console.log('2. Workspace policy blocking external service accounts');
      console.log('3. Need "supportsAllDrives" parameter (will fix in code)');
    }
  }
}

testSharedDrives();
