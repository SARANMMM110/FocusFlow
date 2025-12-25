/**
 * D1 Database Connection
 * 
 * This module provides D1 database connection and query utilities.
 */

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    duration: number;
    size_after?: number;
    rows_read?: number;
    rows_written?: number;
    last_row_id?: number;
    changed_db?: boolean;
    changes?: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

let db: D1Database | null = null;

/**
 * Initialize D1 database connection
 */
export function initDatabase(database: D1Database): void {
  db = database;
  console.log("✅ D1 Database initialized");
}

/**
 * Get D1 database instance
 */
export function getDatabase(): D1Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

/**
 * Execute a SELECT query and return results
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = getDatabase();
  try {
    let stmt = database.prepare(sql);
    
    // Bind parameters if provided
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    
    const result = await stmt.all<T>();
    return result.results || [];
  } catch (error: any) {
    console.error("Database query error:", {
      message: error.message,
      sql: sql.substring(0, 100), // Log first 100 chars of SQL
    });
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 */
export async function execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: number }> {
  const database = getDatabase();
  try {
    let stmt = database.prepare(sql);
    
    // Bind parameters if provided
    if (params.length > 0) {
      stmt = stmt.bind(...params);
    }
    
    const result = await stmt.run();
    return {
      affectedRows: result.meta.changes || result.meta.rows_written || 0,
      insertId: result.meta.last_row_id,
    };
  } catch (error: any) {
    console.error("Database execute error:", {
      message: error.message,
      sql: sql.substring(0, 100), // Log first 100 chars of SQL
    });
    throw error;
  }
}

/**
 * Close database connection (no-op for D1, but kept for compatibility)
 */
export async function closeDatabase(): Promise<void> {
  // D1 doesn't require explicit connection closing
  db = null;
}
