import { InvoiceData, InvoiceFilter, AdvancedFilter, InvoiceType } from '@/types/invoice';
import InvoiceApiService from './invoiceApi';
import InvoiceDatabaseService, { DatabaseSyncResult } from './invoiceDatabaseService';

export interface SyncOptions {
  includeDetails?: boolean; // Default: true - Automatically fetch details after syncing invoices
  batchSize?: number;       // Default: 10 - Number of invoices to process per batch
  maxRetries?: number;      // Default: 3 - Number of retry attempts for failed operations
  skipExisting?: boolean;   // Default: true - Skip invoices that already exist in database
  bearerToken?: string;     // Bearer Token from frontend config for detail API authentication
}

export interface SyncProgress {
  totalInvoices: number;
  processedInvoices: number;
  savedInvoices: number;
  savedDetails: number;
  errors: string[];
  currentBatch?: number;
  totalBatches?: number;
  isComplete: boolean;
}

export class InvoiceSyncService {
  private static syncInProgress = false;
  private static currentProgress: SyncProgress | null = null;

  /**
   * Sync invoices from external API to database
   */
  static async syncFromExternalApi(
    filter: InvoiceFilter | AdvancedFilter,
    invoiceType?: InvoiceType,
    options: SyncOptions = {}
  ): Promise<DatabaseSyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync is already in progress');
    }

    const {
      includeDetails = true, // Default to true for automatic detail fetching
      batchSize = 10,
      maxRetries = 3,
      skipExisting = true,
      bearerToken
    } = options;

    this.syncInProgress = true;
    this.currentProgress = {
      totalInvoices: 0,
      processedInvoices: 0,
      savedInvoices: 0,
      savedDetails: 0,
      errors: [],
      isComplete: false
    };

    try {
      console.log('Starting invoice sync from external API...');
      
      // Fetch invoices from external API
      console.log('Fetching invoices from external API...');
      const apiResponse = await InvoiceApiService.fetchInvoices(filter, {}, invoiceType);
      
      if (!apiResponse.datas || apiResponse.datas.length === 0) {
        return {
          success: true,
          invoicesSaved: 0,
          detailsSaved: 0,
          errors: [],
          message: 'No invoices found to sync'
        };
      }

      console.log(`Found ${apiResponse.datas.length} invoices to sync`);
      this.currentProgress.totalInvoices = apiResponse.datas.length;
      this.currentProgress.totalBatches = Math.ceil(apiResponse.datas.length / batchSize);

      // Filter out existing invoices if skipExisting is enabled
      let invoicesToSync = apiResponse.datas;
      if (skipExisting) {
        console.log('Filtering out existing invoices...');
        const filteredInvoices = [];
        
        for (const invoice of apiResponse.datas) {
          const exists = await InvoiceDatabaseService.invoiceExists(
            invoice.nbmst || invoice.msttcgp,
            invoice.khmshdon,
            invoice.shdon
          );
          
          if (!exists) {
            filteredInvoices.push(invoice);
          }
        }
        
        invoicesToSync = filteredInvoices;
        console.log(`${apiResponse.datas.length - filteredInvoices.length} invoices already exist, syncing ${filteredInvoices.length} new invoices`);
      }

      if (invoicesToSync.length === 0) {
        this.currentProgress.isComplete = true;
        return {
          success: true,
          invoicesSaved: 0,
          detailsSaved: 0,
          errors: [],
          message: 'All invoices already exist in database'
        };
      }

      // Sync invoices in batches
      const result = await InvoiceDatabaseService.syncInvoicesBatch(
        invoicesToSync,
        includeDetails,
        batchSize,
        bearerToken
      );

      this.currentProgress.processedInvoices = invoicesToSync.length;
      this.currentProgress.savedInvoices = result.invoicesSaved;
      this.currentProgress.savedDetails = result.detailsSaved;
      this.currentProgress.errors = result.errors;
      this.currentProgress.isComplete = true;

      return result;

    } catch (error: any) {
      console.error('Error during sync:', error);
      
      if (this.currentProgress) {
        this.currentProgress.errors.push(`Sync error: ${error.message}`);
        this.currentProgress.isComplete = true;
      }

      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync specific invoices by their identifiers
   */
  static async syncSpecificInvoices(
    invoiceIdentifiers: Array<{ nbmst: string; khmshdon: string; shdon: string }>,
    includeDetails: boolean = true // Default to true for automatic detail fetching
  ): Promise<DatabaseSyncResult> {
    const result: DatabaseSyncResult = {
      success: true,
      invoicesSaved: 0,
      detailsSaved: 0,
      errors: [],
      message: ''
    };

    console.log(`Syncing ${invoiceIdentifiers.length} specific invoices...`);

    for (const identifier of invoiceIdentifiers) {
      try {
        // This would require a more specific API endpoint to fetch individual invoices
        // For now, we'll skip this implementation as it depends on the external API capabilities
        result.errors.push(`Direct invoice sync not implemented for ${identifier.shdon}`);
      } catch (error: any) {
        result.errors.push(`Error syncing invoice ${identifier.shdon}: ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    result.message = result.success 
      ? `Successfully synced ${result.invoicesSaved} specific invoices`
      : `Attempted to sync ${invoiceIdentifiers.length} invoices with ${result.errors.length} errors`;

    return result;
  }

  /**
   * Get current sync progress
   */
  static getSyncProgress(): SyncProgress | null {
    return this.currentProgress;
  }

  /**
   * Check if sync is in progress
   */
  static isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  /**
   * Cancel current sync (if possible)
   */
  static cancelSync(): void {
    if (this.syncInProgress && this.currentProgress) {
      this.currentProgress.errors.push('Sync cancelled by user');
      this.currentProgress.isComplete = true;
      this.syncInProgress = false;
    }
  }

  /**
   * Sync invoice details for existing invoices
   */
  static async syncDetailsForExistingInvoices(
    invoiceIds: string[]
  ): Promise<{ success: boolean; totalDetailsSaved: number; errors: string[] }> {
    const result = {
      success: true,
      totalDetailsSaved: 0,
      errors: [] as string[]
    };

    console.log(`Syncing details for ${invoiceIds.length} existing invoices...`);

    for (const invoiceId of invoiceIds) {
      try {
        // Get invoice from database to extract detail parameters
        const invoice = await InvoiceDatabaseService.getInvoice(invoiceId);
        
        if (!invoice) {
          result.errors.push(`Invoice ${invoiceId} not found in database`);
          continue;
        }

        // Check if details already exist
        const existingDetails = await InvoiceDatabaseService.getInvoiceDetails(invoiceId);
        if (existingDetails.length > 0) {
          console.log(`Invoice ${invoiceId} already has ${existingDetails.length} details, skipping...`);
          continue;
        }

        // Prepare detail parameters
        const detailParams = {
          nbmst: invoice.nbmst!,
          khhdon: invoice.khmshdon!,
          shdon: invoice.shdon!,
          khmshdon: invoice.khmshdon!
        };

        // Sync details
        const detailsResult = await InvoiceDatabaseService.syncInvoiceDetailsOnly(invoiceId, detailParams);
        
        if (detailsResult.success) {
          result.totalDetailsSaved += detailsResult.count;
          console.log(`Successfully synced ${detailsResult.count} details for invoice ${invoiceId}`);
        } else {
          result.errors.push(`Failed to sync details for invoice ${invoiceId}: ${detailsResult.error}`);
        }

      } catch (error: any) {
        result.errors.push(`Error syncing details for invoice ${invoiceId}: ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Validate sync configuration
   */
  static async validateSyncConfiguration(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Test database connection
      await InvoiceDatabaseService.getDatabaseStats();
    } catch (error) {
      errors.push('Database connection failed');
    }

    try {
      // Test external API connection (this would need a simple test endpoint)
      // For now, we'll assume the API is accessible if config is valid
      const config = await import('./configService');
      const validatedConfig = config.default.getValidatedConfig();
      
      if (!validatedConfig.bearerToken) {
        errors.push('Bearer token not configured');
      }
    } catch (error) {
      errors.push('External API configuration failed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get sync statistics
   */
  static async getSyncStatistics(): Promise<{
    databaseStats: any;
    lastSyncInfo?: SyncProgress;
  }> {
    const databaseStats = await InvoiceDatabaseService.getDatabaseStats();
    
    return {
      databaseStats,
      lastSyncInfo: this.currentProgress || undefined
    };
  }
}

export default InvoiceSyncService;