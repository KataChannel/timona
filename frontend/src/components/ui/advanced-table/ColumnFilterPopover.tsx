'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Filter, 
  Search, 
  Check, 
  X, 
  SortAsc, 
  SortDesc,
  ArrowUpDown,
  ListFilter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColumnDef, FilterCondition, SortDirection } from './types';

interface ColumnFilterPopoverProps<T> {
  column: ColumnDef<T>;
  data: T[];
  activeFilters: FilterCondition[];
  onAddFilter: (filter: FilterCondition) => void;
  onRemoveFilter: (field: string) => void;
  onClearColumnFilters: (field: string) => void;
  sortDirection?: SortDirection;
  onSort?: (direction: SortDirection) => void;
  children: React.ReactNode;
}

export function ColumnFilterPopover<T>({
  column,
  data,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearColumnFilters,
  sortDirection,
  onSort,
  children
}: ColumnFilterPopoverProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique values from data for this column
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    data.forEach(row => {
      const value = column.valueGetter ? column.valueGetter(row) : row[column.field];
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  }, [data, column]);

  // Filter unique values based on search
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const lower = searchTerm.toLowerCase();
    return uniqueValues.filter(val => val.toLowerCase().includes(lower));
  }, [uniqueValues, searchTerm]);

  // Get active filters for this column
  const columnFilters = useMemo(() => {
    return activeFilters.filter(f => f.field === String(column.field));
  }, [activeFilters, column.field]);

  // Initialize selected values from active filters
  useMemo(() => {
    const inFilters = columnFilters
      .filter(f => f.operator === 'in')
      .flatMap(f => f.value || []);
    
    const equalsFilters = columnFilters
      .filter(f => f.operator === 'equals')
      .map(f => String(f.value));
    
    setSelectedValues(new Set([...inFilters, ...equalsFilters]));
  }, [columnFilters]);

  // Count of active filters
  const filterCount = columnFilters.length;

  // Handle select all / deselect all
  const handleSelectAll = useCallback(() => {
    setSelectedValues(new Set(filteredValues));
  }, [filteredValues]);

  const handleDeselectAll = useCallback(() => {
    setSelectedValues(new Set());
  }, []);

  // Handle individual checkbox
  const handleToggleValue = useCallback((value: string) => {
    setSelectedValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  // Apply filters
  const handleApplyFilter = useCallback(() => {
    // Clear existing filters for this column
    onClearColumnFilters(String(column.field));

    // Add new filter based on selected values
    if (selectedValues.size > 0) {
      if (selectedValues.size === 1) {
        // Single value - use equals
        onAddFilter({
          field: String(column.field),
          operator: 'equals',
          value: Array.from(selectedValues)[0]
        });
      } else {
        // Multiple values - use in
        onAddFilter({
          field: String(column.field),
          operator: 'in',
          value: Array.from(selectedValues)
        });
      }
    }

    setOpen(false);
  }, [selectedValues, column.field, onAddFilter, onClearColumnFilters]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSelectedValues(new Set());
    onClearColumnFilters(String(column.field));
    setSearchTerm('');
  }, [column.field, onClearColumnFilters]);

  // Handle sort
  const handleSort = useCallback((direction: SortDirection) => {
    onSort?.(direction);
    // Don't close popover on sort
  }, [onSort]);

  // Statistics
  const stats = useMemo(() => {
    const total = uniqueValues.length;
    const selected = selectedValues.size;
    const visible = filteredValues.length;
    return { total, selected, visible };
  }, [uniqueValues.length, selectedValues.size, filteredValues.length]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="start"
        side="bottom"
        sideOffset={5}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">{column.headerName}</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filterCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Options */}
        {column.sortable !== false && (
          <div className="px-2 py-2 border-b">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort(sortDirection === 'asc' ? null : 'asc')}
                className={cn(
                  "justify-start h-8 text-xs",
                  sortDirection === 'asc' && "bg-blue-50 text-blue-700"
                )}
              >
                <SortAsc className="w-4 h-4 mr-2" />
                Sort A → Z
                {sortDirection === 'asc' && <Check className="w-4 h-4 ml-auto" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort(sortDirection === 'desc' ? null : 'desc')}
                className={cn(
                  "justify-start h-8 text-xs",
                  sortDirection === 'desc' && "bg-blue-50 text-blue-700"
                )}
              >
                <SortDesc className="w-4 h-4 mr-2" />
                Sort Z → A
                {sortDirection === 'desc' && <Check className="w-4 h-4 ml-auto" />}
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        {/* Filter by values */}
        <div className="px-3 py-2 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">
              Filter by values ({stats.selected}/{stats.visible})
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-6 px-2 text-xs"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectAll}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Values List */}
        <ScrollArea className="max-h-64">
          <div className="px-2 py-2">
            {filteredValues.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No values found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredValues.map((value) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedValues.has(value)}
                      onCheckedChange={() => handleToggleValue(value)}
                    />
                    <span className="text-sm flex-1 truncate" title={value}>
                      {value}
                    </span>
                    {selectedValues.has(value) && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-3 py-3 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={filterCount === 0}
            className="text-xs"
          >
            Clear Filters
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilter}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
