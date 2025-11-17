# 📊 Video Upload Data Flow - Frontend to Backend

## 🎬 Complete Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER ACTIONS                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. User opens Upload Modal                                      │
│  2. Picks/Records video                                          │
│  3. Fills form (title, description, category, tags)              │
│  4. Clicks "Upload Video"                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND PREPARES FORMDATA                          │
│  File: components/UploadModal.tsx                                │
│  Function: handleUpload()                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FORMDATA STRUCTURE                             │
│                                                                   │
│  formData.append("video", {                                      │
│    uri: "file:///path/to/video.mp4",                            │
│    name: "video-1234567890.mp4",                                │
│    type: "video/mp4"                                            │
│  });                                                             │
│                                                                   │
│  formData.append("thumbnail", {                                  │
│    uri: "file:///path/to/thumbnail.jpg",                        │
│    name: "thumbnail-1234567890.jpg",                            │
│    type: "image/jpeg"                                           │
│  });                                                             │
│                                                                   │
│  formData.append("title", "My Awesome Video");                   │
│  formData.append("description", "This is my video");             │
│  formData.append("category", "Gaming");                          │
│  formData.append("privacy", "public");                           │
│  formData.append("is_short", "0");                              │
│  formData.append("tags", "gaming,fun,tutorial");                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP REQUEST                                │
│                                                                   │
│  POST https://moviedbr.com/api/video/upload                      │
│                                                                   │
│  Headers:                                                        │
│    Authorization: Bearer eyJhbGciOiJIUzI1...                     │
│    Accept: application/json                                      │
│    Content-Type: multipart/form-data                            │
│                                                                   │
│  Body: FormData (see above)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND RECEIVES                               │
│  File: api/video/upload.php                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHP PROCESSES REQUEST                           │
│                                                                   │
│  $user = requireAuth();                                          │
│  $videoFile = $_FILES['video'];                                 │
│  $thumbnailFile = $_FILES['thumbnail'];                          │
│  $title = $_POST['title'];                                       │
│  $description = $_POST['description'];                           │
│  $category = $_POST['category'];                                 │
│  $privacy = $_POST['privacy'];                                   │
│  $isShort = $_POST['is_short'];                                 │
│  $tags = $_POST['tags'];                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND VALIDATES & SAVES FILES                     │
│                                                                   │
│  1. Validate file types and sizes                                │
│  2. Generate UUIDs for filenames                                 │
│  3. Move files to uploads/ directory                             │
│  4. Save metadata to database                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND RESPONDS                              │
│                                                                   │
│  SUCCESS:                                                        │
│  {                                                               │
│    "success": true,                                              │
│    "video_id": "abc-123-def-456",                               │
│    "video_url": "https://moviedbr.com/uploads/videos/abc.mp4",  │
│    "thumbnail_url": "https://moviedbr.com/uploads/thumbs/abc.jpg",│
│    "message": "Video uploaded successfully"                      │
│  }                                                               │
│                                                                   │
│  ERROR:                                                          │
│  {                                                               │
│    "success": false,                                             │
│    "error": "Video file and title are required"                  │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND HANDLES RESPONSE                           │
│                                                                   │
│  if (response.ok && result.success) {                            │
│    - Show success message                                        │
│    - Add video to local state                                    │
│    - Close upload modal                                          │
│    - Refresh video list                                          │
│  } else {                                                        │
│    - Show error alert                                            │
│    - Allow user to retry                                         │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Field-by-Field Breakdown

### Video File (`video`)
```
Frontend:
  Key: "video"
  Type: File object { uri, name, type }
  Value: { uri: "file://...", name: "video-123.mp4", type: "video/mp4" }

Backend:
  Access: $_FILES['video']
  Validation: 
    - Type: video/mp4, video/quicktime, video/x-msvideo
    - Size: Max 500MB
  Storage: uploads/videos/uuid.mp4
```

### Thumbnail File (`thumbnail`)
```
Frontend:
  Key: "thumbnail"
  Type: File object { uri, name, type }
  Value: { uri: "file://...", name: "thumb-123.jpg", type: "image/jpeg" }

Backend:
  Access: $_FILES['thumbnail']
  Validation:
    - Type: image/jpeg, image/jpg, image/png
    - Size: Max 5MB
  Storage: uploads/thumbnails/uuid.jpg
```

### Title (`title`)
```
Frontend:
  Key: "title"
  Type: String
  Value: "My Video Title"
  Required: YES
  Max Length: 100 chars

Backend:
  Access: $_POST['title']
  Validation: Required, not empty
  Storage: Database `videos.title`
```

### Description (`description`)
```
Frontend:
  Key: "description"
  Type: String
  Value: "My video description"
  Required: NO
  Max Length: 500 chars

Backend:
  Access: $_POST['description']
  Validation: Optional
  Storage: Database `videos.description`
```

### Category (`category`)
```
Frontend:
  Key: "category"
  Type: String
  Value: "Gaming" | "Music" | "Technology" | etc.
  Required: NO
  Default: "Technology"

Backend:
  Access: $_POST['category']
  Validation: Optional
  Default: "Other"
  Storage: Database `videos.category`
```

### Privacy (`privacy`)
```
Frontend:
  Key: "privacy"
  Type: String
  Value: "public" | "private" | "unlisted" | "scheduled"
  Required: NO
  Default: "public"

Backend:
  Access: $_POST['privacy']
  Validation: In array ['public', 'private', 'unlisted', 'scheduled']
  Default: "public"
  Storage: Database `videos.privacy`
```

### Is Short (`is_short`)
```
Frontend:
  Key: "is_short"
  Type: String
  Value: "0" or "1"
  Required: NO
  Determined by: video duration < 60 seconds

Backend:
  Access: $_POST['is_short']
  Validation: Optional
  Default: 0
  Storage: Database `videos.is_short`
```

### Tags (`tags`)
```
Frontend:
  Key: "tags"
  Type: String (comma-separated)
  Value: "gaming,tutorial,fun"
  Required: NO

Backend:
  Access: $_POST['tags']
  Processing: 
    - Split by comma
    - Trim whitespace
    - Convert to JSON array
  Storage: Database `videos.tags` (JSON)
```

---

## 🎯 Key Differences from OLD Implementation

| Field | OLD (Wrong) | NEW (Correct) |
|-------|------------|---------------|
| Video file | `file` | `video` |
| Privacy | `visibility` | `privacy` |
| Tags | `tags[]` (array) | `tags` (string) |
| Short flag | Not sent | `is_short` |

---

## ✅ Validation Rules Summary

### Frontend Validation (before sending):
- ✅ Video file selected
- ✅ Title min 3 characters
- ✅ Thumbnail selected
- ✅ If scheduled, date selected

### Backend Validation (after receiving):
- ✅ User authenticated (JWT)
- ✅ Video file exists
- ✅ Title not empty
- ✅ Video type allowed
- ✅ Video size ≤ 500MB
- ✅ Thumbnail type allowed (if provided)
- ✅ Thumbnail size ≤ 5MB (if provided)

---

## 📁 File Storage Structure

```
uploads/
├── videos/
│   ├── abc-123-def-456.mp4      (Video 1)
│   ├── xyz-789-ghi-012.mp4      (Video 2)
│   └── ...
├── thumbnails/
│   ├── abc-123-def-456.jpg      (Thumbnail for Video 1)
│   ├── xyz-789-ghi-012.jpg      (Thumbnail for Video 2)
│   └── ...
├── profiles/
│   ├── user-123.jpg             (User profile pic)
│   └── ...
└── shorts/
    ├── short-456.mp4            (Short video)
    └── ...
```

---

## 🎨 Profile Picture Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: Clicks "Change Photo" button                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Opens image picker                                    │
│  File: app/edit-profile.tsx                                      │
│  Function: pickProfilePicture()                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Prepares FormData                                     │
│                                                                   │
│  formData.append("profile_pic", {                                │
│    uri: "file:///...",                                          │
│    name: "profile-123.jpg",                                     │
│    type: "image/jpeg"                                           │
│  });                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  HTTP REQUEST                                                    │
│  POST https://moviedbr.com/api/user/profile/upload              │
│  Headers: Authorization: Bearer {token}                          │
│  Body: FormData                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: api/user/profile/upload.php                            │
│  - Validates image (JPG/PNG, max 5MB)                           │
│  - Generates UUID filename                                       │
│  - Moves to uploads/profiles/                                    │
│  - Updates database users.profile_pic                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  RESPONSE                                                        │
│  {                                                               │
│    "success": true,                                              │
│    "profile_pic_url": "https://moviedbr.com/uploads/profiles/...",│
│    "message": "Profile picture updated successfully"             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Updates UI                                            │
│  - Shows success message                                         │
│  - Updates profile pic state                                     │
│  - Refreshes auth user context                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Notes

1. All files use UUID-based naming for security
2. Frontend validates before upload to save bandwidth
3. Backend validates after upload for security
4. Progress tracking shows user feedback during upload
5. Error handling at every step
6. Authentication required for all uploads

---

## 🔐 Security Measures

1. ✅ JWT authentication required
2. ✅ File type validation (whitelist only)
3. ✅ File size limits enforced
4. ✅ UUID filenames (prevent overwriting)
5. ✅ Directory traversal prevention
6. ✅ SQL injection prevention (prepared statements)
7. ✅ XSS prevention (sanitized inputs)
