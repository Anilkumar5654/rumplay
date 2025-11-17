# API Integration Documentation

## Overview
This document describes all API endpoints required for the PlayTube mobile application. The APIs are built with PHP and MySQL on Hostinger.

**Base URL**: `https://moviedbr.com/api`

All endpoints return JSON responses with this structure:
```json
{
  "success": true|false,
  "error": "Error message if failed",
  "data": {}
}
```

---

## Authentication System

### 1. Register User
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": "96-character-hex-token",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_pic": null,
    "bio": null,
    "phone": null,
    "channel_id": null,
    "subscriptions": [],
    "memberships": [],
    "reactions": [],
    "watch_history": [],
    "watch_history_detailed": [],
    "saved_videos": [],
    "liked_videos": [],
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Validation Rules**:
- Username: 3-64 characters, alphanumeric + underscores
- Email: Valid email format
- Password: Minimum 6 characters

---

### 2. Login User
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": "96-character-hex-token",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_pic": "https://example.com/avatar.jpg",
    "bio": "Video enthusiast",
    "phone": "+1234567890",
    "channel_id": "uuid-or-null",
    "subscriptions": ["channel-uuid-1", "channel-uuid-2"],
    "memberships": [],
    "reactions": [],
    "watch_history": ["video-uuid-1", "video-uuid-2"],
    "watch_history_detailed": [
      {
        "video_id": "uuid",
        "watched_at": "2025-01-17T10:30:00Z",
        "progress": 120
      }
    ],
    "saved_videos": ["video-uuid-1"],
    "liked_videos": ["video-uuid-1", "video-uuid-2"],
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 3. Get Current User (Verify Token)
**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (Success):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_pic": "https://example.com/avatar.jpg",
    "bio": "Video enthusiast",
    "phone": "+1234567890",
    "channel_id": "uuid-or-null",
    "subscriptions": [],
    "memberships": [],
    "reactions": [],
    "watch_history": [],
    "watch_history_detailed": [],
    "saved_videos": [],
    "liked_videos": [],
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Response** (Error - 401):
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 4. Logout User
**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (Success):
```json
{
  "success": true
}
```

---

## User Profile Management

### 5. Get User Profile
**Endpoint**: `GET /user/profile?user_id={uuid}`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `user_id` (required): UUID of user to fetch

**Response** (Success):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "profile_pic": "https://example.com/avatar.jpg",
    "bio": "Video enthusiast",
    "phone": "+1234567890",
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### 6. Update User Profile
**Endpoint**: `POST /user/profile`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Updated",
  "bio": "Updated bio text",
  "phone": "+1234567890",
  "profile_pic": "https://example.com/new-avatar.jpg"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Profile updated",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Updated",
    "email": "john@example.com",
    "role": "user",
    "profile_pic": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio text",
    "phone": "+1234567890",
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Response** (Error - 401):
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### 7. Get User's Uploaded Videos
**Endpoint**: `GET /user/uploads`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (Success):
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "channel_id": "uuid",
      "title": "My Video Title",
      "description": "Video description",
      "video_url": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "privacy": "public",
      "views": 1234,
      "likes": 56,
      "dislikes": 2,
      "duration": 180,
      "category": "Entertainment",
      "tags": ["funny", "tutorial"],
      "is_short": 0,
      "is_live": 0,
      "created_at": "2025-01-17T10:30:00Z"
    }
  ]
}
```

---

## Video Management

### 8. Get All Videos (Public Feed)
**Endpoint**: `GET /video/list`

**Query Parameters** (Optional):
- `category`: Filter by category
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)
- `sort`: Sort order (latest, popular, trending)

**Response** (Success):
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "channel_id": "uuid",
      "title": "Video Title",
      "description": "Description",
      "video_url": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "privacy": "public",
      "views": 1234,
      "likes": 56,
      "dislikes": 2,
      "duration": 180,
      "category": "Entertainment",
      "tags": ["tag1", "tag2"],
      "is_short": 0,
      "is_live": 0,
      "created_at": "2025-01-17T10:30:00Z",
      "uploader": {
        "id": "uuid",
        "username": "johndoe",
        "name": "John Doe",
        "profile_pic": "https://example.com/avatar.jpg"
      }
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

### 9. Get Video Details
**Endpoint**: `GET /video/details?video_id={uuid}`

**Query Parameters**:
- `video_id` (required): UUID of video

**Response** (Success):
```json
{
  "success": true,
  "video": {
    "id": "uuid",
    "user_id": "uuid",
    "channel_id": "uuid",
    "title": "Video Title",
    "description": "Full description",
    "video_url": "https://example.com/video.mp4",
    "thumbnail": "https://example.com/thumb.jpg",
    "privacy": "public",
    "views": 1234,
    "likes": 56,
    "dislikes": 2,
    "duration": 180,
    "category": "Entertainment",
    "tags": ["tag1", "tag2"],
    "is_short": 0,
    "is_live": 0,
    "created_at": "2025-01-17T10:30:00Z",
    "uploader": {
      "id": "uuid",
      "username": "johndoe",
      "name": "John Doe",
      "profile_pic": "https://example.com/avatar.jpg"
    }
  },
  "comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "comment": "Great video!",
      "created_at": "2025-01-17T10:30:00Z",
      "user": {
        "username": "viewer123",
        "name": "Viewer",
        "profile_pic": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

### 10. Upload Video
**Endpoint**: `POST /video/upload`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
video: <file>
thumbnail: <file>
title: "Video Title"
description: "Video description"
category: "Entertainment"
tags: "tag1,tag2,tag3"
privacy: "public"
is_short: "0"
```

**Response** (Success):
```json
{
  "success": true,
  "video_id": "uuid",
  "video_url": "https://example.com/uploads/videos/filename.mp4",
  "thumbnail_url": "https://example.com/uploads/thumbnails/filename.jpg",
  "message": "Video uploaded successfully"
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Video file is required"
}
```

**Validation**:
- Video: Max 500MB, formats: mp4, mov, avi
- Thumbnail: Max 5MB, formats: jpg, jpeg, png
- Title: Required, max 255 characters
- Privacy: public, private, unlisted, scheduled

---

### 11. Like Video
**Endpoint**: `POST /video/like`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "video_id": "uuid",
  "action": "like"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Video liked",
  "likes": 57
}
```

**Actions**: `like`, `unlike`

---

### 12. Add Comment
**Endpoint**: `POST /video/comment`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "video_id": "uuid",
  "comment": "This is a great video!"
}
```

**Response** (Success):
```json
{
  "success": true,
  "comment_id": "uuid",
  "message": "Comment added"
}
```

---

### 13. Search Videos
**Endpoint**: `GET /video/search?q={query}`

**Query Parameters**:
- `q` (required): Search query
- `category`: Filter by category
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset (default: 0)

**Response** (Success):
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "title": "Matching Video",
      "description": "Description",
      "thumbnail": "https://example.com/thumb.jpg",
      "views": 1234,
      "likes": 56,
      "duration": 180,
      "created_at": "2025-01-17T10:30:00Z",
      "uploader": {
        "username": "johndoe",
        "name": "John Doe",
        "profile_pic": "https://example.com/avatar.jpg"
      }
    }
  ],
  "total": 25,
  "query": "search term"
}
```

---

## Shorts Management

### 14. Get All Shorts
**Endpoint**: `GET /shorts/list`

**Query Parameters** (Optional):
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response** (Success):
```json
{
  "success": true,
  "shorts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "channel_id": "uuid",
      "short_url": "https://example.com/short.mp4",
      "thumbnail": "https://example.com/thumb.jpg",
      "description": "Short description",
      "views": 5000,
      "created_at": "2025-01-17T10:30:00Z",
      "uploader": {
        "username": "johndoe",
        "name": "John Doe",
        "profile_pic": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

### 15. Upload Short
**Endpoint**: `POST /shorts/upload`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
video: <file>
thumbnail: <file>
description: "Short description"
```

**Response** (Success):
```json
{
  "success": true,
  "short_id": "uuid",
  "short_url": "https://example.com/uploads/shorts/filename.mp4",
  "thumbnail_url": "https://example.com/uploads/thumbnails/filename.jpg"
}
```

**Validation**:
- Video: Max 60 seconds, Max 100MB
- Formats: mp4, mov

---

## Admin Endpoints

### 16. Get All Users (Admin)
**Endpoint**: `GET /admin/users`

**Headers**:
```
Authorization: Bearer {token}
```

**Required Role**: admin, superadmin

**Response** (Success):
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-01-17T10:30:00Z"
    }
  ]
}
```

---

### 17. Manage Videos (Admin)
**Endpoint**: `GET /admin/videos`

**Headers**:
```
Authorization: Bearer {token}
```

**Required Role**: admin, superadmin

**Query Parameters** (Optional):
- `status`: Filter by status (pending, approved, rejected)
- `limit`: Results per page
- `offset`: Pagination offset

**Response** (Success):
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "user_id": "uuid",
      "privacy": "public",
      "views": 1234,
      "likes": 56,
      "created_at": "2025-01-17T10:30:00Z",
      "uploader": {
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  ]
}
```

---

## Health Check

### 18. Health Check
**Endpoint**: `GET /health`

**Response**:
```json
{
  "success": true,
  "status": "OK",
  "database": "connected",
  "timestamp": "2025-01-17T10:30:00Z"
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'user',
  profile_pic VARCHAR(512),
  bio TEXT,
  phone VARCHAR(32),
  channel_id CHAR(36),
  subscriptions JSON DEFAULT '[]',
  memberships JSON DEFAULT '[]',
  reactions JSON DEFAULT '[]',
  watch_history JSON DEFAULT '[]',
  watch_history_detailed JSON DEFAULT '[]',
  saved_videos JSON DEFAULT '[]',
  liked_videos JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Videos Table
```sql
CREATE TABLE videos (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  video_url VARCHAR(1024) NOT NULL,
  thumbnail VARCHAR(1024) NOT NULL,
  privacy ENUM('public','private','unlisted','scheduled') DEFAULT 'public',
  views BIGINT DEFAULT 0,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  duration INT DEFAULT 0,
  category VARCHAR(128) NOT NULL,
  tags JSON NOT NULL,
  is_short TINYINT(1) DEFAULT 0,
  is_live TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Sessions Table
```sql
CREATE TABLE sessions (
  token CHAR(96) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## Authentication Flow

1. **Register**: `POST /auth/register` → Receive token + user
2. **Login**: `POST /auth/login` → Receive token + user
3. **Store Token**: Save token in AsyncStorage/SecureStore
4. **Authenticated Requests**: Include `Authorization: Bearer {token}` header
5. **Verify Session**: `GET /auth/me` → Validate token on app start
6. **Logout**: `POST /auth/logout` → Clear token from storage

---

## File Upload Guidelines

### Video Upload Process
1. User selects video file
2. Extract thumbnail (or user uploads custom)
3. Create FormData with video, thumbnail, metadata
4. POST to `/video/upload` with multipart/form-data
5. Server saves files to `/public_html/uploads/`
6. Server creates database record
7. Return video_id and URLs

### File Storage Structure
```
public_html/
  uploads/
    videos/
      {uuid}.mp4
    thumbnails/
      {uuid}.jpg
    shorts/
      {uuid}.mp4
    avatars/
      {uuid}.jpg
```

---

## Rate Limiting
- Login attempts: 5 per minute per IP
- API requests: 100 per minute per user
- Video uploads: 10 per hour per user

---

## CORS Configuration
All endpoints support CORS with:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```
