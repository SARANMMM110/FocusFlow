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
 * Convert MySQL/SQLite syntax to PostgreSQL
 */
function convertToPostgreSQL(sql: string): string {
  // Convert DATE() function to PostgreSQL ::DATE cast
  sql = sql.replace(/DATE\(([^)]+)\)/gi, (match, column) => {
    return `${column.trim()}::DATE`;
  });
  
  // Convert boolean comparisons (is_completed = 1 -> is_completed = TRUE)
  // But be careful not to replace in string literals
  sql = sql.replace(/\bis_completed\s*=\s*1\b/gi, "is_completed = TRUE");
  sql = sql.replace(/\bis_completed\s*=\s*0\b/gi, "is_completed = FALSE");
  sql = sql.replace(/\bis_active\s*=\s*1\b/gi, "is_active = TRUE");
  sql = sql.replace(/\bis_active\s*=\s*0\b/gi, "is_active = FALSE");
  sql = sql.replace(/\bis_super_admin\s*=\s*1\b/gi, "is_super_admin = TRUE");
  sql = sql.replace(/\bis_super_admin\s*=\s*0\b/gi, "is_super_admin = FALSE");
  
  return sql;
}

/**
 * Convert parameter values for PostgreSQL (especially booleans)
 * PostgreSQL accepts 1/0 for boolean columns, but we'll convert them to proper booleans
 */
function convertParamsForPostgreSQL(sql: string, params: any[]): any[] {
  // List of boolean columns in the database
  const booleanColumns = ['is_completed', 'is_active', 'is_super_admin', 'auto_start_breaks', 'auto_start_focus', 'minimal_mode_enabled', 'show_motivational_prompts', 'notion_sync_enabled', 'custom_theme_enabled', 'marketing_consent'];
  
  // Find all ? placeholders and track which parameter index they correspond to
  let paramIndex = 0;
  const convertedParams = [...params];
  
  // For each boolean column, find assignments like "is_completed = ?" and convert the corresponding param
  booleanColumns.forEach((col) => {
    const regex = new RegExp(`\\b${col}\\s*=\\s*\\?`, 'gi');
    let match;
    const matches: number[] = [];
    
    // Find all matches and their positions
    while ((match = regex.exec(sql)) !== null) {
      // Count how many ? placeholders come before this one
      const sqlBefore = sql.substring(0, match.index);
      const placeholderCount = (sqlBefore.match(/\?/g) || []).length;
      matches.push(placeholderCount);
    }
    
    // Convert the corresponding parameter values
    matches.forEach((paramIdx) => {
      if (paramIdx < convertedParams.length) {
        const value = convertedParams[paramIdx];
        // Convert 1/0 or true/false to proper PostgreSQL boolean
        if (value === 1 || value === true) {
          convertedParams[paramIdx] = true;
        } else if (value === 0 || value === false) {
          convertedParams[paramIdx] = false;
        }
      }
    });
  });
  
  return convertedParams;
}

/**
 * Execute a SELECT query and return results
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDatabase();
  try {
    // Convert to PostgreSQL syntax
    let pgSql = sql
      .replace(/datetime\('now'\)/gi, "NOW()")
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY");
    
    // Convert MySQL/SQLite syntax to PostgreSQL
    pgSql = convertToPostgreSQL(pgSql);
    
    // Convert placeholders
    pgSql = convertPlaceholders(pgSql);
    
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
    // Convert to PostgreSQL syntax
    let pgSql = sql
      .replace(/datetime\('now'\)/gi, "NOW()")
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, "SERIAL PRIMARY KEY");
    
    // Convert MySQL/SQLite syntax to PostgreSQL
    pgSql = convertToPostgreSQL(pgSql);
    
    // Convert placeholders first (before parameter conversion)
    pgSql = convertPlaceholders(pgSql);
    
    // Convert parameter values for PostgreSQL (especially booleans)
    // Note: This must happen AFTER placeholder conversion to match the correct params
    const convertedParams = convertParamsForPostgreSQL(sql, [...params]);
    
    const result = await db.query(pgSql, convertedParams);
    
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
