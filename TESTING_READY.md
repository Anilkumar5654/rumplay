# 🎯 Rumplay App - Ready for Testing

## ✅ Setup Complete

Your app is now fully configured and ready for testing with:
- **Frontend**: React Native (Expo)
- **Backend**: PHP API on Hostinger
- **Database**: MySQL on Hostinger
- **Domain**: https://moviedbr.com

---

## 📱 How to Start Testing

### 1. Start the Development Server

```bash
bun start
```

This will:
- Start the Expo development server
- Generate a QR code for mobile testing
- Open the Metro bundler

### 2. Test on Different Platforms

#### **Option A: Mobile Device (Recommended)**
1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from your terminal with:
   - iOS: Camera app
   - Android: Expo Go app

#### **Option B: Web Browser**
- The app will automatically open in your browser
- URL: `http://localhost:8081`

---

## 🧪 Testing Checklist

### ✅ Authentication
- [ ] **Register** a new account
  - Test with: email, password, username
  - Should save to MySQL database
  
- [ ] **Login** with created account
  - Should return JWT token
  - Should load user profile

- [ ] **Logout**
  - Should clear session
  - Should redirect to login

### ✅ Video Upload
- [ ] Open **Upload Modal** (+ button)
- [ ] Select video file from device
- [ ] Select/capture thumbnail
- [ ] Fill video details:
  - Title (required)
  - Description
  - Category
  - Tags
  - Privacy settings
- [ ] Submit upload
  - Should upload to: `public_html/uploads/videos/`
  - Should save to MySQL `videos` table
  - Should return video URL

### ✅ Shorts Upload
- [ ] Navigate to Shorts tab
- [ ] Upload short video (< 60 seconds)
- [ ] Should upload to: `public_html/uploads/shorts/`
- [ ] Should save to MySQL `shorts` table

### ✅ Profile Management
- [ ] View profile
- [ ] Edit profile:
  - Change avatar (uploads to `public_html/uploads/profile/`)
  - Update bio
  - Change display name
- [ ] View uploaded videos
- [ ] View watch history

### ✅ Video Playback
- [ ] Play uploaded video
- [ ] Video controls work:
  - Play/Pause
  - Seek bar
  - Volume
  - Fullscreen
- [ ] Like/Unlike video (saves to database)
- [ ] Add comment (saves to database)
- [ ] Share video

### ✅ Settings
- [ ] Change theme (Light/Dark)
- [ ] Change accent color
- [ ] Toggle autoplay settings
- [ ] Clear cache/history

---

## 🔍 What to Check

### Database Verification
After testing, verify data is saved in MySQL:

```sql
-- Check users
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- Check videos
SELECT * FROM videos ORDER BY created_at DESC LIMIT 5;

-- Check uploads count
SELECT COUNT(*) as total_videos FROM videos;
SELECT COUNT(*) as total_users FROM users;
```

### File Manager Verification
Check Hostinger File Manager at: `public_html/uploads/`

Expected structure:
```
public_html/
  └── uploads/
      ├── videos/          (uploaded videos)
      ├── thumbnails/      (video thumbnails)
      ├── shorts/          (short videos)
      ├── profile/         (profile pictures)
      └── channel/         (channel banners)
```

---

## 🐛 Troubleshooting

### Issue: "Network request failed"
**Solution**: 
- Ensure your device is on the same network
- Check `EXPO_PUBLIC_API_URL` in `env` file
- Current: `https://moviedbr.com`

### Issue: "Upload failed - Server returned invalid response"
**Check**:
1. PHP API files exist at: `https://moviedbr.com/api/`
2. Test endpoint: `https://moviedbr.com/api/health.php`
3. Check PHP error logs in Hostinger control panel

### Issue: "Cannot connect to database"
**Verify**:
1. MySQL credentials in `api/db.php`
2. Database exists: `u449340066_rumplay`
3. Remote MySQL is enabled in Hostinger

### Issue: "CORS error"
**Solution**: Headers are set in `api/db.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

## 📊 API Endpoints

All endpoints are at: `https://moviedbr.com/api/`

### Authentication
- `POST /api/auth/login.php` - Login
- `POST /api/auth/register.php` - Register
- `GET /api/auth/me.php` - Get current user
- `POST /api/auth/logout.php` - Logout

### Videos
- `POST /api/video/upload.php` - Upload video
- `GET /api/video/list.php` - List videos
- `GET /api/video/details.php?id={id}` - Video details
- `POST /api/video/like.php` - Like video
- `POST /api/video/comment.php` - Add comment

### Shorts
- `POST /api/shorts/upload.php` - Upload short
- `GET /api/shorts/list.php` - List shorts

### User
- `GET /api/user/profile.php?id={id}` - User profile
- `GET /api/user/uploads.php` - User uploads

### Admin (requires admin role)
- `GET /api/admin/users.php` - Manage users
- `GET /api/admin/videos.php` - Manage videos

### Health Check
- `GET /api/health.php` - Check API status

---

## 🔐 Test Credentials

After registration, you can create test accounts with different roles:

### User Account
```
Email: user@test.com
Password: Test123!
Role: user
```

### Creator Account
```
Email: creator@test.com
Password: Test123!
Role: creator
```

### Admin Account
```
Email: admin@test.com
Password: Test123!
Role: admin
```

*Note: First registered user gets default 'user' role. Roles can be updated in database.*

---

## 📸 Testing Screenshots Checklist

Capture these screens for verification:
- [ ] Login screen
- [ ] Home feed with videos
- [ ] Video player
- [ ] Upload modal
- [ ] Profile screen
- [ ] Settings screen
- [ ] Shorts feed

---

## 🚀 Production Deployment

Once testing is complete:

1. **Update environment variables** for production
2. **Configure CORS** properly (restrict origins)
3. **Enable HTTPS** only
4. **Set up file upload limits** in PHP
5. **Configure database backups**
6. **Set up monitoring** (error logging)
7. **Test performance** with real users

---

## 📝 Known Limitations

1. **File Upload Size**: Default PHP upload limit (check php.ini)
2. **Video Processing**: No automatic transcoding (videos play as uploaded)
3. **Storage**: Limited by Hostinger plan
4. **Concurrent Users**: Based on hosting plan limits

---

## ✨ Features Ready

✅ User authentication (JWT)
✅ Video upload with thumbnails
✅ Shorts upload
✅ Profile management
✅ Video playback
✅ Comments system
✅ Like/Unlike functionality
✅ Watch history tracking
✅ Settings customization
✅ Role-based access (User, Creator, Admin)
✅ Responsive mobile design
✅ Dark/Light theme
✅ File uploads to Hostinger
✅ MySQL database integration

---

## 🎉 Ready to Test!

Your app is fully configured and ready for testing. Start the server with `bun start` and begin testing all features.

For any issues, check the troubleshooting section above or review the console logs for detailed error messages.

**Happy Testing! 🚀**
