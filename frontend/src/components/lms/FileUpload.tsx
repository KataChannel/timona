'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  type: 'image' | 'video' | 'document';
  uploadType: 'thumbnail' | 'video' | 'material'; // Type of upload for endpoint
  courseId?: string; // Course ID for authorization
  onUploadComplete: (url: string, fileData: any) => void;
  onError?: (error: string) => void;
  accept?: string; // File accept types
  maxSize?: number; // Max file size in bytes
  label?: string;
  previewUrl?: string; // Existing file URL for preview
  className?: string;
}

// Helper functions to get mutation details based on upload type
const getUploadMutation = (uploadType: string): string => {
  const mutations = {
    thumbnail: `
      mutation UploadCourseThumbnail($file: Upload!, $courseId: String) {
        uploadCourseThumbnail(file: $file, courseId: $courseId) {
          id url filename mimetype size bucket
        }
      }
    `,
    video: `
      mutation UploadLessonVideo($file: Upload!, $courseId: String!) {
        uploadLessonVideo(file: $file, courseId: $courseId) {
          id url filename mimetype size bucket
        }
      }
    `,
    material: `
      mutation UploadCourseMaterial($file: Upload!, $courseId: String!) {
        uploadCourseMaterial(file: $file, courseId: $courseId) {
          id url filename mimetype size bucket
        }
      }
    `,
  };
  return mutations[uploadType as keyof typeof mutations] || mutations.thumbnail;
};

const getUploadMutationName = (uploadType: string): string => {
  const names = {
    thumbnail: 'uploadCourseThumbnail',
    video: 'uploadLessonVideo',
    material: 'uploadCourseMaterial',
  };
  return names[uploadType as keyof typeof names] || 'uploadCourseThumbnail';
};

export default function FileUpload({
  type,
  uploadType,
  courseId,
  onUploadComplete,
  onError,
  accept,
  maxSize,
  label,
  previewUrl,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default accept types based on file type
  const defaultAccept = {
    image: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
    video: 'video/mp4,video/webm,video/ogg,video/quicktime',
    document: 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  };

  // Default max sizes
  const defaultMaxSize = {
    image: 5 * 1024 * 1024, // 5MB
    video: 500 * 1024 * 1024, // 500MB
    document: 10 * 1024 * 1024, // 10MB
  };

  const acceptTypes = accept || defaultAccept[type];
  const maxFileSize = maxSize || defaultMaxSize[type];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      return `File size exceeds maximum of ${maxSizeMB}MB`;
    }

    // Check file type
    const acceptedTypes = acceptTypes.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    const isValidType = acceptedTypes.some(
      acceptedType =>
        fileType === acceptedType ||
        fileExtension === acceptedType ||
        acceptedType.endsWith('/*') && fileType.startsWith(acceptedType.replace('/*', ''))
    );

    if (!isValidType) {
      return `Invalid file type. Accepted: ${acceptTypes}`;
    }

    return null;
  };

  const handleFile = useCallback(async (selectedFile: File) => {
    // Validate file
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStatus('error');
      onError?.(validationError);
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setUploadStatus('uploading');

    // Generate preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (type === 'video') {
      // Create video preview URL
      const videoUrl = URL.createObjectURL(selectedFile);
      setPreview(videoUrl);
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Build GraphQL multipart request
      const operations = {
        query: getUploadMutation(uploadType),
        variables: {
          file: null,
          ...(courseId && { courseId }),
        },
      };

      const map = {
        '0': ['variables.file'],
      };

      formData.append('operations', JSON.stringify(operations));
      formData.append('map', JSON.stringify(map));
      formData.append('0', selectedFile);

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      // Upload with XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const result = response.data[getUploadMutationName(uploadType)];
            
            setUploadStatus('success');
            onUploadComplete(result.url, result);

            setTimeout(() => {
              setUploadProgress(0);
            }, 2000);
          } catch (err) {
            setUploadStatus('error');
            const errorMsg = 'Failed to parse upload response';
            setErrorMessage(errorMsg);
            onError?.(errorMsg);
          }
        } else {
          setUploadStatus('error');
          const errorMsg = `Upload failed with status ${xhr.status}`;
          setErrorMessage(errorMsg);
          onError?.(errorMsg);
        }
      });

      xhr.addEventListener('error', () => {
        setUploadStatus('error');
        const errorMsg = 'Network error during upload';
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
      });

      let graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:14000/graphql';
      
      // If current page is HTTPS but endpoint is HTTP, upgrade to HTTPS
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && graphqlEndpoint.startsWith('http://')) {
        graphqlEndpoint = graphqlEndpoint.replace('http://', 'https://');
      }
      xhr.open('POST', graphqlEndpoint);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    } catch (error: any) {
      setUploadProgress(0);
      setUploadStatus('error');
      const errorMsg = error.message || 'Upload failed';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    }
  }, [type, uploadType, courseId, onUploadComplete, onError, acceptTypes, maxFileSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(previewUrl || null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {preview && (type === 'image' || type === 'video') && uploadStatus !== 'uploading' ? (
          <div className="relative">
            {type === 'image' && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            {type === 'video' && (
              <video
                src={preview}
                controls
                className="w-full h-48 rounded-lg"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center cursor-pointer">
            {getStatusIcon()}
            
            <p className="mt-2 text-sm text-gray-600">
              {uploadStatus === 'uploading'
                ? `Uploading... ${uploadProgress}%`
                : uploadStatus === 'success'
                ? 'Upload successful!'
                : isDragging
                ? 'Drop file here'
                : 'Drag and drop or click to select'}
            </p>

            {file && uploadStatus !== 'success' && (
              <p className="text-xs text-gray-500 mt-1">{file.name}</p>
            )}

            {uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
              <p className="text-xs text-gray-400 mt-2">
                Max size: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            )}

            {uploadProgress > 0 && uploadStatus === 'uploading' && (
              <div className="w-full max-w-xs mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
