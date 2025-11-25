'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface OrderStatusComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const statuses = [
  { value: 'PENDING', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
];

export function OrderStatusCombobox({ value, onChange, disabled }: OrderStatusComboboxProps) {
  const [open, setOpen] = useState(false);
  
  const selectedStatus = statuses.find((status) => status.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between h-8"
          disabled={disabled}
        >
          {selectedStatus ? (
            <Badge className={cn('text-xs', selectedStatus.color)}>
              {selectedStatus.label}
            </Badge>
          ) : (
            'Chọn trạng thái...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Tìm trạng thái..." />
          <CommandEmpty>Không tìm thấy trạng thái.</CommandEmpty>
          <CommandGroup>
            {statuses.map((status) => (
              <CommandItem
                key={status.value}
                value={status.value}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === status.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
