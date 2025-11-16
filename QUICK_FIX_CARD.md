# 🚨 QUICK FIX CARD - Login/Register Invalid JSON

## Problem
❌ Login/Register returning HTML instead of JSON

## Root Cause
🔍 Backend can't connect to MySQL database  
   Using `localhost` for remote Hostinger database

## Solution (3 Steps)

### 1️⃣ Find MySQL Hostname
Go to: **Hostinger cPanel → Remote MySQL**  
Look for: **"Server" or "MySQL Hostname"**  
Examples: `srv1616.hstgr.io`, `mysql.hostinger.com`

### 2️⃣ Enable Remote Access
In **Hostinger cPanel → Remote MySQL**:
- Add `%` (allow all) or your IP address
- Click "Add Host"

### 3️⃣ Update env File
```env
DB_HOST="srv1616.hstgr.io"  # Your actual hostname
```

Then restart: `bun run dev`

---

## Verification

✅ **Backend logs should show:**
```
[MySQL] ✓ Database connection successful!
```

✅ **App should:**
- Register new users successfully
- Login without "Invalid JSON" errors
- Save data to MySQL database

---

## Most Common Mistakes

❌ Using `DB_HOST="localhost"` for remote database  
❌ Not enabling Remote MySQL access in cPanel  
❌ Wrong hostname (not checking in cPanel)  
❌ Not restarting backend after env changes

---

## Quick Test

1. Start backend: `bun run dev`
2. Check logs for "✓ Database connection successful"
3. Open app → Register → Create account
4. Should succeed! 🎉

---

## Need Help?

See detailed guides:
- **START_HERE_FIX.md** - Complete step-by-step
- **LOGIN_REGISTER_FIX.md** - Full troubleshooting
- **HOSTINGER_MYSQL_SETUP.md** - MySQL setup details

---

## Common Hostinger Hostnames

Try these in order:
1. `srv1616.hstgr.io`
2. `mysql.hostinger.com`
3. Your server IP: `82.25.120.38`

**Always check your actual hostname in Hostinger cPanel!**
