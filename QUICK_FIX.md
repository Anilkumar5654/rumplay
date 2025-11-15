# Quick Fix Guide - Authentication Error

## The Problem
Error: `TRPCClientError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## The Solution (3 Steps)

### ✅ Step 1: Ensure Backend is Running
The backend server MUST be running on port 8787 for login to work.

**Test it:**
```bash
node test-backend.js
```

Or manually:
```bash
curl https://moviedbr.com/api/health
```

**Expected response:**
```json
{"status":"ok","message":"Backend API is healthy"}
```

If you get an error, the backend is not running!

---

### ✅ Step 2: Configure Environment

A `.env` file has been created with:
```env
EXPO_PUBLIC_API_URL=https://moviedbr.com/
EXPO_PUBLIC_API_PORT=8787
```

**For Physical Device:**
Change `localhost` to your computer's local IP (e.g., `192.168.1.100`)

**For Android Emulator:**
Use `http://10.0.2.2:8787`

---

### ✅ Step 3: Restart Everything

```bash
# Stop the Expo server (Ctrl+C)
# Clear cache and restart
bun start --clear
```

---

## Test Login

**Demo Account (User Role):**
- Email: `viewer.demo@example.com`
- Password: `ViewerPass123!`

**Demo Account (Super Admin):**
- Email: `565413anil@gmail.com`
- Password: `SuperAdmin123!`

See `DEMO_CREDENTIALS.md` for all test accounts.

---

## Troubleshooting

### "Cannot connect to backend"
→ Backend is not running. Start it on port 8787.

### "Still getting HTML error"
→ Backend is returning error pages. Check backend logs.

### "Works on web but not on phone"
→ Change `localhost` to your computer's IP in `.env`

### "Environment variables not loading"
→ Restart Expo with `bun start --clear`

---

## Verify the Fix

1. **Backend Health:**
   ```bash
   curl https://moviedbr.com/api/health
   ```

2. **Open App:**
   - Should load home page without errors
   - Can browse videos without login

3. **Try Login:**
   - Go to login page
   - Use demo credentials
   - Check console for `[tRPC]` logs
   - Should redirect based on role

4. **Check Logs:**
   Look for these in console:
   ```
   [tRPC] Making request to: https://moviedbr.com/api/trpc
   [tRPC] Response status: 200
   AuthContext login success
   ```

---

## All Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | viewer.demo@example.com | ViewerPass123! |
| Creator | creator.demo@example.com | CreatorPass123! |
| Admin | admin.demo@example.com | AdminPass123! |
| Super Admin | 565413anil@gmail.com | SuperAdmin123! |

---

## Files Modified

✅ `.env` - Environment configuration
✅ `lib/trpc.ts` - Added logging
✅ `contexts/AuthContext.tsx` - Better errors  
✅ `backend/hono.ts` - Health check endpoint
✅ `app/index.tsx` - Fixed navigation

---

## Need More Help?

Read the detailed guides:
- `FIX_SUMMARY.md` - Comprehensive fix explanation
- `DEMO_CREDENTIALS.md` - All test accounts and setup info

Run the backend test:
```bash
node test-backend.js
```
