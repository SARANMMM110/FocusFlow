# Google OAuth Setup - Step by Step

## Current Error: `redirect_uri_mismatch`

This means the redirect URI in Google Cloud Console doesn't match what your app is sending.

## Step 1: Check What URI Your App Is Using

1. **Start your backend server:**
   ```bash
   npm run dev:server
   ```

2. **Look at the console logs** when you click "Sign Up"
   - You should see: `🔗 [OAuth] Redirect URI being used: http://localhost:3000/api/auth/google/callback`
   - **Copy this exact URI**

## Step 2: Add Redirect URI to Google Cloud Console

### Detailed Steps:

1. **Go to Google Cloud Console**
   - Open: https://console.cloud.google.com/
   - Make sure you're in the correct project

2. **Navigate to Credentials**
   - Click **"APIs & Services"** in the left sidebar
   - Click **"Credentials"** in the submenu
   - You should see a list of OAuth 2.0 Client IDs

3. **Find Your OAuth Client**
   - Look for the one with Client ID: `378278205772-t4icp3d1tlqc1mthf0vgr75dseeamgcq`
   - Click on it (or click the edit/pencil icon)

4. **Add Redirect URI**
   - Scroll down to **"Authorized redirect URIs"** section
   - Click **"+ ADD URI"** button
   - In the text field, paste **exactly** this:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - **Important:** 
     - No quotes
     - No trailing slash
     - Use `http://` not `https://`
     - Use `localhost` not `127.0.0.1`
     - Port must match your server port (check `.env` file)

5. **Save**
   - Click the **"SAVE"** button at the bottom of the page
   - Wait 1-2 minutes for changes to propagate

## Step 3: Verify Your Port

Check your `.env` file:
```env
PORT=3000
```

If it's different (like `PORT=3001`), use that port in the redirect URI:
```
http://localhost:3001/api/auth/google/callback
```

## Step 4: Test Again

1. **Clear your browser cache** (or use incognito mode)
2. **Wait 2 minutes** after saving in Google Cloud Console
3. **Try signing in again**

## Visual Guide

In Google Cloud Console, you should see:

```
┌─────────────────────────────────────────┐
│ OAuth 2.0 Client IDs                    │
├─────────────────────────────────────────┤
│ Name: FocusFlow                         │
│ Client ID: 378278205772-...             │
│                                         │
│ Authorized redirect URIs                │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:3000/api/auth/     │ │
│ │   google/callback                   │ │
│ └─────────────────────────────────────┘ │
│ [+ ADD URI]                             │
│                                         │
│ [SAVE]                                  │
└─────────────────────────────────────────┘
```

## Common Mistakes Checklist

- [ ] Using `https://` instead of `http://` for localhost
- [ ] Adding a trailing slash: `/callback/` instead of `/callback`
- [ ] Using wrong port (check your `.env` file)
- [ ] Using `127.0.0.1` instead of `localhost`
- [ ] Missing `/api` in the path
- [ ] Missing `/google` in the path
- [ ] Not waiting 1-2 minutes after saving
- [ ] Not clearing browser cache

## Still Not Working?

1. **Check backend logs** - Look for the `🔗 [OAuth] Redirect URI being used:` message
2. **Verify the exact URI** - Copy it from the logs and paste it into Google Cloud Console
3. **Try incognito mode** - Rules out browser cache issues
4. **Double-check the port** - Make sure it matches your server
5. **Wait longer** - Sometimes Google takes 3-5 minutes to propagate changes

## Need Help?

If you're still having issues:
1. Check the backend server console for the exact redirect URI
2. Make sure that exact URI (including port) is in Google Cloud Console
3. Verify there are no extra spaces or characters

