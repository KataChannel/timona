import axios from 'axios';
import { saveAs } from 'file-saver';

export interface ExcelExportParams {
  fromDate: string;
  toDate: string;
  invoiceType?: string;
}

/**
 * Service for handling Excel export functionality with comprehensive error handling
 */
class BackendExcelExportService {
  /**
   * Get the base API URL from environment or default
   */
  static getApiUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:12001';
    return `${baseUrl}/ketoan/listhoadon`;
  }

  /**
   * Get the export endpoint URL
   */
  static getExportUrl(): string {
    return `${this.getApiUrl()}/export-excel`;
  }

  /**
   * Normalize date string to YYYY-MM-DD format
   */
  static normalizeDateString(dateStr: string): string {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle MM/DD/YYYY format (US)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try to parse as Date and convert
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateStr);
    }
    
    return dateStr;
  }

  /**
   * Test server connection
   */
  static async testConnection(baseUrl: string): Promise<boolean> {
    try {
      const response = await axios.get(`${baseUrl}/health`, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status for testing
      });
      return response.status < 500; // Accept 2xx, 3xx, 4xx but not 5xx
    } catch (error) {
      return false;
    }
  }

  /**
   * Auto-detect backend URL from common ports
   */
  static async detectBackendUrl(): Promise<string> {
    const commonPorts = [14000, 4000, 3001, 8000];
    const baseHost = 'http://localhost';
    
    for (const port of commonPorts) {
      const testUrl = `${baseHost}:${port}`;
      console.log(`🔍 Testing connection to ${testUrl}...`);
      
      if (await this.testConnection(testUrl)) {
        console.log(`✅ Found working backend at ${testUrl}`);
        return `${testUrl}/ketoan/listhoadon`;
      }
    }
    
    // Fallback to default
    return this.getApiUrl();
  }

  /**
   * Check if backend server is accessible
   */
  static async checkServerConnection(): Promise<{ connected: boolean; url?: string; message: string }> {
    try {
      const apiUrl = this.getApiUrl();
      const baseUrl = apiUrl.replace('/ketoan/listhoadon', '');
      
      console.log('🔍 Checking server connection:', baseUrl);
      
      // Test specific Excel export endpoint instead of health (since health might fail due to minio)
      try {
        const exportTestResponse = await axios.head(`${baseUrl}/ketoan/listhoadon/export-excel?fromDate=2024-01-01&toDate=2024-01-31`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (exportTestResponse.status === 200) {
          return {
            connected: true,
            url: baseUrl,
            message: `Backend server connected on ${baseUrl} (Excel export endpoint working)`
          };
        }
      } catch (exportError) {
        console.log('Excel export endpoint test failed, trying health endpoint...');
      }
      
      if (await this.testConnection(baseUrl)) {
        return {
          connected: true,
          url: baseUrl,
          message: `Backend server connected on ${baseUrl}`
        };
      }
      
      // Try auto-detection
      console.log('🔄 Primary connection failed, trying auto-detection...');
      const detectedUrl = await this.detectBackendUrl();
      const detectedBaseUrl = detectedUrl.replace('/ketoan/listhoadon', '');
      
      // Test Excel export endpoint on detected URL
      try {
        const exportTestResponse = await axios.head(`${detectedBaseUrl}/ketoan/listhoadon/export-excel?fromDate=2024-01-01&toDate=2024-01-31`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (exportTestResponse.status === 200) {
          return {
            connected: true,
            url: detectedBaseUrl,
            message: `Backend server found on ${detectedBaseUrl} (auto-detected, Excel export endpoint working)`
          };
        }
      } catch (exportError) {
        console.log('Auto-detected Excel export endpoint test failed, trying health endpoint...');
      }
      
      if (await this.testConnection(detectedBaseUrl)) {
        return {
          connected: true,
          url: detectedBaseUrl,
          message: `Backend server found on ${detectedBaseUrl} (auto-detected)`
        };
      }
      
      return {
        connected: false,
        message: 'Backend server không khả dụng trên các port thông thường (14000, 4000, 3001, 8000). Vui lòng kiểm tra server có đang chạy không.'
      };
      
    } catch (error) {
      console.error('❌ Connection check error:', error);
      return {
        connected: false,
        message: `Lỗi kiểm tra kết nối server: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate date range before export
   */
  static validateDateRange(fromDate: string, toDate: string): { isValid: boolean; message?: string } {
    try {
      // Check if dates are provided
      if (!fromDate || !toDate) {
        return { isValid: false, message: 'Vui lòng chọn ngày bắt đầu và ngày kết thúc' };
      }

      // Normalize dates first
      const normalizedFromDate = this.normalizeDateString(fromDate);
      const normalizedToDate = this.normalizeDateString(toDate);
      
      // Validate normalized date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(normalizedFromDate) || !dateRegex.test(normalizedToDate)) {
        return { isValid: false, message: 'Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng DD/MM/YYYY hoặc YYYY-MM-DD' };
      }

      const startDate = new Date(normalizedFromDate);
      const endDate = new Date(normalizedToDate);
      
      console.log('🔍 Validating date range:', { 
        originalFromDate: fromDate,
        originalToDate: toDate,
        normalizedFromDate, 
        normalizedToDate, 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        startValid: !isNaN(startDate.getTime()),
        endValid: !isNaN(endDate.getTime())
      });
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { isValid: false, message: 'Ngày không hợp lệ. Vui lòng kiểm tra lại ngày tháng' };
      }
      
      // Check if start date is before end date
      if (startDate > endDate) {
        return { isValid: false, message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc' };
      }
      
      // Check if dates are not in the future (more than current date)
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (startDate > today) {
        return { isValid: false, message: 'Ngày bắt đầu không được vượt quá ngày hiện tại' };
      }
      
      // Check if date range is not too large (prevent performance issues)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return { isValid: false, message: 'Khoảng thời gian không được vượt quá 365 ngày' };
      }
      
      console.log('✅ Date range validation passed:', { daysDiff });
      return { isValid: true };
    } catch (error) {
      console.error('❌ Date validation error:', error);
      return { isValid: false, message: 'Lỗi kiểm tra khoảng thời gian' };
    }
  }

  /**
   * Export data to Excel file
   */
  static async exportToExcel(fromDate: string, toDate: string): Promise<void> {
    try {
      console.log('🔍 Starting Excel export process...');
      console.log('📅 Date range:', { fromDate, toDate });
      
      // Validate date range first
      const validation = this.validateDateRange(fromDate, toDate);
      if (!validation.isValid) {
        alert(`❌ Validation Error: ${validation.message}`);
        return;
      }
      
      // Pre-check server connection with better handling
      console.log('🔌 Checking server connection...');
      const connectionCheck = await this.checkServerConnection();
      console.log('🔌 Connection check result:', connectionCheck);
      
      if (!connectionCheck.connected) {
        const errorMsg = `❌ Server Connection Failed: ${connectionCheck.message}`;
        console.error(errorMsg);
        alert(errorMsg);
        return;
      }
      
      // Use the confirmed working server URL
      const baseUrl = connectionCheck.url!;
      const apiUrl = `${baseUrl}/ketoan/listhoadon/export-excel`;
      
      // Normalize date strings
      const normalizedFromDate = this.normalizeDateString(fromDate);
      const normalizedToDate = this.normalizeDateString(toDate);
      
      console.log('📅 Normalized dates:', {
        original: { fromDate, toDate },
        normalized: { fromDate: normalizedFromDate, toDate: normalizedToDate }
      });
      
      // Build request URL with parameters
      const params = new URLSearchParams({
        fromDate: normalizedFromDate,
        toDate: normalizedToDate
      });
      
      const fullUrl = `${apiUrl}?${params.toString()}`;
      console.log('🌐 Request URL:', fullUrl);
      
      // Test the specific export endpoint first
      console.log('🧪 Testing export endpoint availability...');
      try {
        const testResponse = await axios.head(fullUrl, { timeout: 5000 });
        console.log('✅ Export endpoint is accessible:', testResponse.status);
      } catch (testError) {
        console.log('⚠️ HEAD request failed, proceeding with GET...');
      }
      
      console.log('📤 Making Excel export request...');
      const response = await axios.get(fullUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; rausachcore-Frontend)',
        },
        timeout: 30000, // 30 seconds timeout
        withCredentials: false,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      
      console.log('📊 Response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        dataSize: response.data?.size || 'unknown'
      });
      
      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const filename = `hoa-don-${normalizedFromDate}_${normalizedToDate}.xlsx`;
      console.log('💾 Downloading file:', filename, 'Size:', blob.size, 'bytes');
      
      // Use saveAs to trigger download
      saveAs(blob, filename);
      
      console.log('✅ Excel export completed successfully!');
      alert(`✅ Export thành công! File: ${filename} (${blob.size} bytes)`);
      
    } catch (error) {
      console.error('❌ Excel export error:', error);
      
      let errorMessage = 'Lỗi không xác định khi export Excel';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const statusText = error.response.statusText;
          errorMessage = `Lỗi server (${status}): ${statusText}`;
          
          // Try to get more details from response
          if (error.response.data) {
            try {
              const errorData = typeof error.response.data === 'string' 
                ? error.response.data 
                : JSON.stringify(error.response.data);
              console.error('Server error details:', errorData);
            } catch (parseError) {
              console.error('Could not parse error response:', error.response.data);
            }
          }
        } else if (error.request) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra:\n- Server có đang chạy không?\n- URL có đúng không?\n- Có vấn đề CORS không?';
          console.error('Request error details:', error.request);
        } else {
          errorMessage = `Lỗi setup request: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`❌ Export Excel thất bại:\n${errorMessage}`);
      throw error;
    }
  }

  /**
   * Test validation with various date formats (for debugging)
   */
  static testValidation() {
    const testCases = [
      { from: '2025-01-01', to: '2025-01-31', expected: true },
      { from: '01/01/2025', to: '31/01/2025', expected: true },
      { from: '2025-12-01', to: '2025-11-01', expected: false }, // Start > End
      { from: '', to: '2025-01-31', expected: false }, // Empty date
      { from: 'invalid', to: '2025-01-31', expected: false }, // Invalid format
      { from: '2025-01-01', to: '2026-01-01', expected: false }, // > 365 days
    ];

    console.log('🧪 Testing date validation:');
    testCases.forEach((test, index) => {
      const result = this.validateDateRange(test.from, test.to);
      const passed = result.isValid === test.expected;
      console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'}`, {
        input: { from: test.from, to: test.to },
        expected: test.expected,
        actual: result.isValid,
        message: result.message
      });
    });
  }
}

export default BackendExcelExportService;