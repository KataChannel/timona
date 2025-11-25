import React, { useState } from 'react';
import { TaskMedia, MediaType } from '@/types/todo';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const getMediaTypeFromMime = (mimeType: string): MediaType => {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  return MediaType.DOCUMENT;
};

interface MediaViewerProps {
  media: TaskMedia[];
  onMediaRemove?: (mediaId: string) => void;
  editable?: boolean;
  compact?: boolean;
}

interface MediaModalProps {
  media: TaskMedia;
  isOpen: boolean;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ media, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.fileUrl;
    link.download = media.filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-full p-4">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center bg-black/50 rounded-lg p-2">
          <div className="text-white">
            <h3 className="font-medium">{media.filename}</h3>
                        <div className="text-sm text-gray-600">
              {formatFileSize(media.fileSize || media.size || 0)} • {(media.type || getMediaTypeFromMime(media.mimeType)).toLowerCase()}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-colors"
              title="Tải xuống"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-colors"
              title="Đóng"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg overflow-hidden max-h-[80vh] max-w-[80vw]">
          {(media.type || getMediaTypeFromMime(media.mimeType)) === MediaType.IMAGE ? (
            <img
              src={media.fileUrl || media.url}
              alt={media.filename}
              className="w-full h-full object-cover"
            />
          ) : (media.type || getMediaTypeFromMime(media.mimeType)) === MediaType.VIDEO ? (
            <video
              src={media.fileUrl || media.url}
              controls
              className="w-full h-full"
            />
          ) : (
            <div className="p-8 text-center">
              <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{media.filename}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {formatFileSize(media.fileSize || media.size || 0)} • {media.mimeType}
              </p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Tải xuống
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MediaViewer: React.FC<MediaViewerProps> = ({
  media,
  onMediaRemove,
  editable = false,
  compact = false,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<TaskMedia | null>(null);

  if (media.length === 0) {
    return null;
  }

  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <PhotoIcon className="h-5 w-5 text-blue-500" />;
      case MediaType.VIDEO:
        return <VideoCameraIcon className="h-5 w-5 text-purple-500" />;
      case MediaType.DOCUMENT:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const openModal = (mediaItem: TaskMedia) => {
    setSelectedMedia(mediaItem);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {media.slice(0, 3).map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="relative group cursor-pointer"
            onClick={() => openModal(mediaItem)}
          >
            {(mediaItem.type || getMediaTypeFromMime(mediaItem.mimeType)) === MediaType.IMAGE ? (
              <img
                src={mediaItem.fileUrl || mediaItem.url}
                alt={mediaItem.filename}
                className="h-12 w-12 object-cover rounded border border-gray-200 group-hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                {getFileIcon(mediaItem.type || getMediaTypeFromMime(mediaItem.mimeType))}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all flex items-center justify-center">
              <EyeIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
        
        {media.length > 3 && (
          <div className="h-12 w-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs font-medium text-gray-600">
            +{media.length - 3}
          </div>
        )}

        {selectedMedia && (
          <MediaModal
            media={selectedMedia}
            isOpen={!!selectedMedia}
            onClose={closeModal}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {media.map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
          >
            {/* Media Preview */}
            <div 
              className="cursor-pointer"
              onClick={() => openModal(mediaItem)}
            >
              {(mediaItem.type || getMediaTypeFromMime(mediaItem.mimeType)) === MediaType.IMAGE ? (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={mediaItem.fileUrl || mediaItem.url}
                    alt={mediaItem.filename}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                </div>
              ) : (mediaItem.type || getMediaTypeFromMime(mediaItem.mimeType)) === MediaType.VIDEO ? (
                <div className="aspect-video bg-gray-100 relative">
                  <video
                    src={mediaItem.fileUrl || mediaItem.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <VideoCameraIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <DocumentIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <ArrowsPointingOutIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {mediaItem.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(mediaItem.fileSize || mediaItem.size || 0)}
                  </p>
                  {mediaItem.caption && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      {mediaItem.caption}
                    </p>
                  )}
                </div>

                {editable && onMediaRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMediaRemove(mediaItem.id);
                    }}
                    className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          isOpen={!!selectedMedia}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
