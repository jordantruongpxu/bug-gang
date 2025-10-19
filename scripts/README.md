# Scripts

This directory contains utility scripts for managing the Bug Gang app database.

## Available Scripts

### Database Management

#### `npm run seed-db`
Seeds the database with initial sample tasks. This command will:
- Initialize the SQLite database if it doesn't exist
- Add sample tasks only if the database is empty
- Provide detailed logging of the seeding process

#### `npm run reset-db`
Completely resets the database by:
- Clearing all existing tasks
- Re-seeding with fresh sample data
- Useful for development and testing

#### `npm run run-sqlite`
Runs a mock SQLite service to test functionality outside of Expo environment:
- Simulates database operations
- Tests task management features
- Provides feedback on service functionality
- Safe to run without affecting actual database

## Script Details

### `seed-database.ts`
Main database management script that handles:
- Database initialization
- Task seeding with sample data
- Database reset functionality
- Comprehensive error handling and logging

The script accepts command line arguments:
- `seed` - Seeds database with sample data (if empty)
- `reset` - Clears and re-seeds database

### `run-sqlite.ts`
SQLite service testing script that:
- Provides mock implementation for testing
- Simulates all database operations
- Demonstrates expected functionality
- Works outside of Expo environment

## Usage Examples

```bash
# Seed database with initial data
npm run seed-db

# Reset database to fresh state
npm run reset-db

# Test SQLite service functionality (mock)
npm run run-sqlite

# Run scripts directly with ts-node
npx ts-node scripts/seed-database.ts seed
npx ts-node scripts/seed-database.ts reset
npx ts-node scripts/run-sqlite.ts
```

## Requirements

- Node.js with TypeScript support
- ts-node package (installed as dev dependency)
- expo-sqlite package for database operations (Expo environment)

## Notes

- The `run-sqlite` script uses mock data and is safe for testing
- Database seeding scripts require the Expo environment to work properly
- All scripts provide comprehensive logging and error handling