import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import CreateTaskModal from './CreateTaskModal';
import { useTasks, useSharedTasks, useTaskMutations, useTaskFilters, useTaskSubscriptions } from '../../hooks/useTodos';
import { Task, TaskStatus } from '../../types/todo';
import { toast } from 'sonner';

interface TaskListProps {
  showSharedTasks?: boolean;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({ 
  showSharedTasks = false, 
  className = '' 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useTaskFilters();
  
  // Use different hooks based on showSharedTasks prop
  const { tasks: regularTasks, loading: regularLoading, error: regularError, refetch: regularRefetch } = useTasks(filters);
  const { sharedTasks, loading: sharedLoading, error: sharedError, refetch: sharedRefetch } = useSharedTasks(filters);
  
  // Determine which data to use
  const tasks = showSharedTasks ? sharedTasks : regularTasks;
  const loading = showSharedTasks ? sharedLoading : regularLoading;
  const error = showSharedTasks ? sharedError : regularError;
  const refetch = showSharedTasks ? sharedRefetch : regularRefetch;
  
  const { updateTask, deleteTask, loading: mutationLoading } = useTaskMutations();
  const { newTasks, updatedTasks, clearNotifications } = useTaskSubscriptions();

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        updateFilter('search', searchQuery.trim());
      } else {
        updateFilter('search', undefined);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, updateFilter]);

  // Handle new task notifications
  useEffect(() => {
    if (newTasks.length > 0) {
      toast.success(`${newTasks.length} task mới được tạo`);
      refetch();
      clearNotifications();
    }
  }, [newTasks, refetch, clearNotifications]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTask({ id: taskId, status });
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa task này?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      toast.success('Xóa task thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa task');
      console.error(error);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    refetch();
    toast.success('Tạo task thành công');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Lỗi khi tải danh sách task: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showSharedTasks ? 'Tasks được chia sẻ' : 'Tasks của tôi'}
          </h2>
          <p className="text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' (đã lọc)'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
              ${showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Lọc</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {/* Create Task Button */}
          {!showSharedTasks && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tạo Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Clear filters */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Đang áp dụng bộ lọc</span>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      )}

      {/* Task Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {hasActiveFilters ? (
              <FunnelIcon className="w-12 h-12 text-gray-400" />
            ) : (
              <PlusIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters 
              ? 'Không tìm thấy task nào'
              : showSharedTasks 
                ? 'Chưa có task nào được chia sẻ'
                : 'Chưa có task nào'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters
              ? 'Thử thay đổi bộ lọc để xem thêm tasks'
              : showSharedTasks
                ? 'Các task được chia sẻ với bạn sẽ hiển thị ở đây'
                : 'Bắt đầu bằng cách tạo task đầu tiên của bạn'
            }
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          ) : !showSharedTasks && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo Task Đầu Tiên
            </button>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default TaskList;
