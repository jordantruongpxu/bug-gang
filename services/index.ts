/**
 * Services Index
 * 
 * Central export point for all service modules
 */

export { default as SQLiteService, TASK_STATUSES } from './SQLiteService';
export type { Task, TaskStatus } from './SQLiteService';

// Re-export the singleton instance for convenience
export { sqliteService } from './SQLiteService';
