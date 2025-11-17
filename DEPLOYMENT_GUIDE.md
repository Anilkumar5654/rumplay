# 🚀 Quick Setup Guide - Video Upload Fix

## ✅ What We Fixed
- **Problem**: Video upload failing with "foreign key constraint" error
- **Root Cause**: Users didn't have `channel_id`, but videos require valid `channel_id`
- **Solution**: Auto-create channels for all users (new & existing)

---

## 📦 Files to Upload to Your Server

Upload these files to your Hostinger public_html directory:

### 1. Updated Backend Files

```
public_html/
└── api/
    ├── auth/
    │   ├── login.php          ✅ REPLACE - Auto-creates channel on login
    │   └── register.php       ✅ REPLACE - Auto-creates channel on registration
    ├── video/
    │   └── upload.php         ✅ REPLACE - Validates channel exists
    └── channel/
        └── create-auto.php    ✅ NEW FILE - Manual channel creation
```

### 2. Create Directory Structure
```bash
# Create channel directory if it doesn't exist
mkdir -p public_html/api/channel
```

---

## 🗄️ Database Migration

### Step 1: Backup Your Database
```bash
# Run this in your Hostinger cPanel → phpMyAdmin → Export
# Or via SSH:
mysqldump -u your_user -p your_database > backup_before_migration.sql
```

### Step 2: Run Migration SQL

**Option A: Via phpMyAdmin**
1. Open phpMyAdmin
2. Select your database
3. Go to "SQL" tab
4. Copy and paste this:

```sql
-- Create channels for users without one
INSERT INTO channels (id, user_id, name, handle, description, monetization, created_at)
SELECT 
    UUID() as id,
    u.id as user_id,
    CONCAT(u.username, "'s Channel") as name,
    CONCAT('@', LOWER(REGEXP_REPLACE(u.username, '[^a-zA-Z0-9]', '')), '_', SUBSTRING(UUID(), 1, 6)) as handle,
    'Welcome to my channel!' as description,
    JSON_ARRAY() as monetization,
    NOW() as created_at
FROM users u
WHERE u.channel_id IS NULL
AND NOT EXISTS (SELECT 1 FROM channels c WHERE c.user_id = u.id);

-- Link users to their channels
UPDATE users u
INNER JOIN channels c ON c.user_id = u.id
SET u.channel_id = c.id
WHERE u.channel_id IS NULL;

-- Verify (should show 0 users_without_channels)
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN channel_id IS NOT NULL THEN 1 ELSE 0 END) as users_with_channels,
    SUM(CASE WHEN channel_id IS NULL THEN 1 ELSE 0 END) as users_without_channels
FROM users;
```

5. Click "Go"
6. Verify the results show all users have channels

**Option B: Via SSH**
```bash
mysql -u your_user -p your_database < backend/migrations/001_create_user_channels.sql
```

---

## 🧪 Testing After Deployment

### Test 1: New User Registration
```bash
curl -X POST https://moviedbr.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "username": "testuser"
  }'

# Expected: Success with channel_id in response
```

### Test 2: Existing User Login
```bash
curl -X POST https://moviedbr.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "password"
  }'

# Expected: Success with channel_id in response
```

### Test 3: Video Upload
1. Open your app
2. Login with any account
3. Try uploading a video
4. **Expected**: Upload succeeds without errors

---

## 🎯 Quick Verification Checklist

After deploying, verify these:

- [ ] ✅ File uploaded: `api/auth/register.php` (updated)
- [ ] ✅ File uploaded: `api/auth/login.php` (updated)
- [ ] ✅ File uploaded: `api/video/upload.php` (updated)
- [ ] ✅ File uploaded: `api/channel/create-auto.php` (new)
- [ ] ✅ SQL migration executed successfully
- [ ] ✅ All existing users have `channel_id` (check database)
- [ ] ✅ New user registration creates channel automatically
- [ ] ✅ Video upload works without errors

---

## 🔍 Troubleshooting

### Issue: "Channel not found" error on upload
**Solution**:
1. User needs to logout and login again
2. Or call: `POST /api/channel/create-auto` (requires auth token)

### Issue: Migration SQL fails
**Possible causes**:
- MySQL version doesn't support `UUID()` → Use `CONCAT(UUID(), '')` instead
- Syntax error → Run queries one by one
- Permission denied → Check MySQL user permissions

### Issue: Handle already exists
**Solution**: The handle generation includes UUID prefix to avoid conflicts, but if it still happens:
```sql
-- Fix duplicate handles
UPDATE channels 
SET handle = CONCAT(handle, '_', SUBSTRING(UUID(), 1, 4))
WHERE id IN (
    SELECT id FROM (
        SELECT id, handle, ROW_NUMBER() OVER (PARTITION BY handle ORDER BY created_at) as rn
        FROM channels
    ) t WHERE rn > 1
);
```

---

## 📊 Database Verification Queries

### Check Users Without Channels
```sql
SELECT username, email, channel_id 
FROM users 
WHERE channel_id IS NULL;
-- Expected: 0 rows
```

### Check All Channels
```sql
SELECT 
    u.username,
    c.name as channel_name,
    c.handle,
    c.created_at
FROM users u
INNER JOIN channels c ON c.id = u.channel_id
ORDER BY c.created_at DESC
LIMIT 20;
```

### Check Videos Without Valid Channels (Should be 0)
```sql
SELECT v.id, v.title, v.channel_id
FROM videos v
LEFT JOIN channels c ON c.id = v.channel_id
WHERE c.id IS NULL;
-- Expected: 0 rows
```

---

## 🚀 Deployment Steps Summary

1. **Backup database** ⚠️ Important!
2. **Upload updated PHP files** to your server
3. **Run migration SQL** in phpMyAdmin
4. **Verify** all users have channels
5. **Test** video upload in the app
6. **Done!** ✅

---

## 📝 What Happens Now

### For New Users (Register)
1. User registers → `POST /api/auth/register`
2. System creates user account
3. **System automatically creates channel**
4. System links `channel_id` to user
5. User can upload videos immediately

### For Existing Users (Login)
1. User logs in → `POST /api/auth/login`
2. System checks if user has `channel_id`
3. **If missing**: System creates channel automatically
4. User can upload videos

### For Video Upload
1. User uploads video → `POST /api/video/upload`
2. System gets `channel_id` from authenticated user
3. System validates `channel_id` exists
4. Video is saved with valid `channel_id`
5. **No more foreign key errors!** ✅

---

## 🎉 Benefits

✅ **Zero App Changes**: Frontend already works correctly
✅ **Automatic**: Channels created seamlessly
✅ **Backward Compatible**: Handles existing users
✅ **Secure**: Channel tied to authenticated user
✅ **No Errors**: Foreign key constraint satisfied

---

## 📞 Need Help?

If you encounter any issues:

1. **Check PHP error logs**: `/var/log/php-errors.log`
2. **Check database**: Verify schema and data
3. **Test endpoints**: Use curl commands above
4. **Share error**: Copy exact error message

---

## 📄 Related Documentation

- Full API documentation: `API_CHANNEL_VIDEO_UPLOAD.md`
- Migration script: `backend/migrations/001_create_user_channels.sql`
- Schema reference: `backend/schema.sql`
