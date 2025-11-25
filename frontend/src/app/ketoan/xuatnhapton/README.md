# Báo Cáo Xuất Nhập Tồn - Inventory Management System

## 📋 Tổng Quan

Hệ thống quản lý và báo cáo xuất nhập tồn kho dựa trên dữ liệu hóa đơn điện tử (ext_listhoadon, ext_detailhoadon). Tự động phân loại hóa đơn bán/mua dựa trên mã số thuế (MST) và tính toán tồn kho theo công thức: **Tồn Đầu + Nhập - Xuất = Tồn Cuối**.

## 🎯 Tính Năng

### 1. Cấu Hình Mã Số Thuế (MST)
- Lưu trữ MST và tên công ty trong localStorage
- Tự động phân loại hóa đơn:
  - **Hóa đơn BÁN**: `ext_listhoadon.nbmst = user MST` (Người bán = User)
  - **Hóa đơn MUA**: `ext_listhoadon.nmmst = user MST` (Người mua = User)

### 2. Lọc Theo Thời Gian
- Chọn khoảng thời gian từ ngày đến ngày
- Mặc định: 30 ngày gần nhất
- Lọc hóa đơn theo trường `ext_listhoadon.tdlap`

### 3. Nhóm Sản Phẩm
- **Theo Mã Sản Phẩm** (`ma`): Gộp nhóm bởi `ext_sanphamhoadon.ma`
- **Theo Tên Chuẩn Hóa** (`ten2`): Gộp nhóm bởi `ext_sanphamhoadon.ten2`
- Tự động match `ext_detailhoadon.ten` với `ext_sanphamhoadon.ten`

### 4. Bảng Xuất Nhập Tồn
**Các cột hiển thị:**
- Ngày/Tháng/Năm
- Tên Sản Phẩm (từ groupBy)
- Mã Sản Phẩm
- Đơn Vị Tính (ĐVT)
- **Tồn Đầu**: Số Lượng + Tổng Tiền
- **Nhập**: Số Lượng + Tổng Tiền (từ hóa đơn MUA)
- **Xuất**: Số Lượng + Tổng Tiền (từ hóa đơn BÁN)
- **Tồn Cuối**: Số Lượng + Tổng Tiền

### 5. Tìm Kiếm và Sắp Xếp
- Tìm kiếm: Tên SP, Mã SP, ĐVT
- Sắp xếp: Ngày, Tên SP, SL Tồn, TT Tồn (tăng/giảm dần)
- Phân trang: 50 items/trang

### 6. Xuất Excel
- Xuất toàn bộ dữ liệu (không phân trang)
- Định dạng tiền tệ Việt Nam (VND)
- Bao gồm tổng hợp thống kê

## 🏗️ Cấu Trúc Thư Mục

```
xuatnhapton/
├── page.tsx                    # Main page component (200 lines)
├── types.ts                    # TypeScript type definitions
├── components/
│   ├── index.ts               # Component exports
│   ├── ConfigModal.tsx        # MST configuration modal
│   ├── SummaryCards.tsx       # Statistics summary cards
│   ├── FilterToolbar.tsx      # Search, filters, date range, actions
│   ├── InventoryTable.tsx     # Main data table
│   └── Pagination.tsx         # Pagination controls
├── hooks/
│   ├── index.ts               # Hook exports
│   ├── useInventoryData.ts    # Fetch invoices, details, products
│   ├── useInventoryFilter.ts  # Filter and sort logic
│   └── usePagination.ts       # Pagination logic
└── utils/
    ├── index.ts               # Utility exports
    ├── localStorage.ts        # LocalStorage operations
    ├── formatters.ts          # Date, number, currency formatters
    ├── invoiceClassifier.ts   # Invoice type classification
    ├── inventoryCalculator.ts # Inventory calculation logic
    └── excelExporter.ts       # Excel export functionality
```

## 📊 Data Flow

```
1. Load Data (useInventoryData hook)
   ├── ext_listhoadon (invoices)
   ├── ext_detailhoadon (details)
   └── ext_sanphamhoadon (products)

2. Classify Invoices (invoiceClassifier)
   ├── Compare nbmst/nmmst with user MST
   └── Return 'sale' or 'purchase'

3. Calculate Inventory (inventoryCalculator)
   ├── Match products (ten → ten2/ma)
   ├── Filter by date range
   ├── Group by ma or ten2
   ├── Calculate: Tồn Đầu + Nhập - Xuất = Tồn Cuối
   └── Return InventoryRow[]

4. Filter & Sort (useInventoryFilter)
   ├── Search by product name/code
   └── Sort by selected field

5. Paginate & Display
   └── Show 50 items per page
```

## 🔧 Công Thức Tính Toán

### Phân Loại Hóa Đơn
```typescript
if (invoice.nbmst === userMST) → SALE (Xuất kho)
if (invoice.nmmst === userMST) → PURCHASE (Nhập kho)
```

### Tính Tồn Kho
```typescript
// For each product and date:
openingQuantity = previous closingQuantity
importQuantity = sum(purchase invoices)
exportQuantity = sum(sale invoices)
closingQuantity = openingQuantity + importQuantity - exportQuantity

// Same for amounts (thtien)
```

## 🎨 UI Components

### 1. ConfigModal
- Form nhập MST và tên công ty
- Lưu vào localStorage
- Hiển thị khi chưa có config

### 2. SummaryCards (4 cards)
- Tổng Số Sản Phẩm
- Tổng Nhập (SL + TT)
- Tổng Xuất (SL + TT)
- Tồn Cuối (SL + TT)

### 3. FilterToolbar
- Search box
- Date range pickers (from/to)
- Group by selector (ma/ten2)
- Sort selector + direction
- Action buttons: Config, Refresh, Export

### 4. InventoryTable
- Color-coded columns:
  - Blue: Tồn Đầu
  - Green: Nhập
  - Orange: Xuất
  - Purple: Tồn Cuối
- Responsive layout
- Sticky header

### 5. Pagination
- Page numbers
- Previous/Next buttons
- Item count display

## 📦 Dependencies

```json
{
  "xlsx": "^0.18.5",           // Excel export
  "sonner": "^1.0.0",          // Toast notifications
  "@apollo/client": "^3.8.0",  // GraphQL queries
  "react": "^18.0.0",          // UI framework
  "tailwindcss": "^3.0.0"      // Styling
}
```

## 🚀 Usage

### 1. Cấu Hình Lần Đầu
```typescript
// User opens page → ConfigModal appears
// Enter MST: "0304475742"
// Enter Company: "Công ty ABC"
// → Saved to localStorage
```

### 2. Xem Báo Cáo
```typescript
// Select date range: 2024-01-01 to 2024-12-31
// Select group by: "Mã Sản Phẩm"
// → Table shows inventory movements
```

### 3. Tìm Kiếm
```typescript
// Type in search: "Sữa"
// → Filters to products containing "Sữa"
```

### 4. Xuất Excel
```typescript
// Click "Xuất Excel" button
// → Downloads XuatNhapTon_2024-01-15.xlsx
// → Contains all filtered data (not paginated)
```

## 🧪 Testing

### Test Scenarios

1. **No Config**: Should show ConfigModal
2. **No Data**: Should show empty state
3. **Sale Invoice**: nbmst = user MST → Adds to export
4. **Purchase Invoice**: nmmst = user MST → Adds to import
5. **Product Matching**: ten matches ten2 → Groups correctly
6. **Date Filter**: Only shows invoices in range
7. **Search**: Filters products by name/code
8. **Sort**: Orders by selected field
9. **Pagination**: Shows 50 items per page
10. **Excel Export**: Downloads correct data

## 📝 TypeScript Types

```typescript
// Invoice from ext_listhoadon
interface InvoiceHeader {
  nbmst: string; // Seller MST
  nmmst: string; // Buyer MST
  tdlap: string; // Invoice date
}

// Detail from ext_detailhoadon
interface InvoiceDetail {
  idhdon: string;  // Invoice ID
  ten: string;     // Product name
  sluong: number;  // Quantity
  dgia: number;    // Unit price
  thtien: number;  // Total amount
  dvtinh: string;  // Unit
}

// Product mapping from ext_sanphamhoadon
interface ProductMapping {
  ten: string;   // Original name
  ten2: string;  // Normalized name
  ma: string;    // Product code
  dvt: string;   // Unit
}

// Calculated inventory row
interface InventoryRow {
  productName: string;
  productCode: string;
  unit: string;
  date: string;
  openingQuantity: number;
  openingAmount: number;
  importQuantity: number;
  importAmount: number;
  exportQuantity: number;
  exportAmount: number;
  closingQuantity: number;
  closingAmount: number;
}
```

## 🔒 LocalStorage Schema

```typescript
// Key: 'xuatnhapton_user_config'
{
  "mst": "0304475742",
  "companyName": "Công ty ABC"
}
```

## 🎯 Performance Optimizations

1. **useMemo**: Calculate inventory only when data changes
2. **Pagination**: Only render 50 rows at a time
3. **Lazy Loading**: GraphQL queries with fetchPolicy
4. **Set-based Matching**: O(1) product lookups
5. **Cumulative Calculation**: Single pass for opening/closing

## 🐛 Error Handling

- GraphQL errors → Toast notification
- Invalid MST → Show config modal
- No data → Empty state message
- Export failure → Error toast
- Date validation → Form constraints

## 📄 License

MIT License - See LICENSE file for details
