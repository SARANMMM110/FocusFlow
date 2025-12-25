# Fix Google OAuth Redirect URI Error

## Error: `redirect_uri_mismatch`

This error means the redirect URI in Google Cloud Console doesn't match what your app is sending.

## Solution

### Step 1: Check Your Server Port

Your app uses the redirect URI: `http://localhost:PORT/api/auth/google/callback`

Check your `.env` file for the `PORT` value (default is `3000`).

### Step 2: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (the one with Client ID: `378278205772-t4icp3d1tlqc1mthf0vgr75dseeamgcq`)
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add **exactly** this URI (replace `3000` with your port if different):
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. Click **SAVE**

### Step 3: Important Notes

- **No trailing slash**: Use `http://localhost:3000/api/auth/google/callback` NOT `http://localhost:3000/api/auth/google/callback/`
- **Exact match**: The URI must match exactly (including `http://` not `https://` for localhost)
- **Port must match**: If your server runs on port 3001, use `http://localhost:3001/api/auth/google/callback`
- **Wait a few minutes**: Changes may take 1-2 minutes to propagate

### Step 4: Test Again

1. Restart your server: `npm run dev:server`
2. Try signing in again
3. The OAuth flow should work now

## Common Mistakes

❌ **Wrong**: `http://localhost:3000/auth/callback`  
✅ **Correct**: `http://localhost:3000/api/auth/google/callback`

❌ **Wrong**: `https://localhost:3000/api/auth/google/callback`  
✅ **Correct**: `http://localhost:3000/api/auth/google/callback`

❌ **Wrong**: `http://localhost:3000/api/auth/google/callback/`  
✅ **Correct**: `http://localhost:3000/api/auth/google/callback`

## Still Not Working?

1. **Clear browser cache** and try again
2. **Check server logs** to see what redirect URI is being sent
3. **Verify the port** your server is actually running on
4. **Wait 2-3 minutes** after saving in Google Cloud Console

