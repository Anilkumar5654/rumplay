# 📦 Hostinger Upload Checklist

## 🎯 Files to Upload to Hostinger

### 1️⃣ API Files (Priority: HIGH)

**Location on Server**: `public_html/api/`

**Files to Upload**:
```
api/
├── .htaccess                    ← Upload this first!
├── db.php                       ← Database connection
├── health.php                   ← Health check endpoint
├── auth/
│   ├── login.php
│   ├── register.php
│   ├── me.php
│   └── logout.php
├── video/
│   ├── upload.php
│   ├── list.php
│   ├── details.php
│   ├── like.php
│   └── comment.php
├── shorts/
│   ├── upload.php
│   └── list.php
├── user/
│   ├── profile.php
│   └── uploads.php
└── admin/
    ├── users.php
    └── videos.php
```

**How to Upload**:
1. Login to Hostinger File Manager
2. Navigate to `public_html/`
3. Click "Upload" button
4. Select all files from your local `api/` folder
5. Maintain the folder structure

---

### 2️⃣ Create Upload Directories (Priority: HIGH)

**Location on Server**: `public_html/uploads/`

**Folders to Create**:
```
uploads/
├── videos/         (for video files)
├── thumbnails/     (for video thumbnails)
├── shorts/         (for short videos)
├── profile/        (for profile pictures)
└── channel/        (for channel banners)
```

**How to Create**:
1. In File Manager, go to `public_html/`
2. Click "New Folder"
3. Name it: `uploads`
4. Open `uploads` folder
5. Create 5 subfolders as shown above
6. **Important**: Set permissions to 755 for all folders
   - Right-click folder → Permissions → 755

---

### 3️⃣ Database Setup (Priority: HIGH)

**Step 1: Access phpMyAdmin**
1. Login to Hostinger control panel
2. Go to "Databases" → "phpMyAdmin"
3. Select database: `u449340066_rumplay`

**Step 2: Import Schema**
1. Click "Import" tab
2. Click "Choose File"
3. Select: `backend/schema.sql` from your local project
4. Scroll down and click "Go"
5. Wait for success message

**Step 3: Verify Tables**
Run this SQL query:
```sql
SHOW TABLES;
```

Expected output (14 tables):
```
channels
earnings
notifications
roles
sessions
short_comments
short_likes
shorts
subscriptions
users
video_comments
video_likes
videos
```

---

### 4️⃣ Verify API Configuration

**Check db.php**:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'u449340066_rumplay');
define('DB_PASS', '6>E/UCiT;AYh');
define('DB_NAME', 'u449340066_rumplay');
```

**✅ This is correct!** (localhost is correct for Hostinger shared hosting)

---

### 5️⃣ Test API Health

**Method 1: Browser**
```
https://moviedbr.com/api/health.php
```

**Method 2: Command Line**
```bash
curl https://moviedbr.com/api/health.php
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Rumplay API is working",
  "database": "connected",
  "timestamp": "2025-01-17 12:00:00",
  "server": "MovieDBR.com"
}
```

**If you get HTML instead of JSON**:
- Check that files are in correct location
- Verify .htaccess is uploaded
- Check file permissions (644 for files, 755 for directories)

---

## 🔐 File Permissions Guide

### Recommended Permissions:
```
Directories: 755
PHP Files: 644
.htaccess: 644
Upload folders: 755
```

### How to Set:
1. Right-click file/folder in File Manager
2. Click "Permissions"
3. Enter the permission number
4. Click "Change"

---

## ✅ Verification Checklist

Before testing the app:

### Backend (Hostinger)
- [ ] All API files uploaded to `public_html/api/`
- [ ] .htaccess file uploaded
- [ ] Upload directories created with 755 permissions
- [ ] Database schema imported (14 tables)
- [ ] Health check returns JSON success
- [ ] File permissions set correctly

### Local Setup
- [ ] `env` file has correct API URL
- [ ] Development server starts without errors
- [ ] Expo Go app installed on phone
- [ ] Phone has internet connection

---

## 🚀 Quick Upload Commands

### Using FTP (Alternative Method)
If File Manager is slow, you can use FTP:

```bash
# Connection details
Host: ftp://82.25.120.38
User: u449340066
Pass: 1rZ6xAyXDm[Mpt|+
Port: 21

# Upload path
Remote directory: /public_html/api/
```

**FTP Clients**:
- FileZilla (Windows/Mac/Linux)
- Cyberduck (Mac)
- WinSCP (Windows)

---

## 🐛 Troubleshooting

### Issue: "500 Internal Server Error"
**Solutions**:
1. Check file permissions (should be 644 for PHP files)
2. Check .htaccess syntax
3. Check PHP error logs in Hostinger panel
4. Verify database credentials in db.php

### Issue: "Database connection failed"
**Solutions**:
1. Verify DB_HOST is "localhost"
2. Check database credentials are correct
3. Verify database exists in phpMyAdmin
4. Check if tables are imported

### Issue: "CORS error"
**Solutions**:
1. Verify .htaccess is uploaded
2. Check CORS headers in db.php
3. Clear browser cache
4. Restart Expo dev server

### Issue: "Upload folder not found"
**Solutions**:
1. Verify folders exist: `public_html/uploads/videos/`
2. Check permissions are 755
3. Test write access with a test file

---

## 📝 Upload Progress Tracker

Track your progress:

### API Files
- [ ] db.php
- [ ] .htaccess
- [ ] health.php
- [ ] auth/login.php
- [ ] auth/register.php
- [ ] auth/me.php
- [ ] auth/logout.php
- [ ] video/upload.php
- [ ] video/list.php
- [ ] video/details.php
- [ ] video/like.php
- [ ] video/comment.php
- [ ] shorts/upload.php
- [ ] shorts/list.php
- [ ] user/profile.php
- [ ] user/uploads.php
- [ ] admin/users.php
- [ ] admin/videos.php

### Directories
- [ ] public_html/uploads/
- [ ] public_html/uploads/videos/
- [ ] public_html/uploads/thumbnails/
- [ ] public_html/uploads/shorts/
- [ ] public_html/uploads/profile/
- [ ] public_html/uploads/channel/

### Database
- [ ] Schema imported
- [ ] Tables verified (14 tables)
- [ ] Connection tested

### Testing
- [ ] Health check works
- [ ] Can register user
- [ ] Can login
- [ ] Can upload video

---

## 🎯 After Upload

Once everything is uploaded:

### 1. Test Health Endpoint
```bash
curl https://moviedbr.com/api/health.php
```

### 2. Start Local Dev Server
```bash
bun start
```

### 3. Test on Mobile
- Scan QR code with Expo Go
- Try registering an account
- Try uploading a video

---

## 📞 Quick Reference

### Hostinger Details
```
Domain: https://moviedbr.com
Database: u449340066_rumplay
DB User: u449340066_rumplay
DB Host: localhost
```

### API Endpoints
```
Health: /api/health.php
Login: /api/auth/login.php
Register: /api/auth/register.php
Upload: /api/video/upload.php
```

### Upload Paths
```
API: /public_html/api/
Uploads: /public_html/uploads/
Videos: /public_html/uploads/videos/
```

---

## ✨ You're Almost There!

Follow this checklist step by step and your app will be ready for testing.

**Estimated Time**: 15-20 minutes

**Next**: Once complete, go to `START_HERE_TESTING.md` to begin testing!

🚀 **Let's get your app online!**
