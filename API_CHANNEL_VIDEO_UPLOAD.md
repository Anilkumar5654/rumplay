# 🎥 Channel & Video Upload Integration Guide

## 🚀 What Changed

### Problem Solved
- ❌ **Before**: Video upload failed with foreign key constraint error
- ✅ **After**: Every user automatically gets a channel, video uploads work seamlessly

---

## 📋 Updated Backend APIs

### 1️⃣ **Registration** - `/api/auth/register`
**What's New**: Automatically creates a channel for new users

```php
// Auto-creates channel during registration
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}

// Response includes channel_id
{
  "success": true,
  "token": "session-token...",
  "user": {
    "id": "user-uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "channel_id": "channel-uuid",  // ✅ Now automatically created
    ...
  }
}
```

---

### 2️⃣ **Login** - `/api/auth/login`
**What's New**: Auto-creates channel for existing users (who don't have one)

```php
// Auto-creates channel if user doesn't have one
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response includes channel_id (created on-the-fly if missing)
{
  "success": true,
  "token": "session-token...",
  "user": {
    "id": "user-uuid",
    "username": "johndoe",
    "channel_id": "channel-uuid",  // ✅ Created automatically
    ...
  }
}
```

---

### 3️⃣ **Video Upload** - `/api/video/upload`
**What's New**: Uses user's `channel_id` from authentication

```php
POST /api/video/upload
Headers:
  Authorization: Bearer {token}
  Accept: application/json

Body (FormData):
  - video: (file) Video file
  - thumbnail: (file) Thumbnail image [optional]
  - title: (string) Video title [required]
  - description: (string) Video description
  - category: (string) Category (default: "Other")
  - tags: (string) Comma-separated tags
  - privacy: (string) "public"|"private"|"unlisted"|"scheduled"
  - is_short: (string) "0" or "1"

// Error if channel missing (should never happen now)
{
  "success": false,
  "error": "Channel not found. Please create a channel first."
}

// Success response
{
  "success": true,
  "video_id": "video-uuid",
  "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
  "thumbnail_url": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
  "message": "Video uploaded successfully"
}
```

---

### 4️⃣ **New: Auto-Create Channel** - `/api/channel/create-auto`
**Purpose**: Manual endpoint to create channel (for edge cases)

```php
POST /api/channel/create-auto
Headers:
  Authorization: Bearer {token}

// If channel already exists
{
  "success": true,
  "channel": {
    "id": "channel-uuid",
    "name": "johndoe's Channel",
    "handle": "@johndoe_abc123"
  },
  "message": "Channel already exists"
}

// If channel created
{
  "success": true,
  "channel": {
    "id": "channel-uuid",
    "name": "johndoe's Channel",
    "handle": "@johndoe_abc123",
    "description": "Welcome to my channel!"
  },
  "message": "Channel created successfully"
}
```

---

## 🗄️ Database Schema

### Updated Tables

#### **users** table
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  channel_id CHAR(36) NULL,  -- ✅ Links to channels table
  ...
);
```

#### **channels** table
```sql
CREATE TABLE channels (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  monetization JSON NOT NULL,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### **videos** table
```sql
CREATE TABLE videos (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel_id CHAR(36) NOT NULL,  -- ✅ Required field
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(1024) NOT NULL,
  ...
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);
```

---

## 🔄 Migration for Existing Users

If you have existing users without channels, run this SQL:

```sql
-- Option 1: Create channels for all users without one
DELIMITER $$
CREATE PROCEDURE create_missing_channels()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id CHAR(36);
    DECLARE v_username VARCHAR(64);
    DECLARE v_channel_id CHAR(36);
    DECLARE v_handle VARCHAR(100);
    
    DECLARE cur CURSOR FOR 
        SELECT id, username FROM users WHERE channel_id IS NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_user_id, v_username;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_channel_id = UUID();
        SET v_handle = CONCAT('@', LOWER(REGEXP_REPLACE(v_username, '[^a-zA-Z0-9]', '')), '_', SUBSTRING(v_channel_id, 1, 6));
        
        INSERT INTO channels (id, user_id, name, handle, description, monetization, created_at)
        VALUES (
            v_channel_id,
            v_user_id,
            CONCAT(v_username, "'s Channel"),
            v_handle,
            'Welcome to my channel!',
            JSON_ARRAY(),
            NOW()
        );
        
        UPDATE users SET channel_id = v_channel_id WHERE id = v_user_id;
    END LOOP;
    
    CLOSE cur;
END$$
DELIMITER ;

-- Run the procedure
CALL create_missing_channels();

-- Clean up
DROP PROCEDURE create_missing_channels;
```

---

## 📱 Frontend Integration

The frontend (`UploadModal.tsx`) already sends all required fields correctly:

```typescript
// FormData structure (already implemented)
const formData = new FormData();
formData.append("video", videoFile);
formData.append("thumbnail", thumbnailFile);
formData.append("title", uploadData.title);
formData.append("description", uploadData.description);
formData.append("category", uploadData.category);
formData.append("privacy", uploadData.visibility);  // "public", "private", etc.
formData.append("is_short", uploadData.isShort ? "1" : "0");
formData.append("tags", uploadData.tags.join(","));  // Comma-separated

// Backend automatically extracts channel_id from authenticated user
```

**No frontend changes needed!** The authentication system (`AuthContext.tsx`) already handles the `channel_id` field in the user object.

---

## ✅ Testing Steps

### 1. Test New User Registration
```bash
curl -X POST https://moviedbr.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "test123",
    "username": "newuser"
  }'

# ✅ Should return user with channel_id
```

### 2. Test Existing User Login
```bash
curl -X POST https://moviedbr.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existinguser@test.com",
    "password": "test123"
  }'

# ✅ Should auto-create channel if missing
```

### 3. Test Video Upload
```bash
# Get token from login/register
TOKEN="your-auth-token"

curl -X POST https://moviedbr.com/api/video/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumb.jpg" \
  -F "title=My Test Video" \
  -F "description=Test description" \
  -F "category=Technology" \
  -F "privacy=public" \
  -F "is_short=0" \
  -F "tags=test,demo,video"

# ✅ Should upload successfully with channel_id
```

---

## 🐛 Troubleshooting

### Issue: Foreign key constraint error
**Cause**: User doesn't have a channel
**Solution**: Login/logout to trigger auto-channel creation, or call `/api/channel/create-auto`

### Issue: Channel not created on registration
**Cause**: Database error or missing permissions
**Solution**: Check PHP error logs and ensure `channels` table exists

### Issue: Duplicate handle error
**Cause**: Username conflict generating handle
**Solution**: The system automatically appends UUID prefix to make it unique

---

## 🎯 Summary

✅ **Fixed Issues**:
1. Video upload foreign key constraint error
2. Missing channel for users
3. Automatic channel creation flow

✅ **New Features**:
1. Auto-create channel on registration
2. Auto-create channel on login (for existing users)
3. Manual channel creation endpoint

✅ **Zero Frontend Changes Required**:
- Frontend already sends correct FormData
- Backend extracts `channel_id` from authenticated user
- Everything works seamlessly

---

## 📂 File Structure

```
api/
├── auth/
│   ├── register.php          ✅ Updated - auto-creates channel
│   ├── login.php             ✅ Updated - auto-creates channel if missing
│   ├── me.php                (unchanged)
│   └── logout.php            (unchanged)
├── video/
│   └── upload.php            ✅ Updated - validates channel_id exists
├── channel/
│   └── create-auto.php       ✅ New - manual channel creation
└── db.php                    (unchanged)
```

---

## 🔒 Security Notes

1. ✅ Channel is tied to authenticated user
2. ✅ Foreign key constraints ensure data integrity
3. ✅ Users can only upload to their own channel
4. ✅ Handle uniqueness prevents conflicts
5. ✅ Automatic channel creation is secure and authenticated

---

## 📞 Support

If you encounter any issues:
1. Check PHP error logs: `/var/log/php-errors.log`
2. Verify database schema matches this guide
3. Test authentication endpoints first
4. Ensure `uploads/` directories are writable

**Need help?** Share the specific error message and we'll fix it together!
