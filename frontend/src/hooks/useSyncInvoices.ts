import { useState, useCallback, useEffect } from 'react';
import { InvoiceFilter, AdvancedFilter, InvoiceType } from '@/types/invoice';
import InvoiceSyncService, { SyncOptions, SyncProgress } from '@/services/invoiceSyncService';
import { DatabaseSyncResult } from '@/services/invoiceDatabaseService';

export interface UseSyncInvoicesReturn {
  // State
  isLoading: boolean;
  progress: SyncProgress | null;
  result: DatabaseSyncResult | null;
  error: string | null;
  
  // Actions
  startSync: (
    filter: InvoiceFilter | AdvancedFilter,
    invoiceType?: InvoiceType,
    options?: SyncOptions
  ) => Promise<void>;
  
  syncSpecificInvoices: (
    invoiceIdentifiers: Array<{ nbmst: string; khmshdon: string; shdon: string }>,
    includeDetails?: boolean // Default: true - Automatically fetch details after syncing invoices
  ) => Promise<void>;
  
  syncDetailsForExisting: (invoiceIds: string[]) => Promise<void>;
  
  cancelSync: () => void;
  clearError: () => void;
  clearResult: () => void;
  
  // Validation
  validateConfiguration: () => Promise<{ isValid: boolean; errors: string[] }>;
  
  // Statistics
  getStatistics: () => Promise<any>;
}

export function useSyncInvoices(): UseSyncInvoicesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [result, setResult] = useState<DatabaseSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for progress updates when sync is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        const currentProgress = InvoiceSyncService.getSyncProgress();
        setProgress(currentProgress);
        
        if (currentProgress?.isComplete) {
          setIsLoading(false);
        }
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const startSync = useCallback(async (
    filter: InvoiceFilter | AdvancedFilter,
    invoiceType?: InvoiceType,
    options?: SyncOptions
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setProgress(null);
      
      const syncResult = await InvoiceSyncService.syncFromExternalApi(filter, invoiceType, options);
      
      setResult(syncResult);
      
      if (!syncResult.success && syncResult.errors.length > 0) {
        setError(syncResult.errors.join('; '));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sync');
      setResult(null);
    } finally {
      setIsLoading(false);
      // Get final progress state
      const finalProgress = InvoiceSyncService.getSyncProgress();
      setProgress(finalProgress);
    }
  }, []);

  const syncSpecificInvoices = useCallback(async (
    invoiceIdentifiers: Array<{ nbmst: string; khmshdon: string; shdon: string }>,
    includeDetails: boolean = true // Default to true for automatic detail fetching
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      const syncResult = await InvoiceSyncService.syncSpecificInvoices(invoiceIdentifiers, includeDetails);
      
      setResult(syncResult);
      
      if (!syncResult.success && syncResult.errors.length > 0) {
        setError(syncResult.errors.join('; '));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during specific invoice sync');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncDetailsForExisting = useCallback(async (invoiceIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const detailsResult = await InvoiceSyncService.syncDetailsForExistingInvoices(invoiceIds);
      
      // Convert to DatabaseSyncResult format
      const syncResult: DatabaseSyncResult = {
        success: detailsResult.success,
        invoicesSaved: 0,
        detailsSaved: detailsResult.totalDetailsSaved,
        errors: detailsResult.errors,
        message: detailsResult.success 
          ? `Successfully synced ${detailsResult.totalDetailsSaved} details for ${invoiceIds.length} invoices`
          : `Synced details with ${detailsResult.errors.length} errors`
      };
      
      setResult(syncResult);
      
      if (!detailsResult.success && detailsResult.errors.length > 0) {
        setError(detailsResult.errors.join('; '));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during details sync');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSync = useCallback(() => {
    InvoiceSyncService.cancelSync();
    setIsLoading(false);
    setError('Sync cancelled by user');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(null);
  }, []);

  const validateConfiguration = useCallback(async () => {
    try {
      return await InvoiceSyncService.validateSyncConfiguration();
    } catch (err: any) {
      return {
        isValid: false,
        errors: [err.message || 'Configuration validation failed']
      };
    }
  }, []);

  const getStatistics = useCallback(async () => {
    try {
      return await InvoiceSyncService.getSyncStatistics();
    } catch (err: any) {
      setError(err.message || 'Failed to get statistics');
      return null;
    }
  }, []);

  return {
    // State
    isLoading,
    progress,
    result,
    error,
    
    // Actions
    startSync,
    syncSpecificInvoices,
    syncDetailsForExisting,
    cancelSync,
    clearError,
    clearResult,
    
    // Validation
    validateConfiguration,
    
    // Statistics
    getStatistics
  };
}

export default useSyncInvoices;