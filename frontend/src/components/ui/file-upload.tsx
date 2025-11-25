import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Image from 'next/image';
import { getApiBaseUrl } from '@/lib/api-config';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket?: string;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export function FileUpload({
  bucket = 'uploads',
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileToMinio = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    try {
      const uploadUrl = `${getApiBaseUrl()}/upload`;
      console.log('📤 File upload to:', uploadUrl); // Debug log
      
      const response = await axios.post(
        uploadUrl,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              
              setUploadProgress(prev =>
                prev.map(item =>
                  item.file === file ? { ...item, progress } : item
                )
              );
            }
          },
        }
      );

      return {
        filename: response.data.filename,
        url: response.data.url,
        mimetype: response.data.mimetype,
        size: file.size,
      };
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Upload failed'
      );
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled) return;

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          const errors = file.errors.map((e: any) => e.message).join(', ');
          toast.error(`${file.file.name}: ${errors}`);
        });
      }

      if (acceptedFiles.length === 0) return;

      // Check total files limit
      if (uploadProgress.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Initialize progress for new files
      const newProgress: UploadProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadProgress(prev => [...prev, ...newProgress]);

      // Upload files
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          const uploadedFile = await uploadFileToMinio(file);
          
          setUploadProgress(prev =>
            prev.map(item =>
              item.file === file
                ? { ...item, status: 'completed' as const, progress: 100, url: uploadedFile.url }
                : item
            )
          );

          return uploadedFile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          setUploadProgress(prev =>
            prev.map(item =>
              item.file === file
                ? { ...item, status: 'error' as const, error: errorMessage }
                : item
            )
          );

          toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
          onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
          
          return null;
        }
      });

      try {
        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter((result): result is UploadedFile => result !== null);
        
        if (successfulUploads.length > 0) {
          toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
          onUploadComplete?.(successfulUploads);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    },
    [bucket, disabled, maxFiles, uploadProgress.length, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadProgress([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <CloudArrowUpIcon className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive || dropzoneActive
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        
        {isDragActive || dropzoneActive ? (
          <div>
            <p className="mt-2 text-sm font-medium text-blue-600">
              Drop the files here...
            </p>
          </div>
        ) : (
          <div>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {disabled ? 'Upload disabled' : 'Click to upload or drag and drop'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF, PDF up to {formatFileSize(maxSize)} (max {maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Uploading {uploadProgress.length} file(s)
            </h4>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {uploadProgress.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {item.file.type.startsWith('image/') && item.url ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={item.url}
                        alt={item.file.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    getFileIcon(item.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {item.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}

                  {/* Success Message */}
                  {item.status === 'completed' && (
                    <p className="text-xs text-green-500 mt-1">Upload completed</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {uploadProgress.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {uploadProgress.filter(item => item.status === 'completed').length} of{' '}
          {uploadProgress.length} files uploaded successfully
        </div>
      )}
    </div>
  );
}
