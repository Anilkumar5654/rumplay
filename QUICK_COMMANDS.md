# 🚀 Quick Commands Reference

## Essential Commands

### Start/Restart Development Server
```bash
# Primary command - starts with tunnel
bun start

# Alternative - starts without clearing cache
bun run start

# Start web only
bun start-web

# Clear Metro bundler cache and restart
bun start --clear
```

### Stop Development Server
```
Press Ctrl + C in terminal
```

### Reload App
```
# In Expo Go app
- Shake device
- Press "R" in terminal
- Press "R" in Expo Go menu

# On web
- Press "R" in terminal
- Or refresh browser (Cmd+R / Ctrl+R)
```

---

## Development Workflow

### 1. Start Development
```bash
cd /path/to/rumplay
bun start
```

### 2. Scan QR Code
- Open Expo Go app on your phone
- Scan the QR code from terminal

### 3. View Logs
All logs appear in terminal automatically

### 4. Debug
- Check console logs in terminal
- Check React DevTools in browser
- Use `console.log()` liberally

---

## Common Tasks

### Test API Connection
```bash
# Test health endpoint
curl https://moviedbr.com/api/health.php

# Test login (with credentials)
curl -X POST https://moviedbr.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Check Environment Variables
```bash
# View current API URL
cat env | grep EXPO_PUBLIC_API_URL

# Expected output:
EXPO_PUBLIC_API_URL="https://moviedbr.com"
```

### Clear App Cache
```bash
# Clear Expo cache
bun start --clear

# Or manually
rm -rf .expo
rm -rf node_modules/.cache
```

### Reset App Data (on device)
1. Open app in Expo Go
2. Shake device for developer menu
3. Select "Clear AsyncStorage"
4. Reload app

---

## Platform-Specific Commands

### iOS
```bash
# Start with iOS simulator (if available)
bun start --ios
```

### Android
```bash
# Start with Android emulator (if available)
bun start --android
```

### Web
```bash
# Start web version only
bun start-web

# Or
bun start --web
```

---

## Troubleshooting Commands

### Network Issues
```bash
# Check if API is accessible
curl -I https://moviedbr.com/api/health.php

# Should return: HTTP/2 200
```

### Port Already in Use
```bash
# Kill process on port 8081
kill -9 $(lsof -ti:8081)

# Then restart
bun start
```

### Cache Issues
```bash
# Nuclear option - clear everything
rm -rf node_modules
rm -rf .expo
rm -rf bun.lock
bun install
bun start --clear
```

---

## Database Commands

### Connect to MySQL (via SSH or phpMyAdmin)
- URL: https://hpanel.hostinger.com/
- Database: u449340066_rumplay
- User: u449340066_rumplay

### Quick Queries
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Latest videos
SELECT id, title, created_at FROM videos 
ORDER BY created_at DESC LIMIT 10;

-- Check user role
SELECT username, email, role FROM users WHERE email = 'your@email.com';
```

---

## File Management

### Check Uploads Directory
1. Login to Hostinger File Manager
2. Navigate to: `public_html/uploads/`
3. Check folders:
   - `videos/`
   - `thumbnails/`
   - `shorts/`
   - `profile/`

### Upload API Files
If you need to update API files:
1. Go to Hostinger File Manager
2. Navigate to `public_html/api/`
3. Upload/edit PHP files
4. Ensure permissions are 644 for files, 755 for directories

---

## Environment Variables

Current configuration in `env` file:
```env
EXPO_PUBLIC_API_URL="https://moviedbr.com"
DB_HOST="localhost"
DB_USER="u449340066_rumplay"
DB_PASSWORD="6>E/UCiT;AYh"
DB_NAME="u449340066_rumplay"
PUBLIC_BASE_URL="https://moviedbr.com"
```

After changing env variables:
```bash
# Restart server
# Press Ctrl+C, then:
bun start
```

---

## Quick Fixes

### "Network request failed"
```bash
# 1. Check API is online
curl https://moviedbr.com/api/health.php

# 2. Restart dev server
bun start

# 3. Reload app in Expo Go
# Shake device → Reload
```

### "Upload failed"
```bash
# 1. Check uploads directory exists
ls -la public_html/uploads/

# 2. Check permissions
chmod 755 public_html/uploads/
chmod 755 public_html/uploads/videos/

# 3. Test API endpoint
curl https://moviedbr.com/api/video/upload.php
```

### "Cannot read property 'ReanimatedModule'"
This was fixed in settings.tsx. If it still occurs:
```bash
# Clear cache and restart
bun start --clear
```

---

## Logs Location

### Development Logs
- Terminal output (real-time)
- Metro bundler logs

### Server Logs
- Hostinger Control Panel → Error Logs
- Location: `/home/u449340066/logs/`

### Database Logs
- phpMyAdmin → Status → Error Log

---

## Keyboard Shortcuts

### In Terminal (Expo CLI)
- `R` - Reload app
- `D` - Open developer menu
- `Shift + D` - Toggle dev tools
- `Ctrl + C` - Stop server

### In Browser (Web)
- `Cmd/Ctrl + R` - Reload page
- `F12` - Open DevTools
- `Cmd/Ctrl + Shift + I` - Inspect element

---

## Support Checklist

Before asking for help, try:
- [ ] Restart dev server (`bun start`)
- [ ] Clear cache (`bun start --clear`)
- [ ] Check API health (`curl https://moviedbr.com/api/health.php`)
- [ ] Check console logs in terminal
- [ ] Verify env variables (`cat env`)
- [ ] Test on different device/platform

---

## Quick Status Check

Run this to verify everything is working:
```bash
# 1. Check API
curl https://moviedbr.com/api/health.php

# 2. Check database connection (from PHP)
curl https://moviedbr.com/api/auth/me.php

# 3. Check file uploads directory
# Login to File Manager and verify folders exist
```

Expected results:
- API health returns JSON
- Auth endpoint returns 401 (if not logged in) or user data
- Uploads directory has proper folder structure

---

## 🎯 Most Common Commands

```bash
# Start app
bun start

# Restart (if already running)
Ctrl+C, then: bun start

# Clear cache and start
bun start --clear

# Test API
curl https://moviedbr.com/api/health.php

# Check environment
cat env
```

**That's it! Keep this file handy for quick reference. 🚀**
