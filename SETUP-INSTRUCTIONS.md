# Quick Setup Instructions

## Step 1: Create .env File

Create a `.env` file in the root directory with your MySQL configuration:

```env
# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=focusFlow
DB_SSL=false

# Google OAuth Configuration (required for authentication)
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Note:** If your MySQL root user has no password, leave `DB_PASSWORD` empty.

## Step 2: Set Up Database Schema

Run the setup script to create all tables:

```bash
npm run setup:db
```

Or manually import the schema using phpMyAdmin or MySQL Workbench:
1. Open phpMyAdmin or MySQL Workbench
2. Select the `focusFlow` database
3. Import the file: `database/schema.sql`

## Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: FocusFlow
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## Step 4: Start the Server

```bash
npm run dev:server
```

The server will start on `http://localhost:3000`

## Step 5: Test

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" or "Sign In"
3. You'll be redirected to Google OAuth
4. After authentication, you'll be redirected to the dashboard

## Troubleshooting

### Database Connection Issues

**Error: ER_ACCESS_DENIED_ERROR**
- Check your `DB_USER` and `DB_PASSWORD` in `.env`
- Make sure the user has permissions to create databases and tables

**Error: ECONNREFUSED**
- Make sure MySQL/MariaDB is running
- Check `DB_HOST` and `DB_PORT` in `.env`
- Default port is 3306

**Error: Unknown database 'focusFlow'**
- Run `npm run setup:db` to create the database and tables
- Or manually create the database: `CREATE DATABASE focusFlow;`

### Google OAuth Issues

**Error: redirect_uri_mismatch**
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/google/callback`
- Check for trailing slashes or http vs https

**Error: invalid_client**
- Verify `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces or quotes

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

Then update the Google OAuth redirect URI to match.

## Next Steps

After setup is complete, you can:
- Test user registration and login
- Create tasks and focus sessions
- Explore the dashboard and analytics

For more details, see `README-MYSQL.md`.

