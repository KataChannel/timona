'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

// Types
import { UserConfig, DateRange, GroupBy, SortField, SortDirection } from './types';

// Components
import {
  ConfigModal,
  SummaryCards,
  FilterToolbar,
  InventoryTable,
  Pagination,
} from './components';

// Hooks
import { useInventoryData, useInventoryFilter, usePagination, useDebouncedValue } from './hooks';

// Utils
import {
  getUserConfig,
  saveUserConfig,
  getDefaultDateRange,
  calculateInventory,
  calculateOpeningBalance,
  calculateSummary,
  exportToExcel,
} from './utils';

export default function XuatNhapTonPage() {
  // User configuration
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  // Date range
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300); // 300ms debounce
  const [isSearching, setIsSearching] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('ma');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Display limits
  const DISPLAY_LIMIT = 100; // Limit records shown on UI
  const [itemsPerPage] = useState(50);
  
  // Data loading
  const {
    invoices,
    details,
    products,
    loading,
    error,
    isReady,
    refetch,
  } = useInventoryData();
  
  // Load user config from localStorage on mount
  useEffect(() => {
    const config = getUserConfig();
    if (config) {
      setUserConfig(config);
    } else {
      // Show config modal if no config exists
      setShowConfigModal(true);
    }
  }, []);
  
  // Calculate inventory rows
  const inventoryRows = useMemo(() => {
    if (!userConfig || !isReady) {
      console.log('⚠️ Inventory calculation skipped:', { 
        hasUserConfig: !!userConfig, 
        isReady,
        userConfig 
      });
      return [];
    }
    
    console.log('📊 Calculating inventory with:', {
      invoicesCount: invoices.length,
      detailsCount: details.length,
      productsCount: products.length,
      userMST: userConfig.mst,
      groupBy,
      dateRange,
      periodStartDate: dateRange.periodStartDate,
      sampleInvoice: invoices[0],
      sampleDetail: details[0],
      sampleProduct: products[0],
    });
    
    // Debug: Check if invoices have nbmst/nmmst matching userMST
    const userMSTLower = userConfig.mst.trim().toLowerCase();
    const matchingSales = invoices.filter(inv => inv.nbmst?.trim().toLowerCase() === userMSTLower);
    const matchingPurchases = invoices.filter(inv => inv.nmmst?.trim().toLowerCase() === userMSTLower);
    
    console.log('🔍 MST Matching Debug:', {
      userMST: userConfig.mst,
      userMSTLower,
      matchingSalesCount: matchingSales.length,
      matchingPurchasesCount: matchingPurchases.length,
      sampleSaleInvoice: matchingSales[0],
      samplePurchaseInvoice: matchingPurchases[0],
      firstInvoiceNbmst: invoices[0]?.nbmst,
      firstInvoiceNmmst: invoices[0]?.nmmst,
    });
    
    // Calculate opening balance if periodStartDate is set
    let openingBalances: Map<string, any> | undefined;
    if (dateRange.periodStartDate) {
      console.log('🔵 Calculating opening balance from period start:', dateRange.periodStartDate);
      openingBalances = calculateOpeningBalance(
        invoices,
        details,
        products,
        userConfig.mst,
        groupBy,
        dateRange.periodStartDate
      );
      console.log('✅ Opening balance calculated for', openingBalances.size, 'products');
    }
    
    const result = calculateInventory(
      invoices,
      details,
      products,
      userConfig.mst,
      groupBy,
      dateRange.startDate,
      dateRange.endDate,
      openingBalances
    );
    
    console.log('✅ Inventory rows calculated:', result.length);
    if (result.length > 0) {
      console.log('Sample result rows (first 3):', result.slice(0, 3));
    } else {
      console.warn('⚠️ No inventory rows generated! Check MST matching logic.');
    }
    
    return result;
  }, [invoices, details, products, userConfig, groupBy, dateRange, isReady]);
  
  // Apply filters and sorting with debounced search
  const filteredRows = useInventoryFilter({
    rows: inventoryRows,
    searchTerm: debouncedSearchTerm,
    sortField,
    sortDirection,
  });
  
  // Track search loading state
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);
  
  console.log('🔍 Filtered rows:', filteredRows.length, { searchTerm: debouncedSearchTerm, sortField, sortDirection });
  
  // Limit display rows for performance
  const totalRecords = filteredRows.length;
  const displayRows = filteredRows.slice(0, DISPLAY_LIMIT);
  const isLimited = totalRecords > DISPLAY_LIMIT;
  
  // Calculate summary from display rows for performance
  const summary = useMemo(() => calculateSummary(displayRows), [displayRows]);
  
  // Pagination (using display rows)
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination({
    totalItems: displayRows.length,
    itemsPerPage,
  });
  
  // Handlers
  const handleSaveConfig = (config: UserConfig) => {
    saveUserConfig(config);
    setUserConfig(config);
    setShowConfigModal(false);
    toast.success('Đã lưu cấu hình MST');
  };
  
  const handleExport = () => {
    if (!userConfig) {
      toast.error('Vui lòng cấu hình MST trước');
      setShowConfigModal(true);
      return;
    }
    
    if (filteredRows.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }
    
    try {
      // Calculate full summary from all filtered rows for export
      const fullSummary = calculateSummary(filteredRows);
      
      exportToExcel(
        filteredRows,
        fullSummary,
        dateRange,
        userConfig.companyName || 'Công ty'
      );
      toast.success(`Đã xuất ${filteredRows.length.toLocaleString()} bản ghi ra Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };
  
  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Đã làm mới dữ liệu');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Lỗi khi làm mới dữ liệu');
    }
  };
  
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Show error if data loading failed
  useEffect(() => {
    if (error.any) {
      if (error.invoices) toast.error(`Lỗi tải hóa đơn: ${error.invoices}`);
      if (error.details) toast.error(`Lỗi tải chi tiết: ${error.details}`);
      if (error.products) toast.error(`Lỗi tải sản phẩm: ${error.products}`);
    }
  }, [error]);
  
  // Warning if no config
  const showWarning = !userConfig && !showConfigModal;
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Báo Cáo Xuất Nhập Tồn</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi xuất nhập tồn kho theo hóa đơn
        </p>
        {userConfig && (
          <p className="text-sm text-muted-foreground mt-1">
            MST: <span className="font-medium">{userConfig.mst}</span>
            {userConfig.companyName && ` - ${userConfig.companyName}`}
          </p>
        )}
      </div>
      
      {/* Warning Alert */}
      {showWarning && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            <span className="font-medium">Cần cấu hình MST:</span> Vui lòng cấu hình mã số thuế (MST) để phân loại hóa đơn bán/mua.{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-yellow-800 underline"
              onClick={() => setShowConfigModal(true)}
            >
              Cấu hình ngay
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Config Modal */}
      <ConfigModal
        isOpen={showConfigModal}
        currentConfig={userConfig}
        onSave={handleSaveConfig}
        onClose={() => setShowConfigModal(false)}
      />
      
      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={loading.any} />
      
      {/* Filter Toolbar */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onSearch={() => {
          toast.info(`Tìm thấy ${totalRecords} bản ghi${isLimited ? `, hiển thị ${DISPLAY_LIMIT} đầu tiên` : ''}`);
        }}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onExport={handleExport}
        onRefresh={handleRefresh}
        onConfig={() => setShowConfigModal(true)}
        loading={loading.any}
        totalRecords={totalRecords}
        displayedRecords={displayRows.length}
        isSearching={isSearching}
      />
      
      {/* Inventory Table */}
      <InventoryTable
        rows={displayRows}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        loading={loading.any}
        totalRecords={totalRecords}
        isLimited={isLimited}
        searchTerm={debouncedSearchTerm}
        isSearching={isSearching}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={displayRows.length}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        totalRecords={totalRecords}
        isLimited={isLimited}
      />
    </div>
  );
}
