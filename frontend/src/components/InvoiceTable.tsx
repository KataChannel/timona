import React, { useState, useMemo } from 'react';
import { InvoiceData, AdvancedFilter } from '@/types/invoice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface InvoiceTableProps {
  invoices: InvoiceData[];
  loading?: boolean;
  onSort?: (field: keyof InvoiceData, direction: 'asc' | 'desc') => void;
  sortField?: keyof InvoiceData;
  sortDirection?: 'asc' | 'desc';
  // Enhanced props
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  filter?: AdvancedFilter;
  onFilterChange?: (filter: AdvancedFilter) => void;
  showAdvancedFilter?: boolean;
  onRowClick?: (invoice: InvoiceData) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  loading = false,
  onSort,
  sortField,
  sortDirection,
  pagination,
  onPageChange,
  onPageSizeChange,
  filter,
  onFilterChange,
  showAdvancedFilter = false,
  onRowClick
}) => {
  const [localFilter, setLocalFilter] = useState<AdvancedFilter>(filter || {} as AdvancedFilter);
  const [showFilter, setShowFilter] = useState(showAdvancedFilter);
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      // Handle various date formats from API
      let date: Date;
      if (dateString.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateString.split('/');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        // ISO format
        date = new Date(dateString);
      }
      
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const handleSort = (field: keyof InvoiceData) => {
    if (!onSort) return;
    
    const newDirection = 
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  const getSortIcon = (field: keyof InvoiceData) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleFilterChange = (key: keyof AdvancedFilter, value: any) => {
    const newFilter = { ...localFilter, [key]: value };
    setLocalFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 0 && newPage < (pagination?.totalPages || 0)) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  // Filtered invoices for local search
  const filteredInvoices = useMemo(() => {
    if (!localFilter.globalSearch) return invoices;
    
    const searchTerm = localFilter.globalSearch.toLowerCase();
    return invoices.filter(invoice => 
      invoice.shdon?.toLowerCase().includes(searchTerm) ||
      invoice.khmshdon?.toLowerCase().includes(searchTerm) ||
      invoice.tentcgp?.toLowerCase().includes(searchTerm) ||
      invoice.tenxmua?.toLowerCase().includes(searchTerm) ||
      invoice.msttcgp?.toLowerCase().includes(searchTerm) ||
      invoice.msttmua?.toLowerCase().includes(searchTerm) ||
      (invoice as any).thlap?.toLowerCase().includes(searchTerm)
    );
  }, [invoices, localFilter.globalSearch]);

  // Pagination info
  const startRecord = pagination ? (pagination.page * pagination.size) + 1 : 1;
  const endRecord = pagination ? Math.min(startRecord + pagination.size - 1, pagination.totalElements) : filteredInvoices.length;
  const totalRecords = pagination?.totalElements || filteredInvoices.length;

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">📄</div>
        <p className="text-gray-600">Không có dữ liệu hóa đơn</p>
        <p className="text-gray-500 text-sm">Vui lòng thay đổi bộ lọc để xem kết quả</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Bộ lọc nâng cao</span>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showFilter ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
          </button>
        </div>

        {/* Global Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo số hóa đơn, tên người bán/mua, MST..."
              value={localFilter.globalSearch || ''}
              onChange={(e) => handleFilterChange('globalSearch', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số hóa đơn
              </label>
              <input
                type="text"
                placeholder="Nhập số hóa đơn"
                value={localFilter.invoiceNumber || ''}
                onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã số thuế
              </label>
              <input
                type="text"
                placeholder="MST người bán/mua"
                value={localFilter.taxCode || ''}
                onChange={(e) => handleFilterChange('taxCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ số tiền
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilter.amountFrom || ''}
                onChange={(e) => handleFilterChange('amountFrom', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến số tiền
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilter.amountTo || ''}
                onChange={(e) => handleFilterChange('amountTo', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời điểm lập
              </label>
              <input
                type="text"
                placeholder="Nhập thời điểm lập"
                value={localFilter.thlap || ''}
                onChange={(e) => handleFilterChange('thlap', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Info and Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị {startRecord} - {endRecord} của {totalRecords.toLocaleString('vi-VN')} kết quả
        </div>
        
        {pagination && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Hiển thị:</span>
            <select
              value={pagination.size}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">bản ghi</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('nbmst')}
            >
              <div className="flex items-center space-x-1">
                <span>MST Người bán</span>
                <span className="text-gray-400">{getSortIcon('nbmst')}</span>
              </div>
            </th>
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('khmshdon')}
            >
              <div className="flex items-center space-x-1">
                <span>Ký hiệu mẫu</span>
                <span className="text-gray-400">{getSortIcon('khmshdon')}</span>
              </div>
            </th>
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ký hiệu HĐ
            </th>
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('shdon')}
            >
              <div className="flex items-center space-x-1">
                <span>Số HĐ</span>
                <span className="text-gray-400">{getSortIcon('shdon')}</span>
              </div>
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CQT
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Địa chỉ NB
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên NB
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Địa chỉ NM
            </th>
            <th
              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              MST NM
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên NM
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên NM mua
            </th>
            <th
              className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('tgtcthue')}
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Tiền chưa thuế</span>
                <span className="text-gray-400">{getSortIcon('tgtcthue')}</span>
              </div>
            </th>
            <th
              className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('tgtthue')}
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Tiền thuế</span>
                <span className="text-gray-400">{getSortIcon('tgtthue')}</span>
              </div>
            </th>
            <th
              className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort('tgtttbso')}
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Tổng TT (số)</span>
                <span className="text-gray-400">{getSortIcon('tgtttbso')}</span>
              </div>
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tổng TT (chữ)
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời điểm lập
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CKTM
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TT Báo
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TT Xử lý
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoices.map((invoice, index) => (
            <tr 
              key={invoice.id || `${invoice.shdon}-${invoice.khmshdon}-${index}`}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(invoice)}
            >
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).nbmst || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {invoice.khmshdon || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).khhdon || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm font-medium text-gray-900">
                {invoice.shdon}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).cqt || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).nbdchi}>
                  {(invoice as any).nbdchi || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).nbten}>
                  {(invoice as any).nbten || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).nmdchi}>
                  {(invoice as any).nmdchi || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).nmmst || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).nmten}>
                  {(invoice as any).nmten || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).nmtnmua}>
                  {(invoice as any).nmtnmua || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-right text-gray-900 font-medium">
                {formatCurrency(invoice.tgtcthue)}
              </td>
              <td className="px-3 py-3 text-sm text-right text-gray-900 font-medium">
                {formatCurrency(invoice.tgtthue)}
              </td>
              <td className="px-3 py-3 text-sm text-right text-gray-900 font-bold">
                {formatCurrency(invoice.tgtttbso)}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                <div className="truncate max-w-[150px]" title={(invoice as any).tgtttbchu}>
                  {(invoice as any).tgtttbchu || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).thlap || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).ttcktmai || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  (invoice as any).tthai === '1' || (invoice as any).tthai === 'active'
                    ? 'bg-green-100 text-green-800' 
                    : (invoice as any).tthai === '0' || (invoice as any).tthai === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {(invoice as any).tthai === '1' || (invoice as any).tthai === 'active' ? 'Hợp lệ' : 
                   (invoice as any).tthai === '0' || (invoice as any).tthai === 'cancelled' ? 'Đã hủy' : 
                   (invoice as any).tthai || 'N/A'}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).tttbao || 'N/A'}
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">
                {(invoice as any).ttxly || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {pagination.page + 1} / {pagination.totalPages}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(0)}
              disabled={pagination.page === 0}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const startPage = Math.max(0, Math.min(pagination.page - 2, pagination.totalPages - 5));
              const pageNumber = startPage + i;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 text-sm rounded ${
                    pageNumber === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages - 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => handlePageChange(pagination.totalPages - 1)}
              disabled={pagination.page === pagination.totalPages - 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;