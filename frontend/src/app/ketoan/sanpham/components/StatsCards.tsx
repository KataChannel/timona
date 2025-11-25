import React from 'react';
import { Database, CheckCircle2, XCircle } from 'lucide-react';
import { ProductStats } from '../types';

interface StatsCardsProps {
  stats: ProductStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng sản phẩm</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <Database className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Đã chuẩn hóa</p>
            <p className="text-2xl font-bold text-green-600">{stats.normalized}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chưa chuẩn hóa</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <XCircle className="h-8 w-8 text-orange-500" />
        </div>
      </div>
    </div>
  );
};
