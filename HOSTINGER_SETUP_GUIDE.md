# 🚀 Rumplay Hostinger Setup Guide

## 📋 Overview
Aapka Rumplay app ab **https://MovieDBR.com/** par fully work karega. Yeh guide aapko step-by-step batayega ki apne Hostinger server par kya setup karna hai.

---

## 🎯 Setup Requirements

### 1. Database Setup (MySQL)
Apne Hostinger MySQL mein yeh database already create ho gaya hai:
- **Database Name:** `u449340066_rumplay`
- **Username:** `u449340066_rumplay`
- **Password:** `6>E/UCiT;AYh`
- **Host:** `localhost` (server par) ya `srv1616.hstgr.io` (remote)

---

## 📁 Hostinger Folder Structure

Apke Hostinger server par yeh folder structure hona chahiye:

```
/public_html/
├── api/                    # All API endpoints
│   ├── db.php             # Database connection
│   ├── auth/
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── me.php
│   │   └── logout.php
│   ├── video/
│   │   ├── upload.php
│   │   ├── list.php
│   │   ├── details.php
│   │   ├── like.php
│   │   └── comment.php
│   ├── shorts/
│   │   ├── upload.php
│   │   └── list.php
│   ├── user/
│   │   ├── profile.php
│   │   └── uploads.php
│   └── admin/
│       ├── users.php
│       └── videos.php
│
├── uploads/                # Media files storage
│   ├── videos/
│   ├── thumbnails/
│   ├── profiles/
│   ├── banners/
│   └── shorts/
│
└── index.html             # Optional: Landing page
```

---

## 🗄️ Database Schema Setup

### Step 1: PhpMyAdmin Access
1. Hostinger hPanel login karein
2. **Databases** → **phpMyAdmin** par jayein
3. Database `u449340066_rumplay` select karein

### Step 2: Run SQL Schema
Yeh SQL script run karein (already provided in `backend/schema.sql`):

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  role VARCHAR(64) NOT NULL DEFAULT 'user',
  profile_pic VARCHAR(512) NULL,
  bio TEXT NULL,
  channel_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  video_url VARCHAR(1024) NOT NULL,
  thumbnail VARCHAR(1024) NOT NULL,
  privacy ENUM('public','private','unlisted') DEFAULT 'public',
  views BIGINT DEFAULT 0,
  likes INT DEFAULT 0,
  duration INT DEFAULT 0,
  category VARCHAR(128) NOT NULL,
  tags JSON NOT NULL,
  is_short TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table (for auth)
CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(96) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shorts table
CREATE TABLE IF NOT EXISTS shorts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel_id CHAR(36) NOT NULL,
  short_url VARCHAR(1024) NOT NULL,
  thumbnail VARCHAR(1024) NOT NULL,
  description TEXT NOT NULL,
  views BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📤 Upload PHP Files to Hostinger

### Using File Manager:
1. Hostinger hPanel → **File Manager**
2. `/public_html/` mein jayein
3. `api/` folder create karein
4. Is project ke `api/` folder ke saare PHP files upload karein

### Important Files to Upload:
```
api/db.php                    ✅ Already configured with your DB credentials
api/auth/login.php           ✅ Login endpoint
api/auth/register.php        ✅ Register endpoint
api/video/upload.php         ✅ Video upload endpoint
api/video/list.php           ✅ Get videos list
(... and all other PHP files from api/ folder)
```

---

## 🔧 Configuration Files

### 1. Update `api/db.php` (Already Done ✅)
```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'u449340066_rumplay');
define('DB_PASS', '6>E/UCiT;AYh');
define('DB_NAME', 'u449340066_rumplay');
?>
```

### 2. Create Uploads Folders
File Manager mein manually create karein:
```
/public_html/uploads/videos/
/public_html/uploads/thumbnails/
/public_html/uploads/profiles/
/public_html/uploads/banners/
/public_html/uploads/shorts/
```

**Important:** Folders ko **777** permissions dein (writable)

---

## 🔐 .htaccess Configuration

`/public_html/api/.htaccess` file create karein:

```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Handle OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Pretty URLs (optional)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# PHP settings
php_value upload_max_filesize 500M
php_value post_max_size 500M
php_value max_execution_time 300
php_value memory_limit 256M
```

---

## 🧪 Testing Your Setup

### Test 1: Database Connection
Visit: `https://moviedbr.com/api/health.php`

Expected response:
```json
{
  "success": true,
  "message": "API is working",
  "database": "connected"
}
```

### Test 2: Register User
```bash
curl -X POST https://moviedbr.com/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "abc123...",
  "user": { ... }
}
```

### Test 3: Login
```bash
curl -X POST https://moviedbr.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

---

## 📱 App Configuration (Already Done ✅)

Your app's `env` file has been updated:
```env
EXPO_PUBLIC_API_URL="https://moviedbr.com"
PUBLIC_BASE_URL="https://moviedbr.com"
```

---

## 🎥 API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login.php` | POST | User login |
| `/api/auth/register.php` | POST | User registration |
| `/api/auth/me.php` | GET | Get current user |
| `/api/auth/logout.php` | POST | Logout user |
| `/api/video/upload.php` | POST | Upload video |
| `/api/video/list.php` | GET | Get videos list |
| `/api/video/details.php` | GET | Get video details |
| `/api/video/like.php` | POST | Like/unlike video |
| `/api/video/comment.php` | POST | Add comment |
| `/api/shorts/upload.php` | POST | Upload short |
| `/api/shorts/list.php` | GET | Get shorts list |
| `/api/user/profile.php` | GET | Get user profile |

---

## 🐛 Troubleshooting

### Issue 1: "Database connection failed"
- Check MySQL credentials in `api/db.php`
- Verify database exists in phpMyAdmin
- Check remote MySQL access (if needed)

### Issue 2: "500 Internal Server Error"
- Check PHP error logs in Hostinger
- Verify file permissions (755 for PHP files)
- Check .htaccess syntax

### Issue 3: "CORS error"
- Verify .htaccess CORS headers
- Check `api/db.php` CORS headers

### Issue 4: File upload fails
- Check folder permissions (777)
- Verify PHP upload limits in .htaccess
- Check available disk space

---

## ✅ Checklist

- [ ] Database schema imported in phpMyAdmin
- [ ] All PHP files uploaded to `/public_html/api/`
- [ ] `api/db.php` configured with correct credentials
- [ ] Upload folders created with 777 permissions
- [ ] `.htaccess` file created in `/public_html/api/`
- [ ] Test API health endpoint
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test video upload endpoint
- [ ] App configured with `EXPO_PUBLIC_API_URL`

---

## 🎉 Done!

Aapka Rumplay app ab fully functional hai! App kholen aur test karen:
1. Register new account
2. Login
3. Upload video/short
4. Browse videos
5. Like, comment, share

**Support:** Agar koi issue ho to error logs check karein aur specific error share karein.

---

## 📞 Quick Commands

### Create test user directly in database:
```sql
INSERT INTO users (id, username, name, email, password_hash, password_salt, role)
VALUES (
  UUID(),
  'admin',
  'Admin User',
  'admin@moviedbr.com',
  SHA2(CONCAT('Admin@123', 'testsalt'), 256),
  'testsalt',
  'admin'
);
```

### Check if tables exist:
```sql
SHOW TABLES;
```

### View users:
```sql
SELECT id, username, email, role, created_at FROM users;
```

---

**Last Updated:** $(date)
**App Version:** 1.0.0
**Server:** https://MovieDBR.com/
