# Hostinger MySQL Remote Access Setup

## Problem
Your app's backend is trying to connect to MySQL with `DB_HOST="localhost"`, but the backend runs locally (not on Hostinger), so it can't reach the database.

## Solution
You need to:

1. **Enable Remote MySQL Access in Hostinger**
2. **Update the DB_HOST to use the remote hostname**

---

## Step 1: Find Your Remote MySQL Hostname

### Option A: From Hostinger cPanel
1. Log into your Hostinger account
2. Go to **cPanel** → **Databases** → **MySQL Databases** or **Remote MySQL**
3. Look for your MySQL hostname (it's usually something like):
   - `srv1616.hstgr.io`
   - `mysql.hostinger.com`
   - Or an IP address like `82.25.120.38`

### Option B: From Hostinger Account Dashboard
1. Go to Hostinger dashboard
2. Click on your hosting plan
3. Go to **Databases**
4. Find the **MySQL hostname** or **Server** field

---

## Step 2: Enable Remote MySQL Access

1. In cPanel, go to **Databases** → **Remote MySQL**
2. Add your IP address to the whitelist:
   - If developing locally, add your home/office IP
   - Or add `%` to allow all IPs (less secure, but works for testing)
3. Click **Add Host**

**Important:** If you're using Rork's preview or development server, you might need to whitelist:
- `0.0.0.0/0` (allow all - for testing only)
- Or specific IP ranges provided by your hosting

---

## Step 3: Update Your `env` File

Once you have the correct hostname, update your `env` file:

```env
# Use the REMOTE MySQL hostname from Hostinger
DB_HOST="srv1616.hstgr.io"  # Replace with your actual hostname
DB_USER="u449340066_rumplay"
DB_PASSWORD="6>E/UCiT;AYh"
DB_NAME="u449340066_rumplay"
DB_PORT="3306"
```

---

## Step 4: Test the Connection

After updating the env file:

1. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   bun run dev
   ```

2. **Test login/register** from your app

---

## Common Hostinger MySQL Hostnames

Try these in order:
1. `srv1616.hstgr.io` (Hostinger's typical format)
2. `mysql.hostinger.com`
3. Your server's IP: `82.25.120.38`
4. Check the exact hostname in your Hostinger cPanel

---

## Troubleshooting

### Error: "Access denied for user"
- Double-check your DB_USER and DB_PASSWORD
- Make sure remote access is enabled in cPanel

### Error: "Can't connect to MySQL server"
- Check if the DB_HOST is correct
- Verify your IP is whitelisted in Remote MySQL settings
- Try using the server IP instead of hostname

### Error: "Unknown database"
- Verify DB_NAME matches your database name in Hostinger

---

## Alternative: Use Hostinger's phpMyAdmin Info

1. Log into phpMyAdmin from Hostinger cPanel
2. Look at the connection info at the top
3. The "Server" field shows your MySQL hostname

---

## After Setup

Once connected, test by:
1. Opening the app
2. Going to Register page
3. Creating a new account
4. Check if it succeeds without "invalid JSON" errors

The backend logs will show:
```
[DB] Connected to MySQL database
[Backend] Server running on port 8081
```
