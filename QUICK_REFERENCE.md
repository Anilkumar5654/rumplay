# ⚡ Quick Reference Card - Video Upload Fix

## 🎯 Problem & Solution (One Liner)
**Problem**: Video upload fails with FK constraint error (missing channel_id)  
**Solution**: Auto-create channels for all users on register/login

---

## 📦 Files Changed (4 files)

| File | Action | What It Does |
|------|--------|-------------|
| `api/auth/register.php` | ✏️ REPLACE | Auto-creates channel on registration |
| `api/auth/login.php` | ✏️ REPLACE | Auto-creates channel on login (if missing) |
| `api/video/upload.php` | ✏️ REPLACE | Validates channel exists before upload |
| `api/channel/create-auto.php` | ➕ NEW | Manual channel creation endpoint |

---

## 🗄️ Database Migration (Copy-Paste)

```sql
-- Run this in phpMyAdmin SQL tab
INSERT INTO channels (id, user_id, name, handle, description, monetization, created_at)
SELECT 
    UUID() as id, u.id as user_id,
    CONCAT(u.username, "'s Channel") as name,
    CONCAT('@', LOWER(REGEXP_REPLACE(u.username, '[^a-zA-Z0-9]', '')), '_', SUBSTRING(UUID(), 1, 6)) as handle,
    'Welcome to my channel!' as description,
    JSON_ARRAY() as monetization, NOW() as created_at
FROM users u
WHERE u.channel_id IS NULL AND NOT EXISTS (SELECT 1 FROM channels c WHERE c.user_id = u.id);

UPDATE users u
INNER JOIN channels c ON c.user_id = u.id
SET u.channel_id = c.id
WHERE u.channel_id IS NULL;

-- Verify (should show 0)
SELECT COUNT(*) as missing FROM users WHERE channel_id IS NULL;
```

---

## ✅ Testing Commands

### Test 1: Check Migration Worked
```sql
SELECT COUNT(*) as total_users, 
       SUM(CASE WHEN channel_id IS NOT NULL THEN 1 ELSE 0 END) as with_channels
FROM users;
-- with_channels should equal total_users
```

### Test 2: Register New User
```bash
curl -X POST https://moviedbr.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","username":"testuser"}'
# Should return user with channel_id
```

### Test 3: Upload Video (In App)
1. Login to app
2. Click upload button
3. Select video + fill form
4. Submit
5. **Expected**: Success ✅

---

## 🔍 Quick Verification

| Check | Command | Expected Result |
|-------|---------|----------------|
| Users without channels | `SELECT COUNT(*) FROM users WHERE channel_id IS NULL` | 0 |
| Total channels | `SELECT COUNT(*) FROM channels` | Equal to user count |
| Videos with invalid channel | `SELECT COUNT(*) FROM videos v LEFT JOIN channels c ON c.id = v.channel_id WHERE c.id IS NULL` | 0 |

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Channel not found" on upload | User logged in before migration | Logout → Login again |
| SQL UUID() error | Old MySQL version | Use `CONCAT(UUID(), '')` |
| Foreign key constraint error | Migration didn't run | Run SQL migration again |
| Duplicate handle error | Collision (rare) | Handles include UUID to avoid this |

---

## 🎬 What Happens When

| Event | What Happens | Result |
|-------|-------------|--------|
| New user registers | System creates user + channel automatically | User has channel_id ✅ |
| Existing user logs in | System checks channel_id, creates if missing | User has channel_id ✅ |
| User uploads video | Backend uses channel_id from user | Upload succeeds ✅ |

---

## 📋 Deployment Checklist

- [ ] Backup database
- [ ] Upload 3 updated PHP files
- [ ] Create `api/channel/` folder
- [ ] Upload 1 new PHP file
- [ ] Run SQL migration in phpMyAdmin
- [ ] Verify: Check users have channel_id
- [ ] Test: Register new user
- [ ] Test: Login existing user
- [ ] Test: Upload video in app
- [ ] Done! ✅

---

## 💾 Backup Command (Before Deployment)

```bash
# Via phpMyAdmin: Export → Go
# Or via SSH:
mysqldump -u DB_USER -p DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📊 Key Numbers

| Metric | Value |
|--------|-------|
| Files to update | 4 |
| Lines of SQL | ~10 |
| Deployment time | 15-20 min |
| Frontend changes | 0 |
| Downtime required | 0 |

---

## 🎯 Core Concept

```
Before: User → Video (❌ no channel)
After:  User → Channel → Video (✅ valid FK)
```

---

## 📞 Emergency Rollback

If something breaks:

```sql
-- Restore database from backup
mysql -u DB_USER -p DB_NAME < backup_file.sql

-- Restore old PHP files from your backup
```

---

## 🎉 Success Indicators

✅ All users have `channel_id` in database  
✅ New registrations create channels automatically  
✅ Video uploads succeed without errors  
✅ No foreign key constraint errors  
✅ App works normally  

---

## 📚 Full Documentation

- **Complete Guide**: `API_CHANNEL_VIDEO_UPLOAD.md`
- **Deployment Steps**: `DEPLOYMENT_GUIDE.md`
- **Architecture**: `ARCHITECTURE_DIAGRAM.md`
- **Summary**: `FIX_SUMMARY.md`
- **This Card**: `QUICK_REFERENCE.md`

---

## 💡 Remember

- **No frontend changes needed** - all backend
- **Automatic** - users don't do anything
- **Backward compatible** - handles existing users
- **Secure** - channels tied to authenticated users
- **Zero downtime** - deploy anytime

---

**That's it!** Copy files → Run SQL → Test → Done! 🚀
