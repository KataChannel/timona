/**
 * ============================================================================
 * TASK COMMENTS HOOKS - MVP 3 DYNAMIC GRAPHQL
 * ============================================================================
 * 
 * Real-time comments system using Dynamic GraphQL
 * Features:
 * - Create, read, update, delete comments
 * - Threaded replies support
 * - @Mention users
 * - Real-time updates (prepared)
 * 
 * @author Senior Full-Stack Engineer  
 * @version 3.0.0 - MVP 3
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

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  userId: string;
  parentId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  parent?: TaskComment;
  replies?: TaskComment[];
  _count?: {
    replies: number;
  };
}

export interface CreateCommentInput {
  content: string;
  taskId: string;
  parentId?: string; // For threaded replies
}

export interface UpdateCommentInput {
  content: string;
}

// ==================== QUERY HOOKS ====================

/**
 * Hook: Get all comments for a task (with threaded structure)
 * 
 * @example
 * const { data: comments, loading, refetch } = useTaskComments(taskId);
 */
export const useTaskComments = (taskId: string | null) => {
  const where = useMemo(() => {
    if (!taskId) return undefined;
    
    return {
      taskId: { equals: taskId },
      parentId: { equals: null }, // Only top-level comments
    };
  }, [taskId]);

  const { data, loading, error, refetch } = useFindMany<TaskComment>('taskComment', {
    where,
    orderBy: { createdAt: 'asc' }, // Oldest first (like chat)
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
      replies: {
        orderBy: { createdAt: 'asc' },
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
              replies: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
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
 * Hook: Get single comment with all replies
 * 
 * @example
 * const { data: comment } = useComment(commentId);
 */
export const useComment = (commentId: string | null) => {
  const { data, loading, error, refetch } = useFindUnique<TaskComment>(
    'taskComment',
    commentId || '',
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
        replies: {
          orderBy: { createdAt: 'asc' },
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
      },
    },
    { skip: !commentId }
  );

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook: Get comment count for a task
 * 
 * @example
 * const { count } = useCommentCount(taskId);
 */
export const useCommentCount = (taskId: string | null) => {
  const { data, loading, error, refetch } = useFindMany<TaskComment>('taskComment', {
    where: {
      taskId: { equals: taskId },
    },
    select: {
      id: true,
    },
  }, {
    skip: !taskId,
  });

  return {
    count: data?.length || 0,
    loading,
    error,
    refetch,
  };
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Create new comment
 * 
 * @example
 * const [createComment, { loading }] = useCreateComment();
 * await createComment({
 *   variables: {
 *     input: {
 *       content: "Great work!",
 *       taskId: "task-uuid"
 *     }
 *   }
 * });
 */
export const useCreateComment = () => {
  const [createOne, { data, loading, error }] = useCreateOne<TaskComment>('taskComment');

  const createComment = async (options: { variables: { input: CreateCommentInput } }) => {
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
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return { data: { createComment: result } };
  };

  return [createComment, { loading, error }] as const;
};

/**
 * Hook: Update comment content
 * 
 * @example
 * const [updateComment] = useUpdateComment();
 * await updateComment({
 *   variables: {
 *     id: "comment-uuid",
 *     input: { content: "Updated content" }
 *   }
 * });
 */
export const useUpdateComment = () => {
  const [updateOne, { data, loading, error }] = useUpdateOne<TaskComment>('taskComment');

  const updateComment = async (options: {
    variables: {
      id: string;
      input: UpdateCommentInput;
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
      },
    });

    return { data: { updateComment: result } };
  };

  return [updateComment, { loading, error }] as const;
};

/**
 * Hook: Delete comment
 * 
 * @example
 * const [deleteComment] = useDeleteComment();
 * await deleteComment({ variables: { id: "comment-uuid" } });
 */
export const useDeleteComment = () => {
  const [deleteOne, { data, loading, error }] = useDeleteOne<TaskComment>('taskComment');

  const deleteComment = async (options: { variables: { id: string } }) => {
    const result = await deleteOne({
      where: options.variables.id,
      select: {
        id: true,
      },
    });

    return { data: { deleteComment: result } };
  };

  return [deleteComment, { loading, error }] as const;
};

// ==================== EXPORT ALL ====================

export default {
  // Queries
  useTaskComments,
  useComment,
  useCommentCount,
  // Mutations
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
};
