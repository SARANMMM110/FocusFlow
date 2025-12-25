# MySQL Setup Guide

This guide will help you set up the FocusFlow application with MySQL database and local Google OAuth authentication.

## Prerequisites

1. **MySQL Server** (version 5.7+ or 8.0+)
2. **Node.js** (version 18+)
3. **Google OAuth Credentials** (see below)

## Step 1: Install MySQL

If you don't have MySQL installed:

### Windows
Download and install from: https://dev.mysql.com/downloads/installer/

### macOS
```bash
brew install mysql
brew services start mysql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

## Step 2: Create Database

1. Log into MySQL:
```bash
mysql -u root -p
```

2. Create the database and user:
```sql
CREATE DATABASE focusflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'focusflow'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON focusflow.* TO 'focusflow'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. Import the schema:
```bash
mysql -u focusflow -p focusflow < database/schema.sql
```

## Step 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if prompted
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: FocusFlow
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/google/callback` (for local dev)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=focusflow
DB_PASSWORD=your_password_here
DB_NAME=focusflow
DB_SSL=false

GOOGLE_OAUTH_CLIENT_ID=your_google_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret_here

PORT=3000
NODE_ENV=development
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run the Application

### Development Mode (with hot reload)
```bash
npm run dev:server
```

### Production Mode
```bash
npm run server
```

The server will start on `http://localhost:3000`

## Step 7: Access the Application

1. Open your browser to `http://localhost:3000`
2. Click "Sign Up" or "Sign In"
3. You'll be redirected to Google OAuth
4. After authentication, you'll be redirected back to the dashboard

## Database Schema

The database schema is defined in `database/schema.sql`. It includes:

- `users` - User accounts
- `user_profiles` - User profile information
- `tasks` - Task management
- `focus_sessions` - Focus session tracking
- `user_settings` - User preferences
- `admin_users` - Admin accounts
- And more...

## Troubleshooting

### Database Connection Issues

1. **Check MySQL is running:**
```bash
# Windows
net start mysql

# macOS/Linux
sudo systemctl status mysql
# or
brew services list
```

2. **Test connection:**
```bash
mysql -u focusflow -p focusflow
```

3. **Check firewall:** Ensure MySQL port (3306) is not blocked

### Google OAuth Issues

1. **Redirect URI mismatch:** Ensure the redirect URI in `.env` matches exactly what's configured in Google Cloud Console
2. **OAuth consent screen:** Make sure you've completed the OAuth consent screen setup
3. **API enabled:** Ensure Google+ API is enabled in your Google Cloud project

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

## Production Deployment

For production:

1. Use a production MySQL database (consider managed services like AWS RDS, Google Cloud SQL, or PlanetScale)
2. Set `NODE_ENV=production` in your environment
3. Use HTTPS (set `secure: true` in cookie settings)
4. Configure proper CORS settings
5. Use environment variables for all secrets (never commit `.env` to git)

## Migration from D1 to MySQL

If you're migrating from Cloudflare D1:

1. Export your D1 data
2. Convert the SQL syntax (see `scripts/convert-d1-to-mysql.js`)
3. Import into MySQL
4. Update all database queries in the codebase (many are already converted)

## Support

For issues or questions, check:
- Database logs: `mysql -u root -p -e "SHOW PROCESSLIST;"`
- Application logs: Check console output when running `npm run dev:server`

