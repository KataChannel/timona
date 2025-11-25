import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { TaskMedia, MediaType } from '@/types/todo';
import { UPLOAD_TASK_MEDIA } from '@/graphql/taskQueries';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: MediaType;
  size: number;
  mimeType: string;
  preview?: string;
}

interface UseMediaUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (media: TaskMedia[]) => void;
  onUploadError?: (error: string) => void;
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const {
    maxFiles = 10,
    maxFileSize = 50,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
  } = options;

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [uploadMediaMutation] = useMutation(UPLOAD_TASK_MEDIA);

  const addMediaFiles = useCallback((newFiles: MediaFile[]) => {
    setMediaFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > maxFiles) {
        toast.error(`Chỉ có thể upload tối đa ${maxFiles} file`);
        return prev.slice(0, maxFiles);
      }
      return combined;
    });
  }, [maxFiles]);

  const removeMediaFile = useCallback((fileId: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        // Cleanup object URL to prevent memory leaks
        URL.revokeObjectURL(file.url);
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const clearMediaFiles = useCallback(() => {
    // Cleanup all object URLs
    setMediaFiles(prev => {
      prev.forEach(file => {
        URL.revokeObjectURL(file.url);
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      return [];
    });
  }, []);

  const uploadMedia = useCallback(async (taskId: string): Promise<TaskMedia[]> => {
    if (mediaFiles.length === 0) {
      return [];
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedMedia: TaskMedia[] = [];
      const totalFiles = mediaFiles.length;

      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i];

        try {
          // Update progress
          const progressStep = (i + 1) / totalFiles * 100;
          setUploadProgress(progressStep);
          onUploadProgress?.(progressStep);

          // In a real implementation, you would upload the file to a storage service first
          // For now, we'll create a temporary URL
          const tempUrl = `temp://media/${Date.now()}-${mediaFile.file.name}`;

          // Call the GraphQL mutation
          const result = await uploadMediaMutation({
            variables: {
              input: {
                taskId,
                filename: mediaFile.file.name,
                mimeType: mediaFile.mimeType,
                size: mediaFile.size,
                type: mediaFile.type,
                url: tempUrl,
              },
            },
          });

          if (result.data?.uploadTaskMedia) {
            uploadedMedia.push(result.data.uploadTaskMedia);
          }

        } catch (error) {
          const errorMessage = `Lỗi upload file ${mediaFile.file.name}: ${error}`;
          toast.error(errorMessage);
          onUploadError?.(errorMessage);
          console.error('Upload error:', error);
        }
      }

      // Cleanup after successful upload
      clearMediaFiles();
      onUploadComplete?.(uploadedMedia);
      
      if (uploadedMedia.length > 0) {
        toast.success(`Đã upload thành công ${uploadedMedia.length} file`);
      }

      return uploadedMedia;

    } catch (error) {
      const errorMessage = `Lỗi upload media: ${error}`;
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [mediaFiles, onUploadProgress, onUploadComplete, onUploadError, clearMediaFiles]);

  return {
    mediaFiles,
    uploading,
    uploadProgress,
    addMediaFiles,
    removeMediaFile,
    clearMediaFiles,
    uploadMedia,
  };
};

// Simulate upload function - replace with actual API call
const simulateUpload = async (mediaFile: MediaFile, taskId: string): Promise<TaskMedia> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simulate upload response
  return {
    id: `media-${Date.now()}-${Math.random()}`,
    filename: mediaFile.file.name,
    fileUrl: mediaFile.url, // In real implementation, this would be the server URL
    fileSize: mediaFile.size,
    mimeType: mediaFile.mimeType,
    taskId,
    uploadedById: 'current-user-id', // Replace with actual user ID
    uploadedBy: {
      id: 'current-user-id',
      username: 'current-user',
      firstName: 'Current',
      lastName: 'User',
    },
    createdAt: new Date().toISOString(),
  };
};

// Hook for managing media in existing tasks
export const useTaskMedia = (initialMedia: TaskMedia[] = []) => {
  const [media, setMedia] = useState<TaskMedia[]>(initialMedia);
  const [loading, setLoading] = useState(false);

  const addMedia = useCallback((newMedia: TaskMedia | TaskMedia[]) => {
    const mediaArray = Array.isArray(newMedia) ? newMedia : [newMedia];
    setMedia(prev => [...prev, ...mediaArray]);
  }, []);

  const removeMedia = useCallback(async (mediaId: string) => {
    setLoading(true);
    try {
      // Here you would make API call to delete media
      await simulateDeleteMedia(mediaId);
      
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      toast.success('Đã xóa file thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa file');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMediaCaption = useCallback(async (mediaId: string, caption: string) => {
    setLoading(true);
    try {
      // Here you would make API call to update media
      await simulateUpdateMedia(mediaId, { caption });
      
      setMedia(prev => prev.map(m => 
        m.id === mediaId ? { ...m, caption } : m
      ));
      toast.success('Đã cập nhật caption');
    } catch (error) {
      toast.error('Lỗi khi cập nhật caption');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    media,
    loading,
    addMedia,
    removeMedia,
    updateMediaCaption,
    setMedia,
  };
};

// Simulate API calls - replace with actual implementations
const simulateDeleteMedia = async (mediaId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Simulate success
};

const simulateUpdateMedia = async (mediaId: string, updates: Partial<TaskMedia>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Simulate success
};
