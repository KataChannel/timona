# Product Management Module - Quản Lý Sản Phẩm

## 📁 Cấu trúc thư mục

```
sanpham/
├── page.tsx                      # Main page component (orchestrator)
├── types.ts                      # TypeScript interfaces & types
├── utils.ts                      # Utility functions (formatters)
├── README.md                     # Documentation
├── components/                   # Reusable UI components
│   ├── StatsCards.tsx           # Statistics cards display
│   ├── SearchToolbar.tsx        # Search & filter toolbar
│   ├── ProductTable.tsx         # Product data table with sorting
│   ├── Pagination.tsx           # Pagination controls
│   └── NormalizationModal.tsx   # Product normalization modal
└── hooks/                        # Custom React hooks
    ├── useProductFilters.ts     # Filter & sort logic
    └── useProductPagination.ts  # Pagination logic
```

## 🧩 Components

### 1. **page.tsx** (Main Component)
- **Mục đích**: Orchestrate toàn bộ page, quản lý state và handlers
- **State**: Search, filter, sort, pagination, normalization
- **Dependencies**: Tất cả components và hooks

### 2. **StatsCards.tsx**
- **Props**: `stats: ProductStats`
- **Mục đích**: Hiển thị 3 cards thống kê (Tổng/Đã chuẩn hóa/Chưa xử lý)
- **UI**: Grid layout với icons

### 3. **SearchToolbar.tsx**
- **Props**: 
  - `searchTerm`, `onSearchChange`
  - `filterStatus`, `onFilterChange`
  - `stats`, `loading`
  - `onRefresh`, `onNormalize`
- **Mục đích**: Search input + filter buttons + action buttons
- **Features**: Real-time search, status filtering, refresh, normalize

### 4. **ProductTable.tsx**
- **Props**: 
  - `products: Product[]`
  - `loading`, `sortField`, `sortDirection`
  - `onSort`, `emptyMessage`
- **Mục đích**: Hiển thị bảng sản phẩm với sortable columns
- **Features**: Click column headers để sort, loading state, empty state

### 5. **Pagination.tsx**
- **Props**: 
  - `currentPage`, `totalItems`, `itemsPerPage`
  - `onPageChange`
- **Mục đích**: Điều hướng phân trang
- **Features**: Previous/Next buttons, page info display

### 6. **NormalizationModal.tsx**
- **Props**: 
  - `isOpen`, `onClose`
  - `onNormalize`, `loading`
- **Mục đích**: Modal cấu hình và chạy normalization
- **Features**: Preview/Update mode, limit selection

## 🎣 Custom Hooks

### 1. **useProductFilters**
```typescript
// Input: products, searchTerm, filterStatus, sortField, sortDirection
// Output: { filteredProducts, stats }
```
- **Mục đích**: Apply search, filter, sort logic
- **Performance**: useMemo để tránh re-calculate không cần thiết
- **Logic**: 
  1. Search across: ten, ten2, ma, dvt
  2. Filter by status: all, normalized, pending
  3. Sort by: ma, ten, dgia, createdAt

### 2. **useProductPagination**
```typescript
// Input: products, page, limit, setPage, dependencies
// Output: { paginatedProducts, totalPages }
```
- **Mục đích**: Slice products theo page
- **Auto-reset**: Reset về page 1 khi dependencies thay đổi
- **Performance**: useMemo + useEffect

## 📝 Types

### Core Interfaces
```typescript
Product                    // Sản phẩm data structure
ProductStats              // Thống kê (total, normalized, pending)
NormalizationResult       // Kết quả API normalization
SortConfig                // Sort configuration
```

### Type Aliases
```typescript
SortField                 // 'ten' | 'ma' | 'dgia' | 'createdAt'
SortDirection            // 'asc' | 'desc'
FilterStatus             // 'all' | 'normalized' | 'pending'
```

## 🛠️ Utils

### Formatters
- `formatPrice(price)`: Format số thành VND currency
- `formatDate(date)`: Format ISO string thành localized date

## 🔄 Data Flow

```
GraphQL Query (useDynamicQuery)
    ↓
Raw Products (getext_sanphamhoadons)
    ↓
useProductFilters (search + filter + sort)
    ↓
Filtered Products + Stats
    ↓
useProductPagination (slice by page)
    ↓
Paginated Products
    ↓
ProductTable (render)
```

## 🎨 UI Flow

```
page.tsx
├── Header (Title + Description)
├── SearchToolbar
│   ├── Search Input
│   ├── Refresh Button
│   ├── Normalize Button
│   └── Filter Buttons (All/Normalized/Pending)
├── StatsCards (3 cards grid)
├── ProductTable
│   ├── Sortable Headers
│   ├── Product Rows
│   └── Loading/Empty States
├── Pagination (if needed)
└── NormalizationModal (conditional)
```

## 📊 State Management

### Local State (useState)
- `searchTerm`: Current search query
- `page`: Current page number
- `sortField` + `sortDirection`: Sort configuration
- `filterStatus`: Active filter (all/normalized/pending)
- `normalizing`: Normalization loading state
- `showNormalizeModal`: Modal visibility

### Derived State (useMemo via hooks)
- `filteredProducts`: Filtered & sorted products
- `stats`: Statistics (total, normalized, pending)
- `paginatedProducts`: Current page products

### Server State (GraphQL)
- `productsData`: Raw products from backend
- `queryLoading`: Query loading state
- `refetch`: Function to reload data

## 🚀 Performance Optimizations

1. **useMemo trong hooks**: Tránh re-calculate filters/sort
2. **Conditional rendering**: Chỉ render modal khi cần
3. **Pagination**: Chỉ render products của current page
4. **Component separation**: Re-render chỉ affected components

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test formatPrice với nhiều giá trị
- [ ] Test formatDate với nhiều formats
- [ ] Test useProductFilters với các filters khác nhau
- [ ] Test useProductPagination với edge cases

### Integration Tests
- [ ] Test SearchToolbar interactions
- [ ] Test ProductTable sorting
- [ ] Test Pagination navigation
- [ ] Test NormalizationModal workflow

### E2E Tests
- [ ] Search products
- [ ] Filter by status
- [ ] Sort by columns
- [ ] Navigate pages
- [ ] Run normalization

## 📦 Dependencies

- **React**: Core framework
- **useDynamicQuery**: Custom GraphQL hook
- **lucide-react**: Icons library
- **sonner**: Toast notifications
- **GraphQL**: Data fetching (ext_sanphamhoadon model)

## 🔧 Maintenance Guide

### Thêm filter mới
1. Thêm type vào `FilterStatus` trong `types.ts`
2. Update logic trong `useProductFilters.ts`
3. Thêm button trong `SearchToolbar.tsx`

### Thêm sort column mới
1. Thêm field vào `SortField` trong `types.ts`
2. Update logic trong `useProductFilters.ts`
3. Thêm column trong `ProductTable.tsx`

### Thay đổi UI component
- Mỗi component độc lập, chỉ cần edit file component
- Props interface đảm bảo type safety
- Không ảnh hưởng components khác

### Debug tips
- Check `filteredProducts` length trong DevTools
- Monitor GraphQL query trong Network tab
- Use React DevTools để check props/state
- Console.log trong hooks để trace data flow

## 📚 Best Practices

1. **Single Responsibility**: Mỗi component/hook có 1 nhiệm vụ rõ ràng
2. **Type Safety**: Tất cả props/state đều có TypeScript types
3. **Performance**: useMemo/useCallback cho expensive operations
4. **Reusability**: Components có thể reuse ở pages khác
5. **Maintainability**: Code dễ đọc, dễ modify, có documentation
