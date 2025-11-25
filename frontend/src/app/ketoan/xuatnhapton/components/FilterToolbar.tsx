import React, { useState, useEffect } from 'react';
import { DateRange, GroupBy, SortField, SortDirection } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Settings, RefreshCw, FileSpreadsheet, ArrowUpDown, Loader2 } from 'lucide-react';

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onSearch: () => void; // New callback for search button
  groupBy: GroupBy;
  onGroupByChange: (value: GroupBy) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onExport: () => void;
  onRefresh: () => void;
  onConfig: () => void;
  loading?: boolean;
  totalRecords?: number;
  displayedRecords?: number;
  isSearching?: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onSearch,
  groupBy,
  onGroupByChange,
  sortField,
  sortDirection,
  onSortChange,
  onExport,
  onRefresh,
  onConfig,
  loading,
  totalRecords = 0,
  displayedRecords = 0,
  isSearching = false,
}) => {
  // Local state for date range to prevent auto-reload
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  
  // Sync local state when parent date range changes
  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);
  
  // Handle search button click
  const handleSearch = () => {
    onDateRangeChange(localDateRange);
    onSearch();
  };
  
  // Check if date range has changed
  const hasDateChanged = localDateRange.startDate !== dateRange.startDate || 
                        localDateRange.endDate !== dateRange.endDate ||
                        localDateRange.periodStartDate !== dateRange.periodStartDate;
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 space-y-4">
        {/* Period Start Info */}
        {localDateRange.periodStartDate && (
          <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-2 rounded-md">
            <span className="text-green-700 dark:text-green-300">
              🔵 <strong>Ngày chốt đầu kỳ:</strong> {new Date(localDateRange.periodStartDate).toLocaleDateString('vi-VN')}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">
              (Tồn đầu tính từ 5 năm trước)
            </span>
          </div>
        )}
        
        {/* Records Info */}
        {totalRecords > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-md">
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Tổng số: {totalRecords.toLocaleString()} bản ghi
            </span>
            {totalRecords !== displayedRecords && (
              <>
                <span>•</span>
                <span className="text-amber-700 dark:text-amber-300">
                  Hiển thị: {displayedRecords.toLocaleString()} bản ghi
                </span>
                <span className="text-xs">(Xuất Excel để xem đầy đủ)</span>
              </>
            )}
          </div>
        )}
        
        {/* Row 1: Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm theo tên, mã sản phẩm, đơn vị..."
              className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="default" onClick={onConfig}>
              <Settings className="h-4 w-4 mr-2" />
              Cấu Hình
            </Button>
            
            <Button
              variant="outline"
              size="default"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm Mới
            </Button>
            
            <Button variant="default" size="default" onClick={onExport}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
        
        {/* Row 2: Date Range & Period Start */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="periodStartDate" className="flex items-center gap-1">
              Ngày Chốt Đầu Kỳ
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="periodStartDate"
              type="date"
              value={localDateRange.periodStartDate || ''}
              onChange={(e) => setLocalDateRange({ ...localDateRange, periodStartDate: e.target.value || undefined })}
              placeholder="Chọn ngày chốt"
              title="Chọn ngày chốt đầu kỳ để tính tồn đầu từ 5 năm trước"
            />
            <p className="text-xs text-muted-foreground">
              Tính tồn đầu từ giao dịch 5 năm trước
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Từ Ngày</Label>
            <Input
              id="startDate"
              type="date"
              value={localDateRange.startDate}
              onChange={(e) => setLocalDateRange({ ...localDateRange, startDate: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Đến Ngày</Label>
            <Input
              id="endDate"
              type="date"
              value={localDateRange.endDate}
              onChange={(e) => setLocalDateRange({ ...localDateRange, endDate: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="opacity-0">Action</Label>
            <Button 
              variant={hasDateChanged ? "default" : "outline"}
              size="default" 
              onClick={handleSearch}
              disabled={loading}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {hasDateChanged ? 'Tìm kiếm' : 'Đã cập nhật'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupBy">Nhóm Theo</Label>
            <Select value={groupBy} onValueChange={(value) => onGroupByChange(value as GroupBy)}>
              <SelectTrigger id="groupBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ma">Mã Sản Phẩm</SelectItem>
                <SelectItem value="ten2">Tên Chuẩn Hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Sắp Xếp</Label>
            <div className="flex gap-2">
              <Select
                value={sortField}
                onValueChange={(value) => onSortChange(value as SortField, sortDirection)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Ngày</SelectItem>
                  <SelectItem value="productName">Tên SP</SelectItem>
                  <SelectItem value="closingQuantity">SL Tồn</SelectItem>
                  <SelectItem value="closingAmount">TT Tồn</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
                title={sortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
