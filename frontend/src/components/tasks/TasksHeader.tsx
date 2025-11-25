'use client';

import React from 'react';
import { Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface TasksHeaderProps {
  totalTasks: number;
  onCreateTask: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onFilterChange?: (filters: any) => void;
}

export function TasksHeader({
  totalTasks,
  onCreateTask,
  onSearch,
  searchQuery,
  onFilterChange,
}: TasksHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your tasks efficiently
          </p>
        </div>
        <Button onClick={onCreateTask} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <span>Status</span>
                <Badge variant="secondary" className="ml-2">
                  All
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <span>Priority</span>
                <Badge variant="secondary" className="ml-2">
                  All
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <span>Category</span>
                <Badge variant="secondary" className="ml-2">
                  All
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Clear all filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stats Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{totalTasks}</span>
          <span className="text-sm text-muted-foreground">
            {totalTasks === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
    </div>
  );
}
