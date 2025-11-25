import { InvoiceHeader, InvoiceDetail, ProductMapping, InventoryRow, GroupBy, OpeningBalance } from '../types';
import { classifyInvoice } from './invoiceClassifier';

/**
 * Calculate opening balance from transactions before periodStartDate
 * Looks back up to 5 years
 */
export const calculateOpeningBalance = (
  invoices: InvoiceHeader[],
  details: InvoiceDetail[],
  products: ProductMapping[],
  userMST: string,
  groupBy: GroupBy,
  periodStartDate: string
): Map<string, OpeningBalance> => {
  console.log('🔵 calculateOpeningBalance START:', { periodStartDate });
  
  // Calculate date 5 years before periodStartDate
  const startDateObj = new Date(periodStartDate);
  const fiveYearsAgo = new Date(startDateObj);
  fiveYearsAgo.setFullYear(startDateObj.getFullYear() - 5);
  
  console.log('📅 Date range for opening balance:', {
    from: fiveYearsAgo.toISOString().split('T')[0],
    to: periodStartDate
  });
  
  // Calculate inventory from 5 years ago to periodStartDate (exclusive)
  const periodEndDate = new Date(startDateObj);
  periodEndDate.setDate(periodEndDate.getDate() - 1); // Day before periodStartDate
  
  const historicalInventory = calculateInventory(
    invoices,
    details,
    products,
    userMST,
    groupBy,
    fiveYearsAgo.toISOString().split('T')[0],
    periodEndDate.toISOString().split('T')[0]
  );
  
  // Group by product and get closing balance (which becomes opening balance)
  const openingBalanceMap = new Map<string, OpeningBalance>();
  
  // Sum up all transactions per product to get final closing balance
  historicalInventory.forEach(row => {
    const existing = openingBalanceMap.get(row.productName);
    if (existing) {
      existing.quantity += row.closingQuantity;
      existing.amount += row.closingAmount;
    } else {
      openingBalanceMap.set(row.productName, {
        productName: row.productName,
        quantity: row.closingQuantity,
        amount: row.closingAmount
      });
    }
  });
  
  console.log('✅ Opening balance calculated for', openingBalanceMap.size, 'products');
  if (openingBalanceMap.size > 0) {
    const samples = Array.from(openingBalanceMap.values()).slice(0, 3);
    console.log('Sample opening balances:', samples);
  }
  
  return openingBalanceMap;
};

/**
 * Match product name from invoice detail to product mapping
 * Returns normalized name (ten2) or product code (ma) based on groupBy
 */
const matchProduct = (
  detailName: string,
  products: ProductMapping[],
  groupBy: GroupBy
): { key: string; code: string | null; unit: string | null } => {
  // If no products available, use original name
  if (!products || products.length === 0) {
    console.warn('⚠️ No products available for mapping, using original name');
    return {
      key: detailName,
      code: null,
      unit: null,
    };
  }
  
  // Try exact match first
  const exactMatch = products.find(p => p.ten?.toLowerCase() === detailName.toLowerCase());
  if (exactMatch) {
    const key = groupBy === 'ma' ? (exactMatch.ma || detailName) : (exactMatch.ten2 || detailName);
    return {
      key,
      code: exactMatch.ma,
      unit: exactMatch.dvt,
    };
  }
  
  // Try partial match
  const partialMatch = products.find(p => 
    p.ten?.toLowerCase().includes(detailName.toLowerCase()) ||
    detailName.toLowerCase().includes(p.ten?.toLowerCase() || '')
  );
  if (partialMatch) {
    const key = groupBy === 'ma' ? (partialMatch.ma || detailName) : (partialMatch.ten2 || detailName);
    return {
      key,
      code: partialMatch.ma,
      unit: partialMatch.dvt,
    };
  }
  
  // No match found, use original name
  return {
    key: detailName,
    code: null,
    unit: null,
  };
};

/**
 * Calculate inventory report from invoices
 * @param openingBalances - Optional opening balances at period start
 */
export const calculateInventory = (
  invoices: InvoiceHeader[],
  details: InvoiceDetail[],
  products: ProductMapping[],
  userMST: string,
  groupBy: GroupBy,
  startDate: string,
  endDate: string,
  openingBalances?: Map<string, OpeningBalance>
): InventoryRow[] => {
  console.log('🔧 calculateInventory START:', { invoices: invoices.length, details: details.length, products: products.length });
  
  // Create a map to store inventory by product and date
  const inventoryMap = new Map<string, InventoryRow>();
  
  // Filter invoices by date range
  const filteredInvoices = invoices.filter(inv => {
    if (!inv.tdlap) return false;
    const invDate = new Date(inv.tdlap);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include end date
    return invDate >= start && invDate <= end;
  });
  
  console.log('📅 Filtered by date:', filteredInvoices.length, 'invoices');
  
  // Process each invoice detail
  let processedCount = 0;
  let skippedNoType = 0;
  let saleCount = 0;
  let purchaseCount = 0;
  
  filteredInvoices.forEach(invoice => {
    const invoiceType = classifyInvoice(invoice, userMST);
    if (!invoiceType) {
      skippedNoType++;
      return; // Skip if invoice doesn't belong to user
    }
    processedCount++;
    if (invoiceType === 'sale') saleCount++;
    if (invoiceType === 'purchase') purchaseCount++;
    
    // Get all details for this invoice using idServer field
    const invoiceDetails = details.filter(d => d.idhdonServer === invoice.idServer);
    
    if (processedCount <= 2) {
      console.log(`📄 Processing invoice #${processedCount}:`, {
        type: invoiceType,
        id: invoice.id,
        idServer: invoice.idServer,
        nbmst: invoice.nbmst,
        nmmst: invoice.nmmst,
        detailsCount: invoiceDetails.length,
      });
    }
    
    invoiceDetails.forEach(detail => {
      if (!detail.ten) return;
      
      // Match product
      const { key: productKey, code: productCode, unit } = matchProduct(
        detail.ten,
        products,
        groupBy
      );
      
      // Get or create inventory row for this product and date
      const date = invoice.tdlap ? new Date(invoice.tdlap).toISOString().split('T')[0] : '';
      const mapKey = `${productKey}_${date}`;
      
      let row = inventoryMap.get(mapKey);
      if (!row) {
        row = {
          productName: productKey,
          originalName: detail.ten, // Lưu tên gốc từ hóa đơn
          productCode: productCode,
          unit: unit || detail.dvtinh,
          date: date,
          openingQuantity: 0,
          openingAmount: 0,
          importQuantity: 0,
          importAmount: 0,
          exportQuantity: 0,
          exportAmount: 0,
          exportCostPrice: 0,
          exportSalePrice: 0,
          exportSaleAmount: 0,
          closingQuantity: 0,
          closingAmount: 0,
        };
        inventoryMap.set(mapKey, row);
      }
      
      // Add to import or export based on invoice type
      const quantity = Number(detail.sluong) || 0;
      const amount = Number(detail.thtien) || 0;
      const unitPrice = Number(detail.dgia) || 0;
      
      if (invoiceType === 'purchase') {
        // Mua hàng = Nhập kho
        row.importQuantity += quantity;
        row.importAmount += amount;
      } else if (invoiceType === 'sale') {
        // Bán hàng = Xuất kho
        row.exportQuantity += quantity;
        // Note: exportAmount will be calculated as cost (giá vốn × SL)
        // exportSaleAmount will be calculated from sale price (giá bán × SL)
        row.exportSalePrice = unitPrice; // Store sale unit price from invoice
        row.exportSaleAmount += unitPrice * quantity; // Total sale amount
      }
    });
  });
  
  console.log('✅ Processed invoices:', processedCount, '| Sales:', saleCount, '| Purchases:', purchaseCount, '| Skipped (no type):', skippedNoType);
  console.log('📦 Inventory map size:', inventoryMap.size);
  
  // Convert map to array and calculate closing inventory
  const inventoryRows = Array.from(inventoryMap.values());
  
  console.log('📊 Inventory rows before grouping:', inventoryRows.length);
  
  // Sort by date and calculate cumulative inventory
  const productGroups = new Map<string, InventoryRow[]>();
  inventoryRows.forEach(row => {
    const key = row.productName;
    if (!productGroups.has(key)) {
      productGroups.set(key, []);
    }
    productGroups.get(key)!.push(row);
  });
  
  console.log('🏷️ Product groups:', productGroups.size);
  
  // Calculate opening and closing for each product
  const finalRows: InventoryRow[] = [];
  productGroups.forEach(rows => {
    // Sort by date
    rows.sort((a, b) => a.date.localeCompare(b.date));
    
    // Initialize running balance
    const productName = rows[0].productName;
    const openingBalance = openingBalances?.get(productName);
    
    let runningQuantity = openingBalance?.quantity || 0;
    let runningAmount = openingBalance?.amount || 0;
    
    if (openingBalance) {
      console.log(`🔵 Using opening balance for "${productName}":`, {
        quantity: runningQuantity,
        amount: runningAmount
      });
    }
    
    rows.forEach(row => {
      row.openingQuantity = runningQuantity;
      row.openingAmount = runningAmount;
      
      // Calculate weighted average cost price (Giá vốn bình quân gia quyền)
      // Formula: (Tồn đầu tiền + Nhập tiền) / (Tồn đầu SL + Nhập SL)
      const totalQuantity = row.openingQuantity + row.importQuantity;
      const totalAmount = row.openingAmount + row.importAmount;
      const weightedAvgCost = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
      
      row.exportCostPrice = weightedAvgCost;
      row.exportAmount = weightedAvgCost * row.exportQuantity; // Cost of goods sold
      
      // Formula: Tồn Đầu + Nhập - Xuất = Tồn Cuối
      row.closingQuantity = row.openingQuantity + row.importQuantity - row.exportQuantity;
      row.closingAmount = row.openingAmount + row.importAmount - row.exportAmount;
      
      runningQuantity = row.closingQuantity;
      runningAmount = row.closingAmount;
      
      finalRows.push(row);
    });
  });
  
  console.log('🎯 FINAL ROWS:', finalRows.length);
  if (finalRows.length > 0) {
    console.log('Sample row:', finalRows[0]);
  }
  
  return finalRows;
};

/**
 * Group inventory rows by product (sum all dates for each product)
 */
export const groupInventoryByProduct = (rows: InventoryRow[]): InventoryRow[] => {
  const productMap = new Map<string, InventoryRow>();
  
  rows.forEach(row => {
    const existing = productMap.get(row.productName);
    if (!existing) {
      productMap.set(row.productName, { ...row });
    } else {
      existing.importQuantity += row.importQuantity;
      existing.importAmount += row.importAmount;
      existing.exportQuantity += row.exportQuantity;
      existing.exportAmount += row.exportAmount;
      existing.exportSaleAmount += row.exportSaleAmount;
      existing.closingQuantity += row.closingQuantity;
      existing.closingAmount += row.closingAmount;
      
      // Recalculate weighted average for grouped data
      const totalQty = existing.importQuantity + existing.openingQuantity;
      const totalAmt = existing.importAmount + existing.openingAmount;
      existing.exportCostPrice = totalQty > 0 ? totalAmt / totalQty : 0;
      existing.exportSalePrice = existing.exportQuantity > 0 ? existing.exportSaleAmount / existing.exportQuantity : 0;
    }
  });
  
  return Array.from(productMap.values());
};
