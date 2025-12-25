# How to Start the Application

## You Need TWO Terminal Windows

### Terminal 1: Backend Server (REQUIRED FIRST)

```bash
npm run dev:server
```

**Expected output:**
```
🚀 Server starting on port 3000
📊 MySQL: 127.0.0.1:3306/focusFlow
✅ Server is running on http://localhost:3000
```

**Keep this terminal open!** The backend must be running for the frontend to work.

### Terminal 2: Frontend Server

```bash
npm run dev
```

**Expected output:**
```
VITE v7.3.0  ready in 791 ms
➜  Local:   http://localhost:5173/
```

## What Each Server Does

- **Backend (port 3000)**: Handles API requests, database operations, Google OAuth
- **Frontend (port 5173)**: Serves the React app and proxies API requests to backend

## Troubleshooting

### Error: `ECONNREFUSED` or `http proxy error`

**Problem:** Backend server isn't running.

**Solution:** 
1. Open a new terminal
2. Run `npm run dev:server`
3. Wait for "✅ Server is running" message
4. Then the frontend will work

### Error: Database connection failed

**Problem:** MySQL isn't running or credentials are wrong.

**Solution:**
1. Make sure MySQL/MariaDB is running
2. Check your `.env` file has correct credentials
3. Run `npm run setup:db` to create the database schema

## Quick Checklist

Before starting:
- [ ] MySQL is running
- [ ] Database is set up (`npm run setup:db`)
- [ ] `.env` file exists with correct credentials
- [ ] Google OAuth redirect URI is configured

To start:
- [ ] Terminal 1: `npm run dev:server` (backend)
- [ ] Terminal 2: `npm run dev` (frontend)
- [ ] Open browser to `http://localhost:5173`

