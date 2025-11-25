// ==================== INVOICE DATA TYPES ====================

export interface InvoiceHeader {
  id: string;
  idServer: string | null; // Server ID for relationship
  nbmst: string | null; // Người bán MST
  nmmst: string | null; // Người mua MST
  shdon: string | null; // Số hóa đơn
  khhdon: string | null; // Ký hiệu hóa đơn
  tdlap: string | null; // Thời điểm lập
  nbten: string | null; // Tên người bán
  nmten: string | null; // Tên người mua
  tgtcthue: number | null; // Tổng tiền trước thuế
  tgtthue: number | null; // Tổng tiền thuế
  tgtttbso: number | null; // Tổng tiền thanh toán
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetail {
  id: string;
  idhdonServer: string; // ID hóa đơn (server reference)
  ten: string | null; // Tên sản phẩm
  dvtinh: string | null; // Đơn vị tính (ĐVT)
  sluong: number | null; // Số lượng
  dgia: number | null; // Đơn giá
  thtien: number | null; // Thành tiền
  tsuat: number | null; // Thuế suất
  tthue: number | null; // Tiền thuế
  createdAt: string;
  updatedAt: string;
}

export interface ProductMapping {
  id: string;
  ten: string | null; // Tên gốc
  ten2: string | null; // Tên chuẩn hóa
  ma: string | null; // Mã sản phẩm
  dvt: string | null; // ĐVT
}

// ==================== INVENTORY TYPES ====================

export interface InventoryRow {
  productName: string; // Tên sản phẩm (chuẩn hóa)
  originalName: string; // Tên sản phẩm gốc từ hóa đơn
  productCode: string | null; // Mã sản phẩm
  unit: string | null; // ĐVT
  date: string; // Ngày/Tháng/Năm
  
  // Tồn đầu
  openingQuantity: number; // Số lượng tồn đầu
  openingAmount: number; // Tổng tiền tồn đầu
  
  // Nhập
  importQuantity: number; // Số lượng nhập
  importAmount: number; // Tổng tiền nhập
  
  // Xuất
  exportQuantity: number; // Số lượng xuất
  exportAmount: number; // Tổng tiền xuất (theo giá vốn)
  exportCostPrice: number; // Giá vốn (bình quân gia quyền)
  exportSalePrice: number; // Giá bán (dgia từ đơn hàng)
  exportSaleAmount: number; // Thành tiền bán (SL Xuất × Giá Bán)
  
  // Tồn cuối
  closingQuantity: number; // Số lượng tồn cuối
  closingAmount: number; // Tổng tiền tồn cuối
}

export interface InventorySummary {
  totalProducts: number;
  totalRecords: number; // Tổng số bản ghi
  totalOpeningQuantity: number; // Tổng số lượng tồn đầu
  totalOpeningAmount: number; // Tổng tiền tồn đầu
  totalImportQuantity: number;
  totalImportAmount: number;
  totalExportQuantity: number;
  totalExportAmount: number;
  totalExportSaleAmount: number; // Tổng thành tiền bán
  totalClosingQuantity: number;
  totalClosingAmount: number;
}

// Opening balance for a product at period start
export interface OpeningBalance {
  productName: string;
  quantity: number;
  amount: number;
}

// ==================== CONFIG TYPES ====================

export interface UserConfig {
  mst: string; // Mã số thuế người dùng
  companyName: string; // Tên công ty
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD (Từ ngày)
  endDate: string; // YYYY-MM-DD (Đến ngày)
  periodStartDate?: string; // YYYY-MM-DD (Ngày chốt đầu kỳ - optional)
}

// ==================== UI STATE TYPES ====================

export type InvoiceType = 'all' | 'sale' | 'purchase';
export type GroupBy = 'ma' | 'ten2'; // Nhóm theo mã hoặc tên chuẩn hóa
export type SortField = 'date' | 'productName' | 'closingQuantity' | 'closingAmount';
export type SortDirection = 'asc' | 'desc';

export interface FilterConfig {
  searchTerm: string;
  invoiceType: InvoiceType;
  groupBy: GroupBy;
  dateRange: DateRange;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// ==================== EXPORT TYPES ====================

export interface ExcelExportData {
  headers: string[];
  rows: (string | number)[][];
  summary: {
    label: string;
    value: string | number;
  }[];
}

// ==================== UTILITY TYPES ====================

export interface LoadingState {
  invoices: boolean;
  details: boolean;
  products: boolean;
  exporting: boolean;
}

export interface ErrorState {
  invoices: string | null;
  details: string | null;
  products: string | null;
  export: string | null;
}
