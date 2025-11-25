'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { TasksHeader } from '@/components/tasks/TasksHeader';
import { TasksStats } from '@/components/tasks/TasksStats';
import { TasksFilters } from '@/components/tasks/TasksFilters';
import { TasksGrid } from '@/components/tasks/TasksGrid';
import CreateTaskModal from '@/components/todos/CreateTaskModal';
import { useTasks, useSharedTasks } from '@/hooks/useTodos';
import { useDynamicTasks } from '@/hooks/useDynamicTasks';
import { TaskStatus, TaskPriority, TaskCategory, Task, CreateTaskInput } from '@/types/todo';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Extended task interface to include shared information
interface ExtendedTask extends Task {
  isShared?: boolean;
  sharedBy?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  sharePermission?: 'VIEW' | 'EDIT' | 'ADMIN';
}

interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
  view: 'all' | 'my' | 'shared';
}

export default function TodosPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    view: 'all',
  });

  // Dynamic GraphQL hooks
  const {
    tasks: dynamicTasks,
    loading: dynamicLoading,
    createTask: dynamicCreateTask,
    updateTask: dynamicUpdateTask,
    deleteTask: dynamicDeleteTask,
    refetch: dynamicRefetch
  } = useDynamicTasks();

  // Regular tasks hooks
  const { tasks, loading: tasksLoading, refetch } = useTasks();

  // Shared tasks hooks
  const { sharedTasks, loading: sharedTasksLoading, refetch: refetchShared } = useSharedTasks();

  // Process and combine tasks
  const myTasks = useMemo(() => {
    const baseTasks = dynamicTasks?.length > 0 ? dynamicTasks : (tasks || []);
    return baseTasks.map((task: Task): ExtendedTask => ({
      ...task,
      isShared: false
    }));
  }, [dynamicTasks, tasks]);

  const processedSharedTasks = useMemo(() => {
    return (sharedTasks || []).map((task: Task): ExtendedTask => ({
      ...task,
      isShared: true,
      sharedBy: task.author,
      sharePermission: 'VIEW' as const
    }));
  }, [sharedTasks]);

  const allTasks = useMemo(() => {
    return [...myTasks, ...processedSharedTasks];
  }, [myTasks, processedSharedTasks]);

  // Filter tasks based on current filters and search
  const filteredTasks = useMemo(() => {
    let result = allTasks;

    // Filter by view (all/my/shared)
    switch (filters.view) {
      case 'my':
        result = myTasks;
        break;
      case 'shared':
        result = processedSharedTasks;
        break;
      default:
        result = allTasks;
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((task: ExtendedTask) => task.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      result = result.filter((task: ExtendedTask) => task.priority === filters.priority);
    }

    // Filter by category
    if (filters.category !== 'all') {
      result = result.filter((task: ExtendedTask) => task.category === filters.category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task: ExtendedTask) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allTasks, myTasks, processedSharedTasks, filters, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const tasks = filteredTasks;
    const total = tasks.length;
    const pending = tasks.filter((t: ExtendedTask) => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter((t: ExtendedTask) => t.status === TaskStatus.IN_PROGRESS).length;
    const completed = tasks.filter((t: ExtendedTask) => t.status === TaskStatus.COMPLETED).length;
    const cancelled = tasks.filter((t: ExtendedTask) => t.status === TaskStatus.CANCELLED).length;
    const highPriority = tasks.filter((t: ExtendedTask) => t.priority === TaskPriority.HIGH).length;
    const now = new Date();
    const overdue = tasks.filter((t: ExtendedTask) => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== TaskStatus.COMPLETED
    ).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      highPriority,
      overdue,
    };
  }, [filteredTasks]);

  const finalLoading = dynamicLoading || tasksLoading || sharedTasksLoading;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Enhanced refetch function for all data
  const refetchAllTasks = useCallback(async () => {
    await Promise.all([
      dynamicRefetch(),
      refetch(),
      refetchShared()
    ]);
  }, [dynamicRefetch, refetch, refetchShared]);

  // Task create handler
  const handleTaskCreate = useCallback(async (initialData?: Partial<CreateTaskInput>) => {
    try {
      if (initialData && initialData.title) {
        const taskData: CreateTaskInput = {
          title: initialData.title,
          description: initialData.description || '',
          category: initialData.category || TaskCategory.PERSONAL,
          priority: initialData.priority || TaskPriority.MEDIUM,
          dueDate: initialData.dueDate
        };

        await dynamicCreateTask(taskData, {
          showToast: true,
          onCreate: (task: Task) => {
            console.log('✅ Task created via Dynamic GraphQL:', task);
            toast.success(`🎉 Created: "${task.title}"`);
          }
        });
      } else {
        setShowCreateModal(true);
      }
    } catch (error) {
      console.error('❌ Task creation error:', error);
      toast.error(`❌ Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [dynamicCreateTask]);

  // Task update handler
  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      // Convert Task to UpdateTaskInput format
      const updateInput: any = {};
      if (updates.title !== undefined) updateInput.title = updates.title;
      if (updates.description !== undefined) updateInput.description = updates.description;
      if (updates.status !== undefined) updateInput.status = updates.status;
      if (updates.priority !== undefined) updateInput.priority = updates.priority;
      if (updates.category !== undefined) updateInput.category = updates.category as TaskCategory;
      if (updates.dueDate !== undefined) updateInput.dueDate = updates.dueDate;

      await dynamicUpdateTask(taskId, updateInput, {
        showToast: true,
        onUpdate: (task: Task) => {
          console.log('✅ Task updated via Dynamic GraphQL:', task);
        }
      });
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error('❌ Error updating task');
    }
  }, [dynamicUpdateTask]);

  // Task delete handler
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this task?')) {
        return;
      }
      
      await dynamicDeleteTask(taskId, {
        showToast: true,
        onDelete: () => {
          console.log('✅ Task deleted via Dynamic GraphQL');
        }
      });
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('❌ Error deleting task');
    }
  }, [dynamicDeleteTask]);

  // Status change handler
  const handleTaskStatusChange = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      await handleTaskUpdate(taskId, { status });
    } catch (error) {
      console.error('❌ Status change error:', error);
    }
  }, [handleTaskUpdate]);

  // Filter change handler
  const handleFiltersChange = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      view: filters.view, // Keep the view filter
    });
    setSearchQuery('');
  }, [filters.view]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search and Create */}
        <TasksHeader
          totalTasks={stats.total}
          onCreateTask={() => handleTaskCreate()}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onFilterChange={handleClearFilters}
        />

        {/* Statistics Cards */}
        <div className="mt-6">
          <TasksStats stats={stats} />
        </div>

        {/* Advanced Filters */}
        <div className="mt-6">
          <TasksFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            myTasksCount={myTasks.length}
            sharedTasksCount={processedSharedTasks.length}
            allTasksCount={allTasks.length}
          />
        </div>

        {/* Tasks Grid */}
        <div className="mt-6">
          <TasksGrid
            tasks={filteredTasks}
            loading={finalLoading}
            onEdit={(task) => {
              // TODO: Implement edit modal
              console.log('Edit task:', task);
              toast.success('Edit functionality coming soon!');
            }}
            onDelete={handleTaskDelete}
            onStatusChange={handleTaskStatusChange}
            emptyMessage={
              searchQuery || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks found. Create your first task to get started!'
            }
          />
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={() => {
          refetchAllTasks();
        }}
      />
    </div>
  );
}
