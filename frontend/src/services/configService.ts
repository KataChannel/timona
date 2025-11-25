import { InvoiceConfig, InvoiceType } from '@/types/invoice';

export class ConfigService {
  private static readonly STORAGE_KEY = 'invoice_config';
  private static readonly DEFAULT_CONFIG: InvoiceConfig = {
    bearerToken: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1OTAwNDI4OTA0IiwidHlwZSI6MiwiZXhwIjoxNzU4OTQ2MjgxLCJpYXQiOjE3NTg4NTk4ODF9.Uo17DIposfoivAM-o6BYe0gxa6YY2rIeWn1QhthrZitU6cHDFM5A70ngBeGoe1RUPz4R9_K_CjqkB3YbDhNkbA',
    pageSize: 50,
    invoiceType: 'banra',
    brandname: ''
  };

  /**
   * Get configuration from local storage or return default
   */
  static getConfig(): InvoiceConfig {
    if (typeof window === 'undefined') {
      return this.DEFAULT_CONFIG;
    }

    try {
      const storedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        return { ...this.DEFAULT_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
    }

    return this.DEFAULT_CONFIG;
  }

  /**
   * Save configuration to local storage
   */
  static setConfig(config: Partial<InvoiceConfig>): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
    }
  }

  /**
   * Update bearer token
   */
  static setBearerToken(token: string): void {
    this.setConfig({ bearerToken: token });
  }

  /**
   * Update page size
   */
  static setPageSize(size: number): void {
    this.setConfig({ pageSize: size });
  }

  /**
   * Update invoice type and corresponding API endpoint
   */
  static setInvoiceType(type: InvoiceType): void {
    const apiEndpoint = type === 'banra' ? '/query/invoices/sold' : '/query/invoices/purchase';
    this.setConfig({ 
      invoiceType: type,
      apiEndpoint 
    });
  }

  /**
   * Update brandname
   */
  static setBrandname(brandname: string): void {
    this.setConfig({ brandname });
  }

  /**
   * Get API endpoint based on invoice type
   */
  static getApiEndpoint(type?: InvoiceType): string {
    const config = this.getConfig();
    const invoiceType = type || config.invoiceType;
    
    if (config.apiEndpoint) {
      return config.apiEndpoint;
    }
    
    return invoiceType === 'banra' ? '/query/invoices/sold' : '/query/invoices/purchase';
  }

  /**
   * Reset configuration to default
   */
  static resetConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Validate bearer token format
   */
  static validateBearerToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic JWT token validation (3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Get configuration with validation
   */
  static getValidatedConfig(): InvoiceConfig {
    const config = this.getConfig();
    
    // Validate bearer token
    if (!this.validateBearerToken(config.bearerToken)) {
      console.warn('Invalid bearer token detected, using default');
      config.bearerToken = this.DEFAULT_CONFIG.bearerToken;
    }
    
    // Validate page size
    if (!config.pageSize || config.pageSize < 1 || config.pageSize > 1000) {
      config.pageSize = this.DEFAULT_CONFIG.pageSize;
    }
    
    // Validate brandname (optional, but ensure it's a string)
    if (config.brandname !== undefined && typeof config.brandname !== 'string') {
      config.brandname = this.DEFAULT_CONFIG.brandname;
    }
    
    return config;
  }
}

export default ConfigService;