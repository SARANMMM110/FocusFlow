# Fix Google OAuth Redirect URI Mismatch

## The Problem

Error: `redirect_uri_mismatch` means the redirect URI in Google Cloud Console doesn't match what your app is sending.

## The Solution

Your app is using this redirect URI:
```
http://localhost:3000/api/auth/google/callback
```

### Step-by-Step Fix:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Credentials**
   - Click **APIs & Services** in the left menu
   - Click **Credentials**
   - Find your OAuth 2.0 Client ID (the one with ID: `378278205772-t4icp3d1tlqc1mthf0vgr75dseeamgcq`)
   - Click on it to edit

3. **Add the Redirect URI**
   - Scroll down to **Authorized redirect URIs**
   - Click **+ ADD URI**
   - Enter **exactly** this (no quotes, no trailing slash):
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click **SAVE**

4. **Wait 1-2 minutes** for changes to propagate

5. **Try again** - Clear your browser cache and try signing in again

## Important Notes

✅ **Correct:**
- `http://localhost:3000/api/auth/google/callback`

❌ **Wrong (common mistakes):**
- `https://localhost:3000/api/auth/google/callback` (don't use https for localhost)
- `http://localhost:3000/api/auth/google/callback/` (no trailing slash)
- `http://localhost:3000/auth/callback` (missing `/api` and `/google`)
- `http://127.0.0.1:3000/api/auth/google/callback` (use localhost, not 127.0.0.1)

## Verify Your Port

Check your `.env` file - if `PORT` is set to something other than 3000, use that port in the redirect URI.

For example, if `PORT=3001`, then use:
```
http://localhost:3001/api/auth/google/callback
```

## Still Not Working?

1. **Double-check the exact URI** - Copy and paste it to avoid typos
2. **Clear browser cache** - Old redirects might be cached
3. **Try incognito/private mode** - To rule out browser extensions
4. **Wait 2-3 minutes** - Google's changes can take time to propagate
5. **Check server logs** - Make sure your backend is running on the correct port

## Screenshot Guide

In Google Cloud Console, you should see:
- **Authorized redirect URIs** section
- A text input field
- Add: `http://localhost:3000/api/auth/google/callback`
- Click the **SAVE** button at the bottom

The redirect URI must match **exactly** what your code sends, including:
- Protocol: `http://` (not `https://` for localhost)
- Host: `localhost` (not `127.0.0.1`)
- Port: `3000` (or whatever your PORT is)
- Path: `/api/auth/google/callback` (exact path, no trailing slash)

