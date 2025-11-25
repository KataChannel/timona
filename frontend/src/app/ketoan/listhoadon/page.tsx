'use client'

import React, { useState, useEffect } from 'react';
import InvoiceTableAdvanced from '@/components/InvoiceTableAdvanced';
import InvoiceDetailModal from '@/components/InvoiceDetailModal';
import InvoiceImportModal from '@/components/InvoiceImportModal';
import ConfigModal from '@/components/ConfigModal';
import SyncProgressDisplay, { SyncProgress } from '@/components/SyncProgressDisplay';
import { ExcelPreviewDialog } from '@/components/ExcelPreviewDialog';
import InvoiceApiService from '@/services/invoiceApi';
import ConfigService from '@/services/configService';
import DateService from '@/services/dateService';
import { useInvoiceDatabase } from '@/services/invoiceDatabaseServiceNew';
import { InvoiceData, AdvancedFilter, InvoiceApiResponse, InvoiceType } from '@/types/invoice';
import { Search, RefreshCw, FileSpreadsheet, Settings, Calendar, Filter, ChevronDown, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';
import BackendExcelExportService from '@/services/backendExcelExport';
import FrontendExcelExportService, { InvoiceExportData } from '@/services/frontendExcelExport';

const ListHoaDonPage = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0
  });

  // Configuration state
  const [config, setConfig] = useState(ConfigService.getConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Excel Preview state
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [exportData, setExportData] = useState<InvoiceExportData[]>([]);
  
  // Database integration
  const { syncData, searchInvoices: searchDatabaseInvoices, isLoading: dbLoading } = useInvoiceDatabase();
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Sync progress state
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    currentStep: 'Chưa bắt đầu',
    totalInvoices: 0,
    processedInvoices: 0,
    savedInvoices: 0,
    skippedInvoices: 0,
    failedInvoices: 0,
    detailsFetched: 0,
    errors: [],
  });

  // Filter state - now using month/year instead of direct dates
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const { month } = DateService.getCurrentMonthYear();
    return month;
  });
  
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const { year } = DateService.getCurrentMonthYear();
    return year;
  });

  const [filter, setFilter] = useState<AdvancedFilter>(() => {
    const { month, year } = DateService.getCurrentMonthYear();
    const dateRange = DateService.getMonthDateRange(month, year);
    return {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      month,
      year,
      invoiceNumber: '',
      taxCode: '',
      buyerName: '',
      globalSearch: '',
      amountFrom: undefined,
      amountTo: undefined
    };
  });

  // Quick date range filters
  const [quickDateRange, setQuickDateRange] = useState<string>('custom');

  // Sort state
  const [sortField, setSortField] = useState<keyof InvoiceData>('tdlap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update filter when month/year changes
  useEffect(() => {
    const dateRange = DateService.getMonthDateRange(selectedMonth, selectedYear);
    setFilter(prev => ({
      ...prev,
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate,
      month: selectedMonth,
      year: selectedYear
    }));
  }, [selectedMonth, selectedYear]);

  // Sync data from external API to database
  const syncDataFromAPI = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('Đang lấy dữ liệu từ API bên ngoài...');
      
      // Reset progress
      setSyncProgress({
        status: 'fetching',
        currentStep: 'Đang lấy dữ liệu từ API bên ngoài...',
        totalInvoices: 0,
        processedInvoices: 0,
        savedInvoices: 0,
        skippedInvoices: 0,
        failedInvoices: 0,
        detailsFetched: 0,
        errors: [],
        startTime: new Date(),
      });
      
      // Update config in case it changed
      const currentConfig = ConfigService.getValidatedConfig();
      setConfig(currentConfig);

      // Validate month/year combination
      if (!filter.month || !filter.year || filter.month < 1 || filter.month > 12) {
        toast.error('Vui lòng chọn tháng và năm hợp lệ');
        setSyncProgress(prev => ({
          ...prev,
          status: 'error',
          currentStep: 'Lỗi: Tháng/năm không hợp lệ',
          errors: ['Vui lòng chọn tháng và năm hợp lệ'],
        }));
        return;
      }

      // Fetch data from external API with controlled batch size
      // Limit to 30 invoices per sync to prevent 429 errors and server overload
      const SAFE_BATCH_SIZE = 50;
      const response: InvoiceApiResponse = await InvoiceApiService.fetchInvoices(filter, {
        page: 0,
        size: SAFE_BATCH_SIZE, // Reduced from 50 to 30 to prevent server overload
        sort: `tdlap:desc,khmshdon:asc,shdon:desc`
      }, currentConfig.invoiceType);
      
      // Warn user if there are more invoices available
      if (response.totalElements && response.totalElements > SAFE_BATCH_SIZE) {
        const remaining = response.totalElements - SAFE_BATCH_SIZE;
        toast(`⚠️ Có ${response.totalElements} hóa đơn. Đang đồng bộ ${SAFE_BATCH_SIZE} đầu tiên. Còn ${remaining} hóa đơn.`, {
          duration: 5000,
          icon: 'ℹ️'
        });
        console.log(`📊 Total invoices available: ${response.totalElements}, Syncing: ${SAFE_BATCH_SIZE}, Remaining: ${remaining}`);
      }

      if (response.datas && response.datas.length > 0) {
        setSyncStatus(`Đang đồng bộ ${response.datas.length} hóa đơn vào database...`);
        
        // Update progress with total count
        setSyncProgress(prev => ({
          ...prev,
          status: 'syncing',
          currentStep: `Đang đồng bộ ${response.datas.length} hóa đơn...`,
          totalInvoices: response.datas.length,
        }));
        
        // Get bearer token and brandname from config
        const bearerToken = currentConfig.bearerToken || undefined;
        const brandname = currentConfig.brandname || undefined;
        
        // Sync to database with progress callback
        const syncResult = await syncData(
          response.datas, 
          [],
          bearerToken,
          brandname,
          (progress: { processed: number; total: number; current: string }) => {
            setSyncProgress(prev => ({
              ...prev,
              processedInvoices: progress.processed,
              currentStep: progress.current,
            }));
          }
        );
        
        if (syncResult.success) {
          toast.success(`Đã đồng bộ thành công ${syncResult.invoicesSaved} hóa đơn`);
          setSyncStatus(`Đồng bộ thành công: ${syncResult.invoicesSaved} hóa đơn`);
          
          // Calculate skipped invoices
          const skipped = response.datas.length - syncResult.invoicesSaved - syncResult.errors.length;
          
          // Update final progress
          setSyncProgress(prev => ({
            ...prev,
            status: 'completed',
            currentStep: 'Hoàn thành đồng bộ',
            processedInvoices: response.datas.length,
            savedInvoices: syncResult.invoicesSaved,
            skippedInvoices: skipped > 0 ? skipped : 0,
            failedInvoices: syncResult.errors.length,
            detailsFetched: syncResult.detailsSaved,
            errors: syncResult.errors,
            endTime: new Date(),
            metadata: syncResult.metadata,
          }));
          
          // Now fetch from database to display
          await fetchFromDatabase();
        } else {
          toast.error(`Đồng bộ thất bại: ${syncResult.errors.join(', ')}`);
          setSyncStatus('Đồng bộ thất bại');
          
          setSyncProgress(prev => ({
            ...prev,
            status: 'error',
            currentStep: 'Đồng bộ thất bại',
            errors: syncResult.errors,
            endTime: new Date(),
          }));
        }
      } else {
        toast('Không có dữ liệu mới để đồng bộ', { icon: 'ℹ️' });
        setSyncStatus('Không có dữ liệu mới');
        
        setSyncProgress(prev => ({
          ...prev,
          status: 'completed',
          currentStep: 'Không có dữ liệu mới',
          endTime: new Date(),
        }));
        
        // Still try to fetch from database
        await fetchFromDatabase();
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể đồng bộ dữ liệu';
      setError(errorMessage);
      toast.error(errorMessage);
      setSyncStatus('Lỗi đồng bộ');
      
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Lỗi đồng bộ',
        errors: [errorMessage],
        endTime: new Date(),
      }));
      
      console.error('Error syncing data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch invoices from database
  const fetchFromDatabase = async (pageNumber: number = 0, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Build search filters for database
      const searchFilters = {
        page: pageNumber,
        size: config.pageSize,
        sortBy: sortField,
        sortOrder: sortDirection,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        ...(filter.invoiceNumber && { shdon: filter.invoiceNumber }),
        ...(filter.taxCode && { nbmst: filter.taxCode }),
        ...(filter.buyerName && { nmten: filter.buyerName }),
        ...(filter.thlap && { thlap: filter.thlap })
      };

      const result = await searchDatabaseInvoices(searchFilters);
      // console.log('Database search result:', result);
      const transferData = result.invoices.map((inv:any) => ({
            nbmst: inv.nbmst || inv.msttcgp,
            khmshdon: inv.khmshdon,
            khhdon: inv.khmshdon,
            shdon: inv.shdon,
            cqt: '',
            nbdchi: inv.dchi || inv.dctcgp,
            nbten: inv.nten || inv.tentcgp,
            nmdchi: inv.dcxmua,
            nmmst: inv.msttmua,
            nmten: inv.tenxmua,
            nmtnmua: inv.tenxmua,
            tgtcthue: inv.tgtcthue,
            tgtthue: inv.tgtthue,
            tgtttbso: inv.tgtttbso,
            tgtttbchu: inv.tgtttchu,
            thlap: inv.tdlap,
            ttcktmai: '',
            tthai: inv.tghdon || '',
            tttbao: '',
            ttxly: '',
            details: inv.details.map((detail:any) => ({
              dgia: detail.dgia,
              dvtinh: detail.dvtinh,
              ltsuat: detail.ltsuat,
              sluong: detail.sluong,
              ten: detail.ten,
              thtcthue: detail.thtcthue,
              thtien: detail.thtien,
              tlckhau: detail.tlckhau,
              tsuat: detail.tsuat,
              tthue: detail.tthue,
              tgia: detail.tgia,
              tgtcthue: detail.tgtcthue,
              tgthue: detail.tgthue
            })) || [],
      }));
      setInvoices(transferData || []);
      console.log('Fetched invoices from database:', transferData);
      
      setPagination({
        page: result.page || 0,
        size: result.size || config.pageSize,
        totalElements: result.total || 0,
        totalPages: result.totalPages || 0
      });

      if ((!transferData || transferData.length === 0) && pageNumber === 0) {
        toast(`Không tìm thấy hóa đơn nào trong database cho tháng ${selectedMonth}/${selectedYear}`, {
          icon: 'ℹ️'
        });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể tải dữ liệu từ database';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching from database:', err);
    } finally {
      setLoading(false);
    }
  };

  // Main function to load data (check database first, then sync if needed)
  const fetchInvoices = async (pageNumber: number = 0, showLoading: boolean = true) => {
    // First, try to fetch from database
    await fetchFromDatabase(pageNumber, showLoading);
  };

  // Handle quick date range selection
  const handleQuickDateRange = (range: string) => {
    setQuickDateRange(range);
    
    if (range === 'custom') {
      return; // Keep current month/year selection
    }
    
    const dateRangeOptions = DateService.getDateRangeOptions();
    const selectedOption = dateRangeOptions.find(option => option.value === range);
    
    if (selectedOption) {
      const { fromDate, toDate } = selectedOption.getData();
      setFilter(prev => ({ ...prev, fromDate, toDate }));
    }
  };

  // Handle configuration changes
  const handleConfigChanged = () => {
    const newConfig = ConfigService.getConfig();
    setConfig(newConfig);
    
    // Refresh data with new configuration
    fetchInvoices(0, true);
    toast.success(`Đã chuyển sang hóa đơn ${newConfig.invoiceType === 'banra' ? 'bán ra' : 'mua vào'}`);
  };

  // Handle search form submission - search directly from database
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search directly from database with current filter params
    fetchFromDatabase(0, true);
  };

  // Handle sorting
  const handleSort = (field: keyof InvoiceData, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    // Refresh data with new sort
    fetchInvoices(pagination.page, false);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage, false);
  };

  const handlePageSizeChange = (newSize: number) => {
    ConfigService.setPageSize(newSize);
    setConfig(prev => ({ ...prev, pageSize: newSize }));
    fetchInvoices(0, false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilter: AdvancedFilter) => {
    setFilter(newFilter);
    // Trigger search after a short delay to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchInvoices(0, false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      // Validate date range first
      const validation = BackendExcelExportService.validateDateRange(filter.fromDate, filter.toDate);
      if (!validation.isValid) {
        toast.error(validation.message || 'Dữ liệu ngày không hợp lệ');
        return;
      }

      // Check server connection first
      toast.loading('Kiểm tra kết nối server...', { id: 'excel-export' });
      const connection = await BackendExcelExportService.checkServerConnection();
      
      if (!connection.connected) {
        toast.error(connection.message, { id: 'excel-export' });
        console.error('❌ Server connection failed:', connection.message);
        return;
      }
      
      console.log('✅ Server connection OK:', connection.message);
      toast.loading('Đang xuất file Excel từ server...', { id: 'excel-export' });
      
      // Use backend API for Excel export with date range
      await BackendExcelExportService.exportToExcel(
        filter.fromDate,
        filter.toDate
      );

      // Success toast is handled in the service
    } catch (error: any) {
      console.error('Excel export error:', error);
      // Error toast is handled in the service
    } finally {
      toast.dismiss('excel-export');
    }
  };

// Frontend Excel Export with Preview - FlatMap by Details
const handleFrontendExportExcel = () => {
  try {
    if (invoices.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    // Show loading toast
    toast.loading('🔄 Đang chuẩn bị dữ liệu chi tiết...', { id: 'export-prep' });

    // FlatMap: Create one row per detail item (use existing inv.details)
    console.log('📊 Preparing export data for', invoices, 'invoices');

    const exportData: InvoiceExportData[] = invoices.flatMap((invoice: any) => {
      // If invoice has details, create one row per detail
      if (invoice.details && invoice.details.length > 0) {
        return invoice.details.map((detail: any) => {
          const { details, ...invoiceWithoutDetails } = invoice;
          return {
            // Invoice header fields (matching JSON structure)
            nbmst: invoiceWithoutDetails.nbmst || invoiceWithoutDetails.msttcgp,
            khmshdon: invoiceWithoutDetails.khmshdon,
            khhdon: invoiceWithoutDetails.khmshdon,
            shdon: invoiceWithoutDetails.shdon,
            cqt: '',
            tgtcthue: invoiceWithoutDetails.tgtcthue,
            tgtthue: invoiceWithoutDetails.tgtthue,
            tgtttbso: invoiceWithoutDetails.tgtttbso,
            thlap: invoiceWithoutDetails.tdlap,
            ttcktmai: '',
            tthai: invoiceWithoutDetails.tghdon || '',
            tttbao: '',
            ttxly: '',
            // Detail fields from current detail item
            dgia: detail.dgia,
            dvtinh: detail.dvtinh,
            ltsuat: detail.ltsuat,
            sluong: detail.sluong,
            ten: detail.ten,
            thtcthue: detail.thtcthue,
            thtien: detail.thtien,
            tlckhau: detail.tlckhau,
            tsuat: detail.tsuat,
            tthue: detail.tthue,
            tgia: detail.tgia
          };
        });
      }
      
      // If no details, create single row with null detail fields
      const { details, ...invoiceWithoutDetails } = invoice;
      return [{
        // Invoice header fields
        nbmst: invoiceWithoutDetails.nbmst || invoiceWithoutDetails.msttcgp,
        khmshdon: invoiceWithoutDetails.khmshdon,
        khhdon: invoiceWithoutDetails.khmshdon,
        shdon: invoiceWithoutDetails.shdon,
        cqt: '',
        tgtcthue: invoiceWithoutDetails.tgtcthue,
        tgtthue: invoiceWithoutDetails.tgtthue,
        tgtttbso: invoiceWithoutDetails.tgtttbso,
        thlap: invoiceWithoutDetails.tdlap,
        ttcktmai: '',
        tthai: invoiceWithoutDetails.tghdon || '',
        tttbao: '',
        ttxly: '',
        // Detail fields - all null
        dgia: null,
        dvtinh: null,
        ltsuat: null,
        sluong: null,
        ten: null,
        thtcthue: null,
        thtien: null,
        tlckhau: null,
        tsuat: null,
        tthue: null,
        tgia: null
      }];
    });

    toast.success(`✅ Đã chuẩn bị ${exportData.length} dòng dữ liệu`, { id: 'export-prep' });
    console.log('📊 Export data prepared:', exportData.length, 'rows (flatmapped by details)');
    
    // Store export data in state
    setExportData(exportData);
    setShowExcelPreview(true);
    
  } catch (error) {
    console.error('❌ Error preparing export:', error);
    toast.error('Lỗi khi chuẩn bị xuất Excel', { id: 'export-prep' });
  }
}; 
  
  // Initial load
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle invoice selection to show detail
  const handleInvoiceSelect = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh sách hóa đơn điện tử
          </h1>
          <p className="text-gray-600">
            Quản lý và tra cứu hóa đôn điện tử từ hệ thống thuế điện tử
          </p>
        </div>

        {/* Header Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  {isClient ? (
                    `Loại: ${config.invoiceType === 'banra' ? 'Hóa đơn bán ra' : 'Hóa đơn mua vào'}`
                  ) : (
                    'Loại: Hóa đơn bán ra'
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Kích thước trang: {isClient ? config.pageSize : 20}
              </div>
            </div>
            
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Cấu hình
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Quick Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng thời gian
                </label>
                <select
                  value={quickDateRange}
                  onChange={(e) => handleQuickDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="current_month">Tháng này</option>
                  <option value="previous_month">Tháng trước</option>
                  <option value="last_3_months">3 tháng gần nhất</option>
                  <option value="last_6_months">6 tháng gần nhất</option>
                  <option value="custom">Tùy chọn</option>
                </select>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tháng
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  disabled={quickDateRange !== 'custom'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {DateService.getMonthOptions().map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  disabled={quickDateRange !== 'custom'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {DateService.getYearOptions().map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="text"
                  value={filter.fromDate}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="text"
                  value={filter.toDate}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || dbLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                title="Tìm kiếm hóa đơn trong database theo điều kiện lọc"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading || dbLoading ? 'Đang tìm...' : 'Tìm trong Database'}
              </button>
              
              <button
                type="button"
                onClick={syncDataFromAPI}
                disabled={loading || isSyncing || dbLoading || !filter.month || !filter.year}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                title="Đồng bộ hóa đơn từ API bên ngoài vào database"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ API'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                title="Import hóa đơn từ file Excel"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </button>
              
              <button
                type="button"
                onClick={() => fetchFromDatabase(0, true)}
                disabled={loading || isSyncing || dbLoading}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                title="Làm mới danh sách từ database"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </button>
              
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={!filter.fromDate || !filter.toDate}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                title={`Xuất Excel từ server: ${filter.fromDate} đến ${filter.toDate}`}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Xuất từ Server
              </button>

              <button
                type="button"
                onClick={handleFrontendExportExcel}
                disabled={invoices.length === 0}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                title={`Xuất Excel với xem trước (${invoices.length} hóa đơn)`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Xuất với Xem trước
                <span className="ml-1 text-xs opacity-75">
                  ({invoices.length})
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Sync Progress Display */}
        {(isSyncing || syncProgress.status === 'completed' || syncProgress.status === 'error') && syncProgress.totalInvoices > 0 && (
          <div className="mb-6">
            <SyncProgressDisplay 
              progress={syncProgress}
              onClose={() => setSyncProgress(prev => ({ ...prev, status: 'idle', totalInvoices: 0 }))}
            />
          </div>
        )}

        {syncStatus && !isSyncing && syncProgress.status === 'idle' && (
          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="font-medium">Trạng thái đồng bộ:</span>
              <span className="ml-2">{syncStatus}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="font-medium">Lỗi:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Enhanced Invoice Table with Advanced Table */}
        <InvoiceTableAdvanced
          invoices={invoices}
          loading={loading}
          onRowClick={handleInvoiceSelect}
          height={700}
        />

        {/* Invoice Detail Modal */}
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
        />

        {/* Configuration Modal */}
        <ConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onConfigChanged={handleConfigChanged}
        />

        {/* Import Modal */}
        <InvoiceImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchFromDatabase(0, true);
          }}
        />

        {/* Excel Preview Dialog */}
        <ExcelPreviewDialog
          open={showExcelPreview}
          onOpenChange={setShowExcelPreview}
          invoices={exportData}
          fromDate={filter.fromDate}
          toDate={filter.toDate}
        />
      </div>
    </div>
  );
};

export default ListHoaDonPage;
