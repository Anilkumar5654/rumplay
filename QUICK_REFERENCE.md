# Quick Reference Card

## 🚀 Quick Start (3 Steps)

```bash
# 1. Configure credentials
# Edit 'env' file with your Hostinger details

# 2. Setup database
# Run backend/schema.sql in phpMyAdmin

# 3. Test & Start
bun run test-setup.ts  # Test everything
bun start              # Start the app
```

## 🔧 Essential Commands

```bash
# Test setup
bun run test-setup.ts

# Start app
bun start

# Install dependencies
bun install

# Type check
bun tsc --noEmit
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `env` | Configuration (DB, FTP, URLs) |
| `backend/hono.ts` | Main API server |
| `backend/schema.sql` | Database schema |
| `backend/utils/hostingerUpload.ts` | FTP upload |
| `backend/utils/database.ts` | DB operations |
| `SETUP_INSTRUCTIONS.md` | Full setup guide |
| `test-setup.ts` | Setup verification |

## 🌐 API Endpoints

```
POST /api/auth/register      Register user
POST /api/auth/login         Login user  
GET  /api/auth/me            Get profile
POST /api/auth/logout        Logout

POST /api/video/upload       Upload video
POST /api/shorts/upload      Upload short
POST /api/upload             Generic upload

GET  /api/health             Health check
```

## 📊 Upload Paths

```
Videos:     /public_html/uploads/videos/
Shorts:     /public_html/uploads/shorts/
Thumbnails: /public_html/uploads/thumbnails/
Profiles:   /public_html/uploads/profiles/
Banners:    /public_html/uploads/banners/
```

## 🔐 Environment Variables

```env
# Database
DB_HOST=mysql.hostinger.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306

# FTP
HOSTINGER_FTP_HOST=ftp.yourdomain.com
HOSTINGER_FTP_USER=ftp_username
HOSTINGER_FTP_PASSWORD=ftp_password
HOSTINGER_FTP_PORT=21

# URLs
EXPO_PUBLIC_API_URL=https://yourdomain.com
PUBLIC_BASE_URL=https://yourdomain.com
```

## 📋 Hostinger Setup Checklist

- [ ] Create MySQL database
- [ ] Run schema.sql
- [ ] Create FTP account
- [ ] Create upload folders
- [ ] Set folder permissions (755)
- [ ] Enable SSL certificate
- [ ] Update env file
- [ ] Test connection

## 🗄️ Database Tables (13)

```
roles              User roles
users              User accounts
sessions           JWT tokens
channels           Creator channels
videos             Video metadata
video_likes        Video likes
video_comments     Video comments  
shorts             Short videos
short_likes        Short likes
short_comments     Short comments
subscriptions      Channel subscriptions
notifications      User notifications
earnings           Creator earnings
```

## 🧪 Test User Flow

```javascript
// 1. Register
POST /api/auth/register
{
  "email": "test@example.com",
  "username": "testuser",
  "displayName": "Test User",
  "password": "password123"
}

// 2. Upload Video
POST /api/video/upload
Headers: { Authorization: "Bearer TOKEN" }
FormData: {
  file: video.mp4,
  thumbnail: thumb.jpg,
  title: "My Video",
  description: "Description",
  category: "Technology",
  visibility: "public",
  tags[]: ["tag1", "tag2"]
}
```

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Database connection failed | Check DB credentials in env |
| FTP upload failed | Check FTP credentials, folder permissions |
| 401 Unauthorized | Login again, check token |
| File too large | Check file size limits in hono.ts |
| Upload folder not found | Create folders on Hostinger |

## 📞 Get Help

1. Read `SETUP_INSTRUCTIONS.md`
2. Run `bun run test-setup.ts`
3. Check console logs
4. Verify env file
5. Test in phpMyAdmin

## 🎯 Architecture

```
React Native App (Frontend)
        ↓
Node.js + Hono (Backend API)
        ↓
    ┌───┴───┐
    ↓       ↓
  MySQL   FTP
(Database) (Media)
```

## 📱 App Features

✅ User registration/login
✅ Video upload
✅ Short video upload  
✅ Channel management
✅ Video likes/comments
✅ Subscriptions
✅ Notifications
✅ User profiles
✅ Role-based access
✅ JWT authentication

## 🔒 Security

✅ Password hashing (scrypt)
✅ JWT sessions with expiration
✅ Input validation (Zod)
✅ SQL injection prevention
✅ File type/size validation
✅ CORS protection
✅ Token-based auth

## 📦 Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Node.js + Hono + tRPC
- **Database**: MySQL (Hostinger)
- **Storage**: FTP (Hostinger)
- **Auth**: JWT + Sessions
- **Validation**: Zod
- **Queries**: React Query

---

**Keep this card handy for quick reference!** 📌
