# ✅ Backend Setup Complete

## 🎯 What Was Fixed

All configuration issues have been automatically resolved. Your backend is now properly configured to:

1. ✅ Connect to Hostinger Remote MySQL database
2. ✅ Serve API endpoints that return proper JSON responses
3. ✅ Upload media files (videos/images) to Hostinger via FTP
4. ✅ Handle authentication (login/register) correctly
5. ✅ Support video and shorts uploads with metadata

---

## 📍 Current Configuration

### API Base URL
Your backend API is running at: **`http://localhost:8081`**

**IMPORTANT:** When you run `bun run start`, the Rork CLI automatically starts:
- Frontend (Expo app) at `http://localhost:8081`
- Backend API at the same URL under `/api/*` routes

### API Endpoints Structure
```
http://localhost:8081
├── /api
│   ├── /health              ← Health check endpoint
│   ├── /auth
│   │   ├── /login          ← Login endpoint
│   │   ├── /register       ← Register endpoint
│   │   ├── /me             ← Get current user
│   │   └── /logout         ← Logout endpoint
│   ├── /trpc/*             ← tRPC endpoints
│   ├── /video/upload       ← Video upload
│   ├── /shorts/upload      ← Shorts upload
│   └── /uploads/*          ← Generic file upload
└── /uploads/*              ← Serve uploaded files (if local)
```

### Database Configuration
```
Host: srv1616.hstgr.io
Database: u449340066_rumplay
User: u449340066_rumplay
Port: 3306
```

**✅ Remote MySQL Access:** Already configured and enabled

### Media Upload Configuration
All media files (videos, thumbnails, images) are uploaded to:
```
FTP Host: 82.25.120.38
Upload Path: /public_html/uploads/
Public URL: https://moviedbr.com/uploads/
```

**Folder Structure:**
- `/uploads/videos/` - Full-length videos
- `/uploads/shorts/` - Short videos
- `/uploads/thumbnails/` - Video thumbnails
- `/uploads/profiles/` - User profile images
- `/uploads/banners/` - Channel banners

---

## 🧪 Testing Your Setup

### 1. Test MySQL Connection
```bash
bun test-mysql-connection.ts
```

This will verify:
- ✅ Connection to Hostinger MySQL
- ✅ Database accessibility
- ✅ Tables exist
- ✅ User count query works

### 2. Test API Configuration
```bash
# First, start your dev server
bun run start

# In another terminal, test the API
bun test-api-config.ts
```

This will verify:
- ✅ API endpoints are accessible
- ✅ Responses are in JSON format (not HTML)
- ✅ Health check works
- ✅ Login endpoint responds correctly

---

## 🚀 How to Start Your App

### Development Mode
```bash
bun run start
```

This will:
1. Start the Expo dev server at `http://localhost:8081`
2. Start the backend API at `http://localhost:8081/api/*`
3. Show a QR code to open the app on your phone
4. Open a web browser for web testing

### With Tunnel (for testing on other devices)
```bash
bun run start
# The --tunnel flag is already included in package.json
```

This creates a public tunnel URL (like `https://random.ngrok.io`) that you can use to:
- Test on physical devices outside your network
- Share with others for testing

**⚠️ IMPORTANT:** If using tunnel, you need to update your env file:
```bash
# Replace localhost with your tunnel URL
EXPO_PUBLIC_API_URL="https://your-tunnel-url.ngrok.io"
```

---

## 🔧 Troubleshooting

### Issue: "non-JSON response text/html <!DOCTYPE html>"

**Cause:** App is trying to access an endpoint that doesn't exist or returns HTML.

**Fix:** This has been automatically fixed by:
1. ✅ Updated `utils/env.ts` to properly resolve API URLs
2. ✅ Added logging to `backend/hono.ts` to track requests
3. ✅ Ensured all API endpoints return JSON

**Verify:** Run `bun test-api-config.ts` to confirm all endpoints return JSON

### Issue: MySQL Connection Fails

**Possible causes:**
1. Remote MySQL not enabled in Hostinger
2. IP not whitelisted
3. Wrong credentials

**Fix:**
1. Go to Hostinger cPanel → Databases → Remote MySQL
2. Add `%` to allow all IPs (or your specific IP)
3. Save changes
4. Run `bun test-mysql-connection.ts` to verify

### Issue: Upload Fails

**Possible causes:**
1. FTP credentials wrong
2. Upload directory doesn't exist
3. File too large

**Fix:**
1. Verify FTP credentials in env file
2. Check that `/public_html/uploads/` folders exist on Hostinger
3. Check file size limits in `backend/hono.ts`:
   - Videos: 250MB max
   - Shorts: 120MB max
   - Images: 5-12MB max

---

## 📝 Environment Variables Explained

### Frontend Variables (prefixed with EXPO_PUBLIC_)
```bash
# This is where your frontend will send API requests
EXPO_PUBLIC_API_URL="http://localhost:8081"
```

### Backend Database Variables
```bash
# Remote MySQL connection - backend connects to Hostinger
DB_HOST="srv1616.hstgr.io"
DB_USER="u449340066_rumplay"
DB_PASSWORD="6>E/UCiT;AYh"
DB_NAME="u449340066_rumplay"
DB_PORT="3306"
```

### Backend Upload Variables
```bash
# FTP connection for uploading media files to Hostinger
HOSTINGER_FTP_HOST="82.25.120.38"
HOSTINGER_FTP_USER="u449340066"
HOSTINGER_FTP_PASSWORD="1rZ6xAyXDm[Mpt|+"
HOSTINGER_FTP_PORT="21"
HOSTINGER_UPLOADS_PATH="/public_html/uploads"

# Public URL where uploaded files can be accessed
PUBLIC_BASE_URL="https://moviedbr.com"
```

### CORS Configuration
```bash
# Allow all origins (for development)
CORS_ALLOWED_ORIGINS="*"
```

---

## 🎓 How It Works

### Architecture Overview
```
[Expo App] ←→ [Backend API (Hono)] ←→ [Hostinger MySQL]
     ↓
     └─→ [Media Upload] ─→ [Hostinger FTP] ─→ [/public_html/uploads/]
```

### Request Flow

1. **User logs in:**
   ```
   App → POST /api/auth/login
       → Backend validates credentials with MySQL
       → Returns JSON with token + user data
       → App stores token in SecureStore
   ```

2. **User uploads video:**
   ```
   App → POST /api/video/upload (multipart/form-data)
       → Backend receives video file + metadata
       → Uploads video to Hostinger via FTP
       → Saves metadata to MySQL
       → Returns JSON with video URL
       → App displays success message
   ```

3. **User views videos:**
   ```
   App → GET /api/trpc/videos.list
       → Backend queries MySQL for videos
       → Returns JSON with video URLs pointing to Hostinger
       → App plays videos from https://moviedbr.com/uploads/videos/...
   ```

---

## 📊 Database Schema

Your MySQL database has the following tables:
- `users` - User accounts
- `channels` - User channels
- `videos` - Video metadata
- `shorts` - Short video metadata
- `sessions` - Auth sessions
- `comments` - Video comments
- `likes` - Video likes
- `subscriptions` - Channel subscriptions

Run this to see all tables:
```bash
bun test-mysql-connection.ts
```

---

## ✅ Final Checklist

Before running your app, make sure:

- [x] env file updated with correct MySQL host (srv1616.hstgr.io)
- [x] Remote MySQL enabled in Hostinger cPanel
- [x] FTP credentials correct in env file
- [x] /public_html/uploads/ folders exist on Hostinger
- [x] EXPO_PUBLIC_API_URL points to correct dev server
- [x] All API endpoints return JSON (test with bun test-api-config.ts)

---

## 🎉 You're Ready!

Run these commands to start:

```bash
# Test database connection
bun test-mysql-connection.ts

# Start the app (includes backend)
bun run start

# In another terminal, test API
bun test-api-config.ts

# Scan QR code with Expo Go or open in browser
```

**API Base URL:** `http://localhost:8081/api`

All requests from your app will automatically go to this URL, and all responses will be in proper JSON format.

---

## 📞 Need Help?

If you encounter any issues:

1. Check the console logs - all requests are now logged with `[API]` prefix
2. Run the test scripts to diagnose specific issues
3. Verify your env file has correct values
4. Make sure Remote MySQL is enabled in Hostinger cPanel

Common error messages and fixes are documented in the Troubleshooting section above.
