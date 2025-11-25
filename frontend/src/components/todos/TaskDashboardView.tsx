import React, { useState, useEffect } from 'react';
import { TodoViewProps } from '@/types/todo-views';
import { TaskStatus, Task } from '@/types/todo';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import TaskList from './TaskList';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

export const TaskDashboardView: React.FC<TodoViewProps> = ({
  tasks,
  loading,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
}) => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });

  // Calculate stats when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const now = new Date();
      const newStats: TaskStats = {
        total: tasks.length,
        completed: tasks.filter((task: Task) => task.status === TaskStatus.COMPLETED).length,
        inProgress: tasks.filter((task: Task) => task.status === TaskStatus.IN_PROGRESS).length,
        pending: tasks.filter((task: Task) => task.status === TaskStatus.PENDING).length,
        overdue: tasks.filter((task: Task) => 
          task.dueDate && 
          new Date(task.dueDate) < now && 
          task.status !== TaskStatus.COMPLETED
        ).length,
      };
      setStats(newStats);
    }
  }, [tasks]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng công việc
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hoàn thành
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    {stats.completed}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đang thực hiện
                  </dt>
                  <dd className="text-lg font-medium text-blue-600">
                    {stats.inProgress}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Chờ xử lý
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Quá hạn
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {stats.overdue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">Tiến độ hoàn thành</h3>
            <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {stats.completed} trong tổng số {stats.total} công việc đã hoàn thành
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
          <button
            onClick={() => onTaskCreate?.({})}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo công việc mới
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Công việc hoàn thành hôm nay</p>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter(task => 
                task.status === TaskStatus.COMPLETED && 
                task.updatedAt && 
                new Date(task.updatedAt).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Công việc quá hạn</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Đang thực hiện</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Công việc gần đây</h3>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách các công việc được cập nhật gần đây
          </p>
        </div>
        <TaskList 
          className="p-6"
        />
      </div>
    </div>
  );
};
