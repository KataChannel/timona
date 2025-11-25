import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  ShareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon as SolidClockIcon,
} from '@heroicons/react/24/solid';
import { Task, TaskCategory, TaskPriority, TaskStatus, User } from '../../types/todo';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TaskModal from './TaskModal';

// Extended task interface to include shared information
interface ExtendedTask extends Task {
  isShared?: boolean;
  sharedBy?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  sharePermission?: 'VIEW' | 'EDIT' | 'ADMIN';
}

interface TaskCardProps {
  task: ExtendedTask;
  currentUser?: User;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdate?: (task: Task) => void;
  className?: string;
}

const getCategoryColor = (category: TaskCategory) => {
  switch (category) {
    case TaskCategory.WORK:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case TaskCategory.PERSONAL:
      return 'bg-green-100 text-green-800 border-green-200';
    case TaskCategory.STUDY:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 'bg-red-100 text-red-800 border-red-200';
    case TaskPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TaskPriority.LOW:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    case TaskStatus.IN_PROGRESS:
      return <SolidClockIcon className="w-5 h-5 text-blue-600" />;
    case TaskStatus.PENDING:
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
    case TaskStatus.CANCELLED:
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    default:
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'bg-green-50 border-green-200';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-50 border-blue-200';
    case TaskStatus.PENDING:
      return 'bg-white border-gray-200';
    case TaskStatus.CANCELLED:
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-white border-gray-200';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onStatusChange,
  onDelete,
  onTaskUpdate,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
  const isDueSoon = task.dueDate && 
    new Date(task.dueDate) > new Date() && 
    new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
    task.status !== TaskStatus.COMPLETED;

  const handleStatusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onStatusChange) return;
    
    let nextStatus: TaskStatus;
    switch (task.status) {
      case TaskStatus.PENDING:
        nextStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        nextStatus = TaskStatus.COMPLETED;
        break;
      case TaskStatus.COMPLETED:
        nextStatus = TaskStatus.PENDING;
        break;
      default:
        nextStatus = TaskStatus.PENDING;
    }
    
    onStatusChange(task.id, nextStatus);
  };

  return (
    <>
      <Link href={`/admin/todos/${task.id}`} >
        <div className={`
          group block bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all duration-200 cursor-pointer
          ${getStatusColor(task.status)}
          ${isOverdue ? 'border-red-300 bg-red-50' : ''}
          ${isDueSoon ? 'border-yellow-300 bg-yellow-50' : ''}
          ${task.isShared ? 'border-l-4 border-l-blue-500' : ''}
          ${className}
        `}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStatusClick}
                className="hover:scale-110 transition-transform"
                title="Thay đổi trạng thái"
              >
                {getStatusIcon(task.status)}
              </button>
              <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${
                task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : ''
              }`}>
                {task.title}
              </h3>
              {task.isShared && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <ShareIcon className="h-3 w-3" />
                  Shared
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Priority Badge */}
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                ${getPriorityColor(task.priority)}
              `}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Shared by info */}
          {task.isShared && task.sharedBy && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.sharedBy.avatar} />
                <AvatarFallback className="text-xs bg-blue-200 text-blue-800">
                  {task.sharedBy.firstName && task.sharedBy.lastName 
                    ? `${task.sharedBy.firstName[0]}${task.sharedBy.lastName[0]}`.toUpperCase()
                    : task.sharedBy.username?.slice(0, 2).toUpperCase() || 'UN'
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-700">
                  Được chia sẻ bởi{' '}
                  <span className="font-medium">
                    {task.sharedBy.firstName && task.sharedBy.lastName 
                      ? `${task.sharedBy.firstName} ${task.sharedBy.lastName}`
                      : task.sharedBy.username || 'Unknown User'
                    }
                  </span>
                </p>
              </div>
              {task.sharePermission && (
                <Badge variant="outline" className="text-xs">
                  {task.sharePermission}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Category and Due Date */}
          <div className="flex items-center justify-between mb-3">
            {task.category ? (
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                ${getCategoryColor(task.category as TaskCategory)}
              `}>
                {task.category}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-500">
                Chưa phân loại
              </span>
            )}

            {task.dueDate && (
              <div className={`flex items-center space-x-1 text-sm ${
                isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(task.dueDate), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {/* Author */}
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>{task.author.username}</span>
              </div>

              {/* Attachments */}
              {task.media && task.media.length > 0 && (
                <div className="flex items-center space-x-1">
                  <PaperClipIcon className="w-4 h-4" />
                  <span>{task.media.length}</span>
                </div>
              )}

              {/* Comments */}
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{task.comments.length}</span>
                </div>
              )}

              {/* Shares */}
              {task.shares && task.shares.length > 0 && (
                <div className="flex items-center space-x-1">
                  <ShareIcon className="w-4 h-4" />
                  <span>{task.shares.length}</span>
                </div>
              )}

              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Chi tiết</span>
              </button>
            </div>

            {/* Created time */}
            <span>
              {formatDistanceToNow(new Date(task.createdAt), { 
                addSuffix: true, 
                locale: vi 
              })}
            </span>
          </div>

          {/* Warning indicators */}
          {isOverdue && (
            <div className="mt-3 flex items-center space-x-1 text-red-600 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Quá hạn</span>
            </div>
          )}

          {isDueSoon && !isOverdue && (
            <div className="mt-3 flex items-center space-x-1 text-yellow-600 text-sm">
              <ClockIcon className="w-4 h-4" />
              <span>Sắp đến hạn</span>
            </div>
          )}
        </div>
      </Link>
      {/* Task Modal */}
      <TaskModal
        taskId={task.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onUpdateTask={onTaskUpdate}
      />
    </>
  );
};

export default TaskCard;
