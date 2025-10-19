# Bug Gang

A React Native app built with Expo Router and TypeScript, featuring a comprehensive task management system.

## Features

### 🐛 Bug Gang Scheduler
A full-featured Todo/Task Management system with dual-view capabilities:

- **Board View (Kanban)**: Responsive Kanban board with drag-and-drop functionality
- **List View**: Clean vertical list grouped by task status
- **Task Management**: Add, move, and complete tasks with visual feedback
- **Responsive Design**: Adapts to different screen sizes

#### Task Status Columns:
- **To Do**: New and pending tasks
- **In Progress**: Tasks currently being worked on  
- **Completed**: Finished tasks

#### Interactive Features:
- **Drag & Drop**: Move tasks between columns in board view (drag left/right)
- **Quick Complete**: Tap checkmark in list view to mark tasks as completed
- **Visual Feedback**: Subtle animations and visual cues for better UX
- **Real-time Updates**: Task counts update automatically

#### Database Features:
- **SQLite Integration**: Persistent task storage using expo-sqlite
- **Auto-initialization**: Database and tables created automatically on first launch
- **Manual Seeding**: Optional database seeding with sample tasks via scripts
- **Atomic Operations**: All database operations use transactions for data integrity
- **Error Handling**: Robust error handling with fallbacks

## Database Schema

The app uses SQLite for persistent storage with the following schema:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL
);
```

### Database Seeding:

The database starts empty. You can populate it with sample tasks using the seeding script:

```bash
# Seed database with sample tasks
npm run seed-db

# Reset database (clear all tasks)
npm run reset-db
```

#### Sample Tasks Include:
- "Plan weekly meal prep" (To Do)
- "Debug ant trail AI" (In Progress) 
- "Send out team retrospective summary" (Completed)
- "Buy more honey dew drops" (To Do)
- Additional development tasks for testing

## Getting Started

This project uses Expo Router for navigation and includes a tab-based layout with modal support.

## Working with Modals

To implement a modal in your app, you can use the `Link` component with interactive elements. Here's how to create a modal with menu actions:

```tsx
<Link href="/modal">
  <Link.Trigger>
    <ThemedText type="subtitle">Step 2: Explore 2</ThemedText>
  </Link.Trigger>
  <Link.Preview />
  <Link.Menu>
    <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
    <Link.MenuAction
      title="Share"
      icon="square.and.arrow.up"
      onPress={() => alert('Share pressed')}
    />
    <Link.Menu title="More" icon="ellipsis">
      <Link.MenuAction
        title="Delete"
        icon="trash"
        destructive
        onPress={() => alert('Delete pressed')}
      />
    </Link.Menu>
  </Link.Menu>
</Link>
```

### Modal Components:
- `Link.Trigger`: The element that triggers the modal
- `Link.Preview`: Shows a preview of the modal content
- `Link.Menu`: Container for menu actions
- `Link.MenuAction`: Individual menu items with icons and actions
- `destructive` prop: Makes the action appear as a destructive action (typically red)

## Implementing a New Tab

To add a new tab to your app, you need to:

1. Create a new screen file in the `app/(tabs)/` directory
2. Add a `Tabs.Screen` component to the `_layout.tsx` file

### Tab Configuration Example:

```tsx
<Tabs.Screen
  name="explore"
  options={{
    title: 'Explore',
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
  }}
/>
```

### Tab Properties:
- `name`: The file name of the screen component (without extension)
- `title`: The display name for the tab
- `tabBarIcon`: A function that returns the icon component for the tab
- `color`: The color prop passed based on the tab's active state

### Steps to Add a New Tab:

1. **Create the screen file**: 
   ```
   app/(tabs)/your-new-screen.tsx
   ```

2. **Add the tab configuration**:
   ```tsx
   <Tabs.Screen
     name="your-new-screen"
     options={{
       title: 'Your Tab Title',
       tabBarIcon: ({ color }) => <IconSymbol size={28} name="your-icon-name" color={color} />,
     }}
   />
   ```

3. **Implement your screen component**:
   ```tsx
   export default function YourNewScreen() {
     return (
       <ThemedView>
         <ThemedText>Your content here</ThemedText>
       </ThemedView>
     );
   }
   ```

## Available Icons

The app uses SF Symbols for icons. You can browse available icons at [SF Symbols](https://developer.apple.com/sf-symbols/) or use common ones like:
- `house.fill`
- `paperplane.fill`
- `checklist` (for tasks)
- `gear`
- `person.fill`
- `star.fill`

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx           # Tab navigation layout
│   ├── index.tsx             # Home screen
│   ├── tasks-simple.tsx      # Task management screen
│   └── explore.tsx           # Explore screen
├── modal.tsx                 # Modal screen
└── _layout.tsx               # Root layout

components/
├── ui/
│   └── icon-symbol.tsx       # Icon component
├── themed-text.tsx           # Themed text component
└── themed-view.tsx           # Themed view component

services/
├── index.ts                  # Services exports
└── SQLiteService.ts          # Database service layer

scripts/
├── README.md                 # Scripts documentation
└── seed-database.ts          # Database seeding script
```

## Service Architecture

The app uses a clean service layer architecture to separate business logic from UI components:

### SQLiteService (`services/SQLiteService.ts`)

A comprehensive database service class that handles all SQLite operations:

#### Core Methods:
- `initializeDatabase()` - Sets up database, creates tables, seeds initial data
- `getAllTasks()` - Retrieves all tasks from database
- `addTask(title, status?)` - Adds new task to database
- `updateTaskStatus(id, status)` - Updates task status
- `deleteTask(id)` - Removes task from database
- `getTasksByStatus(status)` - Filters tasks by status
- `getTaskCountByStatus()` - Returns task counts for each status
- `clearAllTasks()` - Resets database (for testing)
- `closeDatabase()` - Properly closes database connection

#### Features:
- **Singleton Pattern**: Single instance manages database connection
- **Auto-initialization**: Database setup with proper error handling
- **Comprehensive Logging**: Detailed console logging for debugging
- **Type Safety**: Full TypeScript with proper interfaces
- **Error Handling**: Robust try-catch blocks with meaningful error messages

## Task Management Implementation

The Bug Gang Scheduler implements a complete task management system with:

### Core Data Structure:
```tsx
interface Task {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}
```

### Key Features:
- **Service Layer**: Clean separation of database logic and UI
- **State Management**: Uses React hooks for efficient state handling
- **Database Integration**: SQLite with expo-sqlite for persistent storage
- **Async Operations**: All database operations are asynchronous with proper error handling
- **Responsive Layout**: Adapts between mobile and tablet views
- **Gesture Support**: PanResponder for drag-and-drop functionality
- **Visual Feedback**: Animations and shadows for better UX
- **Type Safety**: Full TypeScript implementation
- **Loading States**: Proper loading indicators during database initialization

### Usage Examples:

#### UI Interactions:
- **First Launch**: Database initializes automatically (empty by default)
- **Add Sample Data**: Run `npm run seed-db` to populate with sample tasks
- **Add Task**: Type in the input field and press enter or tap the + button (saved to SQLite)
- **Move Task**: In board view, drag tasks left/right to change status (persisted immediately)
- **Complete Task**: In list view, tap the checkmark button (updates database)
- **Switch Views**: Use the toggle buttons to switch between List and Board views
- **Data Persistence**: All changes are automatically saved to the local SQLite database

#### Service Usage (for developers):
```tsx
import { SQLiteService } from '../services';

// Initialize database
await SQLiteService.initializeDatabase();

// Add a task
const newTask = await SQLiteService.addTask('Complete documentation');

// Update task status
await SQLiteService.updateTaskStatus(taskId, 'Completed');

// Get all tasks
const tasks = await SQLiteService.getAllTasks();

// Get task counts by status
const counts = await SQLiteService.getTaskCountByStatus();
```

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Seed the database with sample tasks (optional)
npm run seed-db
```

### Available Scripts

```bash
npm start          # Start Expo development server
npm run seed-db    # Populate database with sample tasks
npm run reset-db   # Clear all tasks from database
npm run reset-project  # Reset the entire project structure
npm run lint       # Run ESLint
```

### Development Workflow

1. **First Time Setup:**
   ```bash
   npm install
   npm run seed-db    # Optional: Add sample tasks
   npm start
   ```

2. **Daily Development:**
   ```bash
   npm start          # Start the app
   # Make your changes
   npm run reset-db   # Reset data if needed
   npm run seed-db    # Re-seed if needed
   ```