import React from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Product, SortField, SortDirection } from '../types';
import { formatPrice } from '../utils';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  emptyMessage?: string;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  sortField,
  sortDirection,
  onSort,
  emptyMessage = 'Không có dữ liệu',
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-500" />
      : <ArrowDown className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('ma')}
              >
                <div className="flex items-center gap-2">
                  Mã SP
                  {renderSortIcon('ma')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('ten')}
              >
                <div className="flex items-center gap-2">
                  Tên sản phẩm
                  {renderSortIcon('ten')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên chuẩn hóa
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ĐVT
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onSort('dgia')}
              >
                <div className="flex items-center justify-end gap-2">
                  Đơn giá
                  {renderSortIcon('dgia')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span className="text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {product.ma || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {product.ten || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {product.ten2 ? (
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        {product.ten2}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa chuẩn hóa</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {product.dvt || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatPrice(product.dgia)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.ten2 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã chuẩn hóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                        <XCircle className="h-3 w-3" />
                        Chưa xử lý
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
