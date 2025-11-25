import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_PROJECT_TASKS, GET_TASK, GET_MY_TASKS } from '@/graphql/task/queries';
import {
  CREATE_PROJECT_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  UPDATE_TASK_ORDER,
  ASSIGN_TASK,
  UPDATE_TASK_STATUS,
} from '@/graphql/task/mutations';

// ==================== QUERY HOOKS ====================

/**
 * Hook: Lấy tasks của project
 */
export const useProjectTasks = (projectId: string | null, filters?: any) => {
  return useQuery(GET_PROJECT_TASKS, {
    variables: { projectId, filters },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });
};

/**
 * Hook: Lấy chi tiết task
 */
export const useTask = (taskId: string | null) => {
  return useQuery(GET_TASK, {
    variables: { id: taskId },
    skip: !taskId,
  });
};

/**
 * Hook: Lấy personal tasks
 */
export const useMyTasks = (filters?: any) => {
  return useQuery(GET_MY_TASKS, {
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Hook: Tạo task trong project
 */
export const useCreateProjectTask = (projectId: string) => {
  const client = useApolloClient();

  return useMutation(CREATE_PROJECT_TASK, {
    update(cache, { data }) {
      // Update cache
      try {
        const existing: any = cache.readQuery({
          query: GET_PROJECT_TASKS,
          variables: { projectId },
        });

        if (existing?.projectTasks) {
          cache.writeQuery({
            query: GET_PROJECT_TASKS,
            variables: { projectId },
            data: {
              projectTasks: [data.createProjectTask, ...existing.projectTasks],
            },
          });
        }
      } catch (e) {
        // Cache might not exist yet
      }
    },
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_TASKS] });
    },
  });
};

/**
 * Hook: Update task
 */
export const useUpdateTask = () => {
  return useMutation(UPDATE_TASK, {
    refetchQueries: [GET_PROJECT_TASKS, GET_TASK],
  });
};

/**
 * Hook: Delete task
 */
export const useDeleteTask = (projectId: string) => {
  const client = useApolloClient();

  return useMutation(DELETE_TASK, {
    update(cache, { data }, { variables }) {
      // Remove from cache
      try {
        const existing: any = cache.readQuery({
          query: GET_PROJECT_TASKS,
          variables: { projectId },
        });

        if (existing?.projectTasks) {
          cache.writeQuery({
            query: GET_PROJECT_TASKS,
            variables: { projectId },
            data: {
              projectTasks: existing.projectTasks.filter(
                (t: any) => t.id !== variables?.id
              ),
            },
          });
        }
      } catch (e) {
        // Ignore cache errors
      }
    },
    onCompleted: () => {
      client.refetchQueries({ include: [GET_PROJECT_TASKS] });
    },
  });
};

/**
 * Hook: Update task order (drag & drop)
 */
export const useUpdateTaskOrder = () => {
  return useMutation(UPDATE_TASK_ORDER, {
    // Optimistic update
    optimisticResponse: (vars) => ({
      updateTaskOrder: {
        id: vars.taskId,
        order: vars.newOrder,
        __typename: 'Task',
      },
    }),
  });
};

/**
 * Hook: Assign task
 */
export const useAssignTask = () => {
  return useMutation(ASSIGN_TASK, {
    refetchQueries: [GET_TASK],
  });
};

/**
 * Hook: Update task status
 */
export const useUpdateTaskStatus = () => {
  return useMutation(UPDATE_TASK_STATUS, {
    // Optimistic update
    optimisticResponse: (vars) => ({
      updateTask: {
        id: vars.input.id,
        status: vars.input.status,
        completedAt: vars.input.status === 'COMPLETED' ? new Date().toISOString() : null,
        __typename: 'Task',
      },
    }),
  });
};
