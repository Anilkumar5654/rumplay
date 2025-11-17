# ✅ Deployment Checklist - Video Upload Fix

**Print this and check off items as you complete them**

---

## 📋 Pre-Deployment (Required)

- [ ] Read `FIX_SUMMARY.md` to understand what's being fixed
- [ ] Read `DEPLOYMENT_GUIDE.md` for detailed steps
- [ ] Verify you have database access (phpMyAdmin or SSH)
- [ ] Verify you have FTP/cPanel access to upload files
- [ ] Backup current state (see backup section below)

---

## 💾 Backup (Critical - Do Not Skip!)

### Database Backup
- [ ] Login to phpMyAdmin
- [ ] Select your database
- [ ] Click "Export" tab
- [ ] Click "Go" button
- [ ] Save file as `backup_YYYYMMDD.sql`
- [ ] Verify file downloaded successfully
- [ ] **Estimated time: 2 minutes**

### Files Backup
- [ ] Download current `api/auth/login.php`
- [ ] Download current `api/auth/register.php`
- [ ] Download current `api/video/upload.php`
- [ ] Save in folder labeled `backup_YYYYMMDD/`
- [ ] **Estimated time: 2 minutes**

**✅ Backup Complete** | Date: _____________ | Time: _______

---

## 📤 Upload Files (4 files)

### File 1: api/auth/register.php
- [ ] Locate file in your project: `api/auth/register.php`
- [ ] Connect to Hostinger via FTP or cPanel File Manager
- [ ] Navigate to `public_html/api/auth/`
- [ ] Upload/Replace `register.php`
- [ ] Verify file timestamp updated
- [ ] **Estimated time: 1 minute**

### File 2: api/auth/login.php
- [ ] Locate file in your project: `api/auth/login.php`
- [ ] Navigate to `public_html/api/auth/`
- [ ] Upload/Replace `login.php`
- [ ] Verify file timestamp updated
- [ ] **Estimated time: 1 minute**

### File 3: api/video/upload.php
- [ ] Locate file in your project: `api/video/upload.php`
- [ ] Navigate to `public_html/api/video/`
- [ ] Upload/Replace `upload.php`
- [ ] Verify file timestamp updated
- [ ] **Estimated time: 1 minute**

### File 4: api/channel/create-auto.php (NEW)
- [ ] Check if folder exists: `public_html/api/channel/`
- [ ] If not, create folder `channel` in `public_html/api/`
- [ ] Locate file in your project: `api/channel/create-auto.php`
- [ ] Navigate to `public_html/api/channel/`
- [ ] Upload `create-auto.php`
- [ ] Verify file exists
- [ ] **Estimated time: 2 minutes**

**✅ Files Uploaded** | Date: _____________ | Time: _______

---

## 🗄️ Database Migration (SQL)

### Step 1: Open phpMyAdmin
- [ ] Login to cPanel
- [ ] Click on "phpMyAdmin"
- [ ] Select your database from left sidebar
- [ ] Click "SQL" tab

### Step 2: Copy Migration SQL
- [ ] Open file: `backend/migrations/001_create_user_channels.sql`
- [ ] Copy entire contents
- [ ] Or copy from below:

```sql
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
```

### Step 3: Execute SQL
- [ ] Paste SQL in the SQL query box
- [ ] Click "Go" button
- [ ] Wait for execution (should be fast)
- [ ] Check for errors (should show success message)
- [ ] **Estimated time: 1 minute**

### Step 4: Verify Migration
- [ ] Run verification query:
```sql
SELECT COUNT(*) as missing FROM users WHERE channel_id IS NULL;
```
- [ ] Expected result: `missing: 0`
- [ ] If not 0, check for errors and re-run migration

**✅ Migration Complete** | Date: _____________ | Time: _______

---

## 🧪 Testing (Do Not Skip!)

### Test 1: Database Verification
```sql
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN channel_id IS NOT NULL THEN 1 ELSE 0 END) as with_channels
FROM users;
```
- [ ] Run query in phpMyAdmin
- [ ] `total_users` = `with_channels` ✅
- [ ] If not equal, troubleshoot before proceeding

### Test 2: Register New User (via curl or app)
```bash
curl -X POST https://moviedbr.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","username":"testuser"}'
```
- [ ] Execute command or register in app
- [ ] Response includes `channel_id` ✅
- [ ] Check database: user has `channel_id` ✅

### Test 3: Login Existing User
- [ ] Login with an existing account
- [ ] Should succeed without errors ✅
- [ ] Check database: user now has `channel_id` ✅

### Test 4: Video Upload (Most Important!)
- [ ] Open your app
- [ ] Login with any account
- [ ] Navigate to upload screen
- [ ] Select a video file
- [ ] Fill in title and other fields
- [ ] Click Upload
- [ ] **Expected**: Upload succeeds ✅
- [ ] **Expected**: No "foreign key constraint" error ✅
- [ ] **Expected**: Video appears in list ✅

**✅ Testing Complete** | Date: _____________ | Time: _______

---

## 🔍 Post-Deployment Verification

### System Health Checks
- [ ] Check PHP error logs (cPanel → Error Log)
  - No new errors related to upload ✅
- [ ] Check database queries log (if available)
  - No failed foreign key inserts ✅
- [ ] Test on mobile app
  - Upload works ✅
- [ ] Test on web browser
  - Upload works ✅

### Data Integrity Checks
```sql
-- Check 1: All users have channels
SELECT COUNT(*) FROM users WHERE channel_id IS NULL;
-- Expected: 0
```
- [ ] Query returns 0 ✅

```sql
-- Check 2: All videos have valid channels
SELECT COUNT(*) FROM videos v LEFT JOIN channels c ON c.id = v.channel_id WHERE c.id IS NULL;
-- Expected: 0
```
- [ ] Query returns 0 ✅

```sql
-- Check 3: Sample channels
SELECT u.username, c.name, c.handle FROM users u INNER JOIN channels c ON c.id = u.channel_id LIMIT 5;
```
- [ ] Returns expected data ✅

**✅ Verification Complete** | Date: _____________ | Time: _______

---

## 🎯 Success Criteria (All Must Pass)

- [ ] ✅ All 4 files uploaded successfully
- [ ] ✅ SQL migration executed without errors
- [ ] ✅ All users have `channel_id` in database
- [ ] ✅ New user registration works
- [ ] ✅ Existing user login works
- [ ] ✅ Video upload works without errors
- [ ] ✅ No foreign key constraint errors
- [ ] ✅ No new PHP errors in logs
- [ ] ✅ Mobile app works normally
- [ ] ✅ Web app works normally

**ALL CHECKED = DEPLOYMENT SUCCESSFUL** 🎉

---

## 🚨 If Something Went Wrong

### Rollback Database
```bash
mysql -u DB_USER -p DB_NAME < backup_YYYYMMDD.sql
```
- [ ] Executed rollback
- [ ] Verify data restored
- [ ] **Estimated time: 2 minutes**

### Rollback Files
- [ ] Re-upload backed up PHP files from `backup_YYYYMMDD/`
- [ ] Verify old files restored
- [ ] **Estimated time: 2 minutes**

### Then:
- [ ] Review error messages
- [ ] Check `DEPLOYMENT_GUIDE.md` → Troubleshooting section
- [ ] Fix issues
- [ ] Re-attempt deployment

---

## 📊 Deployment Summary

### Completed By
- **Name**: _______________________
- **Date**: _______________________
- **Time Started**: _______________
- **Time Completed**: _____________
- **Total Duration**: ______________

### Deployment Stats
- Files uploaded: 4
- SQL queries executed: 2
- Tests performed: 4
- Issues encountered: _____________
- Resolution time: _______________

### Sign-Off
- [ ] All checklist items completed
- [ ] All tests passed
- [ ] No errors in production
- [ ] Team notified of successful deployment

**Signature**: _______________________

**Date**: _______________________

---

## 📞 Emergency Contacts

| Issue | Contact | Documentation |
|-------|---------|---------------|
| Database errors | Database Admin | `DEPLOYMENT_GUIDE.md` |
| PHP errors | Backend Dev | `API_CHANNEL_VIDEO_UPLOAD.md` |
| App not working | Frontend Dev | `FIX_SUMMARY.md` |
| General questions | Project Manager | `INDEX.md` |

---

## 📝 Notes Section

Use this space for any notes, issues, or observations:

```
_________________________________________________________

_________________________________________________________

_________________________________________________________

_________________________________________________________

_________________________________________________________

_________________________________________________________

_________________________________________________________

_________________________________________________________
```

---

## 🎉 Deployment Complete!

**Congratulations!** You've successfully deployed the video upload fix.

**Next Steps**:
1. Monitor error logs for 24 hours
2. Watch for user reports
3. Verify upload metrics in analytics
4. Archive this checklist for records

**Keep backups for at least 30 days** just in case.

---

**Version**: 1.0  
**Last Updated**: 2025-01-17  
**Document**: DEPLOYMENT_CHECKLIST.md
