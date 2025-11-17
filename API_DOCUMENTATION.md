# PlayTube API Documentation

**Base URL:** `https://moviedbr.com/api/`

All API endpoints use JSON format for requests and responses unless otherwise specified.

---

## Authentication

### Register
**Endpoint:** `POST /auth/register.php`

Creates a new user account and automatically creates a channel.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "john_doe",
  "displayName": "John Doe" // Optional, defaults to username
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 6 characters
- Username: 3-64 characters, alphanumeric and underscores only

**Response:**
```json
{
  "success": true,
  "token": "session_token_here",
  "user": {
    "id": "user_uuid",
    "username": "john_doe",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_pic": "",
    "bio": "",
    "phone": "",
    "role": "user",
    "channel_id": "channel_uuid",
    "created_at": "2025-01-01 12:00:00"
  }
}
```

**Error Responses:**
- `400`: Email/username exists, validation failed
- `405`: Method not allowed

---

### Login
**Endpoint:** `POST /auth/login.php`

Authenticates a user and returns a session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "session_token_here",
  "user": {
    "id": "user_uuid",
    "username": "john_doe",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_pic": "",
    "bio": "",
    "phone": "",
    "role": "user",
    "channel_id": "channel_uuid",
    "created_at": "2025-01-01 12:00:00"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `405`: Method not allowed

---

### Get Current User
**Endpoint:** `GET /auth/me.php`

Returns the authenticated user's data.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_uuid",
    "username": "john_doe",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_pic": "",
    "bio": "",
    "phone": "",
    "role": "user",
    "channel_id": "channel_uuid",
    "created_at": "2025-01-01 12:00:00"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (invalid/missing token)

---

### Logout
**Endpoint:** `POST /auth/logout.php`

Invalidates the current session token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

## User Profile

### Get User Profile
**Endpoint:** `GET /user/profile.php?user_id={user_id}`

Retrieves a user's profile information.

**Query Parameters:**
- `user_id`: User UUID (required)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_uuid",
    "username": "john_doe",
    "name": "John Doe",
    "email": "user@example.com",
    "profile_pic": "https://example.com/profile.jpg",
    "bio": "Content creator",
    "phone": "+1234567890",
    "role": "user",
    "channel_id": "channel_uuid",
    "created_at": "2025-01-01 12:00:00"
  }
}
```

**Error Responses:**
- `400`: User ID required
- `404`: User not found

---

### Update User Profile
**Endpoint:** `POST /user/profile.php`

Updates the authenticated user's profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Content creator and developer",
  "phone": "+1234567890",
  "profile_pic": "https://example.com/new-profile.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "user": {
    "id": "user_uuid",
    "username": "john_doe",
    "name": "John Doe Updated",
    "email": "user@example.com",
    "profile_pic": "https://example.com/new-profile.jpg",
    "bio": "Content creator and developer",
    "phone": "+1234567890",
    "role": "user",
    "channel_id": "channel_uuid",
    "created_at": "2025-01-01 12:00:00",
    "updated_at": "2025-01-15 10:30:00"
  }
}
```

**Error Responses:**
- `400`: Name is required
- `401`: Unauthorized
- `500`: Update failed

---

### Upload Profile Picture
**Endpoint:** `POST /user/profile/upload.php`

Uploads a profile picture for the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `profile_pic`: Image file (JPEG, PNG)
  - Max size: 5MB
  - Recommended: 200x200 to 1000x1000 pixels

**Response:**
```json
{
  "success": true,
  "profile_pic_url": "https://moviedbr.com/uploads/profile_pics/uuid.jpg",
  "message": "Profile picture uploaded successfully"
}
```

**Error Responses:**
- `400`: Invalid file format or size
- `401`: Unauthorized
- `500`: Upload failed

---

### Get User Uploads
**Endpoint:** `GET /user/uploads.php`

Retrieves all videos uploaded by the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_uuid",
      "user_id": "user_uuid",
      "channel_id": "channel_uuid",
      "title": "My Video",
      "description": "Video description",
      "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
      "thumbnail": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
      "views": 100,
      "likes": 10,
      "dislikes": 0,
      "privacy": "public",
      "category": "Entertainment",
      "tags": ["tag1", "tag2"],
      "duration": 120,
      "is_short": 0,
      "created_at": "2025-01-15 10:00:00"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized

---

## Videos

### Upload Video
**Endpoint:** `POST /video/upload.php`

Uploads a new video with optional thumbnail.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `video`: Video file (MP4, MOV, AVI) - **Required**
  - Max size: 500MB
- `thumbnail`: Thumbnail image (JPEG, PNG) - **Optional**
  - Max size: 5MB
- `title`: Video title - **Required**
- `description`: Video description - Optional
- `category`: Video category - Optional (default: "Other")
- `tags`: Comma-separated tags - Optional
- `privacy`: Video privacy - Optional (default: "public")
  - Values: `public`, `private`, `unlisted`, `scheduled`
- `is_short`: 0 or 1 - Optional (default: 0)

**Response:**
```json
{
  "success": true,
  "video_id": "video_uuid",
  "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
  "thumbnail_url": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
  "message": "Video uploaded successfully"
}
```

**Error Responses:**
- `400`: Validation failed, missing required fields, channel not found
- `401`: Unauthorized
- `500`: Upload failed

**Important Notes:**
- User must have a `channel_id` to upload videos
- If no thumbnail is provided, a placeholder is used
- Video files are stored in `/uploads/videos/`
- Thumbnails are stored in `/uploads/thumbnails/`

---

### Get Video List
**Endpoint:** `GET /video/list.php`

Retrieves a list of public videos with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Videos per page (default: 20, max: 100)
- `category`: Filter by category (optional)

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_uuid",
      "user_id": "user_uuid",
      "channel_id": "channel_uuid",
      "title": "Video Title",
      "description": "Description",
      "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
      "thumbnail": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
      "views": 1000,
      "likes": 50,
      "dislikes": 2,
      "privacy": "public",
      "category": "Entertainment",
      "tags": ["tag1", "tag2"],
      "duration": 300,
      "is_short": 0,
      "created_at": "2025-01-10 14:30:00",
      "uploader": {
        "username": "john_doe",
        "name": "John Doe",
        "profile_pic": "https://example.com/profile.jpg"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_videos": 100,
    "limit": 20
  }
}
```

---

### Get Video Details
**Endpoint:** `GET /video/details.php?video_id={video_id}`

Retrieves detailed information about a specific video.

**Query Parameters:**
- `video_id`: Video UUID (required)

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "video_uuid",
    "user_id": "user_uuid",
    "channel_id": "channel_uuid",
    "title": "Video Title",
    "description": "Detailed description",
    "video_url": "https://moviedbr.com/uploads/videos/uuid.mp4",
    "thumbnail": "https://moviedbr.com/uploads/thumbnails/uuid.jpg",
    "views": 1500,
    "likes": 75,
    "dislikes": 3,
    "privacy": "public",
    "category": "Technology",
    "tags": ["tech", "tutorial"],
    "duration": 600,
    "is_short": 0,
    "created_at": "2025-01-05 09:00:00",
    "uploader": {
      "id": "user_uuid",
      "username": "tech_guru",
      "name": "Tech Guru",
      "profile_pic": "https://example.com/tech-profile.jpg",
      "channel_id": "channel_uuid"
    },
    "comments_count": 25
  }
}
```

**Error Responses:**
- `400`: Video ID required
- `404`: Video not found

---

### Like Video
**Endpoint:** `POST /video/like.php`

Likes or unlikes a video.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "video_id": "video_uuid",
  "action": "like" // or "unlike"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video liked",
  "likes": 76
}
```

**Error Responses:**
- `400`: Video ID and action required
- `401`: Unauthorized
- `404`: Video not found

---

### Comment on Video
**Endpoint:** `POST /video/comment.php`

Adds a comment to a video.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "video_id": "video_uuid",
  "comment": "Great video!"
}
```

**Response:**
```json
{
  "success": true,
  "comment_id": "comment_uuid",
  "message": "Comment added"
}
```

**Error Responses:**
- `400`: Video ID and comment required
- `401`: Unauthorized
- `404`: Video not found

---

## Shorts

### Get Shorts List
**Endpoint:** `GET /shorts/list.php`

Retrieves a list of short videos.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Shorts per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "shorts": [
    {
      "id": "short_uuid",
      "user_id": "user_uuid",
      "channel_id": "channel_uuid",
      "title": "Short Title",
      "video_url": "https://moviedbr.com/uploads/videos/short-uuid.mp4",
      "thumbnail": "https://moviedbr.com/uploads/thumbnails/short-uuid.jpg",
      "views": 5000,
      "likes": 250,
      "is_short": 1,
      "duration": 30,
      "created_at": "2025-01-15 16:45:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_shorts": 200
  }
}
```

---

### Upload Short
**Endpoint:** `POST /shorts/upload.php`

Uploads a short video (same as regular video upload but with `is_short=1`).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- Same as `/video/upload.php` but `is_short` is automatically set to 1
- Duration should be ≤ 60 seconds

---

## Admin

### Get All Users (Admin Only)
**Endpoint:** `GET /admin/users.php`

Retrieves all users (requires admin role).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_uuid",
      "username": "john_doe",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2025-01-01 12:00:00"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

### Manage Videos (Admin Only)
**Endpoint:** `GET /admin/videos.php`

Retrieves all videos with moderation options.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_uuid",
      "title": "Video Title",
      "user_id": "user_uuid",
      "privacy": "public",
      "views": 1000,
      "created_at": "2025-01-10 10:00:00"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

## Health Check

### Check API Status
**Endpoint:** `GET /health.php`

Returns the API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T12:00:00Z",
  "database": "connected"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

---

## Authentication Flow

1. **Register/Login** → Get `token`
2. **Store token** in secure storage (AsyncStorage for mobile)
3. **Include token** in Authorization header for protected endpoints:
   ```
   Authorization: Bearer {token}
   ```
4. **Handle 401 errors** → Redirect to login
5. **Logout** → Clear token and invalidate session

---

## File Upload Guidelines

### Video Files
- **Formats:** MP4, MOV, AVI
- **Max Size:** 500MB
- **Recommended:** H.264 codec, 1080p or lower
- **Shorts:** Duration ≤ 60 seconds

### Image Files (Thumbnails, Profile Pictures)
- **Formats:** JPEG, PNG
- **Max Size:** 5MB
- **Recommended:** 1280x720 for thumbnails, 500x500 for profile pictures

### Upload Directory Structure
```
/uploads/
  ├── videos/          # Video files
  ├── thumbnails/      # Video thumbnails
  └── profile_pics/    # User profile pictures
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints
- 10 video uploads per hour per user

---

## Frontend Integration Examples

### Login Example
```typescript
const apiRoot = 'https://moviedbr.com/api';

async function login(email: string, password: string) {
  const response = await fetch(`${apiRoot}/auth/login.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    await AsyncStorage.setItem('authToken', data.token);
    return data.user;
  } else {
    throw new Error(data.error);
  }
}
```

### Video Upload Example
```typescript
async function uploadVideo(
  videoUri: string,
  title: string,
  description: string,
  thumbnailUri?: string
) {
  const token = await AsyncStorage.getItem('authToken');
  
  const formData = new FormData();
  formData.append('video', {
    uri: videoUri,
    name: 'video.mp4',
    type: 'video/mp4',
  });
  
  if (thumbnailUri) {
    formData.append('thumbnail', {
      uri: thumbnailUri,
      name: 'thumbnail.jpg',
      type: 'image/jpeg',
    });
  }
  
  formData.append('title', title);
  formData.append('description', description);
  formData.append('privacy', 'public');
  
  const response = await fetch(`${apiRoot}/video/upload.php`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return await response.json();
}
```

### Get Profile Example
```typescript
async function getProfile(userId: string) {
  const token = await AsyncStorage.getItem('authToken');
  
  const response = await fetch(
    `${apiRoot}/user/profile.php?user_id=${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  return await response.json();
}
```

---

## Database Schema Reference

### Users Table
```sql
id, username, name, email, password_hash, password_salt, 
profile_pic, bio, phone, role, channel_id, created_at, updated_at
```

### Videos Table
```sql
id, user_id, channel_id, title, description, video_url, 
thumbnail, views, likes, dislikes, privacy, category, tags, 
duration, is_short, created_at, updated_at
```

### Channels Table
```sql
id, user_id, name, handle, description, banner, 
subscribers, monetization, created_at, updated_at
```

### Sessions Table
```sql
token, user_id, expires_at, created_at
```

---

## Support

For issues or questions:
- Check error responses first
- Verify token is included in headers
- Ensure file sizes are within limits
- Confirm user has required permissions (channel_id for uploads)
- Check upload directory permissions (755 for directories)

---

**Last Updated:** January 2025  
**API Version:** 1.0.0
