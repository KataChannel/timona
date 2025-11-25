'use client';

import React, { useState, useRef } from 'react';
import { type TaskMedia, MediaType, User } from '../../types/todo';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface TaskMediaProps {
  taskId: string;
  media: TaskMedia[];
  currentUser?: User;
  onUploadMedia: (files: FileList) => Promise<void>;
  onDeleteMedia: (mediaId: string) => Promise<void>;
  className?: string;
}

interface MediaViewerProps {
  media: TaskMedia;
  isOpen: boolean;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a');
    link.href = media.fileUrl;
    link.download = media.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 text-white">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium">{media.filename}</h3>
            {media.fileSize && (
              <span className="text-sm text-gray-300">
                {(media.fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex items-center justify-center">
          {media.mimeType.startsWith('image/') && (
            <img
              src={media.fileUrl}
              alt={media.filename}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
          {media.mimeType.startsWith('video/') && (
            <video
              controls
              className="max-w-full max-h-[80vh] rounded-lg"
              src={media.fileUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
          {!media.mimeType.startsWith('image/') && !media.mimeType.startsWith('video/') && (
            <div className="bg-white p-8 rounded-lg text-center">
              <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{media.filename}</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tải xuống
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MediaGrid: React.FC<{ 
  media: TaskMedia[], 
  onView: (media: TaskMedia) => void,
  onDelete: (mediaId: string) => void,
  currentUser?: User 
}> = ({ media, onView, onDelete, currentUser }) => {
  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5" />;
    } else if (mimeType.startsWith('video/')) {
      return <VideoCameraIcon className="w-5 h-5" />;
    } else {
      return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PhotoIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Chưa có file đính kèm nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => (
        <div
          key={item.id}
          className="relative group bg-gray-50 border rounded-lg p-3 hover:shadow-md transition-shadow"
        >
          {/* Media Preview */}
          <div className="aspect-square mb-2 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {item.mimeType.startsWith('image/') ? (
              <img
                src={item.fileUrl}
                alt={item.filename}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => onView(item)}
              />
            ) : (
              <button
                onClick={() => onView(item)}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {getMediaIcon(item.mimeType)}
                <span className="text-xs mt-1">
                  {item.mimeType.split('/')[0]}
                </span>
              </button>
            )}
          </div>

          {/* File Info */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
              {item.filename}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(item.fileSize)}
            </p>
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <button
                onClick={() => onView(item)}
                className="p-1.5 bg-white shadow-sm rounded-md hover:bg-gray-50 transition-colors"
                title="Xem"
              >
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </button>
              {currentUser && item.uploadedBy.id === currentUser.id && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 bg-white shadow-sm rounded-md hover:bg-red-50 transition-colors"
                  title="Xóa"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TaskMediaComponent: React.FC<TaskMediaProps> = ({
  taskId,
  media,
  currentUser,
  onUploadMedia,
  onDeleteMedia,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<TaskMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      await onUploadMedia(files);
      toast.success(`Đã tải lên ${files.length} file thành công`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Có lỗi xảy ra khi tải file');
    } finally {
      setIsUploading(false);
      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    
    try {
      await onDeleteMedia(mediaId);
      toast.success('Đã xóa file thành công');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Có lỗi xảy ra khi xóa file');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <PhotoIcon className="w-5 h-5 mr-2" />
          File đính kèm ({media.length})
        </h3>
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tải...
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4 mr-2" />
              Thêm file
            </>
          )}
        </button>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Grid */}
      <MediaGrid
        media={media}
        onView={setViewingMedia}
        onDelete={handleDeleteMedia}
        currentUser={currentUser}
      />

      {/* Media Viewer Modal */}
      {viewingMedia && (
        <MediaViewer
          media={viewingMedia}
          isOpen={!!viewingMedia}
          onClose={() => setViewingMedia(null)}
        />
      )}
    </div>
  );
};

export default TaskMediaComponent;
