/**
 * Node.js Server Entry Point
 * 
 * This server runs the Hono app with MySQL database support.
 * Serves both API routes and static frontend files in production.
 */

import { serve } from "@hono/node-server";
import { initDatabase } from "./worker/db";
import app from "./worker/index";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Get current directory (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "focusflow",
  ssl: process.env.DB_SSL === "true",
};

// Initialize MySQL connection
initDatabase(dbConfig);

const port = parseInt(process.env.PORT || "3000");
const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : "http://localhost:3000");

// Create environment object for the worker
const env = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_SSL: process.env.DB_SSL,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
  SYSTEME_IO_API_KEY: process.env.SYSTEME_IO_API_KEY,
  AWEBER_CLIENT_ID: process.env.AWEBER_CLIENT_ID,
  AWEBER_CLIENT_SECRET: process.env.AWEBER_CLIENT_SECRET,
  AWEBER_ACCESS_TOKEN: process.env.AWEBER_ACCESS_TOKEN,
  AWEBER_ACCOUNT_ID: process.env.AWEBER_ACCOUNT_ID,
  AWEBER_LIST_ID: process.env.AWEBER_LIST_ID,
  GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID,
  GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  FRONTEND_URL,
};

// In production, serve static files from dist folder
if (isProduction) {
  const distPath = join(__dirname, "../dist");
  if (existsSync(distPath)) {
    // Serve static files for non-API routes
    app.get("*", async (c) => {
      const url = new URL(c.req.url);
      const pathname = url.pathname;
      
      // Don't serve static files for API routes
      if (pathname.startsWith("/api")) {
        return c.text("Not Found", 404);
      }
      
      // Try to serve the requested file
      let filePath = join(distPath, pathname);
      
      // If it's a directory or no extension, serve index.html (SPA routing)
      if (!pathname.includes(".") || !existsSync(filePath)) {
        filePath = join(distPath, "index.html");
      }
      
      if (existsSync(filePath)) {
        const file = readFileSync(filePath);
        const ext = filePath.split(".").pop()?.toLowerCase();
        
        let contentType = "text/html";
        if (ext === "js") contentType = "application/javascript";
        else if (ext === "css") contentType = "text/css";
        else if (ext === "json") contentType = "application/json";
        else if (ext === "png") contentType = "image/png";
        else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
        else if (ext === "svg") contentType = "image/svg+xml";
        else if (ext === "ico") contentType = "image/x-icon";
        
        return c.body(file, 200, { "Content-Type": contentType });
      }
      
      return c.text("Not Found", 404);
    });
  }
}

console.log(`🚀 Server starting on port ${port}`);
console.log(`📊 MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
console.log(`🌍 Environment: ${isProduction ? "production" : "development"}`);

if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
  console.warn("⚠️  WARNING: Google OAuth credentials not configured!");
  console.warn("   Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env");
}

serve({
  fetch: (request) => {
    // Pass environment to the worker
    return app.fetch(request, env);
  },
  port,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
});

