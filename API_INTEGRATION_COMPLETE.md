# 📱 MovieDBR API Integration Documentation

## ✅ Issues Fixed

### 1️⃣ Edit Profile - Avatar Upload
**Status**: ✅ FIXED

**Problem**: Profile picture upload button had no functionality.

**Solution**: 
- Added `expo-image-picker` integration
- Implemented `pickProfilePicture()` function
- Implemented `uploadProfilePicture()` function
- Shows loading state during upload

**Frontend Changes**:
- File: `app/edit-profile.tsx`
- Now sends FormData with `profile_pic` file to: `POST /api/user/profile/upload`

**Backend Requirements**:
You need to create: `api/user/profile/upload.php`

```php
<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();

if (!isset($_FILES['profile_pic'])) {
    respond(['success' => false, 'error' => 'Profile picture file is required'], 400);
}

$uploadDir = '../uploads/profiles/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$file = $_FILES['profile_pic'];
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    respond(['success' => false, 'error' => 'Invalid image format. Only JPG and PNG allowed'], 400);
}

if ($file['size'] > $maxSize) {
    respond(['success' => false, 'error' => 'Image file too large. Max 5MB'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$uuid = generateUUID();
$filename = $uuid . '.' . $ext;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    respond(['success' => false, 'error' => 'Failed to upload image'], 500);
}

$profilePicUrl = 'https://moviedbr.com/uploads/profiles/' . $filename;

$db = getDB();
$stmt = $db->prepare("UPDATE users SET profile_pic = :profile_pic, updated_at = NOW() WHERE id = :id");
$stmt->execute(['profile_pic' => $profilePicUrl, 'id' => $user['id']]);

respond([
    'success' => true,
    'profile_pic_url' => $profilePicUrl,
    'message' => 'Profile picture updated successfully'
]);
```

---

### 2️⃣ Video Upload - Frontend/Backend Format Sync
**Status**: ✅ FIXED

**Problem**: Frontend and backend had mismatched field names.

**Solution**: Updated frontend to match backend expectations.

---

## 📋 Complete API Reference for Video Upload

### **Frontend → Backend Field Mapping**

| Frontend Field | FormData Key | Backend Expects | Type | Required |
|---------------|--------------|-----------------|------|----------|
| videoFile | `video` | `$_FILES['video']` | File | ✅ Yes |
| thumbnailFile | `thumbnail` | `$_FILES['thumbnail']` | File | ⚠️ Optional |
| title | `title` | `$_POST['title']` | String | ✅ Yes |
| description | `description` | `$_POST['description']` | String | ❌ No |
| category | `category` | `$_POST['category']` | String | ❌ No (default: "Other") |
| tags | `tags` | `$_POST['tags']` | String (comma-separated) | ❌ No |
| visibility | `privacy` | `$_POST['privacy']` | String | ❌ No (default: "public") |
| isShort | `is_short` | `$_POST['is_short']` | String "0" or "1" | ❌ No (default: 0) |

---

## 🔄 Frontend Implementation Details

### File: `components/UploadModal.tsx`

**FormData Structure Sent to Backend**:
```javascript
const formData = new FormData();

// Video file (required)
formData.append("video", {
  uri: "file://...",
  name: "video-123456.mp4",
  type: "video/mp4"
});

// Thumbnail file (optional but recommended)
formData.append("thumbnail", {
  uri: "file://...",
  name: "thumbnail-123456.jpg",
  type: "image/jpeg"
});

// Metadata
formData.append("title", "My Video Title");
formData.append("description", "Video description here");
formData.append("category", "Gaming");
formData.append("privacy", "public"); // public, private, unlisted, scheduled
formData.append("is_short", "0"); // "0" or "1"
formData.append("tags", "gaming,tutorial,fun"); // Comma-separated string
```

**API Endpoint**:
```
POST https://moviedbr.com/api/video/upload
Headers:
  Authorization: Bearer {token}
  Accept: application/json
Body: FormData (multipart/form-data)
```

---

## 📊 Backend Expected Response

### Success Response:
```json
{
  "success": true,
  "video_id": "uuid-here",
  "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
  "thumbnail_url": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
  "message": "Video uploaded successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🗂️ Backend File Structure Required

Your `api/` directory should have:

```
api/
├── db.php                      ✅ (Already exists)
├── .htaccess                   ✅ (Already exists)
├── auth/
│   ├── login.php              ✅ (Already exists)
│   ├── register.php           ✅ (Already exists)
│   ├── me.php                 ✅ (Already exists)
│   └── logout.php             ✅ (Already exists)
├── user/
│   ├── profile.php            ✅ (Already exists)
│   ├── profile/upload.php     ⚠️ (NEEDS TO BE CREATED)
│   └── uploads.php            ✅ (Already exists)
├── video/
│   ├── upload.php             ✅ (Already exists)
│   ├── list.php               ✅ (Already exists)
│   ├── details.php            ✅ (Already exists)
│   ├── like.php               ✅ (Already exists)
│   └── comment.php            ✅ (Already exists)
└── shorts/
    ├── list.php               ✅ (Already exists)
    └── upload.php             ✅ (Already exists)
```

---

## 🆕 New API Endpoint Needed

### `POST /api/user/profile/upload`
**Purpose**: Upload profile picture separately

**Request**:
- Method: POST
- Headers: `Authorization: Bearer {token}`
- Body: FormData with `profile_pic` file

**Response**:
```json
{
  "success": true,
  "profile_pic_url": "https://moviedbr.com/uploads/profiles/uuid.jpg",
  "message": "Profile picture updated successfully"
}
```

**PHP Code**: See section 1️⃣ above for full implementation.

---

## 🔐 Required Directory Permissions

Ensure these directories exist and are writable (755):
```bash
uploads/
├── videos/        # For video files
├── thumbnails/    # For video thumbnails
├── profiles/      # For profile pictures (NEW!)
└── shorts/        # For short videos
```

---

## ✅ Testing Checklist

### Profile Picture Upload:
- [ ] Navigate to Profile → Edit Profile
- [ ] Click "Change Photo"
- [ ] Select an image
- [ ] Verify upload success message
- [ ] Verify image appears immediately
- [ ] Check backend database updated

### Video Upload:
- [ ] Open upload modal
- [ ] Select video from gallery
- [ ] Fill in all required fields (title, category)
- [ ] Add optional fields (description, tags)
- [ ] Select thumbnail (or use auto-generated)
- [ ] Click "Upload Video"
- [ ] Verify progress bar shows
- [ ] Verify success message
- [ ] Check video appears in list

---

## 🐛 Common Issues & Solutions

### Issue: "Method not allowed"
**Solution**: Ensure your PHP endpoint handles POST requests correctly

### Issue: "File not uploaded"
**Solution**: Check directory permissions and ensure `move_uploaded_file()` succeeds

### Issue: "Authentication failed"
**Solution**: Verify JWT token is valid and `requireAuth()` function works

### Issue: "Invalid file format"
**Solution**: Check MIME type validation in backend matches frontend

---

## 📞 Support

If you encounter any issues:
1. Check browser/mobile console for frontend errors
2. Check PHP error logs for backend errors
3. Verify all file paths and permissions
4. Ensure database schema matches expected fields

---

## 🎯 Summary

**✅ Fixed Issues**:
1. Profile picture upload now works with `expo-image-picker`
2. Video upload FormData now matches backend expectations exactly

**⚠️ Action Required**:
- Create `api/user/profile/upload.php` using the code provided above
- Ensure `uploads/profiles/` directory exists and is writable
- Test both features thoroughly

**📝 Key Changes**:
- `app/edit-profile.tsx` - Added image picker and upload functionality
- `components/UploadModal.tsx` - Fixed FormData field names:
  - Changed `file` → `video`
  - Changed `visibility` → `privacy`
  - Changed `tags[]` → `tags` (comma-separated)
  - Added `is_short` field
