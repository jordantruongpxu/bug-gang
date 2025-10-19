/**
 * Database Seeding Script for Bug Gang Scheduler
 * 
 * This script seeds the SQLite database with initial task data.
 * Run manually when you want to populate the database with sample tasks.
 * 
 * Usage:
 *   npm run seed-db
 *   or
 *   npx ts-node scripts/seed-database.ts
 */

import { SQLiteService, TaskStatus } from '../services';

// Initial seed data
const SEED_TASKS: { title: string; status: TaskStatus }[] = [
  { title: "Plan weekly meal prep", status: "To Do" },
  { title: "Debug ant trail AI", status: "In Progress" },
  { title: "Send out team retrospective summary", status: "Completed" },
  { title: "Buy more honey dew drops", status: "To Do" },
  { title: "Review team performance metrics", status: "To Do" },
  { title: "Update project documentation", status: "In Progress" },
  { title: "Schedule quarterly planning meeting", status: "To Do" },
];

/**
 * Main seeding function
 */
async function seedDatabase(): Promise<void> {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Initialize database
    console.log('📋 Initializing database connection...');
    await SQLiteService.initializeDatabase();
    console.log('✅ Database connected successfully\n');

    // Check current task count
    const existingTasks = await SQLiteService.getAllTasks();
    console.log(`📊 Current tasks in database: ${existingTasks.length}\n`);

    // Warn if there are existing tasks
    if (existingTasks.length > 0) {
      console.log('⚠️  Warning: Database already contains tasks!');
      console.log('📋 Existing tasks:');
      existingTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}" (${task.status})`);
      });
      console.log('\n🔄 This will add MORE tasks to the existing ones.');
      console.log('💡 To reset the database first, run: npm run reset-db\n');
    }

    // Use the service's built-in seeding method first
    console.log('🌱 Using built-in seeding method...');
    try {
      await SQLiteService.seedInitialDataIfNeeded();
    } catch (error) {
      console.log('   ℹ️  Built-in seeding skipped (database not empty or error)');
    }

    // Add additional tasks
    console.log('\n🌱 Adding additional sample tasks...\n');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < SEED_TASKS.length; i++) {
      const task = SEED_TASKS[i];
      try {
        const newTask = await SQLiteService.addTask(task.title, task.status);
        if (newTask) {
          console.log(`   ✅ Added: "${task.title}" (${task.status})`);
          successCount++;
        } else {
          console.log(`   ❌ Failed: "${task.title}"`);
          errorCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error adding "${task.title}": ${(error as Error).message}`);
        errorCount++;
      }
    }

    // Final summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Successfully added: ${successCount} tasks`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount} tasks`);
    }

    // Show final task count
    const finalTasks = await SQLiteService.getAllTasks();
    console.log(`   📋 Total tasks in database: ${finalTasks.length}`);

    // Show task count by status
    const taskCounts = await SQLiteService.getTaskCountByStatus();
    console.log('\n📈 Tasks by status:');
    console.log(`   📝 To Do: ${taskCounts['To Do']}`);
    console.log(`   🔄 In Progress: ${taskCounts['In Progress']}`);
    console.log(`   ✅ Completed: ${taskCounts['Completed']}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('💡 You can now start your app and see the seeded tasks.\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', (error as Error).message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await SQLiteService.closeDatabase();
      console.log('🔐 Database connection closed.');
    } catch (error) {
      console.error('⚠️  Warning: Error closing database:', (error as Error).message);
    }
  }
}

/**
 * Reset database (clear all tasks)
 */
async function resetDatabase(): Promise<void> {
  try {
    console.log('🧹 Resetting database...\n');

    await SQLiteService.initializeDatabase();
    const clearedSuccessfully = await SQLiteService.clearAllTasks();

    if (clearedSuccessfully) {
      console.log('✅ Database reset successfully!');
      console.log('📊 All tasks have been removed.\n');
    } else {
      console.log('❌ Failed to reset database.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Reset failed:', (error as Error).message);
    process.exit(1);
  } finally {
    await SQLiteService.closeDatabase();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'reset') {
  resetDatabase();
} else if (command === 'seed' || !command) {
  seedDatabase();
} else {
  console.log('❌ Unknown command:', command);
  console.log('\n📖 Usage:');
  console.log('   npx ts-node scripts/seed-database.ts          # Seed database');
  console.log('   npx ts-node scripts/seed-database.ts seed     # Seed database');
  console.log('   npx ts-node scripts/seed-database.ts reset    # Reset database');
  console.log('   npm run seed-db                               # Seed database');
  console.log('   npm run reset-db                              # Reset database');
  process.exit(1);
}