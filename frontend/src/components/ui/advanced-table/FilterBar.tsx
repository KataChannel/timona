'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { FilterCondition, ColumnDef, FilterType } from './types';
import { X, Filter, Plus } from 'lucide-react';

interface FilterBarProps<T> {
  columns: ColumnDef<T>[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  globalSearch: string;
  onGlobalSearchChange: (search: string) => void;
}

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'After' },
    { value: 'lessThan', label: 'Before' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'in', label: 'In' },
  ],
  boolean: [
    { value: 'equals', label: 'Equals' },
  ],
};

export function FilterBar<T>({ 
  columns, 
  filters, 
  onFiltersChange, 
  globalSearch, 
  onGlobalSearchChange 
}: FilterBarProps<T>) {
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<FilterCondition>>({});

  const filterableColumns = useMemo(() => columns.filter(col => col.filterable !== false), [columns]);

  // Reset newFilter when closing popover
  const handleClosePopover = useCallback((open: boolean) => {
    setIsAddingFilter(open);
    if (!open) {
      setNewFilter({});
    }
  }, []);

  const addFilter = useCallback(() => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined && newFilter.value !== '') {
      const filter: FilterCondition = {
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
        value2: newFilter.value2,
      };
      onFiltersChange([...filters, filter]);
      setNewFilter({});
      setIsAddingFilter(false);
    }
  }, [newFilter, filters, onFiltersChange]);

  const removeFilter = useCallback((index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const updateFilter = useCallback((index: number, updates: Partial<FilterCondition>) => {
    const newFilters = filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    );
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const getColumnType = useCallback((field: string): FilterType => {
    const column = columns.find(col => col.field === field);
    return (column?.type as FilterType) || 'text';
  }, [columns]);

  const getOperators = useCallback((type: FilterType) => {
    return OPERATORS[type] || OPERATORS.text;
  }, []);

  const renderFilterValue = (filter: FilterCondition, index: number) => {
    const column = columns.find(col => col.field === filter.field);
    const type = getColumnType(filter.field);

    if (type === 'select' && column?.filterOptions) {
      return (
        <Select
          value={filter.value}
          onValueChange={(value) => updateFilter(index, { value })}
        >
          <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.filterOptions.map(option => (
              <SelectItem key={option} value={option} className="text-xs sm:text-sm">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'boolean') {
      return (
        <Select
          value={String(filter.value)}
          onValueChange={(value) => updateFilter(index, { value: value === 'true' })}
        >
          <SelectTrigger className="w-full sm:w-24 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs sm:text-sm">True</SelectItem>
            <SelectItem value="false" className="text-xs sm:text-sm">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
          value={filter.value || ''}
          onChange={(e) => updateFilter(index, { value: e.target.value })}
          className="w-full sm:w-32 text-xs sm:text-sm"
          placeholder="Value"
        />
        {filter.operator === 'between' && (
          <Input
            type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
            value={filter.value2 || ''}
            onChange={(e) => updateFilter(index, { value2: e.target.value })}
            className="w-full sm:w-32 text-xs sm:text-sm"
            placeholder="To"
          />
        )}
      </div>
    );
  };

  const renderNewFilterValue = () => {
    if (!newFilter.field) return null;
    
    const column = columns.find(col => col.field === newFilter.field);
    const type = getColumnType(newFilter.field);

    if (type === 'select' && column?.filterOptions) {
      return (
        <Select
          value={newFilter.value}
          onValueChange={(value) => setNewFilter({ ...newFilter, value })}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {column.filterOptions.map(option => (
              <SelectItem key={option} value={option} className="text-xs sm:text-sm">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'boolean') {
      return (
        <Select
          value={newFilter.value !== undefined ? String(newFilter.value) : undefined}
          onValueChange={(value) => setNewFilter({ ...newFilter, value: value === 'true' })}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs sm:text-sm">True</SelectItem>
            <SelectItem value="false" className="text-xs sm:text-sm">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
          value={newFilter.value || ''}
          onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
          className="w-full text-xs sm:text-sm"
          placeholder="Value"
        />
        {newFilter.operator === 'between' && (
          <Input
            type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
            value={newFilter.value2 || ''}
            onChange={(e) => setNewFilter({ ...newFilter, value2: e.target.value })}
            className="w-full text-xs sm:text-sm"
            placeholder="To"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border-b bg-gray-50">
      {/* Global Search - Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <Input
          placeholder="Global search..."
          value={globalSearch}
          onChange={(e) => onGlobalSearchChange(e.target.value)}
          className="flex-1 sm:max-w-md text-sm"
        />
        
        <Popover open={isAddingFilter} onOpenChange={handleClosePopover}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[95vw] sm:w-96 max-w-md">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-medium text-sm sm:text-base">Add Filter</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select
                  value={newFilter.field}
                  onValueChange={(value) => setNewFilter({ ...newFilter, field: value, operator: undefined, value: undefined })}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Column" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableColumns.map(col => (
                      <SelectItem key={String(col.field)} value={String(col.field)} className="text-xs sm:text-sm">
                        {col.headerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {newFilter.field && (
                  <Select
                    value={newFilter.operator}
                    onValueChange={(value) => setNewFilter({ ...newFilter, operator: value as any, value: undefined })}
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperators(getColumnType(newFilter.field)).map(op => (
                        <SelectItem key={op.value} value={op.value} className="text-xs sm:text-sm">
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {newFilter.field && newFilter.operator && (
                <div>
                  {renderNewFilterValue()}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingFilter(false)}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={addFilter}
                  disabled={!newFilter.field || !newFilter.operator || newFilter.value === undefined || newFilter.value === ''}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters - Responsive */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
          <span className="text-xs sm:text-sm text-gray-600 flex items-center flex-shrink-0">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Filters:
          </span>
          {filters.map((filter, index) => {
            const column = columns.find(col => col.field === filter.field);
            return (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs">
                <span className="font-medium">{column?.headerName}</span>
                <span className="opacity-75 hidden sm:inline">
                  {OPERATORS[getColumnType(filter.field)]?.find(op => op.value === filter.operator)?.label}
                </span>
                <span className="truncate max-w-[80px] sm:max-w-none">{String(filter.value)}</span>
                {filter.value2 && <span className="hidden sm:inline">- {String(filter.value2)}</span>}
                <button
                  onClick={() => removeFilter(index)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </Badge>
            );
          })}
          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange([])}
              className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}