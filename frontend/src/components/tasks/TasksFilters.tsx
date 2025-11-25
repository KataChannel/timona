'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TaskStatus, TaskPriority, TaskCategory } from '@/types/todo';

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: TaskCategory | 'all';
  tab?: 'all' | 'my' | 'shared';
}

interface TasksFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  myTasksCount: number;
  sharedTasksCount: number;
  allTasksCount: number;
}

export function TasksFilters({
  filters,
  onFiltersChange,
  myTasksCount,
  sharedTasksCount,
  allTasksCount,
}: TasksFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      status: 'all',
      priority: 'all',
      category: 'all',
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.tab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, tab: 'all' })}
          className="gap-2"
        >
          All Tasks
          <Badge variant="secondary" className="ml-1">
            {allTasksCount}
          </Badge>
        </Button>
        <Button
          variant={filters.tab === 'my' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, tab: 'my' })}
          className="gap-2"
        >
          My Tasks
          <Badge variant="secondary" className="ml-1">
            {myTasksCount}
          </Badge>
        </Button>
        <Button
          variant={filters.tab === 'shared' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ ...filters, tab: 'shared' })}
          className="gap-2"
        >
          Shared
          <Badge variant="secondary" className="ml-1">
            {sharedTasksCount}
          </Badge>
        </Button>
      </div>

      <Separator />

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters:
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value as TaskStatus | 'all' })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, priority: value as TaskPriority | 'all' })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value as TaskCategory | 'all' })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value={TaskCategory.PERSONAL}>Personal</SelectItem>
            <SelectItem value={TaskCategory.WORK}>Work</SelectItem>
            <SelectItem value={TaskCategory.STUDY}>Study</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
