'use client';

import { Search, Filter, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ORDER_STATUS_OPTIONS, type OrderFilterOptions } from '@/types/order.types';
import { cn } from '@/lib/utils';

interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  openStatusCombobox: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onComboboxOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * OrderFilters Component
 * 
 * Mobile-First responsive filter controls for orders
 * Uses Combobox for status selection (following rule 11)
 * Includes search input for order number and product name
 * 
 * @param searchQuery - Current search query
 * @param statusFilter - Current status filter value
 * @param openStatusCombobox - Combobox open state
 * @param onSearchChange - Search input change handler
 * @param onStatusChange - Status filter change handler
 * @param onComboboxOpenChange - Combobox open state handler
 * @param className - Additional CSS classes
 */
export function OrderFilters({
  searchQuery,
  statusFilter,
  openStatusCombobox,
  onSearchChange,
  onStatusChange,
  onComboboxOpenChange,
  className,
}: OrderFiltersProps) {
  const selectedStatus = ORDER_STATUS_OPTIONS.find(
    (status) => status.value === statusFilter
  );

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      {/* Search Input - Mobile First */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm theo mã đơn hàng hoặc sản phẩm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 sm:h-10 text-sm"
        />
      </div>

      {/* Status Filter Combobox - Following Rule 11 */}
      <Popover open={openStatusCombobox} onOpenChange={onComboboxOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openStatusCombobox}
            aria-label="Chọn trạng thái đơn hàng"
            className="w-full sm:w-[200px] justify-between h-9 sm:h-10 text-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedStatus?.label || 'Tất cả'}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm trạng thái..." className="h-9" />
            <CommandList>
              <CommandEmpty>Không tìm thấy trạng thái.</CommandEmpty>
              <CommandGroup>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(currentValue) => {
                      onStatusChange(
                        currentValue.toUpperCase() === statusFilter
                          ? 'ALL'
                          : currentValue.toUpperCase()
                      );
                      onComboboxOpenChange(false);
                    }}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        statusFilter === status.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
