# 🎯 Hostinger Upload Quick Reference

## 📤 Exact Files to Upload to Your Hostinger Server

Upload these files from your project's `api/` folder to your Hostinger at `/public_html/api/`:

### ✅ Core Files (Required)
```
api/
├── db.php                          ← Database connection & helper functions
├── health.php                      ← API health check endpoint
└── .htaccess                       ← CORS & PHP settings
```

### 🔐 Authentication Endpoints
```
api/auth/
├── login.php                       ← User login
├── register.php                    ← User registration
├── me.php                          ← Get current user info
└── logout.php                      ← User logout
```

### 🎥 Video Endpoints
```
api/video/
├── upload.php                      ← Upload video
├── list.php                        ← Get all videos
├── details.php                     ← Get single video details
├── like.php                        ← Like/unlike video
└── comment.php                     ← Add comment to video
```

### 🎬 Shorts Endpoints
```
api/shorts/
├── upload.php                      ← Upload short video
└── list.php                        ← Get all shorts
```

### 👤 User Endpoints
```
api/user/
├── profile.php                     ← Get user profile
└── uploads.php                     ← Get user's uploaded videos
```

### 👨‍💼 Admin Endpoints
```
api/admin/
├── users.php                       ← Manage users (admin only)
└── videos.php                      ← Manage videos (admin only)
```

---

## 📁 Create These Folders in Hostinger

Using Hostinger File Manager, create these folders at `/public_html/`:

```
uploads/
├── videos/                         ← Video files
├── thumbnails/                     ← Video thumbnails
├── profiles/                       ← User profile pictures
├── banners/                        ← Channel banners
└── shorts/                         ← Short videos
```

**Important:** Set all folders to **777 permissions** (writable)

---

## 🔧 .htaccess File Content

Create `/public_html/api/.htaccess` with this content:

```apache
# Enable CORS for React Native app
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Handle preflight OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# PHP Upload Settings
php_value upload_max_filesize 500M
php_value post_max_size 500M
php_value max_execution_time 300
php_value max_input_time 300
php_value memory_limit 256M

# JSON responses
AddDefaultCharset UTF-8
AddType application/json .json
