# Upload Implementation - Updated for Expo SDK v54+

## Overview
Complete React Native/Expo file upload system using FormData with file URIs. No deprecated `readAsStringAsync` or base64 conversion for better memory efficiency with large files.

---

## ✅ Key Features

1. **FormData + File URI** - Direct file upload without base64 conversion
2. **JWT Authentication** - Bearer token in Authorization header
3. **Cross-Platform** - Works on iOS, Android, and Web
4. **Large File Support** - Memory-efficient for videos and large files
5. **Progress Tracking** - Real-time upload progress feedback
6. **PHP Backend Compatible** - Sends files as `$_FILES['file']`

---

## 📁 File Structure

```
utils/
  ├── uploadHelpers.ts       # Core upload functions
  └── uploadExamples.ts      # Usage examples

components/
  └── UploadModal.tsx        # Full upload UI component

contexts/
  └── AuthContext.tsx        # JWT token management
```

---

## 🔧 Core Functions

### 1. `uploadVideoToBackend(options)`

Uploads videos or shorts to your PHP backend.

**Parameters:**
```typescript
{
  videoUri: string;           // File URI (file://, content://, or http://)
  thumbnailUri?: string;      // Optional thumbnail URI
  title: string;              // Video title
  description?: string;       // Optional description
  isShort?: boolean;         // true = shorts/upload.php, false = video/upload.php
  token: string;             // JWT token
}
```

**Returns:**
```typescript
{
  success: boolean;
  url?: string;              // Uploaded file URL
  path?: string;             // Server file path
  filename?: string;         // Saved filename
  error?: string;            // Error message if failed
  message?: string;          // Additional info
  file_url?: string;         // Alternative URL field (handled automatically)
}
```

**API Endpoints:**
- Videos: `https://moviedbr.com/api/video/upload.php`
- Shorts: `https://moviedbr.com/api/shorts/upload.php`

**FormData Structure:**
```
title: "Video Title"
description: "Optional description"
file: <File Object>          // Main video file ($_FILES['file'])
thumbnail: <File Object>     // Optional thumbnail ($_FILES['thumbnail'])
```

---

### 2. `uploadMediaFile(uri, fileName, folder, token)`

Generic file uploader for images, thumbnails, profiles.

**Parameters:**
```typescript
uri: string;                 // File URI
fileName: string;            // Desired filename
folder: "videos" | "shorts" | "thumbnails" | "profiles";
token: string;               // JWT token
```

**API Endpoint:**
- `https://moviedbr.com/api/upload.php`

**FormData Structure:**
```
folder: "profiles"           // Target folder
file: <File Object>          // File to upload ($_FILES['file'])
```

---

## 🔐 Authentication

All uploads require JWT token:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { authToken } = useAuth();

await uploadVideoToBackend({
  videoUri: "file:///path/to/video.mp4",
  title: "My Video",
  token: authToken,  // Required!
  // ...
});
```

---

## 📤 Usage Examples

### Example 1: Upload Video

```typescript
import { uploadVideoToBackend } from '@/utils/uploadHelpers';
import { useAuth } from '@/contexts/AuthContext';

const { authToken } = useAuth();

const result = await uploadVideoToBackend({
  videoUri: "file:///storage/video.mp4",
  thumbnailUri: "file:///storage/thumb.jpg",
  title: "My Awesome Video",
  description: "Check out this video!",
  isShort: false,
  token: authToken,
});

if (result.success) {
  console.log("Video URL:", result.url);
} else {
  console.error("Upload failed:", result.error);
}
```

### Example 2: Upload Short

```typescript
const result = await uploadVideoToBackend({
  videoUri: shortVideoUri,
  thumbnailUri: shortThumbUri,
  title: "Quick Short",
  isShort: true,  // Uploads to shorts/upload.php
  token: authToken,
});
```

### Example 3: Upload Profile Picture

```typescript
import { uploadMediaFile } from '@/utils/uploadHelpers';

const result = await uploadMediaFile(
  imageUri,
  `profile-${Date.now()}.jpg`,
  "profiles",
  authToken
);

if (result.success) {
  console.log("Profile pic URL:", result.url);
}
```

---

## 🌐 Cross-Platform Implementation

### Web (React Native Web)
```typescript
// Converts blob URI to File object
const response = await fetch(uri);
const blob = await response.blob();
return new File([blob], fileName, { type: mimeType });
```

### iOS/Android
```typescript
// Returns object with uri, name, type
return {
  uri: "file:///path/to/file.mp4",
  name: "video-123.mp4",
  type: "video/mp4"
};
```

FormData automatically handles both formats.

---

## 🎯 PHP Backend Requirements

Your PHP backend should expect:

### Video/Shorts Upload
```php
<?php
header('Content-Type: application/json');

// JWT verification
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// Verify JWT here...

// Get form data
$title = $_POST['title'];
$description = $_POST['description'] ?? '';

// Get files
$videoFile = $_FILES['file'];           // Main video
$thumbnailFile = $_FILES['thumbnail'];  // Optional

// Process upload...
// Save to /public_html/uploads/videos/ or /uploads/shorts/

echo json_encode([
  'success' => true,
  'url' => 'https://moviedbr.com/uploads/videos/video-123.mp4',
  'path' => '/uploads/videos/video-123.mp4',
  'filename' => 'video-123.mp4'
]);
```

### Generic Media Upload
```php
<?php
$folder = $_POST['folder'];  // "profiles", "thumbnails", etc.
$file = $_FILES['file'];

// Save to /public_html/uploads/{$folder}/

echo json_encode([
  'success' => true,
  'url' => "https://moviedbr.com/uploads/{$folder}/file-123.jpg"
]);
```

---

## 🔍 Error Handling

The functions handle common errors:

1. **Backend URL not configured** - Fix in `utils/env.ts`
2. **Not authenticated** - User needs to login
3. **Network errors** - Connection issues
4. **Non-JSON responses** - Backend returned HTML/error page
5. **Upload failed** - Backend returned success: false

All errors return:
```typescript
{
  success: false,
  error: "Detailed error message"
}
```

---

## 🚀 Upload Flow

```
1. User selects file
   └─ expo-image-picker returns URI
   
2. Create FormData
   └─ Add file using createFileObject()
   └─ Add metadata (title, description, folder)
   
3. Send to Backend
   └─ Authorization: Bearer {JWT_TOKEN}
   └─ Body: FormData (multipart/form-data)
   
4. Backend processes
   └─ Verifies JWT
   └─ Saves to /uploads/{folder}/
   └─ Returns JSON response
   
5. Frontend receives response
   └─ Check success: true/false
   └─ Display result or error
```

---

## 📊 API Endpoints Summary

| Purpose | Endpoint | Method | FormData Fields |
|---------|----------|--------|-----------------|
| Upload Video | `/api/video/upload.php` | POST | `file`, `thumbnail`, `title`, `description` |
| Upload Short | `/api/shorts/upload.php` | POST | `file`, `thumbnail`, `title`, `description` |
| Generic Upload | `/api/upload.php` | POST | `file`, `folder` |

All require: `Authorization: Bearer {JWT_TOKEN}`

---

## 🎨 UI Component (UploadModal)

Full-featured upload modal with:
- Video picker (gallery + camera)
- Thumbnail picker
- Form fields (title, description, category, tags)
- Visibility options
- Progress bar
- Validation

**Usage:**
```typescript
import UploadModal from '@/components/UploadModal';

<UploadModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onUploadComplete={() => {
    // Refresh video list
  }}
/>
```

---

## 🔧 Configuration

Set your backend URL in `utils/env.ts`:

```typescript
export const getEnvApiBaseUrl = (): string => {
  const raw = process.env.EXPO_PUBLIC_API_URL || "https://moviedbr.com";
  // ...
};
```

Or create `.env` file:
```
EXPO_PUBLIC_API_URL=https://moviedbr.com
```

**Important:** Do NOT include `/api` in `EXPO_PUBLIC_API_URL`  
The system automatically appends it: `https://moviedbr.com/api/...`

---

## ✅ Migration Checklist

If updating from old base64 system:

- [x] Removed deprecated `readAsStringAsync`
- [x] Removed `expo-file-system` File class usage
- [x] Using FormData with file URIs
- [x] File objects created with `createFileObject()`
- [x] PHP expects `$_FILES['file']` (not base64 in JSON)
- [x] Added `file_url` fallback for backend compatibility
- [x] JWT token in Authorization header
- [x] Works on iOS, Android, and Web

---

## 🐛 Troubleshooting

**"Backend URL not configured"**
- Set `EXPO_PUBLIC_API_URL` in env or `utils/env.ts`

**"Not authenticated"**
- User needs to login to get JWT token

**"Server returned invalid response. Expected JSON."**
- Backend returned HTML/error instead of JSON
- Check PHP errors and ensure proper JSON response

**Upload succeeds but no URL returned**
- Check if backend returns `url` or `file_url`
- Both are handled automatically

**Large video upload fails**
- Check PHP `upload_max_filesize` and `post_max_size`
- Check `max_execution_time` for long uploads

---

## 📝 Notes

- No base64 conversion = better performance for large files
- FormData automatically sets `Content-Type: multipart/form-data`
- Don't manually set Content-Type header (breaks on web)
- File URIs work: `file://`, `content://`, `http://`
- Backend receives standard `$_FILES` array
- Response can use `url` or `file_url` (both supported)

---

## 🔗 Related Files

- `utils/uploadHelpers.ts` - Core upload functions
- `utils/uploadExamples.ts` - Usage examples
- `components/UploadModal.tsx` - Full UI implementation
- `contexts/AuthContext.tsx` - JWT authentication
- `utils/env.ts` - Backend URL configuration

---

**Last Updated:** 2025-11-16  
**Expo SDK:** v54.0.0+  
**Status:** ✅ Production Ready
