/**
 * MySQL Database Connection
 * 
 * This module provides MySQL database connection and query utilities.
 */

import mysql from "mysql2/promise";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

let pool: mysql.Pool | null = null;

/**
 * Initialize MySQL connection pool
 */
export function initDatabase(config: DatabaseConfig): mysql.Pool {
  if (pool) {
    return pool;
  }

  const poolConfig: mysql.PoolOptions = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };

  if (config.ssl) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  pool = mysql.createPool(poolConfig);

  return pool;
}

/**
 * Get database connection pool
 */
export function getDatabase(): mysql.Pool {
  if (!pool) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return pool;
}

/**
 * Execute a SELECT query and return results
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDatabase();
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
  const db = getDatabase();
  const [result] = await db.execute(sql, params) as any;
  return {
    affectedRows: result.affectedRows || 0,
    insertId: result.insertId,
  };
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

