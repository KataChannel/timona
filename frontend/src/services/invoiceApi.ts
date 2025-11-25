import axios, { AxiosResponse } from 'axios';
import { InvoiceApiResponse, InvoiceApiParams, InvoiceFilter, InvoiceData, AdvancedFilter, InvoiceType } from '@/types/invoice';
import ConfigService from './configService';
import DateService from './dateService';

export class InvoiceApiService {
  private static readonly BASE_URL = 'https://hoadondientu.gdt.gov.vn:30000';

  private static createAxiosInstance() {
    const config = ConfigService.getValidatedConfig();
    
    return axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Build search query string for date range and filters
   */
  private static buildSearchQuery(filter: InvoiceFilter | AdvancedFilter): string {
    const searchParts: string[] = [];

    // Handle month/year inputs or direct date inputs
    let fromDate = filter.fromDate;
    let toDate = filter.toDate;

    if (filter.month && filter.year) {
      const dateRange = DateService.getMonthDateRange(filter.month, filter.year);
      fromDate = dateRange.fromDate;
      toDate = dateRange.toDate;
    }

    // Add date range (required)
    if (fromDate) {
      searchParts.push(`tdlap=ge=${fromDate}T00:00:00`);
    }
    if (toDate) {
      searchParts.push(`tdlap=le=${toDate}T23:59:59`);
    }

    // Add optional filters
    if (filter.invoiceNumber) {
      searchParts.push(`shdon=like=${encodeURIComponent(filter.invoiceNumber)}`);
    }
    if (filter.taxCode) {
      searchParts.push(`msttcgp=like=${encodeURIComponent(filter.taxCode)}`);
    }
    if (filter.buyerName) {
      searchParts.push(`tenxmua=like=${encodeURIComponent(filter.buyerName)}`);
    }

    // Advanced filters
    const advancedFilter = filter as AdvancedFilter;
    if (advancedFilter.globalSearch) {
      // Search across multiple fields
      const globalTerm = encodeURIComponent(advancedFilter.globalSearch);
      searchParts.push(`(shdon=like=${globalTerm};tenxmua=like=${globalTerm};msttcgp=like=${globalTerm})`);
    }

    if (advancedFilter.amountFrom) {
      searchParts.push(`tgtttbso=ge=${advancedFilter.amountFrom}`);
    }

    if (advancedFilter.amountTo) {
      searchParts.push(`tgtttbso=le=${advancedFilter.amountTo}`);
    }

    if (advancedFilter.status) {
      searchParts.push(`tghdon=like=${encodeURIComponent(advancedFilter.status)}`);
    }

    return searchParts.join(';');
  }

  // Rate limiting configuration
  private static rateLimitQueue: Array<() => Promise<any>> = [];
  private static isProcessingQueue = false;
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [2000, 5000, 10000]; // Exponential backoff

  /**
   * Process rate limit queue to prevent server overload
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.rateLimitQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const request = this.rateLimitQueue.shift();
      if (request) {
        try {
          this.lastRequestTime = Date.now();
          await request();
        } catch (error) {
          console.error('Queue request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Execute request with retry logic and rate limiting
   */
  private static async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        // Handle rate limiting (409, 429) with exponential backoff
        if ((status === 409 || status === 429) && retryCount < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAYS[retryCount] || 10000;
          console.warn(`⚠️ Rate limit hit (${status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.executeWithRetry(requestFn, retryCount + 1);
        }
        
        // Handle server overload (503) with longer backoff
        if (status === 503 && retryCount < this.MAX_RETRIES) {
          const delay = Math.min(15000 * (retryCount + 1), 60000); // Max 1 minute
          console.warn(`⚠️ Server overload (503), retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.executeWithRetry(requestFn, retryCount + 1);
        }
      }
      
      throw error;
    }
  }

  /**
   * Fetch invoice data from external API with rate limiting and retry logic
   */
  static async fetchInvoices(
    filter: InvoiceFilter | AdvancedFilter,
    params: InvoiceApiParams = {},
    invoiceType?: InvoiceType
  ): Promise<InvoiceApiResponse> {
    const requestFn = async (): Promise<InvoiceApiResponse> => {
      const axiosInstance = this.createAxiosInstance();
      const config = ConfigService.getValidatedConfig();
      
      const searchQuery = this.buildSearchQuery(filter);
      const endpoint = ConfigService.getApiEndpoint(invoiceType);
      
      const queryParams = new URLSearchParams({
        sort: params.sort || 'tdlap:desc,khmshdon:asc,shdon:desc',
        size: (params.size || config.pageSize).toString(),
        page: (params.page || 0).toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(params.state && { state: params.state })
      });

      console.log(`🔄 Fetching invoices: ${endpoint}?${queryParams.toString().substring(0, 100)}...`);
      
      const response: AxiosResponse<InvoiceApiResponse> = await axiosInstance.get(
        `${endpoint}?${queryParams.toString()}`
      );

      return response.data;
    };

    try {
      const responseData = await this.executeWithRetry(requestFn);
      
      // Check if we need to fetch more data (when total > 50)
      if (responseData.total && responseData.total > 50 && responseData.state && !params.state) {
        console.log(`📊 Total records: ${responseData.total}, initiating controlled pagination...`);
        return await this.fetchAllInvoices(filter, params, invoiceType, responseData);
      }

      return responseData;
    } catch (error) {
      console.error('❌ Error fetching invoice data:', error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          throw new Error('Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật token trong cấu hình.');
        } else if (status === 403) {
          throw new Error('Không có quyền truy cập dữ liệu hóa đơn');
        } else if (status === 404) {
          throw new Error('Endpoint API không tồn tại');
        } else if (status === 409) {
          throw new Error('Server đang quá tải. Vui lòng thử lại sau ít phút.');
        } else if (status === 429) {
          throw new Error('Đã vượt quá giới hạn số lần gọi API. Vui lòng thử lại sau.');
        } else if (status === 503) {
          throw new Error('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Kết nối timeout, vui lòng thử lại');
        } else if (status && status >= 500) {
          throw new Error('Lỗi hệ thống phía server, vui lòng thử lại sau');
        }
      }
      
      throw new Error('Không thể tải dữ liệu hóa đơn. Vui lòng kiểm tra kết nối internet và thử lại.');
    }
  }

  /**
   * Fetch all invoices when total > 50 using controlled state-based pagination
   */
  private static async fetchAllInvoices(
    filter: InvoiceFilter | AdvancedFilter,
    params: InvoiceApiParams,
    invoiceType?: InvoiceType,
    initialResponse?: InvoiceApiResponse
  ): Promise<InvoiceApiResponse> {
    const allData: InvoiceData[] = [];
    let currentState: string | undefined = initialResponse?.state;
    let totalFetched = 0;
    const totalRecords = initialResponse?.total || 0;
    let pageCount = 1;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
    // Add initial response data if provided
    if (initialResponse?.datas) {
      allData.push(...initialResponse.datas);
      totalFetched = initialResponse.datas.length;
    }
    
    console.log(`🔄 Starting controlled pagination: ${totalFetched}/${totalRecords} records (${Math.ceil(totalRecords / 50)} estimated pages)`);
    
    // Calculate adaptive delay based on total records
    const baseDelay = totalRecords > 1000 ? 2000 : totalRecords > 500 ? 1500 : 1000;
    console.log(`⏱️ Using ${baseDelay}ms base delay between requests to prevent server overload`);
    
    // Continue fetching while we have a state and haven't reached the total
    while (currentState && totalFetched < totalRecords) {
      try {
        const statePreview = currentState.length > 50 ? `${currentState.substring(0, 50)}...` : currentState;
        console.log(`📄 Fetching page ${pageCount + 1}/${Math.ceil(totalRecords / 50)} with state: ${statePreview}`);
        
        // Adaptive delay - increase delay if we've had errors
        const adaptiveDelay = baseDelay + (consecutiveErrors * 1000);
        if (pageCount > 1) {
          await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        }
        
        const nextResponse = await this.fetchInvoices(
          filter,
          { ...params, state: currentState },
          invoiceType
        );
        
        // Reset error counter on success
        consecutiveErrors = 0;
        
        if (nextResponse.datas && nextResponse.datas.length > 0) {
          allData.push(...nextResponse.datas);
          totalFetched += nextResponse.datas.length;
          const progress = Math.round((totalFetched / totalRecords) * 100);
          console.log(`✅ Page ${pageCount + 1}/${Math.ceil(totalRecords / 50)}: ${nextResponse.datas.length} records | Total: ${totalFetched}/${totalRecords} (${progress}%)`);
        } else {
          console.log(`⚠️ Page ${pageCount + 1}: No data returned`);
        }
        
        // Update state for next iteration
        currentState = nextResponse.state;
        pageCount++;
        
        // Break if no more state (reached end)
        if (!currentState) {
          console.log('🏁 No more state token, pagination complete');
          break;
        }
        
        // Safety check to prevent infinite loops
        if (totalFetched >= totalRecords) {
          console.log('🎯 Reached total record count, stopping pagination');
          break;
        }
        
        // Safety check for excessive pages (prevent runaway pagination)
        if (pageCount > 200) {
          console.warn('⚠️ Exceeded 200 pages, stopping pagination for safety');
          break;
        }
        
      } catch (error) {
        consecutiveErrors++;
        console.error(`❌ Error during pagination fetch (page ${pageCount + 1}), consecutive errors: ${consecutiveErrors}:`, error);
        
        // If we hit too many consecutive errors, stop pagination
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`💥 Too many consecutive errors (${consecutiveErrors}), stopping pagination`);
          break;
        }
        
        // For rate limit errors, wait longer before retrying
        if (axios.isAxiosError(error) && (error.response?.status === 409 || error.response?.status === 429)) {
          const waitTime = Math.min(30000, 5000 * consecutiveErrors); // Max 30 seconds
          console.warn(`⏳ Rate limit error, waiting ${waitTime}ms before continuing...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // For other errors, wait a bit before continuing
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    const successRate = Math.round((allData.length / totalRecords) * 100);
    console.log(`🎉 Controlled pagination complete: fetched ${allData.length} records out of ${totalRecords} total (${successRate}% success rate)`);
    
    // Return combined result
    return {
      datas: allData,
      totalElements: totalRecords,
      totalPages: Math.ceil(totalRecords / (params.size || 50)),
      size: allData.length,
      number: 0,
      numberOfElements: allData.length,
      first: true,
      last: true,
      total: totalRecords,
      state: undefined // Clear state since we've fetched everything
    };
  }

  /**
   * Fetch invoices with progress callback and controlled rate limiting
   */
  static async fetchInvoicesWithProgress(
    filter: InvoiceFilter | AdvancedFilter,
    params: InvoiceApiParams = {},
    invoiceType?: InvoiceType,
    onProgress?: (current: number, total: number, percentage: number) => void
  ): Promise<InvoiceApiResponse> {
    // First, get initial response to check total count
    const initialResponse = await this.fetchInvoices(filter, params, invoiceType);
    
    // If total <= 50 or no state, return as is
    if (!initialResponse.total || initialResponse.total <= 50 || !initialResponse.state) {
      onProgress?.(initialResponse.datas.length, initialResponse.total || initialResponse.datas.length, 100);
      return initialResponse;
    }
    
    console.log(`🚀 Starting progress-tracked pagination for ${initialResponse.total} records`);
    
    // For large datasets, use controlled pagination with progress tracking
    const allData: InvoiceData[] = [];
    let currentState: string | undefined = initialResponse.state;
    let totalFetched = 0;
    const totalRecords = initialResponse.total;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
    // Calculate adaptive delays
    const baseDelay = totalRecords > 1000 ? 2000 : totalRecords > 500 ? 1500 : 1000;
    
    // Add initial data
    if (initialResponse.datas) {
      allData.push(...initialResponse.datas);
      totalFetched = initialResponse.datas.length;
      onProgress?.(totalFetched, totalRecords, Math.round((totalFetched / totalRecords) * 100));
    }
    
    // Continue fetching with progress updates and rate limiting
    while (currentState && totalFetched < totalRecords && consecutiveErrors < maxConsecutiveErrors) {
      try {
        // Adaptive delay with error backoff
        const adaptiveDelay = baseDelay + (consecutiveErrors * 1000);
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
        
        const nextResponse = await this.fetchInvoices(
          filter,
          { ...params, state: currentState },
          invoiceType
        );
        
        // Reset error counter on success
        consecutiveErrors = 0;
        
        if (nextResponse.datas && nextResponse.datas.length > 0) {
          allData.push(...nextResponse.datas);
          totalFetched += nextResponse.datas.length;
          const percentage = Math.round((totalFetched / totalRecords) * 100);
          onProgress?.(totalFetched, totalRecords, percentage);
        }
        
        currentState = nextResponse.state;
        
        if (!currentState || totalFetched >= totalRecords) break;
        
      } catch (error) {
        consecutiveErrors++;
        console.error(`❌ Error during progress fetch (attempt ${consecutiveErrors}/${maxConsecutiveErrors}):`, error);
        
        // Update progress with error info
        onProgress?.(totalFetched, totalRecords, Math.round((totalFetched / totalRecords) * 100));
        
        // Handle rate limit errors with extended backoff
        if (axios.isAxiosError(error) && (error.response?.status === 409 || error.response?.status === 429)) {
          const waitTime = Math.min(30000, 5000 * consecutiveErrors);
          console.warn(`⏳ Rate limit in progress fetch, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (consecutiveErrors < maxConsecutiveErrors) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    const successRate = Math.round((allData.length / totalRecords) * 100);
    console.log(`🎯 Progress fetch complete: ${allData.length}/${totalRecords} records (${successRate}% success rate)`);
    
    return {
      datas: allData,
      totalElements: totalRecords,
      totalPages: Math.ceil(totalRecords / (params.size || 50)),
      size: allData.length,
      number: 0,
      numberOfElements: allData.length,
      first: true,
      last: true,
      total: totalRecords,
      state: undefined
    };
  }

  /**
   * Get default month and year (current month)
   */
  static getDefaultMonthYear(): { month: number; year: number } {
    return DateService.getCurrentMonthYear();
  }

  /**
   * Get default date range (current month)
   */
  static getDefaultDateRange(): { fromDate: string; toDate: string } {
    const { month, year } = DateService.getCurrentMonthYear();
    return DateService.getMonthDateRange(month, year);
  }

  /**
   * Format date for API (DD/MM/YYYY format as used in the original endpoint)
   */
  private static formatDateForAPI(date: Date): string {
    return DateService.formatDate(date);
  }

  /**
   * Validate date range
   */
  static validateDateRange(fromDate: string, toDate: string): { isValid: boolean; error?: string } {
    return DateService.validateDateRange(fromDate, toDate);
  }

  /**
   * Get configuration options for UI
   */
  static getConfigOptions() {
    return {
      invoiceTypes: [
        { value: 'banra', label: 'Hóa đơn bán ra' },
        { value: 'muavao', label: 'Hóa đơn mua vào' }
      ],
      pageSizes: [10, 20, 50, 100, 200],
      monthOptions: DateService.getMonthOptions(),
      yearOptions: DateService.getYearOptions(),
      dateRangeOptions: DateService.getDateRangeOptions()
    };
  }
}

export default InvoiceApiService;