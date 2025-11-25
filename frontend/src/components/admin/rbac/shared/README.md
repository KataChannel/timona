# RBAC Shared Components

Thư viện các components tái sử dụng cho hệ thống RBAC.

## Components

### 1. TablePagination

Component pagination chuyên nghiệp với đầy đủ tính năng.

**Features:**
- 4 nút navigation (First, Previous, Next, Last)
- Hiển thị range items hiện tại
- Select items per page
- Auto-disable buttons khi không thể navigate
- Icons từ lucide-react

**Usage:**
```tsx
import { TablePagination } from '@/components/admin/rbac/shared';

<TablePagination
  currentPage={page}
  totalPages={Math.ceil(totalItems / itemsPerPage)}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={setPage}
  onItemsPerPageChange={setItemsPerPage}
  showItemsPerPage={true}
/>
```

**Props:**
```typescript
interface TablePaginationProps {
  currentPage: number;              // Current page index (0-based)
  totalPages: number;               // Total number of pages
  totalItems: number;               // Total number of items
  itemsPerPage: number;             // Items per page
  onPageChange: (page: number) => void;  // Page change handler
  onItemsPerPageChange?: (items: number) => void;  // Items per page change handler (optional)
  showItemsPerPage?: boolean;       // Show items per page selector (default: true)
}
```

---

### 2. RbacTableSkeleton

Component skeleton loading cho tables, tự động match với cấu trúc table.

**Features:**
- Configurable rows và columns
- Tùy chọn hiển thị avatar skeleton
- First column có layout đặc biệt
- Last column skeleton cho action buttons
- Smooth animation

**Usage:**
```tsx
import { RbacTableSkeleton } from '@/components/admin/rbac/shared';

<TableBody>
  {loading ? (
    <RbacTableSkeleton 
      rows={5} 
      columns={6} 
      showAvatar={true} 
    />
  ) : (
    data.map(item => <TableRow key={item.id}>...</TableRow>)
  )}
</TableBody>
```

**Props:**
```typescript
interface RbacTableSkeletonProps {
  rows?: number;        // Number of skeleton rows (default: 5)
  columns?: number;     // Number of skeleton columns (default: 6)
  showAvatar?: boolean; // Show avatar in first column (default: false)
}
```

---

## Installation

Các components này đã được tích hợp sẵn trong project. Import và sử dụng trực tiếp:

```tsx
import { TablePagination, RbacTableSkeleton } from '@/components/admin/rbac/shared';
```

## Examples

### Example 1: Basic Table với Pagination và Skeleton

```tsx
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TablePagination, RbacTableSkeleton } from '@/components/admin/rbac/shared';

function MyTable() {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { data, loading } = useMyQuery({ page, size: itemsPerPage });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <RbacTableSkeleton rows={5} columns={3} />
            ) : (
              data.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>Actions...</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={page}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </CardContent>
    </Card>
  );
}
```

### Example 2: Table với Avatar Skeleton

```tsx
<TableBody>
  {loading ? (
    <RbacTableSkeleton 
      rows={10} 
      columns={6} 
      showAvatar={true}  // First column sẽ có avatar skeleton
    />
  ) : (
    users.map(user => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>...</Avatar>
            <div>{user.name}</div>
          </div>
        </TableCell>
        {/* More cells */}
      </TableRow>
    ))
  )}
</TableBody>
```

### Example 3: Pagination không có Items Per Page Selector

```tsx
<TablePagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={20}
  onPageChange={setPage}
  showItemsPerPage={false}  // Ẩn selector
/>
```

---

## Best Practices

### 1. Pagination
- Luôn đặt pagination ở cuối bảng
- Sử dụng state để lưu `currentPage` và `itemsPerPage`
- Reset về page 0 khi thay đổi filters
- Disable pagination khi đang loading

### 2. Skeleton Loading
- Số rows nên match với `itemsPerPage`
- Số columns phải match với table thực
- Sử dụng `showAvatar={true}` cho tables có avatar column
- Đặt skeleton trong `<TableBody>` giống như data rows

### 3. Performance
- Memoize pagination handlers nếu cần
- Debounce items per page changes
- Use stable keys cho table rows

---

## Dependencies

- `@/components/ui/button` - shadcn Button
- `@/components/ui/select` - shadcn Select  
- `@/components/ui/skeleton` - shadcn Skeleton
- `@/components/ui/table` - shadcn Table
- `lucide-react` - Icons

---

## Changelog

### Version 1.0.0 (October 17, 2025)
- ✅ Initial release
- ✅ TablePagination component
- ✅ RbacTableSkeleton component
- ✅ Full TypeScript support
- ✅ Comprehensive documentation

---

## License

Same as project license.

---

## Support

For issues or questions, refer to:
- `RBAC_PROJECT_COMPLETION_SUMMARY.md` - Overview
- `RBAC_TESTING_CHECKLIST.md` - Testing guide
- Component source code - Well commented
