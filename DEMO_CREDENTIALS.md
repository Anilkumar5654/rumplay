# Demo Login Credentials

Use these credentials to test different user roles in the application:

## User (Viewer) Role
**Email:** `viewer.demo@example.com`  
**Password:** `ViewerPass123!`  
**Access:** Can view videos, like, comment, and watch content.

## Creator Role
**Email:** `creator.demo@example.com`  
**Password:** `CreatorPass123!`  
**Access:** Can upload videos, manage their content, and access creator studio.

## Admin Role
**Email:** `admin.demo@example.com`  
**Password:** `AdminPass123!`  
**Access:** Can manage users, moderate content, and access admin dashboard.

## Super Admin Role
**Email:** `565413anil@gmail.com`  
**Password:** `SuperAdmin123!`  
**Access:** Full system access including role management and system configuration.

---

## Important Setup Instructions

### 1. Start the Backend Server

The backend server needs to be running on port 8787. Make sure you have the following environment configuration:

```bash
# Create .env file in the root directory if not exists
EXPO_PUBLIC_API_URL=http://localhost:8787
EXPO_PUBLIC_API_PORT=8787
```

### 2. Backend Connection

The app tries to connect to the backend at `http://localhost:8787/api/trpc`. If you're running on:

- **Web Browser:** The app will automatically connect to `http://localhost:8787`
- **Physical Device:** You need to update the API URL to use your computer's local network IP address:
  ```
  EXPO_PUBLIC_API_URL=http://192.168.x.x:8787
  ```
  Replace `192.168.x.x` with your actual local IP address.

- **Android Emulator:** Use `http://10.0.2.2:8787` instead of localhost
- **iOS Simulator:** `http://localhost:8787` should work

### 3. Common Issues and Fixes

#### Issue: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Cause:** The backend server is not running or the API URL is incorrect.

**Solutions:**
1. Ensure the backend server is running
2. Check that port 8787 is not blocked by firewall
3. Verify the `EXPO_PUBLIC_API_URL` environment variable is set correctly
4. If on physical device, use your computer's local IP address instead of localhost
5. Restart the expo development server after changing environment variables

#### Issue: Login/Register buttons not responding

**Cause:** Backend endpoint not reachable or CORS issues.

**Solutions:**
1. Check browser console/React Native logs for detailed error messages
2. Verify backend is accepting connections from your device's IP
3. Ensure backend CORS is configured properly (should allow * in development)

### 4. First Time Setup

1. The app automatically seeds 4 demo accounts on first run
2. Navigate to `/login` to access the login screen
3. Use any of the demo credentials above
4. After login, you'll be redirected based on your role:
   - User → Home page with video feed
   - Creator → Creator Studio
   - Admin → Admin Dashboard
   - Super Admin → Super Admin Panel

### 5. Testing Features

**As a User:**
- Browse videos on home page
- Watch videos and shorts
- Like, comment, and share (requires login)
- View channels and subscribe

**As a Creator:**
- Upload videos and shorts
- Manage your content
- View analytics (creator studio)
- Edit video details

**As an Admin:**
- Manage users
- Moderate content
- Assign roles
- View system stats

**As a Super Admin:**
- All admin features
- Assign admin roles
- System configuration
- Full access to all features

---

## Development Notes

- The app uses a file-based JSON database located at `backend/data/database.json`
- Sessions expire after 12 hours
- Passwords are hashed using scrypt with random salts
- Authentication uses Bearer tokens stored in SecureStore (mobile) or AsyncStorage (web)
