# Quick Fix for Login/Register Invalid JSON Error

## Problem
Login and register are returning invalid JSON responses (getting HTML/DOCTYPE instead of JSON).

## Root Cause
Your backend is trying to connect to MySQL using `DB_HOST="localhost"`, but:
- The backend runs locally (in development)
- The database is on Hostinger (remote server)
- `localhost` doesn't work for remote connections

## IMMEDIATE FIX

### 1. Find Your Hostinger MySQL Hostname

Log into **Hostinger cPanel** → **Databases** section and find your MySQL hostname.

It's typically one of:
- `srv1616.hstgr.io`
- `mysql.hostinger.com`  
- Your server IP: `82.25.120.38`

### 2. Enable Remote MySQL Access

In Hostinger cPanel:
1. Go to **Remote MySQL**
2. Add `%` (allows all IPs) or your specific IP
3. Click **Add Host**

### 3. Update Your `env` File

Replace this line in your `env` file:
```env
DB_HOST="localhost"
```

With your actual Hostinger MySQL hostname:
```env
DB_HOST="srv1616.hstgr.io"  # or your actual hostname
```

### 4. Restart Development Server

```bash
# Stop the server (Ctrl+C if running)
# Then start again
bun run dev
```

### 5. Test Login/Register

Open your app and try to register or login. It should now return proper JSON responses instead of HTML errors.

---

## Full Configuration Example

Your complete `env` file should look like:

```env
# For local development
EXPO_PUBLIC_API_URL="http://localhost:8081"

# Hostinger MySQL (REMOTE hostname, not localhost)
DB_HOST="srv1616.hstgr.io"  # ← CHANGE THIS
DB_USER="u449340066_rumplay"
DB_PASSWORD="6>E/UCiT;AYh"
DB_NAME="u449340066_rumplay"
DB_PORT="3306"

# FTP for file uploads
HOSTINGER_FTP_HOST="82.25.120.38"
HOSTINGER_FTP_USER="u449340066"
HOSTINGER_FTP_PASSWORD="1rZ6xAyXDm[Mpt|+"
HOSTINGER_FTP_PORT="21"
HOSTINGER_UPLOADS_PATH="/public_html/uploads"

# Public URL for uploaded files
PUBLIC_BASE_URL="https://moviedbr.com"

# CORS
CORS_ALLOWED_ORIGINS="*"
```

---

## Expected Behavior After Fix

✅ **Before Fix:**
- Login returns: `<!DOCTYPE html>` (HTML error page)
- Console shows: "Server returned invalid response"

✅ **After Fix:**
- Login returns: `{ success: true, token: "...", user: {...} }`
- Console shows: "Login successful"
- You're redirected to the home screen

---

## Troubleshooting

### Still getting HTML responses?
1. Check that the backend server is running (`bun run dev`)
2. Verify DB_HOST is the correct remote hostname
3. Ensure Remote MySQL is enabled in Hostinger cPanel

### "Access denied" errors?
- Verify your DB_USER and DB_PASSWORD are correct
- Check that remote access is enabled for your IP

### "Cannot connect to MySQL server"?
- Try different hostnames (srv1616.hstgr.io, IP address, etc.)
- Check if your IP is whitelisted in Remote MySQL settings

---

## How to Find Correct DB_HOST

### Method 1: Hostinger cPanel
1. Login to Hostinger
2. Go to **cPanel** → **Databases** → **Remote MySQL**
3. Look for "Server" or "Hostname" field

### Method 2: phpMyAdmin
1. Open phpMyAdmin from Hostinger cPanel
2. Look at the connection info at the top
3. Note the "Server:" value

### Method 3: Contact Hostinger Support
If you can't find it, contact Hostinger support and ask for:
- "Remote MySQL hostname for my database"

---

## Next Steps After Login Works

Once login/register work properly:
1. Test video upload
2. Test shorts upload  
3. Verify media files save to Hostinger `/public_html/uploads/`
4. Confirm data saves to MySQL database

---

## Need Help?

If you're still having issues:
1. Check the console logs for specific error messages
2. Verify your Hostinger database credentials
3. Make sure Remote MySQL access is enabled
4. Try connecting to the database using a MySQL client (like MySQL Workbench) to test the connection

