/**
 * PostgreSQL Database Connection
 * 
 * This module provides PostgreSQL database connection and query utilities.
 * Compatible with Render PostgreSQL databases.
 */

import { Pool, PoolClient } from "pg";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

let pool: Pool | null = null;

/**
 * Initialize PostgreSQL connection pool
 */
export function initDatabase(config: DatabaseConfig): Pool {
  if (pool) {
    return pool;
  }

  const poolConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased timeout for external connections (Render, etc.)
  };

  pool = new Pool(poolConfig);

  // Test the connection
  pool.query("SELECT NOW()")
    .then(() => {
      console.log("✅ PostgreSQL database connection successful");
    })
    .catch((error) => {
      console.error("❌ PostgreSQL database connection failed:", {
        message: error.message,
        host: config.host,
        port: config.port,
        database: config.database,
        ssl: config.ssl,
      });
    });

  return pool;
}

/**
 * Get database connection pool
 */
export function getDatabase(): Pool {
  if (!pool) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return pool;
}

/**
 * Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
 */
function convertPlaceholders(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

/**
 * Execute a SELECT query and return results
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDatabase();
  try {
    // Replace SQLite-specific syntax with PostgreSQL
    const pgSql = convertPlaceholders(
      sql
        .replace(/datetime\('now'\)/gi, "NOW()")
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY")
    );
    
    const result = await db.query(pgSql, params);
    return result.rows as T[];
  } catch (error: any) {
    console.error("Database query error:", {
      message: error.message,
      code: error.code,
      sql: sql.substring(0, 100), // Log first 100 chars of SQL
    });
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
  const db = getDatabase();
  try {
    // Replace SQLite-specific syntax with PostgreSQL
    const pgSql = convertPlaceholders(
      sql
        .replace(/datetime\('now'\)/gi, "NOW()")
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY")
    );
    
    const result = await db.query(pgSql, params);
    
    // For INSERT queries, get the last inserted ID from RETURNING clause or result
    let insertId: number | undefined;
    if (pgSql.toUpperCase().includes("INSERT") && result.rows.length > 0) {
      // Check if there's an id column in the result
      insertId = result.rows[0]?.id ? Number(result.rows[0].id) : undefined;
    }
    
    return {
      affectedRows: result.rowCount || 0,
      insertId,
    };
  } catch (error: any) {
    console.error("Database execute error:", {
      message: error.message,
      code: error.code,
      sql: sql.substring(0, 100), // Log first 100 chars of SQL
    });
    throw error;
  }
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
