/**
 * ============================================================================
 * TASK SUBTASKS HOOKS - MVP 3 DYNAMIC GRAPHQL
 * ============================================================================
 * 
 * Subtasks management using hierarchical Task model
 * Features:
 * - Create, read, update, delete subtasks
 * - Progress tracking
 * - Completion status
 * - Nested subtasks support
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3
 */

import { useMemo } from 'react';
import {
  useFindMany,
  useCreateOne,
  useUpdateOne,
  useDeleteOne,
} from './useDynamicGraphQL';

// ==================== TYPE DEFINITIONS ====================

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  order: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  parentId: string;
  userId: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  subtasks?: Subtask[]; // Nested subtasks
  _count?: {
    subtasks: number;
  };
}

export interface CreateSubtaskInput {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  parentId: string; // Parent task ID
  userId?: string; // Creator user ID
}

export interface UpdateSubtaskInput {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  order?: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Hook: Get all subtasks for a task
 * 
 * @example
 * const { data: subtasks, loading, refetch } = useSubtasks(taskId);
 */
export const useSubtasks = (taskId: string | null) => {
  const where = useMemo(() => {
    if (!taskId) return undefined;
    
    return {
      parentId: { equals: taskId },
    };
  }, [taskId]);

  const { data, loading, error, refetch } = useFindMany<Subtask>('task', {
    where,
    orderBy: { createdAt: 'asc' }, // Oldest first (single field for Dynamic GraphQL)
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
      subtasks: {
        // Nested subtasks (one level deep)
        orderBy: { order: 'asc' },
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
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  }, {
    skip: !taskId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get subtask progress statistics
 * 
 * @example
 * const { total, completed, percentage } = useSubtaskProgress(taskId);
 */
export const useSubtaskProgress = (taskId: string | null) => {
  const { data: subtasks, loading, error } = useSubtasks(taskId);

  const stats = useMemo(() => {
    if (!subtasks) return { total: 0, completed: 0, percentage: 0 };

    const total = subtasks.length;
    const completed = subtasks.filter(s => s.status === 'COMPLETED').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [subtasks]);

  return {
    ...stats,
    loading,
    error,
  };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Create new subtask
 * 
 * @example
 * const [createSubtask, { loading }] = useCreateSubtask();
 * await createSubtask({
 *   variables: {
 *     input: {
 *       title: "Subtask 1",
 *       description: "Details...",
 *       parentId: "parent-task-uuid"
 *     }
 *   }
 * });
 */
export const useCreateSubtask = () => {
  const [createOne, { data, loading, error }] = useCreateOne<Subtask>('task');

  const createSubtask = async (options: { variables: { input: CreateSubtaskInput } }) => {
    const { userId, ...subtaskData } = options.variables.input;
    
    if (!userId) {
      throw new Error('userId is required to create a subtask');
    }

    const result = await createOne({
      data: {
        ...subtaskData,
        status: 'PENDING',
        category: 'OTHER', // Default category for subtasks
        order: 0, // Will be updated by backend
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
            subtasks: true,
          },
        },
      },
    });

    return { data: { createSubtask: result } };
  };

  return [createSubtask, { loading, error }] as const;
};

/**
 * Hook: Update subtask
 * 
 * @example
 * const [updateSubtask] = useUpdateSubtask();
 * await updateSubtask({
 *   variables: {
 *     id: "subtask-uuid",
 *     input: { status: "COMPLETED" }
 *   }
 * });
 */
export const useUpdateSubtask = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Subtask>('task');

  const updateSubtask = async (options: {
    variables: {
      id: string;
      input: UpdateSubtaskInput;
    };
  }) => {
    // Auto-set completedAt when marking as completed
    const updateData: any = { ...options.variables.input };
    if (updateData.status === 'COMPLETED') {
      updateData.completedAt = new Date().toISOString();
    } else if (updateData.status && updateData.status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    const result = await updateOne({
      where: options.variables.id,
      data: updateData,
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

    return { data: { updateSubtask: result } };
  };

  return [updateSubtask, { loading, error }] as const;
};

/**
 * Hook: Delete subtask
 * 
 * @example
 * const [deleteSubtask] = useDeleteSubtask();
 * await deleteSubtask({ variables: { id: "subtask-uuid" } });
 */
export const useDeleteSubtask = () => {
  const [deleteOne, { data, loading, error }] = useDeleteOne<Subtask>('task');

  const deleteSubtask = async (options: { variables: { id: string } }) => {
    const result = await deleteOne({
      where: options.variables.id,
      select: {
        id: true,
      },
    });

    return { data: { deleteSubtask: result } };
  };

  return [deleteSubtask, { loading, error }] as const;
};

/**
 * Hook: Toggle subtask completion (quick action)
 * 
 * @example
 * const [toggleSubtask] = useToggleSubtask();
 * await toggleSubtask({ 
 *   variables: { 
 *     id: "subtask-uuid", 
 *     completed: true 
 *   } 
 * });
 */
export const useToggleSubtask = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<Subtask>('task');

  const toggleSubtask = async (options: {
    variables: {
      id: string;
      completed: boolean;
    };
  }) => {
    const result = await updateOne({
      where: options.variables.id,
      data: {
        status: options.variables.completed ? 'COMPLETED' : 'PENDING',
        completedAt: options.variables.completed ? new Date().toISOString() : null,
      },
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    });

    return { data: { toggleSubtask: result } };
  };

  return [toggleSubtask, { loading, error }] as const;
};

// ==================== EXPORT ALL ====================

export default {
  // Queries
  useSubtasks,
  useSubtaskProgress,
  // Mutations
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useToggleSubtask,
};
