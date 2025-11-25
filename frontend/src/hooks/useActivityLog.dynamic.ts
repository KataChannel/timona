/**
 * ============================================================================
 * TASK ACTIVITY LOG HOOKS - MVP 3 DYNAMIC GRAPHQL
 * ============================================================================
 * 
 * Activity history tracking using Dynamic GraphQL
 * Features:
 * - Automatic activity logging
 * - Timeline view
 * - Filter by action type
 * - Full change history
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3
 */

import { useMemo } from 'react';
import {
  useFindMany,
  useCreateOne,
} from './useDynamicGraphQL';

// ==================== TYPE DEFINITIONS ====================

export type ActivityType =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_PRIORITY_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'COMMENT_ADDED'
  | 'COMMENT_EDITED'
  | 'COMMENT_DELETED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_COMPLETED'
  | 'SUBTASK_DELETED'
  | 'FILE_UPLOADED'
  | 'FILE_DELETED'
  | 'DUE_DATE_CHANGED'
  | 'DESCRIPTION_CHANGED'
  | 'TITLE_CHANGED';

export interface TaskActivityLog {
  id: string;
  action: ActivityType;
  description: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateActivityInput {
  action: ActivityType;
  description: string;
  oldValue?: any;
  newValue?: any;
  taskId: string;
}

export interface ActivityFilter {
  action?: ActivityType;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

// ==================== QUERY HOOKS ====================

/**
 * Hook: Get activity timeline for a task
 * 
 * @example
 * const { data: activities, loading, refetch } = useTaskActivities(taskId);
 */
export const useTaskActivities = (
  taskId: string | null,
  filters?: ActivityFilter
) => {
  const where = useMemo(() => {
    if (!taskId) return undefined;

    const conditions: any = {
      taskId: { equals: taskId },
    };

    // Apply filters
    if (filters?.action) {
      conditions.action = { equals: filters.action };
    }

    if (filters?.userId) {
      conditions.userId = { equals: filters.userId };
    }

    if (filters?.fromDate || filters?.toDate) {
      conditions.createdAt = {};
      if (filters.fromDate) {
        conditions.createdAt.gte = filters.fromDate;
      }
      if (filters.toDate) {
        conditions.createdAt.lte = filters.toDate;
      }
    }

    return conditions;
  }, [taskId, filters]);

  const { data, loading, error, refetch } = useFindMany<TaskActivityLog>(
    'taskActivityLog',
    {
      where,
      orderBy: { createdAt: 'desc' }, // Newest first
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
    {
      skip: !taskId,
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    data: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get recent activities (last 24 hours)
 * 
 * @example
 * const { data: recentActivities } = useRecentActivities(taskId);
 */
export const useRecentActivities = (taskId: string | null) => {
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString();
  }, []);

  return useTaskActivities(taskId, {
    fromDate: yesterday,
  });
};

/**
 * Hook: Get activity count by type
 * 
 * @example
 * const { stats } = useActivityStats(taskId);
 * // stats = { COMMENT_ADDED: 5, STATUS_CHANGED: 3, ... }
 */
export const useActivityStats = (taskId: string | null) => {
  const { data: activities, loading, error } = useTaskActivities(taskId);

  const stats = useMemo(() => {
    if (!activities) return {};

    const statsByType: Record<string, number> = {};
    activities.forEach(activity => {
      statsByType[activity.action] = (statsByType[activity.action] || 0) + 1;
    });

    return statsByType;
  }, [activities]);

  return {
    stats,
    loading,
    error,
  };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Create activity log entry
 * 
 * Note: In production, this would be called automatically by backend
 * when task changes occur. For MVP 3, we can manually log activities.
 * 
 * @example
 * const [logActivity] = useLogActivity();
 * await logActivity({
 *   variables: {
 *     input: {
 *       action: "TASK_STATUS_CHANGED",
 *       description: "changed status from PENDING to IN_PROGRESS",
 *       oldValue: { status: "PENDING" },
 *       newValue: { status: "IN_PROGRESS" },
 *       taskId: "task-uuid"
 *     }
 *   }
 * });
 */
export const useLogActivity = () => {
  const [createOne, { data, loading, error }] = useCreateOne<TaskActivityLog>(
    'taskActivityLog'
  );

  const logActivity = async (options: {
    variables: {
      input: CreateActivityInput;
    };
  }) => {
    const result = await createOne({
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
      },
    });

    return { data: { logActivity: result } };
  };

  return [logActivity, { loading, error }] as const;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper: Get icon for activity type
 */
export const getActivityIcon = (action: ActivityType): string => {
  switch (action) {
    case 'TASK_CREATED':
      return '✨';
    case 'TASK_UPDATED':
      return '✏️';
    case 'TASK_DELETED':
      return '🗑️';
    case 'TASK_STATUS_CHANGED':
      return '📋';
    case 'TASK_PRIORITY_CHANGED':
      return '🔥';
    case 'TASK_ASSIGNED':
      return '👤';
    case 'TASK_UNASSIGNED':
      return '👋';
    case 'COMMENT_ADDED':
      return '💬';
    case 'COMMENT_EDITED':
      return '✏️';
    case 'COMMENT_DELETED':
      return '🗑️';
    case 'SUBTASK_ADDED':
      return '➕';
    case 'SUBTASK_COMPLETED':
      return '✅';
    case 'SUBTASK_DELETED':
      return '❌';
    case 'FILE_UPLOADED':
      return '📎';
    case 'FILE_DELETED':
      return '🗑️';
    case 'DUE_DATE_CHANGED':
      return '📅';
    case 'DESCRIPTION_CHANGED':
      return '📝';
    case 'TITLE_CHANGED':
      return '✏️';
    default:
      return '📌';
  }
};

/**
 * Helper: Get color for activity type
 */
export const getActivityColor = (action: ActivityType): string => {
  switch (action) {
    case 'TASK_CREATED':
      return 'text-green-600';
    case 'TASK_DELETED':
    case 'COMMENT_DELETED':
    case 'SUBTASK_DELETED':
    case 'FILE_DELETED':
      return 'text-red-600';
    case 'TASK_STATUS_CHANGED':
      return 'text-blue-600';
    case 'TASK_PRIORITY_CHANGED':
      return 'text-orange-600';
    case 'COMMENT_ADDED':
      return 'text-purple-600';
    case 'SUBTASK_ADDED':
    case 'SUBTASK_COMPLETED':
      return 'text-green-600';
    case 'FILE_UPLOADED':
      return 'text-indigo-600';
    default:
      return 'text-gray-600';
  }
};

// ==================== EXPORT ALL ====================

export default {
  // Queries
  useTaskActivities,
  useRecentActivities,
  useActivityStats,
  // Mutations
  useLogActivity,
  // Helpers
  getActivityIcon,
  getActivityColor,
};
