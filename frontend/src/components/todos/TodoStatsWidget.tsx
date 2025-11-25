import React from 'react';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTodos';
import { TaskStatus, Task } from '@/types/todo';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface TodoStatsWidgetProps {
  className?: string;
}

const TodoStatsWidget: React.FC<TodoStatsWidgetProps> = ({ className = '' }) => {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Thống kê Task</h3>
          <p className="text-sm text-red-600">Không thể tải dữ liệu</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task: Task) => task.status === TaskStatus.COMPLETED).length,
    inProgress: tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS).length,
    pending: tasks.filter((task: Task) => task.status === TaskStatus.PENDING).length,
    overdue: tasks.filter((task: Task) => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      task.status !== TaskStatus.COMPLETED
    ).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statItems = [
    {
      icon: CheckCircleIcon,
      label: 'Hoàn thành',
      value: stats.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: ClockIcon,
      label: 'Đang thực hiện',
      value: stats.inProgress,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CalendarIcon,
      label: 'Chờ xử lý',
      value: stats.pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: ExclamationTriangleIcon,
      label: 'Quá hạn',
      value: stats.overdue,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Thống kê Task</h3>
          <Link
            href="/todos"
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center space-x-1"
            >
            <span>Xem tất cả</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Total and Completion Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Tổng cộng: {stats.total} task</span>
            <span>{completionRate}% hoàn thành</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 truncate">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity or Quick Actions */}
        {stats.total === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">Chưa có task nào</p>
            <Link
              href="/todos"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Tạo task đầu tiên →
            </Link>
          </div>
        )}

        {stats.overdue > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800 mb-2">
              Có {stats.overdue} task quá hạn cần xử lý
            </p>
            <Link
              href="/todos?filter=overdue"
              className="text-sm text-red-600 hover:text-red-500 font-medium"
            >
              Xem task quá hạn →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoStatsWidget;
