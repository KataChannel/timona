import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_TASKS,
  GET_TASK_BY_ID,
  GET_SHARED_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  SHARE_TASK,
  CREATE_TASK_COMMENT,
  TASK_CREATED_SUBSCRIPTION,
  TASK_UPDATED_SUBSCRIPTION,
  TASK_COMMENT_CREATED_SUBSCRIPTION,
} from '../lib/graphql/todo-queries';
import {
  Task,
  TaskFilterInput,
  CreateTaskInput,
  UpdateTaskInput,
  ShareTaskInput,
  CreateTaskCommentInput,
} from '../types/todo';

// Hook for fetching user's tasks
export const useTasks = (filters?: TaskFilterInput) => {
  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });

  return {
    tasks: data?.getTasks || [],
    loading,
    error,
    refetch,
  };
};

// Hook for fetching shared tasks
export const useSharedTasks = (filters?: TaskFilterInput) => {
  const { data, loading, error, refetch } = useQuery(GET_SHARED_TASKS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });

  return {
    sharedTasks: data?.getSharedTasks || [],
    loading,
    error,
    refetch,
  };
};

// Hook for fetching a single task with details
export const useTask = (taskId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_TASK_BY_ID, {
    variables: { id: taskId },
    skip: !taskId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    task: data?.getTaskById,
    loading,
    error,
    refetch,
  };
};

// Hook for task mutations
export const useTaskMutations = () => {
  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: [GET_TASKS, GET_SHARED_TASKS],
  });

  const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
    refetchQueries: [GET_TASKS, GET_SHARED_TASKS, GET_TASK_BY_ID],
  });

  const [deleteTask, { loading: deleting }] = useMutation(DELETE_TASK, {
    refetchQueries: [GET_TASKS, GET_SHARED_TASKS],
  });

  const [shareTask, { loading: sharing }] = useMutation(SHARE_TASK, {
    refetchQueries: [GET_TASK_BY_ID],
  });

  const [createComment, { loading: commenting }] = useMutation(CREATE_TASK_COMMENT, {
    refetchQueries: [GET_TASK_BY_ID],
  });

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      const result = await createTask({ variables: { input } });
      return result.data?.createTask;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTask = async (input: UpdateTaskInput) => {
    try {
      const result = await updateTask({ variables: { input } });
      return result.data?.updateTask;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask({ variables: { id } });
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleShareTask = async (input: ShareTaskInput) => {
    try {
      const result = await shareTask({ variables: { input } });
      return result.data?.shareTask;
    } catch (error) {
      throw error;
    }
  };

  const handleCreateComment = async (input: CreateTaskCommentInput) => {
    try {
      const result = await createComment({ variables: { input } });
      return result.data?.createTaskComment;
    } catch (error) {
      throw error;
    }
  };

  return {
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    shareTask: handleShareTask,
    createComment: handleCreateComment,
    loading: {
      creating,
      updating,
      deleting,
      sharing,
      commenting,
    },
  };
};

// Hook for real-time task updates
export const useTaskSubscriptions = () => {
  const [newTasks, setNewTasks] = useState<Task[]>([]);
  const [updatedTasks, setUpdatedTasks] = useState<Task[]>([]);

  useSubscription(TASK_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.taskCreated) {
        setNewTasks(prev => [data.data.taskCreated, ...prev]);
      }
    },
  });

  useSubscription(TASK_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data.data?.taskUpdated) {
        setUpdatedTasks(prev => [data.data.taskUpdated, ...prev]);
      }
    },
  });

  useSubscription(TASK_COMMENT_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('New comment:', data.data?.taskCommentCreated);
    },
  });

  return {
    newTasks,
    updatedTasks,
    clearNotifications: () => {
      setNewTasks([]);
      setUpdatedTasks([]);
    },
  };
};

// Hook for task filtering
export const useTaskFilters = () => {
  const [filters, setFilters] = useState<TaskFilterInput>({});

  const updateFilter = (key: keyof TaskFilterInput, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const resetFilter = (key: keyof TaskFilterInput) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    resetFilter,
    hasActiveFilters: Object.keys(filters).length > 0,
  };
};

// Hook aliases for backward compatibility
export const useTaskById = (id: string) => useTask(id);

export const useCreateTask = () => {
  const { createTask, loading } = useTaskMutations();
  return {
    createTask,
    loading: loading.creating,
  };
};

export const useUpdateTask = () => {
  const [updateTaskMutation, { loading, error }] = useMutation(UPDATE_TASK, {
    refetchQueries: [GET_TASKS, GET_SHARED_TASKS, GET_TASK_BY_ID],
  });

  return {
    updateTask: updateTaskMutation,
    loading,
    error,
  };
};

export const useDeleteTask = () => {
  const [deleteTaskMutation, { loading, error }] = useMutation(DELETE_TASK, {
    refetchQueries: [GET_TASKS, GET_SHARED_TASKS],
  });

  return {
    deleteTask: deleteTaskMutation,
    loading,
    error,
  };
};
