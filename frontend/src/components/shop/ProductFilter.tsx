'use client';

import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'bestseller' | 'popular';

interface ProductFilterProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  totalProducts?: number;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: string }> = [
  { value: 'newest', label: 'Mới nhất', icon: '🆕' },
  { value: 'price-low', label: 'Giá thấp đến cao', icon: '⬆️' },
  { value: 'price-high', label: 'Giá cao đến thấp', icon: '⬇️' },
  { value: 'bestseller', label: 'Bán chạy nhất', icon: '🔥' },
  { value: 'popular', label: 'Phổ biến nhất', icon: '⭐' },
];

export function ProductFilter({
  searchQuery = '',
  onSearchChange,
  sortBy = 'newest',
  onSortChange,
  totalProducts = 0,
  className,
}: ProductFilterProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const currentSort = SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className={cn('bg-white p-4 rounded-lg border', className)}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={localSearch}
              onChange={handleSearchChange}
              className="pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </form>

        {/* Product Count */}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          <span className="font-semibold text-foreground">{totalProducts}</span> sản phẩm
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap">
              {currentSort.icon} {currentSort.label}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="py-1.5">Sắp xếp theo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange?.(option.value)}
                className={cn(
                  'cursor-pointer',
                  sortBy === option.value && 'bg-primary/10'
                )}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
