'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploadResult {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  bucket: string;
}

interface SourceDocumentFileUploadProps {
  documentType: 'FILE' | 'AUDIO' | 'IMAGE';
  onUploadComplete: (result: FileUploadResult) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number; // in MB
  accept?: string;
}

export default function SourceDocumentFileUpload({
  documentType,
  onUploadComplete,
  onUploadError,
  maxSize = 100, // 100MB default
  accept,
}: SourceDocumentFileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Get accept attribute based on document type
  const getAcceptAttribute = useCallback(() => {
    if (accept) return accept;
    
    switch (documentType) {
      case 'FILE':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip';
      case 'AUDIO':
        return '.mp3,.wav,.ogg,.m4a,.flac';
      case 'IMAGE':
        return '.jpg,.jpeg,.png,.gif,.webp,.svg';
      default:
        return '*';
    }
  }, [documentType, accept]);

  // Get file type label
  const getFileTypeLabel = useCallback(() => {
    switch (documentType) {
      case 'FILE':
        return 'PDF, DOC, XLS, PPT...';
      case 'AUDIO':
        return 'MP3, WAV, OGG...';
      case 'IMAGE':
        return 'JPG, PNG, GIF...';
      default:
        return 'File';
    }
  }, [documentType]);

  // Validate file
  const validateFile = (file: File): boolean => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      toast({
        type: 'error',
        title: 'File quá lớn',
        description: `Kích thước file không được vượt quá ${maxSize}MB`,
      });
      return false;
    }
    
    return true;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    
    setSelectedFile(file);
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use FormData with fetch for file upload (apollo-upload-client has compatibility issues)
      const formData = new FormData();
      formData.append('operations', JSON.stringify({
        query: `
          mutation UploadFile($file: Upload!, $bucket: String!) {
            uploadFile(file: $file, bucket: $bucket) {
              id
              url
              filename
              mimetype
              size
              bucket
            }
          }
        `,
        variables: {
          file: null,
          bucket: 'source-documents',
        },
      }));
      formData.append('map', JSON.stringify({
        '0': ['variables.file'],
      }));
      formData.append('0', selectedFile);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:13001/graphql', {
        method: 'POST',
        headers: {
          ...(token && { authorization: `Bearer ${token}` }),
          'apollo-require-preflight': 'true',
        },
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Upload failed');
      }

      const uploadedFile = result.data.uploadFile;
      
      setUploadStatus('success');
      setUploadProgress(100);
      
      toast({
        type: 'success',
        title: 'Upload thành công',
        description: `File "${selectedFile.name}" đã được upload`,
      });

      onUploadComplete(uploadedFile);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    } catch (error: any) {
      setUploadStatus('error');
      
      const errorMessage = error?.message || 'Không thể upload file';
      toast({
        type: 'error',
        title: 'Lỗi upload',
        description: errorMessage,
      });

      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 sm:p-8 
            text-center transition-colors cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`
            w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4
            ${isDragging ? 'text-blue-500' : 'text-gray-400'}
          `} />
          
          <p className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Kéo thả file hoặc click để chọn
          </p>
          
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            Hỗ trợ: {getFileTypeLabel()}
          </p>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Chọn file
          </Button>
          
          <p className="text-xs text-gray-400 mt-2 sm:mt-3">
            Tối đa {maxSize}MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptAttribute()}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <File className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {uploadStatus !== 'uploading' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                Đang upload... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Success Status */}
          {uploadStatus === 'success' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Upload thành công!</span>
            </div>
          )}

          {/* Error Status */}
          {uploadStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Upload thất bại</span>
            </div>
          )}

          {/* Upload Button */}
          {uploadStatus === 'idle' && (
            <Button
              type="button"
              onClick={handleUpload}
              className="w-full text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload lên Cloud Storage
            </Button>
          )}

          {/* Retry Button */}
          {uploadStatus === 'error' && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                variant="outline"
                className="flex-1 text-sm"
              >
                Thử lại
              </Button>
              <Button
                type="button"
                onClick={handleRemoveFile}
                variant="outline"
                className="flex-1 text-sm"
              >
                Chọn file khác
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
