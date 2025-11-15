# Authentication Error Fix Summary

## Problem Identified

The error `TRPCClientError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` means the backend server is either:
1. Not running
2. Not accessible from the client
3. Returning HTML error pages instead of JSON

## What Was Fixed

### 1. **Environment Configuration** ✅
Created `.env` file with backend API URL:
```env
EXPO_PUBLIC_API_URL=https://moviedbr.com/
EXPO_PUBLIC_API_PORT=8787
```

### 2. **Enhanced Logging** ✅
Added detailed logging to help debug connection issues:
- tRPC client now logs every request URL
- Auth errors now include the API URL being used
- Better error messages that tell you exactly what's wrong

### 3. **Fixed Initial Navigation** ✅
Updated `app/index.tsx` to handle authentication state properly:
- Now redirects to home page even if not logged in (viewers can browse)
- Fixed "navigate before mounting" error

### 4. **Added Health Check Endpoint** ✅
Backend now has `/api/health` endpoint to verify it's running:
```
GET https://moviedbr.com/api/health
```

### 5. **Created Demo Credentials Document** ✅
Added `DEMO_CREDENTIALS.md` with all test accounts for each role.

## How to Fix Your App

### Step 1: Start the Backend Server

**The backend MUST be running for authentication to work.**

Check if your backend is running by visiting:
```
https://moviedbr.com/api/health
```

If you see JSON response like this, the backend is running:
```json
{
  "status": "ok",
  "message": "Backend API is healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "endpoints": {
    "tRPC": "/api/trpc",
    "auth": "/api/auth/*"
  }
}
```

### Step 2: Restart the Expo Development Server

After adding the `.env` file, you need to restart Expo:

```bash
# Stop the current server (Ctrl+C)
# Then start again
bun start
```

### Step 3: Check the Console Logs

When you try to login, look for these logs:

**Good signs (working):**
```
[tRPC] Making request to: https://moviedbr.com/api/trpc
[tRPC] Response status: 200
AuthContext login success user-xxx user
```

**Bad signs (not working):**
```
[tRPC] Fetch error: TypeError: Failed to fetch
AuthContext login error Cannot connect to backend at https://moviedbr.com
```

### Step 4: Platform-Specific Configuration

#### Web Browser
- Should work automatically with `https://moviedbr.com`
- Check browser console for errors

#### Physical Device (Phone/Tablet)
You need to use your computer's LOCAL NETWORK IP address instead of localhost:

1. Find your computer's local IP:
   - **macOS/Linux:** `ifconfig | grep "inet "` 
   - **Windows:** `ipconfig`
   - Look for something like `192.168.1.100`

2. Update `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8787
   ```

3. Make sure your phone and computer are on the same WiFi network

#### Android Emulator
Update `.env`:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8787
```

#### iOS Simulator
```env
EXPO_PUBLIC_API_URL=https://moviedbr.com/
```

## Demo Login Credentials

See `DEMO_CREDENTIALS.md` for all test accounts:

**Quick Test Account:**
- Email: `viewer.demo@example.com`
- Password: `ViewerPass123!`

## Testing the Fix

1. **Backend Health Check:**
   ```bash
   curl https://moviedbr.com/api/health
   ```
   Should return JSON with status "ok"

2. **tRPC Endpoint:**
   ```bash
   curl https://moviedbr.com/api/trpc
   ```
   Should return tRPC response (not HTML error page)

3. **Login Test:**
   - Open the app
   - Go to login page
   - Try logging in with demo credentials
   - Check console for `[tRPC]` logs
   - Should see success message and redirect

## Common Issues

### Issue: "Cannot connect to backend at https://moviedbr.com"

**Solution:**
1. Check if backend is running: `curl https://moviedbr.com/api/health`
2. If not running, start the backend server
3. Check if port 8787 is blocked by firewall
4. Try using `127.0.0.1:8787` instead of `localhost:8787`

### Issue: Still getting HTML instead of JSON

**Solution:**
1. The backend might be returning error pages
2. Check backend logs for errors
3. Verify the database file exists at `backend/data/database.json`
4. Try deleting `backend/data/database.json` to reset (will recreate with seed data)

### Issue: Login works but session not persisting

**Solution:**
1. Check AsyncStorage/SecureStore permissions
2. Clear app cache and storage
3. Check browser/app console for storage errors

### Issue: Environment variables not loading

**Solution:**
1. Restart Expo dev server after changing `.env`
2. Clear Metro bundler cache: `bun start --clear`
3. Check that `.env` file is in project root (not in subdirectory)

## Next Steps

1. ✅ Start backend server on port 8787
2. ✅ Restart Expo with cleared cache
3. ✅ Test login with demo credentials
4. ✅ Check console logs for connection info
5. ✅ Verify API URL is correct for your platform

## Files Changed

- ✅ Created `.env` - Backend API configuration
- ✅ Created `DEMO_CREDENTIALS.md` - Test account credentials
- ✅ Created `FIX_SUMMARY.md` - This file
- ✅ Updated `lib/trpc.ts` - Added detailed logging
- ✅ Updated `contexts/AuthContext.tsx` - Better error messages
- ✅ Updated `backend/hono.ts` - Added health check endpoint
- ✅ Updated `app/index.tsx` - Fixed navigation timing

## Getting Help

If you're still having issues after following this guide:

1. Check the console logs for `[tRPC]` and `[AuthContext]` messages
2. Verify backend is running: `https://moviedbr.com/api/health`
3. Share the console error messages
4. Check your network configuration (firewall, WiFi, etc.)
