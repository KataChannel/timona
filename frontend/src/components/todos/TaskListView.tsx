import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { TodoViewProps } from '@/types/todo-views';
import { MediaViewer } from './MediaViewer';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

export const TaskListView: React.FC<TodoViewProps> = ({
  tasks,
  loading = false,
  onTaskUpdate,
  onTaskDelete
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'text-red-600 bg-red-100';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case TaskPriority.LOW:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case TaskStatus.IN_PROGRESS:
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case TaskStatus.PENDING:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
      case TaskStatus.CANCELLED:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED 
      ? TaskStatus.PENDING 
      : TaskStatus.COMPLETED;
    onTaskUpdate?.(task.id, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có task nào</h3>
        <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo task mới.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-4">
            {/* Status Toggle */}
            <button
              onClick={() => handleStatusToggle(task)}
              className="mt-1 flex-shrink-0"
            >
              {getStatusIcon(task.status)}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    task.status === TaskStatus.COMPLETED 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Priority Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  <FlagIcon className="h-3 w-3 mr-1" />
                  {task.priority}
                </span>
              </div>

              {/* Media */}
              {task.media && task.media.length > 0 && (
                <div className="mt-3">
                  <MediaViewer 
                    media={task.media} 
                    compact={true}
                  />
                </div>
              )}

              {/* Meta Information */}
              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                {task.dueDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(task.dueDate), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </span>
                  </div>
                )}

                {task.assignedTo && (
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{task.assignedTo.username}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(task.createdAt), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
