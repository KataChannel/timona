import { useState, useEffect } from 'react';
import { useDynamicQuery } from '@/lib/graphql/dynamic-hooks';
import { InvoiceHeader, InvoiceDetail, ProductMapping } from '../types';

/**
 * Hook to fetch all necessary data for inventory calculation
 */
export const useInventoryData = () => {
  const [isReady, setIsReady] = useState(false);
  const [debugged, setDebughed] = useState(false);
  const [detailsDebugged, setDetailsDebugged] = useState(false);
  
  // Fetch invoices (ext_listhoadon)
  const {
    data: invoicesData,
    loading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useDynamicQuery('GET_ALL', 'ext_listhoadon', {
    fetchPolicy: 'network-only',
  });
  console.log('invoicesData', invoicesData);
  
  // Fetch invoice details (ext_detailhoadon)
  const {
    data: detailsData,
    loading: detailsLoading,
    error: detailsError,
    refetch: refetchDetails,
  } = useDynamicQuery('GET_ALL', 'ext_detailhoadon', {
    fetchPolicy: 'network-only',
  });
  
  // Fetch product mappings (ext_sanphamhoadon)
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useDynamicQuery('GET_ALL', 'ext_sanphamhoadon', {
    fetchPolicy: 'network-only',
  });
  
  // Extract data from GraphQL responses
  const invoices: InvoiceHeader[] = invoicesData?.getext_listhoadons || [];
  const details: InvoiceDetail[] = detailsData?.getext_detailhoadons || [];
  const products: ProductMapping[] = productsData?.getext_sanphamhoadons || [];
  
  // Debug data structure
  useEffect(() => {
    if (invoices.length > 0 && !debugged) {
      console.log('📋 Sample invoice:', invoices[0]);
      console.log('📋 Invoice fields:', Object.keys(invoices[0]));
      setDebughed(true);
    }
    if (details.length > 0 && !detailsDebugged) {
      console.log('📄 Sample detail:', details[0]);
      console.log('📄 Detail fields:', Object.keys(details[0]));
      setDetailsDebugged(true);
    }
  }, [invoices, details, debugged, detailsDebugged]);
  
  // Check if all data is loaded
  useEffect(() => {
    if (!invoicesLoading && !detailsLoading && !productsLoading) {
      setIsReady(true);
    }
  }, [invoicesLoading, detailsLoading, productsLoading]);
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      refetchInvoices(),
      refetchDetails(),
      refetchProducts(),
    ]);
  };
  
  return {
    invoices,
    details,
    products,
    loading: {
      invoices: invoicesLoading,
      details: detailsLoading,
      products: productsLoading,
      any: invoicesLoading || detailsLoading || productsLoading,
    },
    error: {
      invoices: invoicesError?.message || null,
      details: detailsError?.message || null,
      products: productsError?.message || null,
      any: invoicesError || detailsError || productsError,
    },
    isReady,
    refetch: refetchAll,
  };
};
