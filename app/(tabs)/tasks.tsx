import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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

  // Move task to next status or complete
  const moveTaskToCompleted = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: 'Completed' as const }
        : task
    ));
  };

  // Move task between columns (for board view)
  const moveTask = (taskId: number, newStatus: Task['status']) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    ));
  };

  // Group tasks by status for list view
  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = tasks.filter(task => task.status === status);
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
      onPanResponderRelease: (evt, gestureState) => {
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
      {
        backgroundColor: colors.background,
        borderColor: colors.text + '20',
        shadowColor: colors.text,
      },
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
          <IconSymbol 
            name="leaf.fill" 
            size={16} 
            color={colors.tint} 
            style={styles.taskIcon} 
          />
          <Text style={[styles.taskTitle, { color: colors.text }]}>
            {task.title}
          </Text>
        </View>
        
        {showMoveButton && task.status !== 'Completed' && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.tint }]}
            onPress={() => moveTaskToCompleted(task.id)}
          >
            <IconSymbol name="checkmark" size={16} color="white" />
          </TouchableOpacity>
        )}
        
        {viewMode === 'board' && (
          <View style={styles.dragIndicator}>
            <IconSymbol name="ellipsis" size={12} color={colors.text + '60'} />
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
          backgroundColor: colors.background + '80',
          borderColor: colors.text + '20',
          width: isWideScreen ? '30%' : screenWidth * 0.8,
        }
      ]}>
        <View style={[styles.columnHeader, { backgroundColor: colors.tint + '20' }]}>
          <ThemedText type="subtitle" style={styles.columnTitle}>
            {status}
          </ThemedText>
          <View style={[styles.taskCount, { backgroundColor: colors.tint }]}>
            <Text style={styles.taskCountText}>{columnTasks.length}</Text>
          </View>
        </View>
        
        <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
          {columnTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {columnTasks.length === 0 && (
            <View style={styles.emptyColumn}>
              <IconSymbol name="plus.circle.dashed" size={32} color={colors.text + '40'} />
              <Text style={[styles.emptyText, { color: colors.text + '60' }]}>
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
            <View style={[styles.listSectionHeader, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {status}
              </ThemedText>
              <View style={[styles.taskCount, { backgroundColor: colors.tint }]}>
                <Text style={styles.taskCountText}>{statusTasks.length}</Text>
              </View>
            </View>
            
            {statusTasks.map(task => (
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
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.text + '20' }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          🐛 Scheduler
        </ThemedText>
        
        {/* Add Task Input */}
        <View style={styles.addTaskContainer}>
          <TextInput
            style={[
              styles.taskInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.text + '30',
                color: colors.text,
              }
            ]}
            placeholder="Add a new task..."
            placeholderTextColor={colors.text + '60'}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={addTask}
          >
            <IconSymbol name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* View Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: colors.background + '80' }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && { backgroundColor: colors.tint },
            ]}
            onPress={() => setViewMode('list')}
          >
            <IconSymbol
              name="list.bullet"
              size={20}
              color={viewMode === 'list' ? 'white' : colors.text}
            />
            <Text style={[
              styles.toggleText,
              {
                color: viewMode === 'list' ? 'white' : colors.text,
                fontWeight: viewMode === 'list' ? '600' : '400',
              }
            ]}>
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'board' && { backgroundColor: colors.tint },
            ]}
            onPress={() => setViewMode('board')}
          >
            <IconSymbol
              name="square.grid.2x2"
              size={20}
              color={viewMode === 'board' ? 'white' : colors.text}
            />
            <Text style={[
              styles.toggleText,
              {
                color: viewMode === 'board' ? 'white' : colors.text,
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    gap: 16,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  addTaskContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
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
  },
  sectionTitle: {
    fontSize: 18,
  },
  taskCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
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
    borderWidth: 1,
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
  },
  columnTitle: {
    fontSize: 18,
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
  },
  
  // Task Card Styles
  taskCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  },
  taskIcon: {
    marginRight: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
  },
  dragIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});