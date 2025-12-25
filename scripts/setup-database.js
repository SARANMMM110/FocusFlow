/**
 * Database Setup Script
 * 
 * This script creates the database schema in your MySQL database.
 * Run with: node scripts/setup-database.js
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const config = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true, // Allow multiple SQL statements
  };

  console.log("🔌 Connecting to MySQL...");
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log("✅ Connected to MySQL server");

    // Read the schema file
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📄 Reading schema file...");
    console.log("🚀 Executing schema...");

    // Execute the schema
    await connection.query(schema);

    console.log("✅ Database schema created successfully!");
    console.log(`📊 Database: ${process.env.DB_NAME || "focusFlow"}`);

    // Verify tables were created
    const [tables] = await connection.query(
      `SHOW TABLES FROM ${process.env.DB_NAME || "focusFlow"}`
    );

    console.log(`\n📋 Created ${tables.length} tables:`);
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log("\n✨ Setup complete! You can now run the server with: npm run dev:server");
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("   Check your DB_USER and DB_PASSWORD in .env");
    } else if (error.code === "ECONNREFUSED") {
      console.error("   Make sure MySQL is running and DB_HOST/DB_PORT are correct");
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

