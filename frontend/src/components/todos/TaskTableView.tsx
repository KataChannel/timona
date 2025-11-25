import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { TodoViewProps } from '@/types/todo-views';
import { MediaViewer } from './MediaViewer';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const TaskTableView: React.FC<TodoViewProps> = ({
  tasks,
  loading = false,
  onTaskUpdate,
  onTaskDelete
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    return [...tasks].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortField, sortDirection]);

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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case TaskStatus.PENDING:
        return 'text-gray-600 bg-gray-100';
      case TaskStatus.CANCELLED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case TaskStatus.IN_PROGRESS:
        return <ClockIcon className="h-4 w-4" />;
      case TaskStatus.PENDING:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case TaskStatus.CANCELLED:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    onTaskUpdate?.(task.id, { status: newStatus });
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' 
            ? <ChevronUpIcon className="h-4 w-4" />
            : <ChevronDownIcon className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-gray-200 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có task nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo task mới.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="title">Task</SortableHeader>
              <SortableHeader field="status">Trạng thái</SortableHeader>
              <SortableHeader field="priority">Độ ưu tiên</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Media
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người thực hiện
              </th>
              <SortableHeader field="dueDate">Hạn hoàn thành</SortableHeader>
              <SortableHeader field="createdAt">Ngày tạo</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className={`text-sm font-medium ${
                        task.status === TaskStatus.COMPLETED 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                  >
                    <option value={TaskStatus.PENDING}>Chờ xử lý</option>
                    <option value={TaskStatus.IN_PROGRESS}>Đang thực hiện</option>
                    <option value={TaskStatus.COMPLETED}>Hoàn thành</option>
                    <option value={TaskStatus.CANCELLED}>Đã hủy</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <FlagIcon className="h-3 w-3 mr-1" />
                    {task.priority}
                  </span>
                </td>
                
                {/* Media Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.media && task.media.length > 0 ? (
                    <MediaViewer 
                      media={task.media} 
                      compact={true}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Không có</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.assignedTo ? (
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {task.assignedTo.username}
                    </div>
                  ) : (
                    <span className="text-gray-400">Chưa gán</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.dueDate ? (
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div>{format(new Date(task.dueDate), 'dd/MM/yyyy')}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(task.dueDate), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Không có hạn</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(task.createdAt), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onTaskDelete?.(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
