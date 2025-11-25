import React from 'react';
import { X } from 'lucide-react';
import { TaskCategory, TaskPriority, TaskStatus, TaskFilterInput } from '../../types/todo';

interface TaskFiltersProps {
  filters: TaskFilterInput;
  onFilterChange: (key: keyof TaskFilterInput, value: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const categoryOptions = [
    { value: TaskCategory.WORK, label: 'Công việc' },
    { value: TaskCategory.PERSONAL, label: 'Cá nhân' },
    { value: TaskCategory.STUDY, label: 'Học tập' },
  ];

  const priorityOptions = [
    { value: TaskPriority.HIGH, label: 'Cao' },
    { value: TaskPriority.MEDIUM, label: 'Trung bình' },
    { value: TaskPriority.LOW, label: 'Thấp' },
  ];

  const statusOptions = [
    { value: TaskStatus.PENDING, label: 'Đang chờ' },
    { value: TaskStatus.IN_PROGRESS, label: 'Đang thực hiện' },
    { value: TaskStatus.COMPLETED, label: 'Hoàn thành' },
    { value: TaskStatus.CANCELLED, label: 'Đã hủy' },
  ];

  const handleDateChange = (field: 'dueBefore' | 'dueAfter', value: string) => {
    onFilterChange(field, value || undefined);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
            <span>Xóa tất cả</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ ưu tiên
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả độ ưu tiên</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hạn chót
          </label>
          <div className="space-y-2">
            <input
              type="date"
              placeholder="Từ ngày"
              value={filters.dueAfter || ''}
              onChange={(e) => handleDateChange('dueAfter', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              placeholder="Đến ngày"
              value={filters.dueBefore || ''}
              onChange={(e) => handleDateChange('dueBefore', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Danh mục: {categoryOptions.find(c => c.value === filters.category)?.label}</span>
                <button
                  onClick={() => onFilterChange('category', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.priority && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Độ ưu tiên: {priorityOptions.find(p => p.value === filters.priority)?.label}</span>
                <button
                  onClick={() => onFilterChange('priority', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.status && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Trạng thái: {statusOptions.find(s => s.value === filters.status)?.label}</span>
                <button
                  onClick={() => onFilterChange('status', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.dueAfter && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Từ: {new Date(filters.dueAfter).toLocaleDateString('vi-VN')}</span>
                <button
                  onClick={() => onFilterChange('dueAfter', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.dueBefore && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Đến: {new Date(filters.dueBefore).toLocaleDateString('vi-VN')}</span>
                <button
                  onClick={() => onFilterChange('dueBefore', undefined)}
                  className="ml-2 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
