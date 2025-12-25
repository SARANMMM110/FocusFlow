import type { Task } from "@/shared/types";

/**
 * Notion Integration Stub (MVP)
 * 
 * This module provides a stub implementation for Notion database syncing.
 * For MVP, it simulates successful syncing and logs the payload that would
 * be sent to Notion. A real implementation would use the Notion API.
 * 
 * To wire up a real integration:
 * 1. Add NOTION_API_KEY to secrets
 * 2. Replace syncTask() with real Notion API calls
 * 3. Handle authentication and error states
 */

export interface NotionSyncPayload {
  task_id: number;
  title: string;
  status: string;
  priority: number;
  completed_at: string | null;
  project: string | null;
  tags: string[] | null;
  actual_minutes: number;
  synced_at: string;
}

/**
 * Sync a completed task to Notion database (stub)
 * 
 * @param task - The completed task to sync
 * @returns Promise resolving to sync success status
 */
export async function syncTask(task: Task): Promise<{ success: boolean; message: string }> {
  // Construct the payload that would be sent to Notion
  const payload: NotionSyncPayload = {
    task_id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    completed_at: task.completed_at,
    project: task.project,
    tags: task.tags ? JSON.parse(task.tags) : null,
    actual_minutes: task.actual_minutes,
    synced_at: new Date().toISOString(),
  };

  // Log the payload that would be sent to Notion
  console.log("📝 [Notion Stub] Would sync task to Notion:", payload);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For MVP, always return success
  return {
    success: true,
    message: `Task "${task.title}" synced successfully (simulated)`,
  };
}

/**
 * Verify Notion database access (stub)
 * 
 * @param databaseId - The Notion database ID to verify
 * @returns Promise resolving to verification status
 */
export async function verifyDatabaseAccess(databaseId: string): Promise<{ success: boolean; message: string }> {
  console.log("🔍 [Notion Stub] Would verify database access:", databaseId);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Basic validation
  if (!databaseId || databaseId.length < 10) {
    return {
      success: false,
      message: "Invalid database ID format",
    };
  }

  return {
    success: true,
    message: "Database access verified (simulated)",
  };
}

/**
 * Get Notion database properties (stub)
 * 
 * @param databaseId - The Notion database ID
 * @returns Promise resolving to database schema
 */
export async function getDatabaseSchema(databaseId: string): Promise<any> {
  console.log("📋 [Notion Stub] Would fetch database schema for:", databaseId);

  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock schema that matches what Notion would return
  return {
    properties: {
      Title: { type: "title" },
      Status: { type: "select" },
      Priority: { type: "number" },
      Project: { type: "select" },
      Tags: { type: "multi_select" },
      "Completed At": { type: "date" },
      "Time Spent": { type: "number" },
    },
  };
}
