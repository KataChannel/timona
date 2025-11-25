/**
 * Example usage of the updated fetchInvoices with pagination support
 * 
 * This demonstrates how to use the new pagination functionality when total > 50
 */

import { InvoiceApiService } from '@/services/invoiceApi';
import { InvoiceFilter, InvoiceApiParams, InvoiceData } from '@/types/invoice';
import { useState } from 'react';

// Example 1: Basic usage - automatically handles pagination when total > 50
export async function fetchAllInvoicesExample() {
  try {
    const filter: InvoiceFilter = {
      fromDate: '01/09/2025',
      toDate: '30/09/2025'
    };

    console.log('🚀 Fetching invoices (auto-pagination when total > 50)...');
    
    const result = await InvoiceApiService.fetchInvoices(filter);
    
    console.log(`✅ Fetched ${result.datas.length} invoices`);
    console.log(`📊 Total available: ${result.total || result.totalElements}`);
    
    if (result.total && result.total > 50) {
      console.log('🔄 Pagination was automatically applied');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    throw error;
  }
}

// Example 2: Using progress callback for UI updates
export async function fetchInvoicesWithProgressExample() {
  try {
    const filter: InvoiceFilter = {
      fromDate: '01/01/2025',
      toDate: '31/12/2025'
    };

    console.log('🚀 Fetching invoices with progress tracking...');
    
    const result = await InvoiceApiService.fetchInvoicesWithProgress(
      filter,
      {},
      'banra', // Sale invoices
      (current, total, percentage) => {
        console.log(`📈 Progress: ${current}/${total} (${percentage}%)`);
        // Update your UI progress bar here
        // e.g., setProgress(percentage);
      }
    );
    
    console.log(`✅ Complete! Fetched ${result.datas.length} invoices`);
    return result;
  } catch (error) {
    console.error('❌ Error fetching invoices with progress:', error);
    throw error;
  }
}

// Example 3: Manual pagination using state token
export async function manualPaginationExample() {
  try {
    const filter: InvoiceFilter = {
      fromDate: '01/09/2025',
      toDate: '30/09/2025'
    };

    let allInvoices = [];
    let currentState: string | undefined;
    let page = 1;
    
    console.log('🚀 Manual pagination example...');
    
    do {
      const params: InvoiceApiParams = {
        size: 50,
        ...(currentState && { state: currentState })
      };
      
      const response = await InvoiceApiService.fetchInvoices(filter, params);
      
      console.log(`📄 Page ${page}: ${response.datas.length} invoices`);
      allInvoices.push(...response.datas);
      
      currentState = response.state;
      page++;
      
      // Break if no more pages or reached reasonable limit
      if (!currentState || page > 20) break;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } while (currentState);
    
    console.log(`✅ Manual pagination complete: ${allInvoices.length} total invoices`);
    return allInvoices;
  } catch (error) {
    console.error('❌ Error in manual pagination:', error);
    throw error;
  }
}

// Example 4: Handling large datasets with error recovery
export async function robustFetchExample() {
  try {
    const filter: InvoiceFilter = {
      fromDate: '01/01/2025',
      toDate: '31/12/2025'
    };

    console.log('🚀 Robust fetch with error handling...');
    
    const result = await InvoiceApiService.fetchInvoicesWithProgress(
      filter,
      { size: 50 },
      'banra', // Sale invoices
      (current, total, percentage) => {
        if (percentage % 10 === 0) { // Log every 10%
          console.log(`📈 ${percentage}% complete (${current}/${total})`);
        }
      }
    );
    
    const successRate = (result.datas.length / (result.total || result.totalElements)) * 100;
    
    if (successRate >= 95) {
      console.log(`✅ Excellent: ${result.datas.length} invoices fetched (${successRate.toFixed(1)}% success)`);
    } else if (successRate >= 80) {
      console.log(`⚠️ Good: ${result.datas.length} invoices fetched (${successRate.toFixed(1)}% success)`);
    } else {
      console.log(`❌ Partial: ${result.datas.length} invoices fetched (${successRate.toFixed(1)}% success)`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in robust fetch:', error);
    throw error;
  }
}

// React Hook example for use in components
export function useInvoicePagination() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchInvoices = async (filter: InvoiceFilter, invoiceType?: 'banra' | 'muavao') => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: 0, percentage: 0 });
    
    try {
      const result = await InvoiceApiService.fetchInvoicesWithProgress(
        filter,
        {},
        invoiceType,
        (current, total, percentage) => {
          setProgress({ current, total, percentage });
        }
      );
      
      setInvoices(result.datas);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    progress,
    invoices,
    error,
    fetchInvoices
  };
}

export default {
  fetchAllInvoicesExample,
  fetchInvoicesWithProgressExample,
  manualPaginationExample,
  robustFetchExample,
  useInvoicePagination
};