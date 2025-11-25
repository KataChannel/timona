import * as XLSX from 'xlsx';
import { InventoryRow, InventorySummary, DateRange } from '../types';
import { formatCurrency, formatNumber, formatDate } from './formatters';

/**
 * Export inventory data to Excel file
 */
export const exportToExcel = (
  rows: InventoryRow[],
  summary: InventorySummary,
  dateRange: DateRange,
  companyName: string
): void => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const excelData: any[] = [];
  
  // Title rows
  excelData.push(['BÁO CÁO XUẤT NHẬP TỒN']);
  excelData.push([companyName]);
  excelData.push([`Từ ngày: ${formatDate(dateRange.startDate)} - Đến ngày: ${formatDate(dateRange.endDate)}`]);
  excelData.push([]); // Empty row
  
  // Header row
  excelData.push([
    'Ngày',
    'Tên Sản Phẩm',
    'Mã SP',
    'ĐVT',
    'SL Tồn Đầu',
    'TT Tồn Đầu',
    'SL Nhập',
    'TT Nhập',
    'SL Xuất',
    'Giá Vốn',
    'TT Vốn',
    'Giá Bán',
    'TT Bán',
    'SL Tồn Cuối',
    'TT Tồn Cuối',
  ]);
  
  // Data rows
  rows.forEach(row => {
    excelData.push([
      formatDate(row.date),
      row.productName,
      row.productCode || '',
      row.unit || '',
      row.openingQuantity,
      row.openingAmount,
      row.importQuantity,
      row.importAmount,
      row.exportQuantity,
      row.exportCostPrice,
      row.exportAmount,
      row.exportSalePrice,
      row.exportSaleAmount,
      row.closingQuantity,
      row.closingAmount,
    ]);
  });
  
  // Summary section
  excelData.push([]); // Empty row
  excelData.push(['TỔNG HỢP']);
  excelData.push(['Tổng số sản phẩm:', summary.totalProducts]);
  excelData.push(['Tổng SL nhập:', summary.totalImportQuantity]);
  excelData.push(['Tổng TT nhập:', summary.totalImportAmount]);
  excelData.push(['Tổng SL xuất:', summary.totalExportQuantity]);
  excelData.push(['Tổng TT vốn:', summary.totalExportAmount]);
  excelData.push(['Tổng TT bán:', summary.totalExportSaleAmount]);
  excelData.push(['Tổng SL tồn cuối:', summary.totalClosingQuantity]);
  excelData.push(['Tổng TT tồn cuối:', summary.totalClosingAmount]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 12 },  // Ngày
    { wch: 40 },  // Tên SP
    { wch: 15 },  // Mã SP
    { wch: 10 },  // ĐVT
    { wch: 12 },  // SL Tồn Đầu
    { wch: 15 },  // TT Tồn Đầu
    { wch: 12 },  // SL Nhập
    { wch: 15 },  // TT Nhập
    { wch: 12 },  // SL Xuất
    { wch: 15 },  // Giá Vốn
    { wch: 15 },  // TT Vốn
    { wch: 15 },  // Giá Bán
    { wch: 15 },  // TT Bán
    { wch: 12 },  // SL Tồn Cuối
    { wch: 15 },  // TT Tồn Cuối
  ];
  ws['!cols'] = colWidths;
  
  // Merge cells for title
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title (15 columns now)
    { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }, // Company name
    { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // Date range
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Xuất Nhập Tồn');
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `XuatNhapTon_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(wb, filename);
};

/**
 * Calculate summary statistics from inventory rows
 */
export const calculateSummary = (rows: InventoryRow[]): InventorySummary => {
  // Get unique products
  const uniqueProducts = new Set(rows.map(r => r.productName));
  
  return {
    totalProducts: uniqueProducts.size,
    totalRecords: rows.length,
    totalOpeningQuantity: rows.reduce((sum, r) => sum + r.openingQuantity, 0),
    totalOpeningAmount: rows.reduce((sum, r) => sum + r.openingAmount, 0),
    totalImportQuantity: rows.reduce((sum, r) => sum + r.importQuantity, 0),
    totalImportAmount: rows.reduce((sum, r) => sum + r.importAmount, 0),
    totalExportQuantity: rows.reduce((sum, r) => sum + r.exportQuantity, 0),
    totalExportAmount: rows.reduce((sum, r) => sum + r.exportAmount, 0),
    totalExportSaleAmount: rows.reduce((sum, r) => sum + r.exportSaleAmount, 0),
    totalClosingQuantity: rows.reduce((sum, r) => sum + r.closingQuantity, 0),
    totalClosingAmount: rows.reduce((sum, r) => sum + r.closingAmount, 0),
  };
};
