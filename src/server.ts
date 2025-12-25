/**
 * Node.js Server Entry Point
 * 
 * This server runs the Hono app with D1 database support.
 * Serves both API routes and static frontend files in production.
 * 
 * Note: For local development with D1, use `wrangler dev` instead of this server.
 * This server is primarily for production deployments on platforms like Render.
 */

import { serve } from "@hono/node-server";
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

// For local Node.js development, create a mock D1 database
// In production on Cloudflare Workers, the D1 binding will be provided automatically
let mockD1: any = null;

if (process.env.NODE_ENV !== "production" || !process.env.CF_PAGES) {
  // Create a simple mock D1 database for local development
  // Note: For full D1 functionality locally, use `wrangler dev` instead
  console.warn("⚠️  Running in Node.js mode. For full D1 support, use `wrangler dev`");
  console.warn("   Creating mock D1 database for basic functionality...");
  
  // Simple mock implementation
  mockD1 = {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        all: async () => ({ results: [], success: true, meta: { duration: 0, changes: 0 } }),
        first: async () => null,
        run: async () => ({ success: true, meta: { duration: 0, changes: 0, last_row_id: 0 } }),
      }),
    }),
    exec: async () => ({ count: 0, duration: 0 }),
    batch: async () => [],
  };
}

const port = parseInt(process.env.PORT || "3000");
const isProduction = process.env.NODE_ENV === "production";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : "http://localhost:3000");

// Create environment object for the worker
const env = {
  DB: mockD1, // D1 database binding (mock for local, real binding in Cloudflare Workers)
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
console.log(`📊 Database: D1 (Cloudflare)`);
console.log(`🌍 Environment: ${isProduction ? "production" : "development"}`);

if (!mockD1 && process.env.NODE_ENV !== "production") {
  console.warn("⚠️  NOTE: For full D1 database functionality, use `wrangler dev` for local development");
  console.warn("   This Node.js server uses a mock D1 database for basic functionality");
}

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

