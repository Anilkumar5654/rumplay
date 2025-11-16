# Upload Setup Guide

## Problem

The video upload is failing because the **Hostinger FTP credentials** are not configured in the `env` file.

## Error

```
ERROR [UploadModal] Upload failed: Upload failed
```

This happens because the backend cannot upload files to Hostinger without valid FTP credentials.

## Solution

### 1. Configure Hostinger FTP Credentials

Edit your `env` file and replace the placeholder values with your actual Hostinger credentials:

```env
# Hostinger FTP/SFTP Configuration for Media Uploads
HOSTINGER_FTP_HOST="ftp.moviedbr.com"           # Replace with your actual FTP host
HOSTINGER_FTP_USER="your_actual_ftp_username"  # Replace with your FTP username
HOSTINGER_FTP_PASSWORD="your_actual_password"  # Replace with your FTP password
HOSTINGER_FTP_PORT="21"                         # Default FTP port (21)
HOSTINGER_UPLOADS_PATH="/public_html/uploads"  # Path where files will be uploaded
```

### 2. How to Get Your Hostinger FTP Credentials

1. **Login to Hostinger Panel** (hpanel.hostinger.com)
2. **Go to Files → FTP Accounts**
3. You'll see your FTP credentials or create a new FTP account:
   - **FTP Host**: Usually `ftp.yourdomain.com` or an IP address
   - **Username**: Your FTP username
   - **Password**: Set or reset your password
   - **Port**: Usually `21` for FTP or `22` for SFTP

### 3. MySQL Database Credentials

Also ensure your MySQL credentials are correct:

```env
# Backend Database Configuration (Hostinger MySQL)
DB_HOST="your_hostinger_mysql_host.mysql.db"  # Get from Hostinger MySQL section
DB_USER="your_database_username"               # Your MySQL username
DB_PASSWORD="your_database_password"           # Your MySQL password
DB_NAME="your_database_name"                   # Your database name
DB_PORT="3306"                                  # Default MySQL port
```

To get MySQL credentials:
1. **Login to Hostinger Panel**
2. **Go to Databases → MySQL Databases**
3. Note down:
   - **Database Host** (e.g., `mysql123.hostinger.com`)
   - **Database Name**
   - **Username**
   - **Password** (reset if forgotten)

### 4. Create Upload Directories on Hostinger

Ensure these directories exist in your Hostinger file manager:

```
/public_html/uploads/
├── videos/
├── shorts/
├── thumbnails/
├── profiles/
└── banners/
```

Create them via:
- **Hostinger File Manager**, or
- **FTP Client** (FileZilla, WinSCP)

### 5. Restart Your Backend

After updating the `env` file:

```bash
# If using bun
bun run dev

# Or restart your server
```

### 6. Test the Upload

1. Login to your app
2. Click the upload button
3. Select a video and thumbnail
4. Fill in title, description, category
5. Click "Upload Video"

Check the console logs for detailed error messages.

## Architecture

Here's how the upload flow works:

```
Frontend (React Native)
    ↓ FormData (multipart/form-data)
Backend (Hono API - /api/video/upload)
    ↓ Processes files
    ↓ Validates auth, title, category
    ↓ Creates file buffers
    ↓ Uploads to Hostinger FTP
Hostinger Server (/public_html/uploads/)
    ↓ Files stored
    ↓ Public URLs generated
Backend saves metadata to MySQL
    ↓ Video ID, title, URLs, etc.
Frontend receives response
    ↓ Displays success
```

## Debugging

### Check Backend Logs

Look for these log messages:

```
[VideoUpload] Incoming request
[Uploads] Uploading to Hostinger
[HostingerUpload] Connecting to FTP server
[HostingerUpload] Upload successful
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Hostinger FTP configuration incomplete` | Missing FTP credentials | Add credentials to `env` file |
| `Connection refused` | Wrong FTP host/port | Check FTP host and port in Hostinger panel |
| `Authentication failed` | Wrong username/password | Reset password in Hostinger FTP section |
| `Directory not found` | Upload directories don't exist | Create folders in file manager |
| `Unable to upload file` | Network/permission issue | Check file permissions on Hostinger |

### Test FTP Connection

You can test your FTP connection using FileZilla or command line:

```bash
# Using FTP command
ftp ftp.moviedbr.com
# Enter username and password when prompted

# Or using curl
curl -T test.txt ftp://ftp.moviedbr.com/public_html/uploads/ --user username:password
```

## Alternative: Use Local Storage During Development

If you don't want to configure Hostinger FTP yet, you can temporarily modify the backend to save files locally:

1. Edit `backend/utils/hostingerUpload.ts`
2. Make `uploadToHostinger` save to local filesystem
3. Use local URLs for development

**Note**: This is only for testing. Production should use Hostinger FTP.

## Need Help?

1. Check console logs in both frontend and backend
2. Verify all credentials in `env` file
3. Test FTP connection separately
4. Ensure upload directories exist on Hostinger
5. Check file permissions (755 for directories, 644 for files)

## Summary

**Quick Checklist:**

- [ ] FTP credentials added to `env` file
- [ ] MySQL credentials added to `env` file  
- [ ] Upload directories created on Hostinger
- [ ] Backend restarted after env changes
- [ ] Test upload with logged-in user
- [ ] Check console for detailed errors
