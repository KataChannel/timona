import React from 'react';
import { Search, RefreshCw, Database, PackagePlus } from 'lucide-react';
import { FilterStatus, UniqueFilter, ProductStats } from '../types';

interface SearchToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  uniqueFilter: UniqueFilter;
  onUniqueFilterChange: (filter: UniqueFilter) => void;
  stats: ProductStats;
  filteredCount: number; // Count after applying all filters including unique
  loading: boolean;
  onRefresh: () => void;
  onNormalize: () => void;
  onUpdate: () => void;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  uniqueFilter,
  onUniqueFilterChange,
  stats,
  filteredCount,
  loading,
  onRefresh,
  onNormalize,
  onUpdate,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã, DVT..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>

            <button
              onClick={onUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PackagePlus className="h-4 w-4" />
              Cập nhật SP
            </button>

            <button
              onClick={onNormalize}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Database className="h-4 w-4" />
              Chuẩn hóa
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tất cả ({stats.total})
            </button>
            <button
              onClick={() => onFilterChange('normalized')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterStatus === 'normalized'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Đã chuẩn hóa ({stats.normalized})
            </button>
            <button
              onClick={() => onFilterChange('pending')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Chưa xử lý ({stats.pending})
            </button>
          </div>
        </div>

        {/* Unique Filters */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Hiển thị unique:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onUniqueFilterChange('none')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                uniqueFilter === 'none'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tất cả {uniqueFilter === 'none' && `(${filteredCount})`}
            </button>
            <button
              onClick={() => onUniqueFilterChange('ma')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                uniqueFilter === 'ma'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Theo mã sản phẩm {uniqueFilter === 'ma' && `(${filteredCount})`}
            </button>
            <button
              onClick={() => onUniqueFilterChange('ten2')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                uniqueFilter === 'ten2'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Theo tên chuẩn hóa {uniqueFilter === 'ten2' && `(${filteredCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
