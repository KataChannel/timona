'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { VirtualScroll } from '../ui/VirtualScroll';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: (a: T, b: T) => number;
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: T) => boolean;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any[];
}

export interface ResponsiveDataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  rowKey: string | ((record: T) => string);
  loading?: boolean;
  height?: number;
  rowHeight?: number | ((record: T, index: number) => number);
  showHeader?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onSort?: (sortConfig: SortConfig | null) => void;
  onFilter?: (filterConfig: FilterConfig) => void;
  onRowClick?: (record: T, index: number) => void;
  onRowDoubleClick?: (record: T, index: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  scroll?: {
    x?: number;
    y?: number;
  };
  sticky?: boolean;
  bordered?: boolean;
  striped?: boolean;
  size?: 'small' | 'medium' | 'large';
  emptyText?: string;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
}

export function ResponsiveDataTable<T = any>({
  columns,
  data,
  rowKey,
  loading = false,
  height = 400,
  rowHeight = 50,
  showHeader = true,
  sortable = false,
  filterable = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onSort,
  onFilter,
  onRowClick,
  onRowDoubleClick,
  pagination,
  scroll,
  sticky = false,
  bordered = false,
  striped = false,
  size = 'medium',
  emptyText = 'No data',
  className = '',
  rowClassName,
  expandable,
}: ResponsiveDataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [expandedKeys, setExpandedKeys] = useState<string[]>(expandable?.expandedRowKeys || []);
  
  // Get row key
  const getRowKey = useCallback((record: T, index: number): string => {
    return typeof rowKey === 'function' ? rowKey(record) : (record as any)[rowKey] || String(index);
  }, [rowKey]);
  
  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply filters
    Object.entries(filterConfig).forEach(([key, values]) => {
      if (values.length > 0) {
        const column = columns.find(col => col.key === key);
        if (column?.onFilter) {
          result = result.filter(record => 
            values.some(value => column.onFilter!(value, record))
          );
        }
      }
    });
    
    return result;
  }, [data, filterConfig, columns]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      if (column.sorter) {
        const result = column.sorter(a, b);
        return sortConfig.direction === 'desc' ? -result : result;
      }
      
      const aValue = column.dataIndex ? (a as any)[column.dataIndex] : a;
      const bValue = column.dataIndex ? (b as any)[column.dataIndex] : b;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredData, sortConfig, columns]);
  
  // Handle sort
  const handleSort = useCallback((key: string) => {
    if (!sortable) return;
    
    const newSortConfig: SortConfig = {
      key,
      direction: sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    };
    
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  }, [sortable, sortConfig, onSort]);
  
  // Handle filter
  const handleFilter = useCallback((key: string, values: any[]) => {
    const newFilterConfig = {
      ...filterConfig,
      [key]: values,
    };
    
    setFilterConfig(newFilterConfig);
    onFilter?.(newFilterConfig);
  }, [filterConfig, onFilter]);
  
  // Handle selection
  const handleSelectRow = useCallback((recordKey: string, selected: boolean) => {
    if (!selectable) return;
    
    const newSelectedKeys = selected
      ? [...selectedKeys, recordKey]
      : selectedKeys.filter(key => key !== recordKey);
    
    onSelectionChange?.(newSelectedKeys);
  }, [selectable, selectedKeys, onSelectionChange]);
  
  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!selectable) return;
    
    const newSelectedKeys = selected
      ? sortedData.map((record, index) => getRowKey(record, index))
      : [];
    
    onSelectionChange?.(newSelectedKeys);
  }, [selectable, sortedData, getRowKey, onSelectionChange]);
  
  // Handle expand
  const handleExpand = useCallback((recordKey: string, expanded: boolean) => {
    const newExpandedKeys = expanded
      ? [...expandedKeys, recordKey]
      : expandedKeys.filter(key => key !== recordKey);
    
    setExpandedKeys(newExpandedKeys);
    
    if (expandable?.onExpand) {
      const record = sortedData.find((item, index) => getRowKey(item, index) === recordKey);
      if (record) {
        expandable.onExpand(expanded, record);
      }
    }
  }, [expandedKeys, expandable, sortedData, getRowKey]);
  
  // Size classes
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };
  
  // Row height based on size
  const getRowHeight = useCallback((record: T, index: number): number => {
    if (typeof rowHeight === 'function') {
      return rowHeight(record, index);
    }
    
    const baseHeight = rowHeight;
    const recordKey = getRowKey(record, index);
    const isExpanded = expandedKeys.includes(recordKey);
    
    return isExpanded ? baseHeight * 2 : baseHeight;
  }, [rowHeight, expandedKeys, getRowKey]);
  
  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div 
        className={`
          flex bg-gray-50 border-b ${bordered ? 'border-gray-200' : ''} 
          ${sticky ? 'sticky top-0 z-10' : ''}
        `}
        style={{ height: getRowHeight({} as T, -1) }}
      >
        {/* Selection header */}
        {selectable && (
          <div className="flex items-center justify-center px-4 py-2 w-12">
            <input
              type="checkbox"
              checked={selectedKeys.length === sortedData.length && sortedData.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* Expand header */}
        {expandable && (
          <div className="w-12"></div>
        )}
        
        {/* Column headers */}
        {columns.map((column) => (
          <div
            key={column.key}
            className={`
              flex items-center px-4 py-2 font-medium text-gray-700
              ${column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
              ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}
              ${column.className || ''}
            `}
            style={{
              width: column.width,
              minWidth: column.minWidth || 100,
              maxWidth: column.maxWidth,
              flex: column.width ? undefined : 1,
            }}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <span className="truncate">{column.title}</span>
            
            {/* Sort indicator */}
            {column.sortable !== false && sortable && sortConfig?.key === column.key && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
            
            {/* Filter indicator */}
            {column.filterable !== false && filterable && filterConfig[column.key]?.length > 0 && (
              <span className="ml-1 text-blue-500">●</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render row
  const renderRow = ({ item, index, style }: { item: T; index: number; style: React.CSSProperties }) => {
    const recordKey = getRowKey(item, index);
    const isSelected = selectedKeys.includes(recordKey);
    const isExpanded = expandedKeys.includes(recordKey);
    
    const rowClasses = `
      flex items-center border-b ${bordered ? 'border-gray-200' : 'border-gray-100'}
      ${striped && index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
      ${isSelected ? 'bg-blue-50' : ''}
      hover:bg-gray-50 transition-colors
      ${typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName || ''}
      ${sizeClasses[size]}
    `;
    
    return (
      <div style={style}>
        <div
          className={rowClasses}
          onClick={() => onRowClick?.(item, index)}
          onDoubleClick={() => onRowDoubleClick?.(item, index)}
        >
          {/* Selection checkbox */}
          {selectable && (
            <div className="flex items-center justify-center px-4 py-2 w-12">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleSelectRow(recordKey, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {/* Expand button */}
          {expandable && (
            <div className="flex items-center justify-center px-4 py-2 w-12">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand(recordKey, !isExpanded);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? '−' : '+'}
              </button>
            </div>
          )}
          
          {/* Column cells */}
          {columns.map((column) => {
            const value = column.dataIndex ? (item as any)[column.dataIndex] : item;
            const cellContent = column.render ? column.render(value, item, index) : String(value || '');
            
            return (
              <div
                key={column.key}
                className={`
                  px-4 py-2
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  ${column.ellipsis ? 'truncate' : ''}
                  ${column.className || ''}
                `}
                style={{
                  width: column.width,
                  minWidth: column.minWidth || 100,
                  maxWidth: column.maxWidth,
                  flex: column.width ? undefined : 1,
                }}
                title={column.ellipsis ? String(value || '') : undefined}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
        
        {/* Expanded content */}
        {expandable && isExpanded && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            {expandable.expandedRowRender(item)}
          </div>
        )}
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }
  
  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        {emptyText}
      </div>
    );
  }
  
  return (
    <div className={`responsive-data-table ${className}`}>
      {/* Header */}
      {renderHeader()}
      
      {/* Body with virtual scrolling */}
      <VirtualScroll
        items={sortedData.map((item, index) => ({
          id: getRowKey(item, index),
          data: item,
        }))}
        itemHeight={(item, index) => getRowHeight(item.data, index)}
        containerHeight={height - (showHeader ? (typeof rowHeight === 'number' ? rowHeight : 50) : 0)}
        renderItem={({ item, index, style }) => 
          renderRow({ item: item.data, index, style })
        }
        className="overflow-auto"
      />
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}