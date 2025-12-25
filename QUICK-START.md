# Quick Start Guide

## Running the Application

You need to run **TWO servers** simultaneously:

### 1. Backend Server (Node.js + MySQL)

Open a terminal and run:
```bash
npm run dev:server
```

This starts the backend API server on `http://localhost:3000`

**Expected output:**
```
🚀 Server starting on port 3000
📊 MySQL: 127.0.0.1:3306/focusFlow
✅ Server is running on http://localhost:3000
```

### 2. Frontend Server (Vite + React)

Open **another terminal** and run:
```bash
npm run dev
```

This starts the frontend dev server (usually on `http://localhost:5173`)

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

## Troubleshooting

### Error: `ECONNREFUSED` or `http proxy error`

**Problem:** The backend server isn't running.

**Solution:** 
1. Make sure you've started the backend server with `npm run dev:server`
2. Check that it's running on port 3000
3. Verify MySQL is running and the database is set up

### Error: Database connection failed

**Problem:** MySQL isn't running or credentials are wrong.

**Solution:**
1. Check your `.env` file has correct MySQL credentials
2. Make sure MySQL/MariaDB is running
3. Run `npm run setup:db` to create the database schema

### Port Already in Use

If port 3000 is already in use:
1. Change `PORT=3001` in your `.env` file
2. Update Vite proxy in `vite.config.ts` to point to port 3001
3. Restart both servers

## Development Workflow

1. **Terminal 1:** `npm run dev:server` (backend)
2. **Terminal 2:** `npm run dev` (frontend)
3. Open browser to `http://localhost:5173` (or whatever port Vite shows)

The frontend will automatically proxy API requests to the backend.

