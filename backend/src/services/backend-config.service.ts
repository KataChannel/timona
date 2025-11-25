import { Injectable, Logger } from '@nestjs/common';

export interface BackendInvoiceConfig {
  bearerToken: string;
  apiBaseUrl: string;
  timeout: number;
  sslVerification: boolean;
  brandname?: string;  // Tên nhãn hàng
  // Rate limiting configuration
  batchSize: number;
  delayBetweenBatches: number;
  delayBetweenDetailCalls: number;
  maxRetries: number;
}

@Injectable()
export class BackendConfigService {
  private readonly logger = new Logger(BackendConfigService.name);
  
  /**
   * Get invoice configuration from environment variables
   */
  getInvoiceConfig(): BackendInvoiceConfig {
    const bearerToken = this.getBearerTokenSafe();
    const apiBaseUrl = process.env.INVOICE_API_BASE_URL || 'https://hoadon.vanban.vn';
    const timeout = parseInt(process.env.INVOICE_API_TIMEOUT || '30000', 10);
    const sslVerification = process.env.INVOICE_SSL_VERIFICATION !== 'false';
    const brandname = process.env.INVOICE_BRANDNAME || '';
    
    // Rate limiting configuration - Updated to prevent 429 errors
    const batchSize = parseInt(process.env.INVOICE_BATCH_SIZE || '3', 10); // Reduced from 10 to 3
    const delayBetweenBatches = parseInt(process.env.INVOICE_DELAY_BETWEEN_BATCHES || '3000', 10); // Increased from 1000 to 3000
    const delayBetweenDetailCalls = parseInt(process.env.INVOICE_DELAY_BETWEEN_DETAIL_CALLS || '2000', 10); // Increased from 500 to 2000
    const maxRetries = parseInt(process.env.INVOICE_MAX_RETRIES || '5', 10); // Increased from 3 to 5

    return {
      bearerToken,
      apiBaseUrl,
      timeout,
      sslVerification,
      brandname,
      batchSize,
      delayBetweenBatches,
      delayBetweenDetailCalls,
      maxRetries
    };
  }

  /**
   * Get bearer token from environment (throws error if not found)
   */
  getBearerToken(): string {
    const token = process.env.INVOICE_BEARER_TOKEN;
    if (!token) {
      throw new Error('INVOICE_BEARER_TOKEN environment variable is required');
    }
    return token;
  }

  /**
   * Get bearer token from environment safely (returns empty string if not found)
   */
  getBearerTokenSafe(): string {
    return process.env.INVOICE_BEARER_TOKEN || '';
  }

  /**
   * Get brandname from environment
   */
  getBrandname(): string {
    return process.env.INVOICE_BRANDNAME || '';
  }

  /**
   * Validate if Bearer Token is configured properly
   */
  isTokenConfigured(): boolean {
    const token = this.getBearerTokenSafe();
    return token.length > 0 && 
           token !== 'your-actual-bearer-token-here' && 
           token !== 'your-default-bearer-token-here';
  }

  /**
   * Get complete API endpoint for detail fetching
   */
  getDetailApiEndpoint(): string {
    const config = this.getInvoiceConfig();
    return `${config.apiBaseUrl}/query/invoices/detail`;
  }

  /**
   * Validate configuration parameters
   */
  validateConfiguration(): boolean {
    try {
      const config = this.getInvoiceConfig();
      const hasValidToken = config.bearerToken.length > 0;
      const hasValidTimeout = config.timeout > 0;
      const hasValidBrandname = config.brandname !== undefined;
      
      return hasValidToken && hasValidTimeout && hasValidBrandname;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }
}