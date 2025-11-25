'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useDynamicQuery,
  useDynamicMutation,
  useCRUD,
  BulkOperationResult,
  formatDynamicGraphQLError,
  isDynamicGraphQLError
} from '@/lib/graphql/dynamic-hooks';
import { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskFilterInput,
  TaskStatus,
  TaskPriority,
  TaskCategory
} from '@/types/todo';
import { toast } from 'sonner';

// Types for hook options
interface CreateTaskOptions {
  showToast?: boolean;
  onCreate?: (task: Task) => void;
  onError?: (error: any) => void;
}

interface BulkCreateOptions {
  showToast?: boolean;
  showProgress?: boolean;
  onProgress?: (progress: { completed: number; total: number }) => void;
  onCompleted?: (result: BulkOperationResult<Task>) => void;
  onError?: (error: any) => void;
}

interface UpdateTaskOptions {
  showToast?: boolean;
  onUpdate?: (task: Task) => void;
  onError?: (error: any) => void;
}

interface DeleteTaskOptions {
  showToast?: boolean;
  onDelete?: () => void;
  onError?: (error: any) => void;
}

// Dynamic Task CRUD Hook với tất cả tính năng
export function useDynamicTasks() {
  const [isLoading, setIsLoading] = useState(false);

  // Sử dụng CRUD hook cho Task model
  const taskCRUD = useCRUD<Task>('Task');

  // Dynamic queries với improved error handling
  const { data: allTasks, loading: tasksLoading, error: tasksError, refetch } = useDynamicQuery<Task[]>(
    'GET_ALL',
    'Task',
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    }
  );

  // Handle data loading and errors with useEffect instead of deprecated callbacks
  useEffect(() => {
    if (allTasks) {
      // console.log('✅ Dynamic tasks loaded:', allTasks);
      // console.log('✅ Is array?', Array.isArray(allTasks));
      // console.log('✅ Type:', typeof allTasks);
    }
  }, [allTasks]);

  useEffect(() => {
    if (tasksError) {
      console.error('❌ Dynamic tasks error:', tasksError);
    }
  }, [tasksError]);

  const { data: tasksPaginated, loading: paginatedLoading, refetch: refetchPaginated } = useDynamicQuery(
    'GET_PAGINATED',
    'Task',
    {
      variables: { page: 1, limit: 10 },
      fetchPolicy: 'cache-and-network'
    }
  );

  // Dynamic mutations
  const [createTask, { loading: creating }] = useDynamicMutation<Task, { data: CreateTaskInput }>(
    'CREATE',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED'],
      awaitRefetchQueries: true,
      errorPolicy: 'all'
    }
  );

  const [updateTask, { loading: updating }] = useDynamicMutation<Task, { id: string; data: Partial<UpdateTaskInput> }>(
    'UPDATE',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED', 'GET_TASK_BY_ID'],
      awaitRefetchQueries: true
    }
  );

  const [deleteTask, { loading: deleting }] = useDynamicMutation<boolean, { id: string }>(
    'DELETE',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED'],
      awaitRefetchQueries: true
    }
  );

  // Bulk operations
  const [createTasksBulk, { loading: bulkCreating }] = useDynamicMutation<BulkOperationResult<Task>, { data: CreateTaskInput[] }>(
    'CREATE_BULK',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED'],
      awaitRefetchQueries: true
    }
  );

  const [updateTasksBulk, { loading: bulkUpdating }] = useDynamicMutation<BulkOperationResult<Task>, { where: any; data: Partial<UpdateTaskInput> }>(
    'UPDATE_BULK',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED'],
      awaitRefetchQueries: true
    }
  );

  const [deleteTasksBulk, { loading: bulkDeleting }] = useDynamicMutation<BulkOperationResult<Task>, { where: any }>(
    'DELETE_BULK',
    'Task',
    {
      refetchQueries: ['GET_TASKs', 'GET_TASKs_PAGINATED'],
      awaitRefetchQueries: true
    }
  );

  // Enhanced task creation
  const handleCreateTask = useCallback(async (taskData: CreateTaskInput, options: CreateTaskOptions = {}) => {
    const { showToast = true, onCreate, onError } = options;

    try {
      setIsLoading(true);

      // Validation
      if (!taskData.title?.trim()) {
        throw new Error('Tiêu đề task không được để trống');
      }

      const sanitizedData: CreateTaskInput = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || undefined,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: taskData.dueDate || undefined
      };

      // Sử dụng specific resolver
      const response = await createTask({
        variables: { data: sanitizedData }
      });
      const result = response.data || null;

      if (!result) {
        throw new Error('Không thể tạo task - response rỗng');
      }

      if (showToast) {
        toast.success('✅ Tạo task thành công!');
      }

      onCreate?.(result);
      
      // Safe refetch
      try {
        await refetch();
      } catch (refetchError) {
        console.warn('⚠️ Refetch warning:', refetchError);
      }
      
      return result;

    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      
      const errorMessage = isDynamicGraphQLError(error)
        ? formatDynamicGraphQLError(error)
        : error.message || 'Lỗi khi tạo task';

      if (showToast) {
        toast.error(`❌ ${errorMessage}`);
      }

      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createTask, refetch]);

  // Bulk task creation
  const handleCreateTasksBulk = useCallback(async (tasksData: CreateTaskInput[], options: BulkCreateOptions = {}) => {
    const { showToast = true, showProgress = true, onProgress, onCompleted, onError } = options;

    try {
      setIsLoading(true);

      // Validate all tasks
      const validatedData = tasksData.map((task, index) => {
        if (!task.title?.trim()) {
          throw new Error(`Task ${index + 1}: Tiêu đề không được để trống`);
        }
        return {
          title: task.title.trim(),
          description: task.description?.trim() || undefined,
          category: task.category,
          priority: task.priority,
          dueDate: task.dueDate || undefined
        };
      });

      if (showProgress) {
        toast.loading(`Đang tạo ${tasksData.length} tasks...`, { id: 'bulk-create' });
      }

      const response = await createTasksBulk({
        variables: { data: validatedData }
      });

      const result = response.data!;

      if (showProgress) {
        toast.dismiss('bulk-create');
      }

      if (showToast) {
        if (result.errors && result.errors.length > 0) {
          toast.success(`✅ Tạo thành công ${result.count}/${tasksData.length} tasks`);
          toast.error(`❌ Lỗi: ${result.errors.length} tasks`);
        } else {
          toast.success(`✅ Tạo thành công ${result.count} tasks!`);
        }
      }

      onProgress?.({ completed: result.count, total: tasksData.length });
      onCompleted?.(result);
      await refetch();

      return result;

    } catch (error: any) {
      console.error('Error creating tasks bulk:', error);
      
      if (showProgress) {
        toast.dismiss('bulk-create');
      }

      const errorMessage = isDynamicGraphQLError(error)
        ? formatDynamicGraphQLError(error)
        : error.message || 'Lỗi khi tạo tasks';

      if (showToast) {
        toast.error(`❌ ${errorMessage}`);
      }

      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createTasksBulk, refetch]);

  // Enhanced task update
  const handleUpdateTask = useCallback(async (id: string, updates: Partial<UpdateTaskInput>, options: UpdateTaskOptions = {}) => {
    const { showToast = true, onUpdate, onError } = options;

    try {
      setIsLoading(true);

      const sanitizedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string') {
            acc[key] = value.trim() || undefined;
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);

      const response = await updateTask({
        variables: { 
          id, 
          data: sanitizedUpdates 
        }
      });

      const result = response.data;
      if (!result) {
        throw new Error('Không thể cập nhật task');
      }

      if (showToast) {
        toast.success('✅ Cập nhật task thành công!');
      }

      onUpdate?.(result);
      await refetch();

      return result;

    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      
      const errorMessage = isDynamicGraphQLError(error)
        ? formatDynamicGraphQLError(error)
        : error.message || 'Lỗi khi cập nhật task';

      if (showToast) {
        toast.error(`❌ ${errorMessage}`);
      }

      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateTask, refetch]);

  // Enhanced task deletion
  const handleDeleteTask = useCallback(async (id: string, options: DeleteTaskOptions = {}) => {
    const { showToast = true, onDelete, onError } = options;

    try {
      setIsLoading(true);

      const response = await deleteTask({
        variables: { id }
      });

      const success = response.data;

      if (showToast && success) {
        toast.success('✅ Xóa task thành công!');
      }

      onDelete?.();
      await refetch();

      return success;

    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      
      const errorMessage = isDynamicGraphQLError(error)
        ? formatDynamicGraphQLError(error)
        : error.message || 'Lỗi khi xóa task';

      if (showToast) {
        toast.error(`❌ ${errorMessage}`);
      }

      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [deleteTask, refetch]);

  // Statistics and computed values
  const statistics = useMemo(() => {
    if (!Array.isArray(allTasks)) return {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0
    };

    const completed = allTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = allTasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
    const overdue = allTasks.filter(t => {
      return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED;
    }).length;

    return {
      total: allTasks.length,
      completed,
      pending,
      overdue
    };
  }, [allTasks]);

  // Quick actions
  const quickActions = useMemo(() => ({
    markAsCompleted: (id: string) => handleUpdateTask(id, { status: TaskStatus.COMPLETED }),
    markAsPending: (id: string) => handleUpdateTask(id, { status: TaskStatus.PENDING }),
    markAsInProgress: (id: string) => handleUpdateTask(id, { status: TaskStatus.IN_PROGRESS }),
    setPriority: (id: string, priority: TaskPriority) => handleUpdateTask(id, { priority }),
    setDueDate: (id: string, dueDate: Date) => handleUpdateTask(id, { dueDate: dueDate.toISOString() })
  }), [handleUpdateTask]);

  // Return all functionality
  return {
    // Data
    tasks: Array.isArray(allTasks) ? allTasks : [],
    tasksPaginated,
    statistics,

    // Loading states
    loading: tasksLoading || paginatedLoading || isLoading,
    creating,
    updating,
    deleting,
    bulkCreating,
    bulkUpdating,
    bulkDeleting,

    // Error state
    error: tasksError,

    // CRUD operations
    createTask: handleCreateTask,
    createTasksBulk: handleCreateTasksBulk,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    refetch,
    refetchPaginated,

    // Quick actions
    quickActions,

    // Raw CRUD hook for advanced usage
    crud: taskCRUD
  };
}
