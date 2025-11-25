import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/todo';
import { TodoViewProps } from '@/types/todo-views';
import { MediaViewer } from './MediaViewer';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  UserIcon,
  FlagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export const TaskKanbanView: React.FC<TodoViewProps> = ({
  tasks,
  loading = false,
  onTaskUpdate,
  onTaskCreate
}) => {
  const columns: KanbanColumn[] = React.useMemo(() => {
    const tasksByStatus: Record<TaskStatus, Task[]> = {
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.COMPLETED]: [],
      [TaskStatus.CANCELLED]: [],
    };

    // Group tasks by status
    tasks?.forEach(task => {
      if (task.status && tasksByStatus[task.status as TaskStatus]) {
        tasksByStatus[task.status as TaskStatus].push(task);
      }
    });

    return [
      {
        id: TaskStatus.PENDING,
        title: 'Chờ xử lý',
        color: 'bg-gray-100 border-gray-300',
        tasks: tasksByStatus[TaskStatus.PENDING] || []
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'Đang thực hiện',
        color: 'bg-blue-100 border-blue-300',
        tasks: tasksByStatus[TaskStatus.IN_PROGRESS] || []
      },
      {
        id: TaskStatus.COMPLETED,
        title: 'Hoàn thành',
        color: 'bg-green-100 border-green-300',
        tasks: tasksByStatus[TaskStatus.COMPLETED] || []
      },
      {
        id: TaskStatus.CANCELLED,
        title: 'Đã hủy',
        color: 'bg-red-100 border-red-300',
        tasks: tasksByStatus[TaskStatus.CANCELLED] || []
      },
    ];
  }, [tasks]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'text-red-600 bg-red-100 border-red-200';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case TaskPriority.LOW:
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    onTaskUpdate?.(taskId, { status: newStatus });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, currentStatus: task.status }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.currentStatus !== targetStatus) {
      handleTaskMove(data.taskId, targetStatus);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-20 bg-gray-200 rounded mb-3"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`rounded-lg border-2 border-dashed p-4 min-h-[500px] ${column.color}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {column.title}
              <span className="ml-2 text-sm text-gray-500">
                ({column.tasks.length})
              </span>
            </h3>
            <button
              onClick={() => onTaskCreate?.({ status: column.id })}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`text-sm font-medium ${
                    task.status === TaskStatus.COMPLETED 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    <FlagIcon className="h-3 w-3 mr-1" />
                    {task.priority.charAt(0)}
                  </span>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Media */}
                {task.media && task.media.length > 0 && (
                  <div className="mb-3">
                    <MediaViewer 
                      media={task.media} 
                      compact={true}
                    />
                  </div>
                )}

                {/* Task Meta */}
                <div className="space-y-2">
                  {task.dueDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(task.dueDate), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    </div>
                  )}

                  {(task as any).assignedTo && (
                    <div className="flex items-center text-xs text-gray-500">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span>{(task as any).assignedTo.username}</span>
                    </div>
                  )}
                </div>

                {/* Task Footer */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(task.createdAt), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </span>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-1">
                      {task.status !== TaskStatus.COMPLETED && (
                        <button
                          onClick={() => handleTaskMove(task.id, TaskStatus.COMPLETED)}
                          className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
                        >
                          ✓
                        </button>
                      )}
                      {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.COMPLETED && (
                        <button
                          onClick={() => handleTaskMove(task.id, TaskStatus.IN_PROGRESS)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">Không có task nào</div>
                <button
                  onClick={() => onTaskCreate?.({ status: column.id })}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Thêm task mới
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
