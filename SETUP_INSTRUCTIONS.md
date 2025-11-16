# Complete Setup Instructions

## Architecture Overview

Your application now uses this architecture:
- **Frontend APIs**: Managed in `backend/` folder (Node.js + Hono + tRPC)
- **Media Storage**: Files uploaded to Hostinger server at `/public_html/uploads/`
- **Database**: MySQL on Hostinger
- **Authentication**: JWT tokens with session management

## Step 1: Configure Environment Variables

Edit the `env` file in your project root with your Hostinger credentials:

```env
# Frontend API Base URL
EXPO_PUBLIC_API_URL="https://moviedbr.com"

# Backend Database Configuration (Hostinger MySQL)
DB_HOST="your_hostinger_mysql_host.mysql.db"
DB_USER="your_database_username"
DB_PASSWORD="your_database_password"
DB_NAME="your_database_name"
DB_PORT="3306"

# Hostinger FTP/SFTP Configuration for Media Uploads
HOSTINGER_FTP_HOST="ftp.moviedbr.com"
HOSTINGER_FTP_USER="your_ftp_username"
HOSTINGER_FTP_PASSWORD="your_ftp_password"
HOSTINGER_FTP_PORT="21"
HOSTINGER_UPLOADS_PATH="/public_html/uploads"

# Public Base URL for uploaded files
PUBLIC_BASE_URL="https://moviedbr.com"

# CORS Configuration
CORS_ALLOWED_ORIGINS="*"
```

### How to Get Hostinger Credentials:

1. **MySQL Database Credentials:**
   - Login to Hostinger Control Panel
   - Go to: Databases → MySQL Databases
   - Find your database details:
     - Host: Usually `mysql.hostinger.com` or similar
     - Username: Your database username
     - Password: Your database password
     - Database Name: Your database name

2. **FTP Credentials:**
   - Login to Hostinger Control Panel
   - Go to: Files → FTP Accounts
   - Use existing FTP account or create new one
   - Get: Host, Username, Password, Port (usually 21)

## Step 2: Setup MySQL Database

1. Login to Hostinger Control Panel → Databases → phpMyAdmin

2. Select your database and run the SQL schema from `backend/schema.sql`:

```sql
-- Copy and paste the entire content from backend/schema.sql
-- This will create all required tables:
-- - roles
-- - users
-- - channels
-- - videos
-- - video_likes
-- - video_comments
-- - shorts
-- - short_likes
-- - short_comments
-- - subscriptions
-- - notifications
-- - earnings
-- - sessions
```

3. Verify tables are created:
```sql
SHOW TABLES;
```

You should see all 13 tables listed.

## Step 3: Create Upload Folders on Hostinger

1. Login to Hostinger Control Panel → Files → File Manager

2. Navigate to `/public_html/`

3. Create the following folder structure:
```
/public_html/
  └── uploads/
      ├── videos/
      ├── shorts/
      ├── thumbnails/
      ├── profiles/
      └── banners/
```

4. Set folder permissions to `755` (rwxr-xr-x) for all upload folders

## Step 4: Install Dependencies

Run the following command in your project root:

```bash
bun install
```

This will install all required packages including:
- `basic-ftp` - For uploading files to Hostinger
- `mysql2` - For MySQL database connection
- All other existing dependencies

## Step 5: Test Database Connection

Create a test file `test-db-connection.js`:

```javascript
import { getPool } from './backend/utils/mysqlClient.ts';

async function testConnection() {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful:', rows);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
bun test-db-connection.js
```

## Step 6: Test FTP Upload

Create a test file `test-ftp-upload.js`:

```javascript
import { uploadToHostinger } from './backend/utils/hostingerUpload.ts';
import { readFileSync } from 'fs';

async function testUpload() {
  try {
    const testBuffer = Buffer.from('Test file content');
    const result = await uploadToHostinger(
      testBuffer,
      'thumbnails',
      'test-file.txt'
    );
    
    if (result.success) {
      console.log('✅ FTP upload successful:', result.url);
    } else {
      console.error('❌ FTP upload failed:', result.error);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ FTP test error:', error);
    process.exit(1);
  }
}

testUpload();
```

Run it:
```bash
bun test-ftp-upload.js
```

## Step 7: Start the Application

### Development Mode:

```bash
# Start Expo app
bun start
```

The backend API will automatically start when you run the Expo app.

### Access the App:

- **Web**: Press `w` in the terminal
- **Android**: Press `a` (requires Android emulator or device)
- **iOS**: Press `i` (requires iOS simulator, Mac only)
- **Scan QR**: Use Expo Go app on your mobile device

## Step 8: Test Core Features

### Test Registration:

1. Open the app
2. Navigate to Register screen
3. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Display Name: `Test User`
   - Password: `password123`
4. Click Register

**Expected Result**: User created in database, JWT token returned, logged in automatically

### Test Login:

1. Navigate to Login screen
2. Enter registered credentials
3. Click Login

**Expected Result**: JWT token received, user data loaded

### Test Video Upload:

1. Login to the app
2. Click Upload button (+ icon in tabs)
3. Select or record a video
4. Fill in:
   - Title: "My Test Video"
   - Description: "Testing upload"
   - Category: Select any
   - Tags: Add some tags
5. Click Upload

**Expected Result**: 
- Video uploaded to `https://moviedbr.com/uploads/videos/`
- Thumbnail uploaded to `https://moviedbr.com/uploads/thumbnails/`
- Video record created in database
- Channel auto-created for user if needed

### Test Short Upload:

1. Upload a video under 60 seconds
2. Follow same process as video upload

**Expected Result**:
- Short uploaded to `https://moviedbr.com/uploads/shorts/`
- Short record created in database

## API Endpoints

Your backend now exposes these endpoints:

### Authentication:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### File Uploads:
- `POST /api/upload` - Generic file upload
- `POST /api/video/upload` - Video upload with metadata
- `POST /api/shorts/upload` - Short video upload

### Health Check:
- `GET /api/health` - Check if API is running

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**
1. Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `env` file
2. Check if MySQL service is running on Hostinger
3. Verify database exists and credentials are correct
4. Test connection from phpMyAdmin first

### Issue: FTP Upload Failed

**Solution:**
1. Verify FTP credentials in `env` file
2. Test FTP connection with FileZilla or similar client
3. Check if upload folders exist on server
4. Verify folder permissions are set to `755`
5. Check FTP logs in Hostinger panel

### Issue: 401 Unauthorized on Upload

**Solution:**
1. Ensure you're logged in
2. Check if JWT token is being sent in Authorization header
3. Verify session exists in database
4. Token might be expired - login again

### Issue: Upload folder not found

**Solution:**
1. Login to Hostinger File Manager
2. Navigate to `/public_html/uploads/`
3. Create missing folders: videos, shorts, thumbnails, profiles, banners
4. Set permissions to `755`

### Issue: Video URL not accessible

**Solution:**
1. Verify `PUBLIC_BASE_URL` in `env` matches your domain
2. Check if file exists in Hostinger File Manager
3. Test direct URL in browser: `https://moviedbr.com/uploads/videos/filename.mp4`
4. Verify folder permissions allow public read access

## Database Verification Queries

Run these in phpMyAdmin to verify data:

```sql
-- Check users
SELECT id, username, email, role FROM users;

-- Check channels
SELECT id, name, handle, user_id FROM channels;

-- Check videos
SELECT id, title, video_url, thumbnail, user_id FROM videos;

-- Check shorts
SELECT id, short_url, thumbnail, user_id FROM shorts;

-- Check sessions
SELECT token, user_id, expires_at FROM sessions WHERE expires_at > NOW();
```

## Security Notes

1. **Never commit the `env` file** - It contains sensitive credentials
2. **Use strong passwords** - For database and FTP accounts
3. **Enable HTTPS** - Ensure your domain has SSL certificate
4. **Limit FTP access** - Create dedicated FTP user for uploads only
5. **Regular backups** - Backup database and media files regularly

## File Structure Overview

```
your-project/
├── backend/                    # Backend API code
│   ├── hono.ts                # Main API server
│   ├── schema.sql             # Database schema
│   ├── utils/
│   │   ├── database.ts        # Database operations
│   │   ├── mysqlClient.ts     # MySQL connection
│   │   └── hostingerUpload.ts # FTP upload utility
│   └── trpc/                  # tRPC routes
├── env                         # Environment variables (DO NOT COMMIT)
├── components/
│   └── UploadModal.tsx        # Video upload UI
└── app/                       # Expo app screens
```

## Next Steps

1. ✅ Complete environment setup
2. ✅ Test database connection
3. ✅ Test FTP uploads
4. ✅ Test user registration
5. ✅ Test video upload
6. Deploy app to production
7. Setup monitoring and analytics
8. Implement video processing (transcoding, etc.)
9. Add CDN for faster video delivery
10. Implement video recommendations

## Support

If you encounter any issues:

1. Check console logs for detailed error messages
2. Verify all environment variables are correct
3. Test each component individually (DB, FTP, Auth)
4. Check Hostinger control panel for service status
5. Review this guide again

## Production Deployment

When ready for production:

1. Update `EXPO_PUBLIC_API_URL` to production domain
2. Update `CORS_ALLOWED_ORIGINS` to specific domains
3. Enable Hostinger SSL certificate
4. Setup automated database backups
5. Implement error monitoring (Sentry, etc.)
6. Setup CDN for media files (Cloudflare, etc.)
7. Optimize video delivery with HLS/DASH
8. Implement rate limiting on API endpoints

---

**Congratulations! Your YouTube-like app is now fully configured and ready to use!** 🎉
