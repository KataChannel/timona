import { useState } from 'react';

export interface DatabaseSyncResult {
  success: boolean;
  invoicesSaved: number;
  detailsSaved: number;
  errors: string[];
  message: string;
  metadata?: {
    totalProcessed: number;
    durationMs: number;
    durationMinutes: number;
    successRate: number;
    startTime: string;
    endTime: string;
  };
}

export interface InvoiceStats {
  totalInvoices: number;
  totalDetails: number;
  totalAmount: number;
  totalTax: number;
  lastSyncDate?: Date;
}

/**
 * Service for syncing invoice data with the database
 * Integrates with backend REST API endpoints
 */
class InvoiceDatabaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:14000';
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    // Get the JWT token from the auth service (using token as per useAuth hook)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Sync invoice data to database using REST API
   */
  async syncInvoiceData(
    invoiceData: any[],
    detailsData?: any[],
    bearerToken?: string,
    brandname?: string,
    onProgress?: (progress: { processed: number; total: number; current: string }) => void
  ): Promise<DatabaseSyncResult> {
    try {
      console.log('Syncing invoice data to database:', {
        invoiceCount: invoiceData.length,
        detailsCount: detailsData?.length || 0,
        hasBearerToken: !!bearerToken,
      });

      // Notify progress start
      if (onProgress) {
        onProgress({ processed: 0, total: invoiceData.length, current: 'Bắt đầu đồng bộ...' });
      }

      // Simulate progress updates since REST API doesn't support streaming
      // Estimate: 3 invoices per batch, 3s between batches, 2s per detail fetch
      let progressInterval: NodeJS.Timeout | null = null;
      if (onProgress) {
        const estimatedTimePerInvoice = 2500; // 2.5 seconds per invoice (with delays)
        const totalEstimatedTime = invoiceData.length * estimatedTimePerInvoice;
        const updateIntervalMs = 1000; // Update every 1 second
        const totalUpdates = Math.floor(totalEstimatedTime / updateIntervalMs);
        let currentUpdate = 0;

        progressInterval = setInterval(() => {
          currentUpdate++;
          const estimatedProgress = Math.min(
            Math.floor((currentUpdate / totalUpdates) * invoiceData.length),
            invoiceData.length - 1 // Don't reach 100% until actual completion
          );
          
          onProgress({
            processed: estimatedProgress,
            total: invoiceData.length,
            current: `Đang xử lý hóa đơn ${estimatedProgress + 1}/${invoiceData.length}...`
          });

          if (currentUpdate >= totalUpdates) {
            if (progressInterval) clearInterval(progressInterval);
          }
        }, updateIntervalMs);
      }

      const response = await fetch(`${this.baseUrl}/api/invoices/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          invoiceData,
          detailsData: detailsData || [],
          bearerToken: bearerToken || undefined,
          brandname: brandname || undefined,
        }),
      });

      // Clear progress interval when request completes
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Clear progress interval when request completes
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DatabaseSyncResult = await response.json();
      
      // Send final progress update with actual results
      if (onProgress && result.success) {
        onProgress({
          processed: invoiceData.length,
          total: invoiceData.length,
          current: `Hoàn thành: ${result.invoicesSaved} hóa đơn, ${result.detailsSaved} chi tiết`
        });
      }
      
      console.log('Database sync result:', result);
      return result;
    } catch (error) {
      console.error('Error syncing invoice data:', error);
      return {
        success: false,
        invoicesSaved: 0,
        detailsSaved: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Lỗi khi đồng bộ dữ liệu với cơ sở dữ liệu',
      };
    }
  }

  /**
   * Check if invoice exists in database using REST API
   */
  async checkInvoiceExists(nbmst: string, khmshdon: string, shdon: string): Promise<boolean> {
    try {
      console.log('Checking invoice exists:', { nbmst, khmshdon, shdon });
      
      const response = await fetch(
        `${this.baseUrl}/api/invoices/exists/${encodeURIComponent(nbmst)}/${encodeURIComponent(khmshdon)}/${encodeURIComponent(shdon)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.exists || false;
    } catch (error) {
      console.error('Error checking invoice existence:', error);
      return false;
    }
  }

  /**
   * Get database statistics using REST API
   */
  async getDatabaseStats(): Promise<InvoiceStats> {
    try {
      console.log('Getting database statistics');
      
      const response = await fetch(`${this.baseUrl}/api/invoices/stats/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stats: InvoiceStats = await response.json();
      
      // Convert lastSyncDate string to Date object if it exists
      if (stats.lastSyncDate) {
        stats.lastSyncDate = new Date(stats.lastSyncDate);
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalInvoices: 0,
        totalDetails: 0,
        totalAmount: 0,
        totalTax: 0,
      };
    }
  }

  /**
   * Search invoices in database
   */
  async searchInvoices(filters: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    nbmst?: string;
    nmmst?: string;
    khmshdon?: string;
    shdon?: string;
    tthai?: string;
    fromDate?: string;
    toDate?: string;
    thlap?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      console.log('Searching invoices with params:', queryParams.toString());
      
      const response = await fetch(`${this.baseUrl}/api/invoices?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if(response.status === 403 || response.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching invoices:', error);
      throw error;
    }
  }

  /**
   * Create a single invoice
   */
  async createInvoice(invoiceData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/invoices`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/invoices/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      throw error;
    }
  }
}

export const invoiceDatabaseService = new InvoiceDatabaseService();

/**
 * Hook for using invoice database operations
 */
export function useInvoiceDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncData:any = async (
    invoiceData: any[], 
    detailsData?: any[], 
    bearerToken?: string,
    brandname?: string,
    onProgress?: (progress: { processed: number; total: number; current: string }) => void
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await invoiceDatabaseService.syncInvoiceData(
        invoiceData, 
        detailsData, 
        bearerToken,
        brandname,
        onProgress
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkExists = async (nbmst: string, khmshdon: string, shdon: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const exists = await invoiceDatabaseService.checkInvoiceExists(nbmst, khmshdon, shdon);
      return exists;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await invoiceDatabaseService.getDatabaseStats();
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchInvoices = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await invoiceDatabaseService.searchInvoices(filters);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoiceData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await invoiceDatabaseService.createInvoice(invoiceData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoiceById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await invoiceDatabaseService.getInvoiceById(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncData,
    checkExists,
    getStats,
    searchInvoices,
    createInvoice,
    getInvoiceById,
    isLoading,
    error,
  };
}