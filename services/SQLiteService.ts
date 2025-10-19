import * as SQLite from 'expo-sqlite';

export interface Task {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export type TaskStatus = Task['status'];

// Database configuration
const DATABASE_NAME = 'BugGangDB.db';
const TABLE_NAME = 'tasks';

// SQL Queries
const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL
  );
`;

const SELECT_ALL_TASKS = `SELECT * FROM ${TABLE_NAME} ORDER BY id`;
const SELECT_TASK_COUNT = `SELECT COUNT(*) as count FROM ${TABLE_NAME}`;
const INSERT_TASK = `INSERT INTO ${TABLE_NAME} (title, status) VALUES (?, ?)`;
const UPDATE_TASK_STATUS = `UPDATE ${TABLE_NAME} SET status = ? WHERE id = ?`;
const DELETE_TASK = `DELETE FROM ${TABLE_NAME} WHERE id = ?`;

// Initial seed data
const INITIAL_TASKS = [
  { title: "Plan weekly meal prep", status: "To Do" as TaskStatus },
  { title: "Debug ant trail AI", status: "In Progress" as TaskStatus },
  { title: "Send out team retrospective summary", status: "Completed" as TaskStatus },
  { title: "Buy more honey dew drops", status: "To Do" as TaskStatus }
];

class SQLiteService {
  private database: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize the SQLite database
   * Creates the database file, sets up tables, and seeds initial data if needed
   */
  async initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
    try {
      console.log('🗄️ Initializing SQLite database...');
      
      // Open or create the database
      this.database = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      // Create tasks table if it doesn't exist
      await this.database.execAsync(CREATE_TASKS_TABLE);
      console.log('✅ Tasks table created/verified');
      
      console.log('🎉 Database initialization complete');
      console.log('💡 To seed with sample data, run: npm run seed-db');
      return this.database;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Seed the database with initial tasks if it's empty
   * This method can be called manually or by seeding scripts
   */
  async seedInitialDataIfNeeded(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      // Check if table is empty
      const countResult = await this.database.getFirstAsync(SELECT_TASK_COUNT);
      const count = (countResult as { count: number }).count;
      
      if (count === 0) {
        console.log('📦 Seeding database with initial tasks...');
        
        // Insert initial tasks
        for (const task of INITIAL_TASKS) {
          await this.database.runAsync(INSERT_TASK, [task.title, task.status]);
        }
        
        console.log(`✅ Seeded ${INITIAL_TASKS.length} initial tasks`);
      } else {
        console.log(`📊 Found ${count} existing tasks in database`);
      }
    } catch (error) {
      console.error('❌ Error seeding initial data:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.database) {
      throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return this.database;
  }

  /**
   * Load all tasks from the database
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const result = await this.database.getAllAsync(SELECT_ALL_TASKS);
      console.log(`📋 Loaded ${result.length} tasks from database`);
      return result as Task[];
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Add a new task to the database
   */
  async addTask(title: string, status: TaskStatus = 'To Do'): Promise<Task | null> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const result = await this.database.runAsync(INSERT_TASK, [title, status]);
      
      if (result.lastInsertRowId) {
        const newTask: Task = {
          id: result.lastInsertRowId,
          title,
          status
        };
        console.log(`➕ Added new task: "${title}" with ID ${result.lastInsertRowId}`);
        return newTask;
      }
      
      console.warn('⚠️ Failed to get lastInsertRowId for new task');
      return null;
    } catch (error) {
      console.error('❌ Error adding task:', error);
      return null;
    }
  }

  /**
   * Update a task's status in the database
   */
  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<boolean> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const result = await this.database.runAsync(UPDATE_TASK_STATUS, [status, taskId]);
      
      if (result.changes > 0) {
        console.log(`📝 Updated task ${taskId} status to "${status}"`);
        return true;
      } else {
        console.warn(`⚠️ No task found with ID ${taskId} to update`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      return false;
    }
  }

  /**
   * Delete a task from the database
   */
  async deleteTask(taskId: number): Promise<boolean> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const result = await this.database.runAsync(DELETE_TASK, [taskId]);
      
      if (result.changes > 0) {
        console.log(`🗑️ Deleted task with ID ${taskId}`);
        return true;
      } else {
        console.warn(`⚠️ No task found with ID ${taskId} to delete`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      return false;
    }
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const query = `SELECT * FROM ${TABLE_NAME} WHERE status = ? ORDER BY id`;
      const result = await this.database.getAllAsync(query, [status]);
      return result as Task[];
    } catch (error) {
      console.error('❌ Error getting tasks by status:', error);
      return [];
    }
  }

  /**
   * Get task count by status
   */
  async getTaskCountByStatus(): Promise<Record<TaskStatus, number>> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const query = `
        SELECT status, COUNT(*) as count 
        FROM ${TABLE_NAME} 
        GROUP BY status
      `;
      
            const result = await this.database.getAllAsync(query) as { status: TaskStatus; count: number }[];
      
      // Initialize counts for all statuses
      const counts: Record<TaskStatus, number> = {
        'To Do': 0,
        'In Progress': 0,
        'Completed': 0
      };

      // Fill in actual counts
      result.forEach(row => {
        counts[row.status] = row.count;
      });

      return counts;
    } catch (error) {
      console.error('❌ Error getting task counts:', error);
      return { 'To Do': 0, 'In Progress': 0, 'Completed': 0 };
    }
  }

  /**
   * Clear all tasks from the database (for testing/reset purposes)
   */
  async clearAllTasks(): Promise<boolean> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      await this.database.runAsync(`DELETE FROM ${TABLE_NAME}`);
      console.log('🧹 Cleared all tasks from database');
      return true;
    } catch (error) {
      console.error('❌ Error clearing tasks:', error);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  async closeDatabase(): Promise<void> {
    try {
      if (this.database) {
        await this.database.closeAsync();
        this.database = null;
        console.log('🔐 Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }
}

// Export a singleton instance
export const sqliteService = new SQLiteService();

// Export constants for use in components
export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

export default sqliteService;