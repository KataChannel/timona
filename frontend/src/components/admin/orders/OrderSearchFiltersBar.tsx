/**
 * Order Search & Filters Bar Component
 * Thanh tìm kiếm và nút filters
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';

interface OrderSearchFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onExportClick: () => void;
}

export default function OrderSearchFiltersBar({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onExportClick,
}: OrderSearchFiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo mã đơn, email, địa chỉ..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button */}
      <Button variant="outline" onClick={onFilterClick}>
        <Filter className="h-4 w-4 mr-2" />
        Lọc đơn hàng
      </Button>

      {/* Export Button */}
      <Button variant="outline" onClick={onExportClick}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Xuất Excel</span>
      </Button>
    </div>
  );
}
