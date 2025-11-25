// Vietnamese Invoice Data Types for Electronic Tax Invoice API

export interface InvoiceData {
  id?: string;
  khmshdon: string; // Ký hiệu mẫu số hóa đơn (Invoice template symbol)
  shdon: string;    // Số hóa đơn (Invoice number)
  tdlap: string;    // Thời điểm lập (Creation date)
  msttcgp: string;  // Mã số thuế TCGp (Tax code of issuer)
  tentcgp: string;  // Tên TCGp (Name of issuer)
  dctcgp?: string;  // Địa chỉ TCGp (Address of issuer)
  msttmua?: string; // Mã số thuế TMua (Tax code of buyer)
  tenxmua?: string; // Tên người mua (Buyer name)
  dcxmua?: string;  // Địa chỉ người mua (Buyer address)
  tgtcthue: number; // Tổng giá trị chưa thuế (Total value before tax)
  tgtthue: number;  // Tổng giá trị thuế (Total tax value)
  tgtttbso: number; // Tổng giá trị thanh toán bằng số (Total payment amount)
  tgtttchu?: string; // Tổng giá trị thanh toán bằng chữ (Total payment in words)
  dvtte?: string;   // Đơn vị tiền tệ (Currency unit)
  tghdon?: string;  // Trạng thái hóa đơn (Invoice status)
  pthuc?: string;   // Phương thức thanh toán (Payment method)
  mtdieu?: string;  // Mô tả điều khoản (Terms description)
  ttxmua?: string;  // Thông tin người mua (Buyer information)
  nbmst?: string;   // Người bán MST (Seller tax code)
  nten?: string;    // Người tên (Person name)
  dchi?: string;    // Địa chỉ (Address)
  stk?: string;     // Số tài khoản (Account number)
  nh?: string;      // Ngân hàng (Bank)
  fkey?: string;    // File key
  cccd?: string;    // Căn cước công dân (Citizen ID)
  
  // Details (if already loaded from database)
  details?: Array<{
    stt?: number;
    ten?: string;
    dvtinh?: string;
    sluong?: number;
    dgia?: number;
    thtien?: number;
    tsuat?: number;
    tthue?: number;
  }>;
}

// Database model types matching Prisma schema
export interface ExtListhoadon {
  id: string;
  
  // Basic Invoice Info
  nbmst?: string;
  khmshdon?: string;
  khhdon?: string;
  shdon?: string;
  cqt?: string;
  hdon?: string;
  hthdon?: string;
  htttoan?: string;
  idtbao?: string;
  khdon?: string;
  khhdgoc?: string;
  khmshdgoc?: string;
  lhdgoc?: string;
  mhdon?: string;
  mtdiep?: string;
  mtdtchieu?: string;
  
  // Seller Information
  nbdchi?: string;
  chma?: string;
  chten?: string;
  nbhdktngay?: Date;
  nbhdktso?: string;
  nbhdso?: string;
  nblddnbo?: string;
  nbptvchuyen?: string;
  nbstkhoan?: string;
  nbten?: string;
  nbtnhang?: string;
  nbtnvchuyen?: string;
  
  // Other Codes
  ncma?: string;
  ncnhat?: Date;
  ngcnhat?: Date;
  nky?: string;
  
  // Buyer Information
  nmdchi?: string;
  nmmst?: string;
  nmstkhoan?: string;
  nmten?: string;
  nmtnhang?: string;
  nmtnmua?: string;
  nmttkhac?: string;
  
  // Process Information
  ntao?: Date;
  ntnhan?: Date;
  pban?: string;
  ptgui?: string;
  shdgoc?: string;
  tchat?: string;
  tdlap?: Date;
  tgia?: number;
  
  // Amounts
  tgtcthue?: number;
  tgtthue?: number;
  tgtttbchu?: string;
  tgtttbso?: number;
  
  // Status and Processing
  thdon?: string;
  thlap?: string;
  thttlphi?: number;
  tlhdon?: string;
  ttcktmai?: string;
  tthai?: string;
  tttbao?: string;
  ttxly?: string;
  tvandnkntt?: string;
  
  // Additional Fields
  mhso?: string;
  ladhddt?: boolean;
  mkhang?: string;
  nbsdthoai?: string;
  nbdctdtu?: string;
  nbfax?: string;
  nbwebsite?: string;
  nmsdthoai?: string;
  nmdctdtu?: string;
  nmcmnd?: string;
  nmcks?: string;
  
  // Legal and Compliance
  bhphap?: string;
  hddunlap?: string;
  gchdgoc?: string;
  tbhgtngay?: Date;
  bhpldo?: string;
  bhpcbo?: string;
  bhpngay?: Date;
  tdlhdgoc?: Date;
  tgtphi?: number;
  unhiem?: string;
  mstdvnunlhdon?: string;
  tdvnunlhdon?: string;
  
  // Regulatory Information
  nbmdvqhnsach?: string;
  nbsqdinh?: string;
  nbncqdinh?: string;
  nbcqcqdinh?: string;
  nbhtban?: string;
  nmmdvqhnsach?: string;
  nmddvchden?: string;
  nmtgvchdtu?: Date;
  nmtgvchdden?: Date;
  nbtnban?: string;
  dcdvnunlhdon?: string;
  
  // Processing Dates
  dksbke?: Date;
  dknlbke?: Date;
  thtttoan?: string;
  msttcgp?: string;
  gchu?: string;
  kqcht?: string;
  hdntgia?: number;
  tgtkcthue?: number;
  tgtkhac?: number;
  
  // Reference Information
  nmshchieu?: string;
  nmnchchieu?: string;
  nmnhhhchieu?: string;
  nmqtich?: string;
  ktkhthue?: number;
  nmstttoan?: string;
  nmttttoan?: string;
  hdhhdvu?: string;
  qrcode?: string;
  ttmstten?: string;
  ladhddtten?: string;
  
  // Export/Import
  hdxkhau?: string;
  hdxkptquan?: string;
  hdgktkhthue?: number;
  hdonLquans?: string;
  tthdclquan?: string;
  pdndungs?: string;
  hdtbssrses?: string;
  
  // Duplicate Handling
  hdTrung?: string;
  isHDTrung?: boolean;
  hdcttchinh?: string;
  
  // Brand name from configuration
  brandname?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  details?: ExtDetailhoadon[];
}

export interface ExtDetailhoadon {
  id: string;
  idhdon: string; // Foreign key to ext_listhoadon.id
  
  // Item Information
  dgia?: number;
  dvtinh?: string;
  ltsuat?: number;
  sluong?: number;
  stbchu?: string;
  stckhau?: number;
  stt?: number;
  tchat?: string;
  ten?: string;
  thtcthue?: number;
  thtien?: number;
  tlckhau?: number;
  tsuat?: number;
  tthue?: number;
  sxep?: number;
  dvtte?: string;
  tgia?: number;
  tthhdtrung?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  invoice?: ExtListhoadon;
}

export interface InvoiceItem {
  stt: number;      // Số thứ tự (Sequential number)
  mahang?: string;  // Mã hàng (Item code)
  tenhang: string;  // Tên hàng hóa, dịch vụ (Item/service name)
  dvt?: string;     // Đơn vị tính (Unit of measurement)
  sluong: number;   // Số lượng (Quantity)
  dgia: number;     // Đơn giá (Unit price)
  thtien: number;   // Thành tiền (Line total)
  tsuat?: number;   // Thuế suất (Tax rate)
  tthue: number;    // Tiền thuế (Tax amount)
}

export interface InvoiceApiResponse {
  datas: InvoiceData[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  // New fields for pagination with state
  total?: number;    // Total number of records available
  state?: string;    // State token for pagination continuation
}

export interface InvoiceApiParams {
  sort?: string;    // Sorting parameters
  size?: number;    // Page size
  page?: number;    // Page number
  search?: string;  // Search query with date range and filters
  state?: string;   // State token for pagination continuation
}

export interface InvoiceFilter {
  fromDate: string;  // Start date (tdlap>=)
  toDate: string;    // End date (tdlap<=)
  invoiceNumber?: string;  // Số hóa đơn
  taxCode?: string;  // Mã số thuế
  buyerName?: string; // Tên người mua
  month?: number;    // Tháng (1-12)
  year?: number;     // Năm
}

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  currencyFormat?: string;
}

// Configuration types
export interface InvoiceConfig {
  bearerToken: string;
  pageSize: number;
  invoiceType: 'banra' | 'muavao';
  brandname?: string;  // Tên nhãn hàng
  apiEndpoint?: string;
}

export type InvoiceType = 'banra' | 'muavao';

// Enhanced filtering and search
export interface AdvancedFilter extends InvoiceFilter {
  globalSearch?: string;    // Search across multiple fields
  dateRange?: string;       // Predefined date ranges
  status?: string;          // Invoice status filter
  amountFrom?: number;      // Minimum amount filter
  amountTo?: number;        // Maximum amount filter
  thlap?: string;           // Thời điểm lập filter (Creation time filter)
}

// Table configuration
export interface TableConfig {
  sortField: keyof InvoiceData;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  filters: AdvancedFilter;
}