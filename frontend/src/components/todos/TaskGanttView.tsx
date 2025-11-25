import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { TodoViewProps } from '@/types/todo-views';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

interface GanttTask extends Task {
  startDate: Date;
  endDate: Date;
  progress: number;
}

export const TaskGanttView: React.FC<TodoViewProps> = ({
  tasks,
  loading = false,
  onTaskUpdate
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Convert tasks to Gantt format
  const ganttTasks: GanttTask[] = React.useMemo(() => {
    if (!tasks) return [];
    
    return tasks.map(task => {
      const createdDate = new Date(task.createdAt);
      const dueDate = task.dueDate ? new Date(task.dueDate) : addDays(createdDate, 7);
      const progress = task.status === TaskStatus.COMPLETED ? 100 : 
                      task.status === TaskStatus.IN_PROGRESS ? 50 : 0;
      
      return {
        ...task,
        startDate: createdDate,
        endDate: dueDate,
        progress
      };
    });
  }, [tasks]);

  // Get week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-500';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-500';
      case TaskPriority.LOW:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case TaskStatus.PENDING:
        return 'bg-gray-400';
      case TaskStatus.CANCELLED:
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const calculateTaskPosition = (task: GanttTask) => {
    const taskStart = task.startDate;
    const taskEnd = task.endDate;
    
    // Calculate position within the week
    const weekStartTime = weekStart.getTime();
    const weekEndTime = weekEnd.getTime();
    const weekDuration = weekEndTime - weekStartTime;
    
    const taskStartTime = Math.max(taskStart.getTime(), weekStartTime);
    const taskEndTime = Math.min(taskEnd.getTime(), weekEndTime);
    
    if (taskStartTime > weekEndTime || taskEndTime < weekStartTime) {
      return null; // Task not in current week
    }
    
    const left = ((taskStartTime - weekStartTime) / weekDuration) * 100;
    const width = ((taskEndTime - taskStartTime) / weekDuration) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setCurrentWeek(addDays(currentWeek, days));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-8 gap-4 mb-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 mb-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="col-span-7 h-12 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Gantt Chart - {format(weekStart, 'dd/MM', { locale: vi })} - {format(weekEnd, 'dd/MM/yyyy', { locale: vi })}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Tuần này
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Date Headers */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-500 border-r border-gray-200">
              Task
            </div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-3 text-center border-r border-gray-200">
                <div className="text-xs text-gray-500">
                  {format(day, 'EEE', { locale: vi })}
                </div>
                <div className={`text-sm font-medium ${
                  isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'dd')}
                </div>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="divide-y divide-gray-200">
            {ganttTasks.map((task) => {
              const position = calculateTaskPosition(task);
              
              return (
                <div key={task.id} className="grid grid-cols-8 hover:bg-gray-50">
                  {/* Task Info */}
                  <div className="p-3 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === TaskPriority.HIGH ? 'text-red-600 bg-red-100' :
                        task.priority === TaskPriority.MEDIUM ? 'text-yellow-600 bg-yellow-100' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        <FlagIcon className="h-3 w-3 mr-1" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${
                          task.status === TaskStatus.COMPLETED 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-900'
                        }`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="col-span-7 relative p-3 border-r border-gray-200">
                    {position && (
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded-sm flex items-center"
                        style={{ 
                          left: position.left, 
                          width: position.width,
                        }}
                      >
                        {/* Task Bar */}
                        <div className={`h-full w-full rounded-sm ${getStatusColor(task.status)} opacity-80`}>
                          {/* Progress Bar */}
                          {task.progress > 0 && (
                            <div
                              className="h-full bg-white bg-opacity-30 rounded-sm"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                        </div>
                        
                        {/* Task Label */}
                        {parseFloat(position.width) > 15 && (
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-white text-xs font-medium truncate">
                              {task.title}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Today Indicator */}
                    {weekDays.some(day => isSameDay(day, new Date())) && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-60"
                        style={{ 
                          left: `${((new Date().getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100}%` 
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {ganttTasks.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có task nào</h3>
              <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo task mới.</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
            <span className="text-gray-600">Chờ xử lý</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <span className="text-gray-600">Đang thực hiện</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <span className="text-gray-600">Hoàn thành</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded-sm"></div>
            <span className="text-gray-600">Đã hủy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
