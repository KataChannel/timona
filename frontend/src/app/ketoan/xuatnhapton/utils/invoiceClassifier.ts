import { InvoiceHeader } from '../types';

// Debug flag
let classifyDebugLogged = false;

/**
 * Classify invoice as sale or purchase based on MST
 * @param invoice - Invoice header
 * @param userMST - User's tax code (MST)
 * @returns 'sale' if user is seller, 'purchase' if user is buyer, null if neither
 */
export const classifyInvoice = (
  invoice: InvoiceHeader,
  userMST: string
): 'sale' | 'purchase' | null => {
  if (!userMST || !invoice) return null;
  
  const normalizedUserMST = userMST.trim().toLowerCase();
  const nbmst = invoice.nbmst?.trim().toLowerCase();
  const nmmst = invoice.nmmst?.trim().toLowerCase();
  
  // Debug first invoice
  if (!classifyDebugLogged) {
    console.log('🔍 classifyInvoice DEBUG:', {
      userMST: normalizedUserMST,
      nbmst,
      nmmst,
      matchesSeller: nbmst === normalizedUserMST,
      matchesBuyer: nmmst === normalizedUserMST,
      invoice: invoice
    });
    classifyDebugLogged = true;
  }
  
  // Hóa đơn bán: nbmst = user MST
  if (nbmst === normalizedUserMST) {
    return 'sale';
  }
  
  // Hóa đơn mua: nmmst = user MST
  if (nmmst === normalizedUserMST) {
    return 'purchase';
  }
  
  return null;
};

/**
 * Filter invoices by type
 */
export const filterInvoicesByType = (
  invoices: InvoiceHeader[],
  userMST: string,
  type: 'all' | 'sale' | 'purchase'
): InvoiceHeader[] => {
  if (type === 'all') return invoices;
  
  return invoices.filter(invoice => {
    const classification = classifyInvoice(invoice, userMST);
    return classification === type;
  });
};

/**
 * Get invoice type display name
 */
export const getInvoiceTypeLabel = (type: 'sale' | 'purchase' | null): string => {
  switch (type) {
    case 'sale':
      return 'Bán hàng';
    case 'purchase':
      return 'Mua hàng';
    default:
      return 'Không xác định';
  }
};

/**
 * Get invoice type badge color
 */
export const getInvoiceTypeBadgeColor = (type: 'sale' | 'purchase' | null): string => {
  switch (type) {
    case 'sale':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'purchase':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
