'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ColumnDef, SortDirection, ColumnPinPosition, FilterCondition, RowData } from './types';
import { ColumnFilterPopover } from './ColumnFilterPopover';
import { ChevronUp, ChevronDown, MoreHorizontal, Pin, PinOff, Eye, EyeOff, Maximize2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnHeaderProps<T extends RowData> {
  column: ColumnDef<T>;
  data: T[];
  sortDirection?: SortDirection;
  sortPriority?: number;
  activeFilters: FilterCondition[];
  onSort?: (direction: SortDirection) => void;
  onPin?: (position: ColumnPinPosition) => void;
  onHide?: () => void;
  onAutoSize?: () => void;
  onResize?: (width: number) => void;
  onAddFilter?: (filter: FilterCondition) => void;
  onRemoveFilter?: (field: string) => void;
  onClearColumnFilters?: (field: string) => void;
  width: number;
  isResizing?: boolean;
}

export function ColumnHeader<T extends RowData>({
  column,
  data,
  sortDirection,
  sortPriority,
  activeFilters,
  onSort,
  onPin,
  onHide,
  onAutoSize,
  onResize,
  onAddFilter,
  onRemoveFilter,
  onClearColumnFilters,
  width,
  isResizing
}: ColumnHeaderProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleSortClick = () => {
    if (!column.sortable) return;
    
    let newDirection: SortDirection;
    if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortDirection === 'desc') {
      newDirection = null;
    } else {
      newDirection = 'asc';
    }
    
    onSort?.(newDirection);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!column.resizable) return;
    
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(50, startWidthRef.current + diff);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  const getSortIcon = () => {
    if (!column.sortable) return null;
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4" />;
    }
    
    return (
      <div className="flex flex-col opacity-50">
        <ChevronUp className="w-3 h-3 -mb-1" />
        <ChevronDown className="w-3 h-3" />
      </div>
    );
  };

  const getPinIcon = () => {
    if (column.pinned === 'left') return <Pin className="w-4 h-4 rotate-45" />;
    if (column.pinned === 'right') return <Pin className="w-4 h-4 -rotate-45" />;
    return <PinOff className="w-4 h-4" />;
  };

  // Get filter count for this column
  const columnFilterCount = activeFilters.filter(f => f.field === String(column.field)).length;

  return (
    <div
      className={cn(
        'group relative flex items-center h-full w-full px-2 select-none',
        'border-r border-gray-200 bg-gray-50',
        'hover:bg-gray-100 transition-colors',
        column.headerClass,
        column.pinned === 'left' && 'bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]',
        column.pinned === 'right' && 'bg-white shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]'
      )}
    >
      <div className="flex items-center justify-between w-full min-w-0 gap-1">
        <div 
          className={cn(
            "flex items-center gap-1 min-w-0 flex-1",
            column.sortable && 'cursor-pointer'
          )}
          onClick={handleSortClick}
        >
          <span className="font-semibold text-xs text-gray-700 truncate">
            {column.headerName}
          </span>
          {sortPriority !== undefined && sortPriority > 0 && (
            <span className="text-[10px] bg-blue-500 text-white px-1 rounded min-w-[16px] text-center">
              {sortPriority + 1}
            </span>
          )}
          {column.sortable && (
            <span className="text-gray-400 transition-colors group-hover:text-gray-600">
              {getSortIcon()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Google Sheets-style Filter Icon */}
          {column.filterable !== false && (
            <ColumnFilterPopover
              column={column}
              data={data}
              activeFilters={activeFilters}
              onAddFilter={onAddFilter!}
              onRemoveFilter={onRemoveFilter!}
              onClearColumnFilters={onClearColumnFilters!}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-5 w-5 p-0 rounded",
                  columnFilterCount > 0 
                    ? "opacity-100 text-green-600 hover:text-green-700 hover:bg-green-50" 
                    : "opacity-0 group-hover:opacity-100 hover:text-gray-700 hover:bg-gray-200"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Filter className="w-3.5 h-3.5" />
                {columnFilterCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 p-0 flex items-center justify-center text-[8px] bg-green-600 text-white border border-white"
                  >
                    {columnFilterCount}
                  </Badge>
                )}
              </Button>
            </ColumnFilterPopover>
          )}
          
          {/* More Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {column.sortable && (
                <>
                  <DropdownMenuItem onClick={() => onSort?.('asc')}>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Sort Ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort?.('desc')}>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Sort Descending
                  </DropdownMenuItem>
                  {sortDirection && (
                    <DropdownMenuItem onClick={() => onSort?.(null)}>
                      Clear Sort
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={() => onPin?.(column.pinned === 'left' ? null : 'left')}>
                <Pin className="w-4 h-4 mr-2 rotate-45" />
                {column.pinned === 'left' ? 'Unpin' : 'Pin Left'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin?.(column.pinned === 'right' ? null : 'right')}>
                <Pin className="w-4 h-4 mr-2 -rotate-45" />
                {column.pinned === 'right' ? 'Unpin' : 'Pin Right'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {column.resizable && (
                <>
                  <DropdownMenuItem onClick={onAutoSize}>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Auto Size Column
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={onHide}>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Resize handle */}
      {column.resizable && (
        <div
          ref={resizeRef}
          className={cn(
            'absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-400 z-10',
            isDragging && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}