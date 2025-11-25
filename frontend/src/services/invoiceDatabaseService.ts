import { InvoiceData, ExtListhoadon, ExtDetailhoadon } from '@/types/invoice';
import InvoiceDetailApiService, { InvoiceDetailParams } from './invoiceDetailApi';
import ConfigService from './configService';

export interface DatabaseSyncResult {
  success: boolean;
  invoicesSaved: number;
  detailsSaved: number;
  errors: string[];
  message: string;
}

export class InvoiceDatabaseService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  /**
   * Map API invoice data to database format
   */
  private static mapApiToDatabase(apiInvoice: InvoiceData): Partial<ExtListhoadon> {
    return {
      // Use existing ID if available, otherwise let database generate
      ...(apiInvoice.id && { id: apiInvoice.id }),
      
      // Basic Invoice Info
      nbmst: apiInvoice.nbmst || apiInvoice.msttcgp,
      khmshdon: apiInvoice.khmshdon,
      shdon: apiInvoice.shdon,
      nbten: apiInvoice.tentcgp,
      nbdchi: apiInvoice.dctcgp,
      
      // Buyer Information
      nmmst: apiInvoice.msttmua,
      nmten: apiInvoice.tenxmua,
      nmdchi: apiInvoice.dcxmua,
      
      // Amounts
      tgtcthue: apiInvoice.tgtcthue,
      tgtthue: apiInvoice.tgtthue,
      tgtttbso: apiInvoice.tgtttbso,
      tgtttbchu: apiInvoice.tgtttchu,
      
      // Status and timing
      tthai: apiInvoice.tghdon,
      tdlap: apiInvoice.tdlap ? new Date(this.parseDate(apiInvoice.tdlap)) : undefined,
      
      // Additional fields - using correct database field names
      htttoan: apiInvoice.pthuc,
      gchu: apiInvoice.mtdieu,
      
      // Brand name from configuration
      brandname: ConfigService.getConfig().brandname || '',
      
      // Meta fields
      ladhddt: true, // This is always electronic invoice
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Parse date string from API (handles DD/MM/YYYY format)
   */
  private static parseDate(dateStr: string): string {
    try {
      if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Already in ISO format
      return dateStr;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Save single invoice to database
   */
  static async saveInvoice(apiInvoice: InvoiceData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const invoiceData = this.mapApiToDatabase(apiInvoice);
      
      const response = await fetch(`${this.API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, id: result.id };
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save invoice details to database
   */
  static async saveInvoiceDetails(
    invoiceId: string, 
    details: ExtDetailhoadon[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const detailsData = details.map(detail => ({
        ...detail,
        idhdon: invoiceId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const response = await fetch(`${this.API_BASE_URL}/invoices/${invoiceId}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ details: detailsData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, count: result.count || details.length };
    } catch (error: any) {
      console.error('Error saving invoice details:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Automatically fetch and save invoice details for a successfully synced invoice
   */
  static async fetchAndSaveInvoiceDetails(
    invoiceId: string,
    apiInvoice: InvoiceData
  ): Promise<{ success: boolean; detailCount: number; error?: string }> {
    try {
      console.log(`Auto-fetching details for invoice ${apiInvoice.shdon}...`);
      
      // Extract detail parameters from invoice
      const detailParams = InvoiceDetailApiService.extractDetailParamsFromInvoice(apiInvoice);
      
      if (!detailParams) {
        return { 
          success: false, 
          detailCount: 0, 
          error: `Could not extract detail parameters for invoice ${apiInvoice.shdon}` 
        };
      }

      // Validate parameters
      const validation = InvoiceDetailApiService.validateDetailParams(detailParams);
      
      if (!validation.isValid) {
        return { 
          success: false, 
          detailCount: 0, 
          error: `Invalid detail parameters for invoice ${apiInvoice.shdon}: ${validation.error}` 
        };
      }

      // Fetch details from external API
      const detailResponse = await InvoiceDetailApiService.fetchInvoiceDetails(detailParams);
      
      if (!detailResponse.success || !detailResponse.datas || detailResponse.datas.length === 0) {
        console.log(`No details found for invoice ${apiInvoice.shdon}`);
        return { success: true, detailCount: 0 }; // Not an error, just no details available
      }

      // Save details to database
      const detailsResult = await this.saveInvoiceDetails(invoiceId, detailResponse.datas);
      
      if (detailsResult.success) {
        console.log(`Successfully auto-saved ${detailsResult.count} details for invoice ${apiInvoice.shdon}`);
        return { success: true, detailCount: detailsResult.count };
      } else {
        return { 
          success: false, 
          detailCount: 0, 
          error: `Failed to save details for invoice ${apiInvoice.shdon}: ${detailsResult.error}` 
        };
      }
    } catch (error: any) {
      console.error(`Error auto-fetching details for invoice ${apiInvoice.shdon}:`, error);
      return { 
        success: false, 
        detailCount: 0, 
        error: `Auto-fetch details error for invoice ${apiInvoice.shdon}: ${error.message}` 
      };
    }
  }

  /**
   * Sync multiple invoices with database and automatically fetch details
   */
  static async syncInvoices(
    apiInvoices: InvoiceData[],
    includeDetails: boolean = true
  ): Promise<DatabaseSyncResult> {
    const result: DatabaseSyncResult = {
      success: true,
      invoicesSaved: 0,
      detailsSaved: 0,
      errors: [],
      message: ''
    };

    console.log(`Starting sync of ${apiInvoices.length} invoices, includeDetails: ${includeDetails}`);

    for (const apiInvoice of apiInvoices) {
      try {
        // Check if invoice already exists
        const exists = await this.invoiceExists(
          apiInvoice.nbmst || apiInvoice.msttcgp,
          apiInvoice.khmshdon,
          apiInvoice.shdon
        );

        if (exists) {
          console.log(`Invoice ${apiInvoice.shdon} already exists, skipping...`);
          continue;
        }

        // Save invoice
        const invoiceResult = await this.saveInvoice(apiInvoice);
        
        if (invoiceResult.success && invoiceResult.id) {
          result.invoicesSaved++;
          console.log(`Successfully saved invoice ${apiInvoice.shdon} with ID: ${invoiceResult.id}`);
          
          // Automatically fetch and save details after successful invoice sync
          if (includeDetails) {
            const detailResult = await this.fetchAndSaveInvoiceDetails(invoiceResult.id, apiInvoice);
            
            if (detailResult.success) {
              result.detailsSaved += detailResult.detailCount;
            } else if (detailResult.error) {
              result.errors.push(detailResult.error);
            }
          }
        } else {
          result.errors.push(`Failed to save invoice ${apiInvoice.shdon}: ${invoiceResult.error}`);
        }
      } catch (error: any) {
        console.error(`Error processing invoice ${apiInvoice.shdon}:`, error);
        result.errors.push(`Error processing invoice ${apiInvoice.shdon}: ${error.message}`);
      }
    }

    // Set overall success based on results
    result.success = result.errors.length === 0;
    result.message = result.success 
      ? `Successfully synced ${result.invoicesSaved} invoices${includeDetails ? ` with ${result.detailsSaved} details` : ''}`
      : `Synced ${result.invoicesSaved} invoices${includeDetails ? ` with ${result.detailsSaved} details` : ''} with ${result.errors.length} errors`;

    console.log('Sync completed:', result);
    return result;
  }

  /**
   * Sync invoices with automatic detail fetching and Bearer Token (simplified wrapper)
   */
  static async syncInvoicesWithDetails(apiInvoices: InvoiceData[], bearerToken?: string): Promise<DatabaseSyncResult> {
    return this.syncInvoicesGraphQL(apiInvoices, true, bearerToken);
  }

  /**
   * Sync invoices without details (for backward compatibility)
   */
  static async syncInvoicesOnly(apiInvoices: InvoiceData[], bearerToken?: string): Promise<DatabaseSyncResult> {
    return this.syncInvoicesGraphQL(apiInvoices, false, bearerToken);
  }

  /**
   * Check if invoice exists in database
   */
  static async invoiceExists(nbmst: string, khmshdon: string, shdon: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/invoices/exists?nbmst=${nbmst}&khmshdon=${khmshdon}&shdon=${shdon}`
      );
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.exists === true;
    } catch (error) {
      console.error('Error checking invoice existence:', error);
      return false;
    }
  }

  /**
   * Get invoice from database
   */
  static async getInvoice(id: string): Promise<ExtListhoadon | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/invoices/${id}`);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  }

  /**
   * Get invoice details from database
   */
  static async getInvoiceDetails(invoiceId: string): Promise<ExtDetailhoadon[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/invoices/${invoiceId}/details`);
      
      if (!response.ok) {
        return [];
      }
      
      const result = await response.json();
      return result.details || [];
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      return [];
    }
  }

  /**
   * Search invoices in database
   */
  static async searchInvoices(params: {
    nbmst?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ invoices: ExtListhoadon[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.nbmst) queryParams.set('nbmst', params.nbmst);
      if (params.fromDate) queryParams.set('fromDate', params.fromDate);
      if (params.toDate) queryParams.set('toDate', params.toDate);
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.size) queryParams.set('size', params.size.toString());

      const response = await fetch(`${this.API_BASE_URL}/invoices/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching invoices:', error);
      return { invoices: [], total: 0 };
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    totalInvoices: number;
    totalDetails: number;
    lastSyncDate?: Date;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/invoices/stats`);
      
      if (!response.ok) {
        throw new Error(`Stats request failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching database stats:', error);
      return { totalInvoices: 0, totalDetails: 0 };
    }
  }

  /**
   * Sync invoices using GraphQL with Bearer Token support
   */
  static async syncInvoicesGraphQL(
    apiInvoices: InvoiceData[],
    includeDetails: boolean = true,
    bearerToken?: string
  ): Promise<DatabaseSyncResult> {
    try {
      // Get GraphQL endpoint
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';
      
      console.log(`Syncing ${apiInvoices.length} invoices via GraphQL with Bearer Token: ${bearerToken ? 'Yes' : 'No'}`);

      // Prepare GraphQL mutation
      const mutation = `
        mutation BulkCreateInvoices($input: BulkInvoiceInput!) {
          bulkCreateInvoices(input: $input) {
            success
            invoicesSaved
            detailsSaved
            errors
            message
          }
        }
      `;

      // Get brandname from ConfigService
      const config = ConfigService.getConfig();

      // Prepare variables
      const variables = {
        input: {
          invoices: apiInvoices.map(invoice => ({
            ...invoice,
            // Ensure proper data types for common fields
            tdlap: invoice.tdlap ? new Date(invoice.tdlap).toISOString() : null,
            tgtttbso: invoice.tgtttbso ? parseFloat(invoice.tgtttbso.toString()) : null,
            tgtthue: invoice.tgtthue ? parseFloat(invoice.tgtthue.toString()) : null,
            tgtcthue: invoice.tgtcthue ? parseFloat(invoice.tgtcthue.toString()) : null,
            // Add brandname from configuration
            brandname: config.brandname || '',
          })),
          skipExisting: true,
          includeDetails,
          bearerToken // Pass Bearer Token to backend
        }
      };

      // Make GraphQL request
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      return result.data.bulkCreateInvoices;

    } catch (error: any) {
      console.error('Error in GraphQL sync:', error);
      return {
        success: false,
        invoicesSaved: 0,
        detailsSaved: 0,
        errors: [error.message],
        message: `GraphQL sync failed: ${error.message}`
      };
    }
  }

  /**
   * Sync invoices in batches for better performance with Bearer Token
   */
  static async syncInvoicesBatch(
    apiInvoices: InvoiceData[],
    includeDetails: boolean = true,
    batchSize: number = 10,
    bearerToken?: string
  ): Promise<DatabaseSyncResult> {
    const totalResult: DatabaseSyncResult = {
      success: true,
      invoicesSaved: 0,
      detailsSaved: 0,
      errors: [],
      message: ''
    };

    const tokenInfo = bearerToken ? 'with Bearer Token from frontend' : 'using environment token';
    console.log(`Starting batch sync of ${apiInvoices.length} invoices in batches of ${batchSize} ${tokenInfo}`);

    // Process invoices in batches
    for (let i = 0; i < apiInvoices.length; i += batchSize) {
      const batch = apiInvoices.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(apiInvoices.length / batchSize)}`);

      try {
        const batchResult = await this.syncInvoicesGraphQL(batch, includeDetails, bearerToken);
        
        // Accumulate results
        totalResult.invoicesSaved += batchResult.invoicesSaved;
        totalResult.detailsSaved += batchResult.detailsSaved;
        totalResult.errors.push(...batchResult.errors);

        // Small delay between batches to avoid overwhelming the API
        if (i + batchSize < apiInvoices.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        totalResult.errors.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
      }
    }

    // Set overall success
    totalResult.success = totalResult.errors.length === 0;
    totalResult.message = totalResult.success 
      ? `Successfully synced ${totalResult.invoicesSaved} invoices${includeDetails ? ` with ${totalResult.detailsSaved} details` : ''} in ${Math.ceil(apiInvoices.length / batchSize)} batches`
      : `Synced ${totalResult.invoicesSaved} invoices${includeDetails ? ` with ${totalResult.detailsSaved} details` : ''} with ${totalResult.errors.length} errors`;

    return totalResult;
  }

  /**
   * Sync single invoice with retry logic
   */
  static async syncSingleInvoiceWithRetry(
    apiInvoice: InvoiceData,
    includeDetails: boolean = false,
    maxRetries: number = 3
  ): Promise<{ success: boolean; id?: string; detailsSaved?: number; error?: string }> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to sync invoice ${apiInvoice.shdon} (attempt ${attempt}/${maxRetries})`);

        // Check if invoice already exists
        const exists = await this.invoiceExists(
          apiInvoice.nbmst || apiInvoice.msttcgp,
          apiInvoice.khmshdon,
          apiInvoice.shdon
        );

        if (exists) {
          return { success: true, error: 'Invoice already exists' };
        }

        // Save invoice
        const invoiceResult = await this.saveInvoice(apiInvoice);
        
        if (!invoiceResult.success || !invoiceResult.id) {
          throw new Error(invoiceResult.error || 'Failed to save invoice');
        }

        let detailsSaved = 0;

        // Fetch and save details if requested
        if (includeDetails) {
          const detailParams = InvoiceDetailApiService.extractDetailParamsFromInvoice(apiInvoice);
          
          if (detailParams) {
            const validation = InvoiceDetailApiService.validateDetailParams(detailParams);
            
            if (validation.isValid) {
              const detailResponse = await InvoiceDetailApiService.fetchInvoiceDetails(detailParams);
              
              if (detailResponse.success && detailResponse.datas && detailResponse.datas.length > 0) {
                const detailsResult = await this.saveInvoiceDetails(invoiceResult.id, detailResponse.datas);
                
                if (detailsResult.success) {
                  detailsSaved = detailsResult.count;
                }
              }
            }
          }
        }

        return { 
          success: true, 
          id: invoiceResult.id, 
          detailsSaved: includeDetails ? detailsSaved : undefined 
        };

      } catch (error: any) {
        lastError = error.message;
        console.error(`Attempt ${attempt} failed for invoice ${apiInvoice.shdon}:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return { success: false, error: `Failed after ${maxRetries} attempts: ${lastError}` };
  }

  /**
   * Sync invoice details only (for invoices already in database)
   */
  static async syncInvoiceDetailsOnly(
    invoiceId: string,
    detailParams: InvoiceDetailParams
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Validate parameters
      const validation = InvoiceDetailApiService.validateDetailParams(detailParams);
      
      if (!validation.isValid) {
        return { success: false, count: 0, error: validation.error };
      }

      // Fetch details from external API
      const detailResponse = await InvoiceDetailApiService.fetchInvoiceDetails(detailParams);
      
      if (!detailResponse.success || !detailResponse.datas || detailResponse.datas.length === 0) {
        return { success: false, count: 0, error: 'No details found from external API' };
      }

      // Save details to database
      const result = await this.saveInvoiceDetails(invoiceId, detailResponse.datas);
      
      return result;
    } catch (error: any) {
      console.error('Error syncing invoice details only:', error);
      return { success: false, count: 0, error: error.message };
    }
  }
}

export default InvoiceDatabaseService;