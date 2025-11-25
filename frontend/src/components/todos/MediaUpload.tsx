import React, { useState, useRef, useCallback } from 'react';
import { MediaType } from '@/types/todo';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
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

interface MediaUploadProps {
  onMediaAdd: (media: MediaFile[]) => void;
  onMediaRemove: (mediaId: string) => void;
  existingMedia?: MediaFile[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaAdd,
  onMediaRemove,
  existingMedia = [],
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  acceptedTypes = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_DOCUMENT_TYPES],
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaType = (mimeType: string): MediaType => {
    if (ACCEPTED_IMAGE_TYPES.includes(mimeType)) return MediaType.IMAGE;
    if (ACCEPTED_VIDEO_TYPES.includes(mimeType)) return MediaType.VIDEO;
    return MediaType.DOCUMENT;
  };

  const generatePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (existingMedia.length + fileArray.length > maxFiles) {
      toast.error(`Chỉ có thể upload tối đa ${maxFiles} file`);
      return;
    }

    setUploading(true);
    const newMediaFiles: MediaFile[] = [];

    for (const file of fileArray) {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`File ${file.name} không được hỗ trợ`);
        continue;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn (tối đa ${maxFileSize}MB)`);
        continue;
      }

      try {
        const preview = await generatePreview(file);
        const mediaFile: MediaFile = {
          id: `temp-${Date.now()}-${Math.random()}`,
          file,
          url: URL.createObjectURL(file),
          type: getMediaType(file.type),
          size: file.size,
          mimeType: file.type,
          preview,
        };
        newMediaFiles.push(mediaFile);
      } catch (error) {
        toast.error(`Lỗi xử lý file ${file.name}`);
      }
    }

    if (newMediaFiles.length > 0) {
      onMediaAdd(newMediaFiles);
      toast.success(`Đã thêm ${newMediaFiles.length} file`);
    }

    setUploading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    if (disabled) return;

    const items = event.clipboardData.items;
    const files: File[] = [];

    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      await processFiles(files);
    }
  }, [disabled, processFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <PhotoIcon className="h-8 w-8 text-blue-500" />;
      case MediaType.VIDEO:
        return <VideoCameraIcon className="h-8 w-8 text-purple-500" />;
      case MediaType.DOCUMENT:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          <div className="flex justify-center">
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              Kéo thả file vào đây hoặc{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-500 font-medium disabled:text-gray-400"
              >
                chọn file
              </button>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hỗ trợ hình ảnh, video và tài liệu. Tối đa {maxFileSize}MB mỗi file.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>Paste (Ctrl+V)</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span>Drag & Drop</span>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Đang xử lý...</p>
          </div>
        )}
      </div>

      {/* Media Preview */}
      {existingMedia.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            File đã chọn ({existingMedia.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingMedia.map((media) => (
              <div
                key={media.id}
                className="relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {media.type === MediaType.IMAGE && media.preview ? (
                      <img
                        src={media.preview}
                        alt={media.file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(media.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {media.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(media.size)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {media.type.toLowerCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onMediaRemove(media.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
