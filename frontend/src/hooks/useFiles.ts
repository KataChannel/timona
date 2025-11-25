import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  GET_FILES,
  GET_FILE,
  GET_FOLDERS,
  GET_FOLDER,
  GET_STORAGE_STATS,
  UPDATE_FILE,
  DELETE_FILE,
  MOVE_FILES,
  BULK_DELETE_FILES,
  BULK_UPDATE_FILES,
  CREATE_FOLDER,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  CREATE_FILE_SHARE,
} from '@/graphql/queries/files';
import { getFileUploadUrl, getBulkFileUploadUrl } from '@/lib/api-config';
import {
  File,
  FileFolder,
  GetFilesInput,
  UpdateFileInput,
  CreateFolderInput,
  UpdateFolderInput,
  MoveFilesInput,
  BulkDeleteFilesInput,
  BulkUpdateFilesInput,
  CreateFileShareInput,
  PaginatedFiles,
  FileStorageStats,
  UploadResponse,
  BulkUploadResponse,
} from '@/types/file';

/**
 * Hook to get files with pagination and filters
 */
export function useFiles(input?: GetFilesInput) {
  const { data, loading, error, refetch } = useQuery(GET_FILES, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
  });

  return {
    files: data?.files as PaginatedFiles | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get single file
 */
export function useFile(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_FILE, {
    variables: { id },
    skip: !id,
  });

  return {
    file: data?.file as File | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get all folders
 */
export function useFolders() {
  const { data, loading, error, refetch } = useQuery(GET_FOLDERS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    folders: (data?.folders as FileFolder[]) || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get single folder
 */
export function useFolder(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_FOLDER, {
    variables: { id },
    skip: !id,
  });

  return {
    folder: data?.folder as FileFolder | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to get storage statistics
 */
export function useStorageStats() {
  const { data, loading, error, refetch } = useQuery(GET_STORAGE_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.fileStorageStats as FileStorageStats | undefined,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to upload files using REST API
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    file: File,
    folderId?: string,
    metadata?: any,
  ): Promise<UploadResponse> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file as any);
      if (folderId) formData.append('folderId', folderId);
      if (metadata) formData.append('metadata', JSON.stringify(metadata));

      const uploadUrl = getFileUploadUrl();
      console.log('📤 Single file upload to:', uploadUrl); // Debug log
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setProgress(100);
      return result;
    } catch (error: any) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadFiles = async (
    files: File[],
    folderId?: string,
  ): Promise<BulkUploadResponse> => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file as any));
      if (folderId) formData.append('folderId', folderId);

      const uploadUrl = getBulkFileUploadUrl();
      console.log('📤 Bulk file upload to:', uploadUrl); // Debug log
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setProgress(100);
      return result;
    } catch (error: any) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadFiles,
    uploading,
    progress,
  };
}

/**
 * Hook to update file
 */
export function useUpdateFile() {
  const [updateFile, { loading, error }] = useMutation(UPDATE_FILE);

  return {
    updateFile: async (input: UpdateFileInput) => {
      const result = await updateFile({ variables: { input } });
      return result.data?.updateFile as File;
    },
    loading,
    error,
  };
}

/**
 * Hook to delete file
 */
export function useDeleteFile() {
  const [deleteFile, { loading, error }] = useMutation(DELETE_FILE, {
    refetchQueries: [{ query: GET_FILES }],
  });

  return {
    deleteFile: async (id: string) => {
      const result = await deleteFile({ variables: { id } });
      return result.data?.deleteFile as boolean;
    },
    loading,
    error,
  };
}

/**
 * Hook to move files
 */
export function useMoveFiles() {
  const [moveFiles, { loading, error }] = useMutation(MOVE_FILES, {
    refetchQueries: [{ query: GET_FILES }],
  });

  return {
    moveFiles: async (input: MoveFilesInput) => {
      const result = await moveFiles({ variables: { input } });
      return result.data?.moveFiles as File[];
    },
    loading,
    error,
  };
}

/**
 * Hook to bulk delete files
 */
export function useBulkDeleteFiles() {
  const [bulkDeleteFiles, { loading, error }] = useMutation(BULK_DELETE_FILES, {
    refetchQueries: [{ query: GET_FILES }],
  });

  return {
    bulkDeleteFiles: async (input: BulkDeleteFilesInput) => {
      const result = await bulkDeleteFiles({ variables: { input } });
      return result.data?.bulkDeleteFiles as number;
    },
    loading,
    error,
  };
}

/**
 * Hook to bulk update files
 */
export function useBulkUpdateFiles() {
  const [bulkUpdateFiles, { loading, error }] = useMutation(BULK_UPDATE_FILES, {
    refetchQueries: [{ query: GET_FILES }],
  });

  return {
    bulkUpdateFiles: async (input: BulkUpdateFilesInput) => {
      const result = await bulkUpdateFiles({ variables: { input } });
      return result.data?.bulkUpdateFiles as File[];
    },
    loading,
    error,
  };
}

/**
 * Hook to create folder
 */
export function useCreateFolder() {
  const [createFolder, { loading, error }] = useMutation(CREATE_FOLDER, {
    refetchQueries: [{ query: GET_FOLDERS }],
  });

  return {
    createFolder: async (input: CreateFolderInput) => {
      const result = await createFolder({ variables: { input } });
      return result.data?.createFolder as FileFolder;
    },
    loading,
    error,
  };
}

/**
 * Hook to update folder
 */
export function useUpdateFolder() {
  const [updateFolder, { loading, error }] = useMutation(UPDATE_FOLDER, {
    refetchQueries: [{ query: GET_FOLDERS }],
  });

  return {
    updateFolder: async (input: UpdateFolderInput) => {
      const result = await updateFolder({ variables: { input } });
      return result.data?.updateFolder as FileFolder;
    },
    loading,
    error,
  };
}

/**
 * Hook to delete folder
 */
export function useDeleteFolder() {
  const [deleteFolder, { loading, error }] = useMutation(DELETE_FOLDER, {
    refetchQueries: [{ query: GET_FOLDERS }],
  });

  return {
    deleteFolder: async (id: string) => {
      const result = await deleteFolder({ variables: { id } });
      return result.data?.deleteFolder as boolean;
    },
    loading,
    error,
  };
}

/**
 * Hook to create file share
 */
export function useCreateFileShare() {
  const [createFileShare, { loading, error }] = useMutation(CREATE_FILE_SHARE);

  return {
    createFileShare: async (input: CreateFileShareInput) => {
      const result = await createFileShare({ variables: { input } });
      return result.data?.createFileShare;
    },
    loading,
    error,
  };
}
