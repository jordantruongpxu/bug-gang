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
```

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
- **State Management**: Uses React hooks for efficient state handling
- **Responsive Layout**: Adapts between mobile and tablet views
- **Gesture Support**: PanResponder for drag-and-drop functionality
- **Visual Feedback**: Animations and shadows for better UX
- **Type Safety**: Full TypeScript implementation

### Usage Examples:
- **Add Task**: Type in the input field and press enter or tap the + button
- **Move Task**: In board view, drag tasks left/right to change status
- **Complete Task**: In list view, tap the checkmark button
- **Switch Views**: Use the toggle buttons to switch between List and Board views

## Development

To start development:

```bash
npm start
```

To reset the project:

```bash
npm run reset-project
```