'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  taskId?: string;
  projectId?: string;
  onUploadComplete?: (fileUrl: string, filename: string) => void;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedUrl?: string;
}

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_FORMATS = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'];

export function FileUploadZone({
  taskId,
  projectId,
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      toast({
        title: 'File too large',
        description: `File size exceeds ${maxFileSize / 1024 / 1024}MB limit`,
        type: 'error',
      });
      return false;
    }

    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    const isAccepted = acceptedFormats.some((format) => {
      if (format.includes('*')) {
        const [type] = format.split('/*');
        return fileType.startsWith(type);
      }
      return fileName.endsWith(format);
    });

    if (!isAccepted) {
      toast({
        title: 'Invalid file type',
        description: 'File type not supported',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' } : f))
    );

    try {
      const formData = new FormData();
      formData.append('file', file.file);

      if (taskId) formData.append('taskId', taskId);
      if (projectId) formData.append('projectId', projectId);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: percentComplete } : f
            )
          );
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const uploadedUrl = response.url || response.fileUrl;

          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    uploadedUrl,
                  }
                : f
            )
          );

          if (onUploadComplete) {
            onUploadComplete(uploadedUrl, file.file.name);
          }

          toast({
            title: 'Upload successful',
            description: `${file.file.name} uploaded successfully`,
            type: 'success',
          });
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error',
                  error: 'Upload failed',
                }
              : f
          )
        );

        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.file.name}`,
          type: 'error',
        });
      });

      // Start upload
      const endpoint = taskId
        ? `/api/project/upload/task/${taskId}`
        : projectId
        ? `/api/project/upload/project/${projectId}`
        : '/api/project/upload';

      xhr.open('POST', endpoint);
      xhr.send(formData);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      if (validateFile(file)) {
        const uploadFile: UploadFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: 'pending',
        };

        setFiles((prev) => [...prev, uploadFile]);
        uploadFile_(uploadFile);
      }
    });
  };

  const uploadFile_ = async (file: UploadFile) => {
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryUpload = (file: UploadFile) => {
    uploadFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />

        <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p className="font-medium text-gray-700 mb-1">
          Drag and drop files here
        </p>
        <p className="text-sm text-gray-500 mb-3">
          or click to select files
        </p>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
        >
          Choose Files
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          Max size: {maxFileSize / 1024 / 1024}MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {files.length} file(s)
          </p>

          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <File className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </p>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-1.5" />
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(file.progress)}%
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-2 flex items-center gap-2">
                      {file.status === 'pending' && (
                        <span className="text-xs text-gray-500">Pending...</span>
                      )}
                      {file.status === 'uploading' && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading...
                        </span>
                      )}
                      {file.status === 'completed' && (
                        <span className="text-xs text-green-600">✓ Uploaded</span>
                      )}
                      {file.status === 'error' && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-600">
                            {file.error}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 px-2 text-xs"
                            onClick={() => retryUpload(file)}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
