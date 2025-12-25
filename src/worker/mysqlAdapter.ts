/**
 * MySQL Database Adapter
 * 
 * Provides a D1-like interface for MySQL database operations.
 * This allows the code to work with MySQL while maintaining similar API.
 */

import { query, execute } from "./db";

export interface QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta?: {
    last_row_id?: number;
    rows_read?: number;
    rows_written?: number;
  };
}

export class MySQLAdapter {
  /**
   * Prepare a SQL statement (returns a statement-like object)
   */
  prepare(sql: string) {
    return {
      bind: (...params: any[]) => ({
        all: async <T = any>(): Promise<QueryResult<T>> => {
          const results = await query<T>(sql, params);
          return {
            results,
            success: true,
            meta: {
              rows_read: results.length,
            },
          };
        },
        run: async (): Promise<{ success: boolean; meta: { last_row_id?: number; rows_written?: number } }> => {
          const result = await execute(sql, params);
          return {
            success: true,
            meta: {
              last_row_id: result.insertId,
              rows_written: result.affectedRows,
            },
          };
        },
        first: async <T = any>(): Promise<T | null> => {
          const results = await query<T>(sql, params);
          return results.length > 0 ? results[0] : null;
        },
      }),
    };
  }
}

