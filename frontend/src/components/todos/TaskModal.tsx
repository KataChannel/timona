'use client';

import React, { useState } from 'react';
import { Task, User } from '../../types/todo';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import TaskComments from './TaskComments';
import TaskMediaComponent from './TaskMedia';
import {
  useTaskWithDetails,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useUploadMedia,
  useDeleteMedia,
} from '../../hooks/useTaskFeatures';
import { toast } from 'sonner';

interface TaskModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onUpdateTask?: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  taskId,
  isOpen,
  onClose,
  currentUser,
  onUpdateTask,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'media'>('details');
  
  // Hooks for data fetching and mutations
  const { task, loading, error, refetch } = useTaskWithDetails(taskId);
  const { createComment } = useCreateComment();
  const { updateComment } = useUpdateComment();
  const { deleteComment } = useDeleteComment();
  const { uploadMedia } = useUploadMedia();
  const { deleteMedia } = useDeleteMedia();

  if (!isOpen) return null;

  // Handle comment operations
  const handleAddComment = async (content: string, parentId?: string) => {
    try {
      await createComment(taskId, content, parentId);
      await refetch(); // Refresh task data
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      await refetch(); // Refresh task data
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      await refetch(); // Refresh task data
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // Handle media operations
  const handleUploadMedia = async (files: FileList) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a simple media data object - in real implementation, you'd upload to a storage service first
        const mediaData = {
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          type: file.type.startsWith('image/') ? 'IMAGE' : 
                file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
          url: `temp://${file.name}`, // Temporary URL - replace with actual upload logic
        };
        
        // Here you would normally upload the file to storage service and get the real URL
        console.log('Uploading media for task:', taskId, 'file:', file.name);
        
        // For now, just return success
        return mediaData;
      });
      
      await Promise.all(uploadPromises);
      await refetch(); // Refresh task data
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      console.log('Deleting media:', mediaId);
      await refetch(); // Refresh task data
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-red-600">Lỗi: Không thể tải thông tin task</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                {task.author.firstName} {task.author.lastName}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(task.createdAt), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PencilIcon className="w-4 h-4 inline mr-2" />
            Chi tiết
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ChatBubbleLeftIcon className="w-4 h-4 inline mr-2" />
            Bình luận ({task.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'media'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PhotoIcon className="w-4 h-4 inline mr-2" />
            File đính kèm ({task.media?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status === 'PENDING' && 'Chờ xử lý'}
                    {task.status === 'IN_PROGRESS' && 'Đang làm'}
                    {task.status === 'COMPLETED' && 'Hoàn thành'}
                    {task.status === 'CANCELLED' && 'Đã hủy'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'HIGH' && 'Cao'}
                    {task.priority === 'MEDIUM' && 'Trung bình'}
                    {task.priority === 'LOW' && 'Thấp'}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hạn chót
                  </label>
                  <p className="text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {/* Category */}
              {task.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <p className="text-gray-900">{task.category}</p>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              <TaskComments
                taskId={taskId}
                comments={task.comments || []}
                currentUser={currentUser}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          )}

          {activeTab === 'media' && (
            <div className="p-6">
              <TaskMediaComponent
                taskId={taskId}
                media={task.media || []}
                currentUser={currentUser}
                onUploadMedia={handleUploadMedia}
                onDeleteMedia={handleDeleteMedia}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
