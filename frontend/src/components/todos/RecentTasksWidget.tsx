import React from 'react';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTodos';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ClockIcon,
  CalendarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface RecentTasksWidgetProps {
  className?: string;
  limit?: number;
}

const RecentTasksWidget: React.FC<RecentTasksWidgetProps> = ({ 
  className = '', 
  limit = 5 
}) => {
  const { tasks, loading, error } = useTasks();

  // All hooks must be called before any conditional returns
  // Get recent tasks (last 5, sorted by createdAt desc)
  const recentTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    // Create a copy of the array before sorting to avoid mutation
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [tasks, limit]);

  const getPriorityColor = React.useCallback((priority: TaskPriority) => {
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
  }, []);

  const getStatusIcon = React.useCallback((status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case TaskStatus.IN_PROGRESS:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case TaskStatus.PENDING:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
      case TaskStatus.CANCELLED:
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  if (loading) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Task gần đây</h3>
          <p className="text-sm text-red-600">Không thể tải dữ liệu</p>
        </div>
      </div>
    );
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && 
           new Date(task.dueDate) < new Date() && 
           task.status !== TaskStatus.COMPLETED;
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Task gần đây</h3>
          <Link
            href="/todos"
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center space-x-1"
            >
            <span>Xem tất cả</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-6">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có task nào</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo task đầu tiên</p>
            <div className="mt-6">
              <Link
                href="/todos"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Tạo task
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task: Task) => (
              <Link
                key={task.id}
                href={`/todos/${task.id}`}
                className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
                >
                <div className="flex items-start space-x-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className={`text-sm font-medium ${
                        task.status === TaskStatus.COMPLETED 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900'
                      } truncate`}>
                        {task.title}
                      </p>
                      
                      {/* Priority Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === TaskPriority.HIGH ? 'Cao' :
                         task.priority === TaskPriority.MEDIUM ? 'TB' : 'Thấp'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {/* Created time */}
                      <span>
                        {formatDistanceToNow(new Date(task.createdAt), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span className={`flex items-center space-x-1 ${
                          isOverdue(task) ? 'text-red-600' : ''
                        }`}>
                          <CalendarIcon className="w-3 h-3" />
                          <span>
                            {isOverdue(task) ? 'Quá hạn' : 
                             formatDistanceToNow(new Date(task.dueDate), { 
                               addSuffix: true, 
                               locale: vi 
                             })}
                          </span>
                        </span>
                      )}

                      {/* Category */}
                      {task.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {task.category === 'WORK' ? 'Công việc' :
                           task.category === 'PERSONAL' ? 'Cá nhân' :
                           task.category === 'STUDY' ? 'Học tập' : task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTasksWidget;
