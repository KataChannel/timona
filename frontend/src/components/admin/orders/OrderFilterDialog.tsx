'use client';

import { useState } from 'react';
import { Filter, X, Check, ChevronsUpDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ============================================================================
// Types & Configs
// ============================================================================

interface FilterValues {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface OrderFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
  currentFilters?: FilterValues;
}

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  { value: 'PROCESSING', label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED', label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'DELIVERED', label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
];

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PROCESSING', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  { value: 'PAID', label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  { value: 'FAILED', label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' },
];

// ============================================================================
// Component
// ============================================================================

export function OrderFilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters = {},
}: OrderFilterDialogProps) {
  const [filters, setFilters] = useState<FilterValues>(currentFilters);
  const [statusOpen, setStatusOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const selectedStatus = ORDER_STATUSES.find((s) => s.value === filters.status);
  const selectedPayment = PAYMENT_STATUSES.find((p) => p.value === filters.paymentStatus);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 flex flex-col max-h-[90vh] sm:max-w-[500px]">
        {/* HEADER - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Lọc đơn hàng
              </DialogTitle>
              <DialogDescription className="mt-1">
                {activeFilterCount > 0 ? `${activeFilterCount} bộ lọc đang áp dụng` : 'Chưa có bộ lọc nào'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Order Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trạng thái đơn hàng</Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={statusOpen}
                    className="w-full justify-between"
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
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Tìm trạng thái..." />
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setFilters({ ...filters, status: undefined });
                          setStatusOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            !filters.status ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        Tất cả trạng thái
                      </CommandItem>
                      {ORDER_STATUSES.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onSelect={(currentValue) => {
                            setFilters({ ...filters, status: currentValue });
                            setStatusOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              filters.status === status.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trạng thái thanh toán</Label>
              <Popover open={paymentOpen} onOpenChange={setPaymentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={paymentOpen}
                    className="w-full justify-between"
                  >
                    {selectedPayment ? (
                      <Badge className={cn('text-xs', selectedPayment.color)}>
                        {selectedPayment.label}
                      </Badge>
                    ) : (
                      'Chọn trạng thái thanh toán...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Tìm trạng thái..." />
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setFilters({ ...filters, paymentStatus: undefined });
                          setPaymentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            !filters.paymentStatus ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        Tất cả trạng thái
                      </CommandItem>
                      {PAYMENT_STATUSES.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.value}
                          onSelect={(currentValue) => {
                            setFilters({ ...filters, paymentStatus: currentValue });
                            setPaymentOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              filters.paymentStatus === status.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Khoảng thời gian</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Từ ngày</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Đến ngày</Label>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Amount Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Khoảng giá trị đơn hàng</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Từ (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Đến (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="999999999"
                    value={filters.maxAmount || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">Bộ lọc đang áp dụng</p>
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.status && (
                    <Badge variant="outline" className="gap-1">
                      {ORDER_STATUSES.find((s) => s.value === filters.status)?.label}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, status: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.paymentStatus && (
                    <Badge variant="outline" className="gap-1">
                      {PAYMENT_STATUSES.find((p) => p.value === filters.paymentStatus)?.label}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, paymentStatus: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.dateFrom && (
                    <Badge variant="outline" className="gap-1">
                      Từ {filters.dateFrom}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, dateFrom: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.dateTo && (
                    <Badge variant="outline" className="gap-1">
                      Đến {filters.dateTo}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, dateTo: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.minAmount && (
                    <Badge variant="outline" className="gap-1">
                      Min: {filters.minAmount.toLocaleString()} đ
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, minAmount: undefined })}
                      />
                    </Badge>
                  )}
                  {filters.maxAmount && (
                    <Badge variant="outline" className="gap-1">
                      Max: {filters.maxAmount.toLocaleString()} đ
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setFilters({ ...filters, maxAmount: undefined })}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* FOOTER - Fixed */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Xóa bộ lọc
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Áp dụng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
