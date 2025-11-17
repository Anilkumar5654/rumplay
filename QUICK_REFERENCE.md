# 🎯 Quick Reference Card - Video Upload Integration

## ⚡ Frontend → Backend Mapping (Copy This!)

### Video Upload Endpoint
```
POST https://moviedbr.com/api/video/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### FormData Fields

| Field Name | Type | Example Value | Required |
|------------|------|---------------|----------|
| `video` | File | `video-123.mp4` | ✅ YES |
| `thumbnail` | File | `thumb-123.jpg` | ⚠️ Recommended |
| `title` | String | `"My Video"` | ✅ YES |
| `description` | String | `"About video"` | ❌ No |
| `category` | String | `"Gaming"` | ❌ No |
| `privacy` | String | `"public"` | ❌ No |
| `is_short` | String | `"0"` or `"1"` | ❌ No |
| `tags` | String | `"gaming,fun"` | ❌ No |

---

## 📱 Profile Picture Upload Endpoint

```
POST https://moviedbr.com/api/user/profile/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  profile_pic: File (JPG/PNG, max 5MB)
```

---

## ✅ Success Response Format

```json
{
  "success": true,
  "video_id": "abc-123",
  "video_url": "https://moviedbr.com/uploads/videos/abc-123.mp4",
  "thumbnail_url": "https://moviedbr.com/uploads/thumbnails/abc-123.jpg",
  "message": "Video uploaded successfully"
}
```

---

## ❌ Error Response Format

```json
{
  "success": false,
  "error": "Video file and title are required"
}
```

---

## 🔧 PHP Backend Access

```php
// Files
$_FILES['video']      // Main video file
$_FILES['thumbnail']  // Thumbnail image

// Form fields
$_POST['title']       // Video title
$_POST['description'] // Description
$_POST['category']    // Category
$_POST['privacy']     // Privacy setting
$_POST['is_short']    // Is short (0 or 1)
$_POST['tags']        // Comma-separated tags
```

---

## 📁 Required Directory Structure

```
public_html/
├── api/
│   └── user/
│       └── profile/
│           └── upload.php  ← Create this!
└── uploads/
    ├── videos/
    ├── thumbnails/
    └── profiles/           ← Create this!
```

---

## 🚀 Quick Deploy Checklist

- [ ] Upload `api/user/profile/upload.php` to server
- [ ] Create `uploads/profiles/` directory
- [ ] Set directory permissions to 755
- [ ] Test profile picture upload
- [ ] Test video upload
- [ ] Verify files are saved correctly

---

## 🐛 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "Method not allowed" | Check `$_SERVER['REQUEST_METHOD'] === 'POST'` |
| "File not uploaded" | Check directory permissions (755) |
| "Authentication failed" | Verify JWT token is valid |
| "Invalid file format" | Check MIME type validation |
| "Database error" | Check SQL query and table schema |

---

## 📊 File Size Limits

- Video: Max 500MB
- Thumbnail: Max 5MB  
- Profile Picture: Max 5MB

---

## 🎨 Allowed File Types

**Videos**:
- video/mp4
- video/quicktime
- video/x-msvideo

**Images**:
- image/jpeg
- image/jpg
- image/png

---

## 🔐 Authentication

All upload endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
```

Backend validates with:
```php
$user = requireAuth(); // From db.php
```

---

## 📝 Tags Format

❌ Wrong:
```javascript
formData.append("tags[]", "gaming");
formData.append("tags[]", "fun");
```

✅ Correct:
```javascript
formData.append("tags", "gaming,fun,tutorial");
```

---

## 🔄 Privacy Values

- `public` - Everyone can see
- `private` - Only user can see
- `unlisted` - Only with link
- `scheduled` - Publish later

---

## 💡 Pro Tips

1. Always validate file size on frontend before upload
2. Generate thumbnails automatically if user doesn't provide
3. Show upload progress for better UX
4. Use UUID for file names to prevent conflicts
5. Store file paths in database, not file contents
6. Clean up failed uploads to save disk space

---

## 📞 Need Help?

1. Check browser console for frontend errors
2. Check PHP error logs for backend errors  
3. Verify network requests in developer tools
4. Test with small files first
5. Ensure all required fields are present

---

## 🎯 Testing Commands

### Test Profile Upload:
```bash
curl -X POST https://moviedbr.com/api/user/profile/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "profile_pic=@/path/to/image.jpg"
```

### Test Video Upload:
```bash
curl -X POST https://moviedbr.com/api/video/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumb.jpg" \
  -F "title=Test Video" \
  -F "description=Test" \
  -F "category=Gaming" \
  -F "privacy=public" \
  -F "is_short=0" \
  -F "tags=test,demo"
```

---

## ✨ You're All Set!

All issues fixed, documentation complete, and ready to deploy! 🚀
