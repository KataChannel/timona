/**
 * ============================================================================
 * TASK MANAGEMENT HOOKS - DYNAMIC GRAPHQL VERSION
 * ============================================================================
 * 
 * Migrated from Apollo Client to Dynamic GraphQL
 * Uses universal hooks for better performance and type safety
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0 - Dynamic GraphQL Migration
 */

import { useMemo } from 'react';
import {
  useFindMany,
  useFindUnique,
  useCreateOne,
  useUpdateOne,
  useDeleteOne,
} from './useDynamicGraphQL';

// ==================== TYPE DEFINITIONS ====================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  dueDate?: string;
  completedAt?: string;
  order: number;
  assignedTo?: string[];
  mentions?: string[];
  tags?: string[];
  projectId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
    subtasks: number;
  };
}

export interface TaskFilterInput {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedTo?: string[];
  tags?: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  dueDate?: string;
  assignedTo?: string[];
  tags?: string[];
  projectId?: string;
  userId?: string; // Creator/owner user ID
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string[];
  tags?: string[];
  order?: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Hook: Get tasks for a project (TaskFeed)
 * 
 * @example
 * const { data: tasks, loading, refetch } = useProjectTasks(projectId, {
 *   status: 'IN_PROGRESS',
 *   priority: 'HIGH',
 *   search: 'design'
 * });
 */
export const useProjectTasks = (projectId: string | null, filters?: TaskFilterInput) => {
  const where = useMemo(() => {
    if (!projectId) return undefined;

    const conditions: any = {
      projectId: { equals: projectId },
    };

    // Apply filters
    if (filters?.status) {
      conditions.status = { equals: filters.status };
    }

    if (filters?.priority) {
      conditions.priority = { equals: filters.priority };
    }

    if (filters?.category) {
      conditions.category = { equals: filters.category };
    }

    if (filters?.search) {
      conditions.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.dueDateFrom || filters?.dueDateTo) {
      conditions.dueDate = {};
      if (filters.dueDateFrom) {
        conditions.dueDate.gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        conditions.dueDate.lte = filters.dueDateTo;
      }
    }

    if (filters?.assignedTo && filters.assignedTo.length > 0) {
      conditions.assignedTo = {
        hasSome: filters.assignedTo,
      };
    }

    if (filters?.tags && filters.tags.length > 0) {
      conditions.tags = {
        hasSome: filters.tags,
      };
    }

    return conditions;
  }, [projectId, filters]);

  const { data, loading, error, refetch } = useFindMany<Task>('task', {
    where,
    orderBy: { createdAt: 'desc' }, // Latest first (single field for Dynamic GraphQL)
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
          subtasks: true,
        },
      },
    },
  }, {
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: { projectTasks: data || [] },
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get single task details
 * 
 * @example
 * const { data: task, loading } = useTask(taskId);
 */
export const useTask = (taskId: string | null) => {
  const { data, loading, error, refetch } = useFindUnique<Task>(
    'task',
    taskId || '',
    {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
    },
    { skip: !taskId }
  );

  return {
    data: data ? { task: data } : undefined,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get user's personal tasks (no project)
 * 
 * @example
 * const { data: tasks, loading } = useMyTasks({ status: 'PENDING' });
 */
export const useMyTasks = (filters?: TaskFilterInput) => {
  const where = useMemo(() => {
    const conditions: any = {
      projectId: { equals: null }, // Personal tasks only
    };

    if (filters?.status) {
      conditions.status = { equals: filters.status };
    }

    if (filters?.priority) {
      conditions.priority = { equals: filters.priority };
    }

    if (filters?.category) {
      conditions.category = { equals: filters.category };
    }

    if (filters?.search) {
      conditions.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return conditions;
  }, [filters]);

  const { data, loading, error, refetch } = useFindMany<Task>('task', {
    where,
    orderBy: { createdAt: 'desc' }, // Latest first (single field for Dynamic GraphQL)
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
          subtasks: true,
        },
      },
    },
  });

  return {
    data: { myTasks: data || [] },
    loading,
    error,
    refetch,
  };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Create task in project
 * 
 * @example
 * const [createTask, { loading }] = useCreateProjectTask(projectId);
 * await createTask({
 *   variables: {
 *     projectId,
 *     input: {
 *       title: "New task",
 *       priority: "HIGH",
 *       dueDate: "2024-11-01",
 *       assignedTo: ["user-id-1"],
 *       tags: ["urgent"]
 *     }
 *   }
 * });
 */
export const useCreateProjectTask = (projectId: string) => {
  const [createOne, { data, loading, error }] = useCreateOne<Task>('task');

  const createTask = async (options: {
    variables: {
      projectId: string;
      input: CreateTaskInput;
    };
  }) => {
    // Extract userId from input, throw error if missing
    const { userId, ...taskData } = options.variables.input;
    
    if (!userId) {
      throw new Error('userId is required to create a task');
    }

    const result = await createOne({
      data: {
        ...taskData,
        projectId: options.variables.projectId,
        status: 'PENDING',
        order: 0, // Will be set by backend
        user: {
          connect: { id: userId }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
    });

    return { data: { createProjectTask: result } };
  };

  return [createTask, { loading, error }] as const;
};

/**
 * Hook: Update task
 * 
 * @example
 * const [updateTask] = useUpdateTask();
 * await updateTask({
 *   variables: {
 *     id: "task-uuid",
 *     input: { status: "COMPLETED" }
 *   }
 * });
 */
export const useUpdateTask = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Task>('task');

  const updateTask = async (options: {
    variables: {
      id: string;
      input: UpdateTaskInput;
    };
  }) => {
    const result = await updateOne({
      where: options.variables.id,
      data: options.variables.input,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
    });

    return { data: { updateTask: result } };
  };

  return [updateTask, { loading, error }] as const;
};

/**
 * Hook: Delete task
 * 
 * @example
 * const [deleteTask] = useDeleteTask(projectId);
 * await deleteTask({ variables: { id: "task-uuid" } });
 */
export const useDeleteTask = (projectId: string) => {
  const [deleteOne, { data, loading, error }] = useDeleteOne<Task>('task');

  const deleteTask = async (options: { variables: { id: string } }) => {
    const result = await deleteOne({
      where: options.variables.id,
      select: {
        id: true,
      },
    });

    return { data: { deleteTask: result } };
  };

  return [deleteTask, { loading, error }] as const;
};

/**
 * Hook: Update task order (for drag & drop)
 * 
 * @example
 * const [updateOrder] = useUpdateTaskOrder();
 * await updateOrder({ variables: { taskId: "uuid", newOrder: 5 } });
 */
export const useUpdateTaskOrder = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Task>('task');

  const updateOrder = async (options: {
    variables: {
      taskId: string;
      newOrder: number;
    };
  }) => {
    const result = await updateOne({
      where: options.variables.taskId,
      data: { order: options.variables.newOrder },
      select: {
        id: true,
        order: true,
      },
    });

    return { data: { updateTaskOrder: result } };
  };

  return [updateOrder, { loading, error }] as const;
};

/**
 * Hook: Assign task to users
 * 
 * @example
 * const [assignTask] = useAssignTask();
 * await assignTask({
 *   variables: {
 *     taskId: "uuid",
 *     userIds: ["user-1", "user-2"]
 *   }
 * });
 */
export const useAssignTask = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Task>('task');

  const assignTask = async (options: {
    variables: {
      taskId: string;
      userIds: string[];
    };
  }) => {
    const result = await updateOne({
      where: options.variables.taskId,
      data: { assignedTo: options.variables.userIds },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return { data: { assignTask: result } };
  };

  return [assignTask, { loading, error }] as const;
};

/**
 * Hook: Update task status (used by TaskCard checkbox)
 * 
 * @example
 * const [updateStatus] = useUpdateTaskStatus();
 * await updateStatus({
 *   variables: {
 *     input: {
 *       id: "task-uuid",
 *       status: "COMPLETED"
 *     }
 *   }
 * });
 */
export const useUpdateTaskStatus = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Task>('task');

  const updateStatus = async (options: {
    variables: {
      input: {
        id: string;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      };
    };
  }) => {
    const updateData: any = {
      status: options.variables.input.status,
    };

    // Set completedAt when marking as completed
    if (options.variables.input.status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString();
    } else {
      updateData.completedAt = null;
    }

    const result = await updateOne({
      where: options.variables.input.id,
      data: updateData,
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    });

    return { data: { updateTask: result } };
  };

  return [updateStatus, { loading, error }] as const;
};

// ==================== EXPORT ALL ====================

export default {
  // Queries
  useProjectTasks,
  useTask,
  useMyTasks,
  // Mutations
  useCreateProjectTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskOrder,
  useAssignTask,
  useUpdateTaskStatus,
};
