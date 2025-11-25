'use client';

import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_TASK_COMMENT,
  UPDATE_TASK_COMMENT,
  DELETE_TASK_COMMENT,
  GET_TASK_WITH_DETAILS,
  UPLOAD_TASK_MEDIA,
  DELETE_TASK_MEDIA,
} from '../graphql/taskQueries';
import { TaskComment, TaskMedia, Task } from '../types/todo';

// Combined hook for task with details (includes comments and media)
export const useTaskWithDetails = (taskId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_TASK_WITH_DETAILS, {
    variables: { id: taskId },
    skip: !taskId,
  });

  return {
    task: data?.getTask as Task,
    comments: (data?.getTask?.comments || []) as TaskComment[],
    media: (data?.getTask?.media || []) as TaskMedia[],
    loading,
    error,
    refetch,
  };
};

// Comment hooks (using the main task query for data)
export const useTaskComments = (taskId: string) => {
  const { task, loading, error, refetch } = useTaskWithDetails(taskId);

  return {
    comments: (task?.comments || []) as TaskComment[],
    loading,
    error,
    refetch,
  };
};

export const useCreateComment = () => {
  const [createComment, { loading, error }] = useMutation(CREATE_TASK_COMMENT, {
    refetchQueries: [GET_TASK_WITH_DETAILS],
  });

  const handleCreateComment = async (taskId: string, content: string, parentId?: string) => {
    try {
      const result = await createComment({
        variables: {
          input: {
            taskId,
            content,
            parentId,
          },
        },
      });
      return result.data?.createTaskComment;
    } catch (err) {
      throw err;
    }
  };

  return {
    createComment: handleCreateComment,
    loading,
    error,
  };
};

export const useUpdateComment = () => {
  const [updateComment, { loading, error }] = useMutation(UPDATE_TASK_COMMENT, {
    refetchQueries: [GET_TASK_WITH_DETAILS],
  });

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const result = await updateComment({
        variables: {
          id: commentId,
          input: {
            content,
          },
        },
      });
      return result.data?.updateTaskComment;
    } catch (err) {
      throw err;
    }
  };

  return {
    updateComment: handleUpdateComment,
    loading,
    error,
  };
};

export const useDeleteComment = () => {
  const [deleteComment, { loading, error }] = useMutation(DELETE_TASK_COMMENT, {
    refetchQueries: [GET_TASK_WITH_DETAILS],
  });

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment({
        variables: {
          id: commentId,
        },
      });
      return result.data?.deleteTaskComment;
    } catch (err) {
      throw err;
    }
  };

  return {
    deleteComment: handleDeleteComment,
    loading,
    error,
  };
};

// Media hooks (using the main task query for data)
export const useTaskMedia = (taskId: string) => {
  const { task, loading, error, refetch } = useTaskWithDetails(taskId);

  return {
    media: (task?.media || []) as TaskMedia[],
    loading,
    error,
    refetch,
  };
};

// Media upload/delete hooks with real GraphQL mutations
export const useUploadMedia = () => {
  const [uploadMedia, { loading, error }] = useMutation(UPLOAD_TASK_MEDIA, {
    refetchQueries: [GET_TASK_WITH_DETAILS],
  });

  const handleUploadMedia = async (taskId: string, mediaData: any) => {
    try {
      const result = await uploadMedia({
        variables: {
          input: {
            taskId,
            ...mediaData,
          },
        },
      });
      return result.data?.uploadTaskMedia;
    } catch (err) {
      throw err;
    }
  };

  return {
    uploadMedia: handleUploadMedia,
    loading,
    error,
  };
};

export const useDeleteMedia = () => {
  const [deleteMedia, { loading, error }] = useMutation(DELETE_TASK_MEDIA, {
    refetchQueries: [GET_TASK_WITH_DETAILS],
  });

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const result = await deleteMedia({
        variables: { mediaId },
      });
      return result.data?.deleteTaskMedia;
    } catch (err) {
      throw err;
    }
  };

  return {
    deleteMedia: handleDeleteMedia,
    loading,
    error,
  };
};
