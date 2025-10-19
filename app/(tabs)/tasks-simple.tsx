import React, { useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Task {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

type ViewMode = 'list' | 'board';

const COLUMNS: Task['status'][] = ['To Do', 'In Progress', 'Completed'];

const initialTasks: Task[] = [
  { id: 1, title: "Plan weekly meal prep", status: "To Do" },
  { id: 2, title: "Debug ant trail AI", status: "In Progress" },
  { id: 3, title: "Send out team retrospective summary", status: "Completed" },
  { id: 4, title: "Buy more honey dew drops", status: "To Do" },
];

// Simple icon component
const SimpleIcon = ({ name, size = 16, color = '#007AFF' }: { name: string; size?: number; color?: string }) => {
  const iconText = {
    'leaf': '🍃',
    'plus': '+',
    'checkmark': '✓',
    'list': '☰',
    'grid': '⊞',
    'ellipsis': '⋯',
    'plus-circle': '⊕',
  }[name] || '•';
  
  return (
    <Text style={[{ fontSize: size, color }, styles.icon]}>
      {iconText}
    </Text>
  );
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const isWideScreen = screenWidth > 768;

  // Add new task
  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle.trim(),
        status: 'To Do',
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  // Move task to completed
  const moveTaskToCompleted = (taskId: number) => {
    setTasks(tasks.map((task: Task) =>
      task.id === taskId
        ? { ...task, status: 'Completed' as const }
        : task
    ));
  };

  // Move task between columns (for board view)
  const moveTask = (taskId: number, newStatus: Task['status']) => {
    setTasks(tasks.map((task: Task) =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    ));
  };

  // Group tasks by status for list view
  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = tasks.filter((task: Task) => task.status === status);
      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [tasks]);

  // Task Card Component
  const TaskCard = ({ task, showMoveButton = false }: { task: Task; showMoveButton?: boolean }) => {
    const pan = new Animated.ValueXY();

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => viewMode === 'board',
      onPanResponderGrant: () => {
        setDraggedTask(task);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt: any, gestureState: any) => {
        pan.flattenOffset();
        
        // Simple drop logic - move to next column if dragged right, previous if left
        if (Math.abs(gestureState.dx) > 50) {
          const currentIndex = COLUMNS.indexOf(task.status);
          let newIndex = currentIndex;
          
          if (gestureState.dx > 50 && currentIndex < COLUMNS.length - 1) {
            newIndex = currentIndex + 1;
          } else if (gestureState.dx < -50 && currentIndex > 0) {
            newIndex = currentIndex - 1;
          }
          
          if (newIndex !== currentIndex) {
            moveTask(task.id, COLUMNS[newIndex]);
          }
        }
        
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        
        setDraggedTask(null);
      },
    });

    const cardStyle = [
      styles.taskCard,
      draggedTask?.id === task.id && styles.draggedCard,
    ];

    return (
      <Animated.View
        style={[
          cardStyle,
          viewMode === 'board' && {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...(viewMode === 'board' ? panResponder.panHandlers : {})}
      >
        <View style={styles.taskContent}>
          <SimpleIcon 
            name="leaf" 
            size={16} 
            color="#007AFF"
          />
          <Text style={styles.taskTitle}>
            {task.title}
          </Text>
        </View>
        
        {showMoveButton && task.status !== 'Completed' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => moveTaskToCompleted(task.id)}
          >
            <SimpleIcon name="checkmark" size={16} color="white" />
          </TouchableOpacity>
        )}
        
        {viewMode === 'board' && (
          <View style={styles.dragIndicator}>
            <SimpleIcon name="ellipsis" size={12} color="#666" />
          </View>
        )}
      </Animated.View>
    );
  };

  // Column Component for Board View
  const Column = ({ status }: { status: Task['status'] }) => {
    const columnTasks = groupedTasks[status];
    
    return (
      <View style={[
        styles.column,
        {
          width: isWideScreen ? '30%' : screenWidth * 0.8,
        }
      ]}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>
            {status}
          </Text>
          <View style={styles.taskCount}>
            <Text style={styles.taskCountText}>{columnTasks.length}</Text>
          </View>
        </View>
        
        <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
          {columnTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {columnTasks.length === 0 && (
            <View style={styles.emptyColumn}>
              <SimpleIcon name="plus-circle" size={32} color="#CCC" />
              <Text style={styles.emptyText}>
                Drop tasks here
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // List View Component
  const ListView = () => (
    <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
      {COLUMNS.map(status => {
        const statusTasks = groupedTasks[status];
        if (statusTasks.length === 0) return null;
        
        return (
          <View key={status} style={styles.listSection}>
            <View style={styles.listSectionHeader}>
              <Text style={styles.sectionTitle}>
                {status}
              </Text>
              <View style={styles.taskCount}>
                <Text style={styles.taskCountText}>{statusTasks.length}</Text>
              </View>
            </View>
            
            {statusTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} showMoveButton />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );

  // Board View Component
  const BoardView = () => (
    <ScrollView
      horizontal={!isWideScreen}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.boardContainer,
        isWideScreen ? styles.boardContainerWide : styles.boardContainerNarrow
      ]}
    >
      {COLUMNS.map(status => (
        <Column key={status} status={status} />
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🐛 Scheduler
        </Text>
        
        {/* Add Task Input */}
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.taskInput}
            placeholder="Add a new task..."
            placeholderTextColor="#999"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addTask}
          >
            <SimpleIcon name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('list')}
          >
            <SimpleIcon
              name="list"
              size={20}
              color={viewMode === 'list' ? 'white' : '#007AFF'}
            />
            <Text style={[
              styles.toggleText,
              {
                color: viewMode === 'list' ? 'white' : '#007AFF',
                fontWeight: viewMode === 'list' ? '600' : '400',
              }
            ]}>
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'board' && styles.activeToggle,
            ]}
            onPress={() => setViewMode('board')}
          >
            <SimpleIcon
              name="grid"
              size={20}
              color={viewMode === 'board' ? 'white' : '#007AFF'}
            />
            <Text style={[
              styles.toggleText,
              {
                color: viewMode === 'board' ? 'white' : '#007AFF',
                fontWeight: viewMode === 'board' ? '600' : '400',
              }
            ]}>
              Board
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {viewMode === 'list' ? <ListView /> : <BoardView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  icon: {
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 16,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addTaskContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#F0F0F0',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  
  // List View Styles
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listSection: {
    marginBottom: 24,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#E3F2FD',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  taskCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#007AFF',
  },
  taskCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Board View Styles
  boardContainer: {
    padding: 16,
    gap: 16,
  },
  boardContainerWide: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  boardContainerNarrow: {
    flexDirection: 'row',
  },
  column: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    minHeight: 300,
    marginHorizontal: 4,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  columnContent: {
    flex: 1,
    padding: 12,
  },
  emptyColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  
  // Task Card Styles
  taskCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowColor: '#000',
    elevation: 2,
  },
  draggedCard: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  completeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  dragIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});