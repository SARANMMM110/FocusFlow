## FocusFlow

This app was created using https://getmocha.com.
Need help or want to join the community? Join our [Discord](https://discord.gg/shDEGBSe2d).

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Setup with MySQL and Local Google OAuth

This application now uses **MySQL database** and **local Google OAuth** (no Mocha dependency).

### Quick Start

1. **Install MySQL** and create a database (see `README-MYSQL.md` for details)

2. **Set up Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000/api/auth/google/callback`

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL and Google OAuth credentials
   ```

4. **Create database schema**:
   ```bash
   mysql -u your_user -p your_database < database/schema.sql
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Run the server**:
   ```bash
   npm run dev:server
   ```

7. **Access the app**: Open `http://localhost:3000`

### Detailed Setup

See `README-MYSQL.md` for complete setup instructions including:
- MySQL installation and configuration
- Google OAuth setup
- Database schema creation
- Troubleshooting guide

### Environment Variables

Required:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` - Google OAuth credentials

Optional:
- `SYSTEME_IO_API_KEY` - For email marketing integration
- `AWEBER_*` - For AWeber integration
- `GOOGLE_CALENDAR_*` - For Google Calendar integration

## Troubleshooting

### API Errors (401, 500)
- **Local Dev Mode**: The app should work automatically without any configuration
- **With Mocha**: Make sure `.dev.vars` has valid credentials and restart the server
