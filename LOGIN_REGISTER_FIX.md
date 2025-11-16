# 🔧 Login/Register Invalid JSON Fix

## ❌ Problem
Login and register are failing with "Invalid JSON response" error. The backend is returning HTML (`<!DOCTYPE html>`) instead of JSON.

## ✅ Solution Summary

The issue is that your backend cannot connect to the Hostinger MySQL database because:
- Your `env` file has `DB_HOST="localhost"`
- But your backend runs locally (not on Hostinger)
- `localhost` refers to the local machine, not the Hostinger server

**You need to use the REMOTE MySQL hostname instead.**

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Find Your Hostinger MySQL Hostname

Go to **Hostinger cPanel → Databases → Remote MySQL**

Your MySQL hostname will be something like:
- `srv1616.hstgr.io` (most common)
- `mysql.hostinger.com`
- Or an IP address

### Step 2: Enable Remote MySQL Access

In Hostinger cPanel:
1. Go to **Remote MySQL** section
2. Add `%` (allows all IPs) or your specific IP address
3. Click **Add Host**

**Important:** This allows your local backend to connect to the Hostinger database.

### Step 3: Update Your `env` File

Open your `env` file and change:

```env
# ❌ WRONG (doesn't work for remote connection)
DB_HOST="localhost"

# ✅ CORRECT (replace with your actual hostname)
DB_HOST="srv1616.hstgr.io"
```

Also update the API URL for local development:
```env
EXPO_PUBLIC_API_URL="http://localhost:8081"
```

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
bun run dev
```

---

## 📋 Complete env File Configuration

Your `env` file should look like this:

```env
# Frontend API Base URL (for local development)
EXPO_PUBLIC_API_URL="http://localhost:8081"

# Backend Database Configuration (Hostinger MySQL)
DB_HOST="srv1616.hstgr.io"  # ← YOUR REMOTE HOSTNAME HERE
DB_USER="u449340066_rumplay"
DB_PASSWORD="6>E/UCiT;AYh"
DB_NAME="u449340066_rumplay"
DB_PORT="3306"
DB_CHARSET="utf8mb4"

# Hostinger FTP/SFTP Configuration for Media Uploads
HOSTINGER_FTP_HOST="82.25.120.38"
HOSTINGER_FTP_USER="u449340066"
HOSTINGER_FTP_PASSWORD="1rZ6xAyXDm[Mpt|+"
HOSTINGER_FTP_PORT="21"
HOSTINGER_UPLOADS_PATH="/public_html/uploads"

# Public Base URL for uploaded files
PUBLIC_BASE_URL="https://moviedbr.com"

# CORS Configuration
CORS_ALLOWED_ORIGINS="*"
```

---

## 🧪 Testing After Fix

1. **Start the backend:**
   ```bash
   bun run dev
   ```

2. **Check the console logs:**
   You should see:
   ```
   [MySQL] Resolving database configuration...
   [MySQL] DB_HOST: srv1616.hstgr.io
   [MySQL] ✓ Configuration resolved successfully
   [MySQL] Creating connection pool...
   [MySQL] Testing database connection...
   [MySQL] ✓ Database connection successful!
   ```

3. **Test login/register:**
   - Open your app
   - Go to the Register page
   - Create a new account
   - You should see: "Success! Logged in successfully"
   - No more "Invalid JSON" errors

---

## 🔍 Expected Behavior

### ❌ Before Fix:
```json
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
...
```
- Error: "Server returned invalid response"
- Console: "Cannot read property..."

### ✅ After Fix:
```json
{
  "success": true,
  "token": "abc123...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "user123",
    ...
  }
}
```
- Success message displayed
- User logged in and redirected to home screen

---

## 🐛 Troubleshooting

### Issue: Still getting HTML responses

**Solution:**
1. Make sure the backend server is running (`bun run dev`)
2. Check that `EXPO_PUBLIC_API_URL="http://localhost:8081"` in your env
3. Verify the backend is accessible at `http://localhost:8081/api/health`

---

### Issue: "Cannot reach database server" (ENOTFOUND/ECONNREFUSED)

**Solution:**
1. ✅ Verify DB_HOST is correct (not "localhost")
2. ✅ Check if Remote MySQL is enabled in Hostinger cPanel
3. ✅ Try different hostname formats:
   - `srv1616.hstgr.io`
   - IP address: `82.25.120.38`
   - Check Hostinger cPanel for exact hostname

---

### Issue: "Access denied for user"

**Solution:**
1. ✅ Double-check DB_USER and DB_PASSWORD in env file
2. ✅ Make sure credentials match those in Hostinger cPanel
3. ✅ Ensure Remote MySQL access is enabled
4. ✅ Try adding your IP address to Remote MySQL whitelist

---

### Issue: "Unknown database"

**Solution:**
1. ✅ Verify DB_NAME matches your database name in Hostinger
2. ✅ Log into phpMyAdmin and check the database exists
3. ✅ Ensure schema.sql has been imported

---

## 📊 How to Find Your MySQL Hostname

### Method 1: Hostinger cPanel (Recommended)
1. Login to Hostinger
2. Open cPanel
3. Go to **Databases** → **Remote MySQL**
4. Look for **"Server"** or **"Hostname"** field
5. Copy that value to DB_HOST in your env file

### Method 2: phpMyAdmin
1. Open phpMyAdmin from Hostinger cPanel
2. Look at the top of the page
3. You'll see "Server: srv1616.hstgr.io" (or similar)
4. Use that as your DB_HOST

### Method 3: MySQL Databases Section
1. Go to cPanel → **MySQL Databases**
2. Look for connection information
3. Note the hostname shown

### Method 4: Contact Hostinger Support
If you can't find it, ask Hostinger support for:
- "Remote MySQL hostname for database access"

---

## 🎯 Next Steps After Login Works

Once login/register work:

1. ✅ Test video upload functionality
2. ✅ Test shorts upload
3. ✅ Verify files are saved to Hostinger FTP
4. ✅ Check data is saved in MySQL database
5. ✅ Test user profile updates

---

## 📚 Additional Resources

- **HOSTINGER_MYSQL_SETUP.md** - Detailed MySQL setup guide
- **SETUP_COMPLETE.md** - Full project setup instructions
- **env.example** - Configuration template with comments

---

## ⚠️ Important Notes

1. **Never use `localhost` for remote databases**
   - Only use `localhost` if backend runs on the same server as MySQL
   - For Hostinger, always use the remote hostname

2. **Enable Remote MySQL Access**
   - This is REQUIRED for external connections
   - Without it, you'll get "Access denied" errors

3. **Development vs Production**
   - Development: `EXPO_PUBLIC_API_URL="http://localhost:8081"`
   - Production: `EXPO_PUBLIC_API_URL="https://moviedbr.com"`

4. **Security**
   - Use strong passwords
   - Don't commit the `env` file to Git
   - Enable HTTPS in production
   - Restrict Remote MySQL to specific IPs in production

---

## 💡 Understanding the Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│                 │         │                 │         │                  │
│   Mobile App    │────────>│  Local Backend  │────────>│ Hostinger MySQL  │
│                 │         │  (localhost)    │         │  (Remote Server) │
└─────────────────┘         └─────────────────┘         └──────────────────┘
     Frontend                    Backend                    Database

API calls go to         Backend connects to          Database stores
localhost:8081          remote MySQL server          user data, videos, etc.
```

**Key Point:** The backend acts as a bridge between your app and the Hostinger database.

---

## ✅ Success Checklist

After fixing, verify:

- [ ] Backend starts without database connection errors
- [ ] Console shows "✓ Database connection successful!"
- [ ] Register page works and creates new users
- [ ] Login page works with created users
- [ ] Users are saved in Hostinger MySQL database
- [ ] No more "Invalid JSON" errors
- [ ] Auth token is stored and persists on app restart

---

## 🆘 Still Having Issues?

If you've tried everything and it's still not working:

1. Check the backend console logs for specific error messages
2. Test the database connection using MySQL Workbench or another client
3. Verify all credentials in Hostinger cPanel
4. Make sure the schema.sql has been imported
5. Try connecting from a different network
6. Contact Hostinger support for MySQL connection issues

---

**Last Updated:** 2025-01-16  
**Status:** ✅ Fixed - Follow steps above
