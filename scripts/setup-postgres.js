/**
 * Setup PostgreSQL Database Schema
 * 
 * This script initializes the PostgreSQL database with all required tables.
 * Run this after creating your PostgreSQL database on Render.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/setup-postgres.js
 *   OR
 *   DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... node scripts/setup-postgres.js
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  let pool;

  try {
    // Parse database URL if provided, otherwise use individual env vars
    let config;
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      config = {
        host: url.hostname,
        port: parseInt(url.port || "5432"),
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: url.searchParams.get("sslmode") === "require" || process.env.DB_SSL === "true",
      };
    } else {
      config = {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "focusflow",
        ssl: process.env.DB_SSL === "true",
      };
    }

    console.log("🔌 Connecting to PostgreSQL...");
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);

    pool = new Pool({
      ...config,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL server");

    // Read the schema file
    const schemaPath = join(__dirname, "../database/schema-postgres.sql");
    const schema = readFileSync(schemaPath, "utf8");

    console.log("📄 Reading schema file...");
    console.log("🚀 Executing schema...");

    // Remove comments but keep SQL structure
    let cleanSchema = schema
      .replace(/--[^\r\n]*/g, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ""); // Remove multi-line comments

    // Execute the entire schema - PostgreSQL supports multiple statements
    try {
      await pool.query(cleanSchema);
      console.log("✅ Schema executed successfully");
    } catch (error) {
      console.error(`❌ Error: ${error.message.substring(0, 150)}`);
      console.log("⚠️  Trying alternative method...");
      throw error; // Re-throw to show the actual error
    }

    console.log("✅ Database schema created successfully!");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`\n📋 Created ${result.rows.length} tables:`);
    result.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    console.log("\n✨ Setup complete! Your database is ready to use.");
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    if (error.code === "28P01") {
      console.error("   Check your DB_USER and DB_PASSWORD");
    } else if (error.code === "3D000") {
      console.error("   Database does not exist. Create it first.");
    } else if (error.code === "ECONNREFUSED") {
      console.error("   Make sure PostgreSQL is running and DB_HOST/DB_PORT are correct");
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

setupDatabase();

