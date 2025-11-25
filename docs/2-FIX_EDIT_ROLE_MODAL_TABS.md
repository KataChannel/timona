# Fix Bug: Edit Role không hiển thị phần gán quyền và menu

## Vấn đề (Problem)
Khi chỉnh sửa (edit) một role bất kỳ (ví dụ: `blog_manager`) trong **Quản lý Vai trò hệ thống và quyền hạn**, modal chỉ hiển thị form cơ bản (name, displayName, description, priority) mà **KHÔNG có phần để gán quyền (permissions) và xem danh sách menu**.

### Trước khi fix:
- Modal `EditRoleModal` chỉ cho phép edit thông tin cơ bản
- Để gán permissions, phải:
  1. Đóng modal edit
  2. Click vào icon ShieldCheck (🛡️) 
  3. Mở modal riêng `AssignRolePermissionsModal`
- Không có cách nào để xem danh sách menu mà role có thể truy cập

## Nguyên nhân (Root Cause)
Component `EditRoleModal.tsx` được thiết kế đơn giản chỉ để edit basic info, không tích hợp phần quản lý permissions và menus.

## Giải pháp (Solution)
Cập nhật `EditRoleModal` thành modal có 3 tabs:

### Tab 1: Thông tin (Info)
- Role Name
- Display Name  
- Description
- Priority
- Active status
- Button: **Cập nhật**

### Tab 2: Quyền hạn (Permissions)
- Search box để tìm permissions
- Badge hiển thị số lượng permissions đã gán
- ScrollArea với list tất cả permissions
- Radio buttons: `Không` / `Cho phép` cho mỗi permission
- Hiển thị:
  - Permission name & description
  - Resource:Action:Scope
  - Category badge
- Button: **Lưu quyền hạn**

### Tab 3: Menu
- Alert info: Hướng dẫn cách gán menu
- List các menu mà role có quyền truy cập (based on `requiredRoles` field)
- Hiển thị:
  - Menu icon & title
  - Path
  - Type badge
  - Required permissions count
- **Read-only**: Để gán menu, phải vào Quản lý Menu và edit trường `requiredRoles`
- Button: **Đóng**

## File thay đổi (Changed Files)

### `/frontend/src/components/admin/rbac/EditRoleModal.tsx`

**Imports mới:**
```typescript
import { ShieldCheck, Menu, Info } from 'lucide-react';
import { useAssignRolePermissions } from '../../../hooks/useRbac';
import { Permission } from '../../../types/rbac.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQuery, gql } from '@apollo/client';
```

**State mới:**
```typescript
const [activeTab, setActiveTab] = useState('info');
const [permissionAssignments, setPermissionAssignments] = useState<PermissionAssignment[]>([]);
const [searchPermissionTerm, setSearchPermissionTerm] = useState('');
```

**GraphQL Query mới:**
```graphql
const GET_MENUS_BY_ROLE = gql`
  query GetMenusByRole($roleName: String!) {
    menus(
      where: { 
        requiredRoles: { has: $roleName }
        isActive: true
      }
    ) {
      id
      title
      path
      type
      icon
      requiredRoles
      requiredPermissions
    }
  }
`;
```

**Functions mới:**
- `handleSavePermissions()` - Lưu permissions cho role
- `handlePermissionChange()` - Thay đổi effect của permission

**UI Structure:**
```
Dialog (max-w-5xl)
  ├─ DialogHeader
  │   ├─ Title: "Chỉnh sửa Vai trò: {displayName}"
  │   └─ Description: "Cập nhật thông tin, quyền hạn và menu"
  │
  └─ Tabs
      ├─ TabsList (3 tabs with icons & badges)
      │   ├─ Info 📋
      │   ├─ Quyền hạn 🛡️ (badge: count)
      │   └─ Menu 📁 (badge: count)
      │
      ├─ TabsContent[info]
      │   └─ Form với basic fields
      │
      ├─ TabsContent[permissions]
      │   ├─ Search input
      │   ├─ ScrollArea (400px height)
      │   │   └─ List permissions với Radio buttons
      │   └─ Footer: Hủy | Lưu quyền hạn
      │
      └─ TabsContent[menus]
          ├─ Alert (info về cách gán menu)
          ├─ ScrollArea (400px height)
          │   └─ List menus (read-only)
          └─ Footer: Đóng
```

## Tính năng mới (New Features)

### ✅ All-in-one Modal
Không cần mở nhiều modal riêng biệt, tất cả thông tin và chỉnh sửa trong 1 modal duy nhất.

### ✅ Real-time Permission Management
Gán/bỏ gán permissions ngay trong modal edit role, không cần đóng modal và click icon riêng.

### ✅ Menu Visibility
Xem được danh sách menu mà role có thể access, giúp admin hiểu rõ hơn về phạm vi quyền hạn.

### ✅ Badge Indicators
Hiển thị số lượng permissions đã gán và số menu có thể truy cập ngay trên tab labels.

### ✅ Search Functionality
Tìm kiếm nhanh trong danh sách permissions (search by name, resource, action).

### ✅ Better UX
- Tabs với icons rõ ràng
- ScrollArea để hiển thị nhiều items
- Radio buttons thay vì checkboxes cho permissions
- Alert/Info messages hữu ích

## Hướng dẫn sử dụng (Usage)

### Để chỉnh sửa role:
1. Vào **Admin** → **Người dùng** → Tab **RBAC** → Sub-tab **Roles**
2. Click icon ✏️ **Edit** ở role muốn chỉnh sửa
3. Modal mở ra với 3 tabs

### Tab Thông tin:
- Chỉnh sửa name, displayName, description, priority
- Bật/tắt Active status
- Click **Cập nhật** để lưu

### Tab Quyền hạn:
- Tìm kiếm permissions nếu cần
- Chọn `Cho phép` để gán permission
- Chọn `Không` để bỏ gán
- Click **Lưu quyền hạn** để áp dụng

### Tab Menu:
- Xem danh sách menu mà role có quyền truy cập
- **Lưu ý**: Để thay đổi menu, phải vào **Quản lý Menu** và edit field `requiredRoles`

## Testing Checklist

- [ ] Mở Edit Role Modal → Kiểm tra 3 tabs hiển thị đúng
- [ ] Tab Thông tin → Edit fields và Update → Verify data saved
- [ ] Tab Quyền hạn → Search permissions → Verify filter works
- [ ] Tab Quyền hạn → Gán/bỏ permissions → Click Lưu → Verify assignments saved
- [ ] Tab Menu → Kiểm tra list menus hiển thị đúng (based on requiredRoles)
- [ ] System roles → Verify fields bị disabled đúng
- [ ] Badge counters → Verify hiển thị số đúng
- [ ] Close modal → Reopen → Verify state reset

## Lưu ý (Notes)

### Menu Assignment
Menu **KHÔNG được gán trực tiếp từ role**. Thay vào đó:
- Mỗi menu item có field `requiredRoles: string[]`
- Khi edit menu, admin set `requiredRoles = ['blog_manager', 'content_manager']`
- Tab Menu trong EditRoleModal chỉ **hiển thị read-only** list các menu có `requiredRoles` chứa role name

### Permission Effect
Hiện tại chỉ hỗ trợ `allow` effect. Option `deny` có trong UI nhưng backend chưa fully support.

### GraphQL Query
Query `GET_MENUS_BY_ROLE` sử dụng Prisma filter `has` để tìm menus:
```prisma
where: { 
  requiredRoles: { has: roleName }
  isActive: true
}
```

### Performance
- Permissions: Load max 100 items (backend limit)
- Menus: Load all matching menus (usually < 50 items)
- ScrollArea giúp handle nhiều items mà không lag

## Frontend Restart Required?

Không cần restart frontend nếu đang chạy dev mode. Next.js sẽ hot-reload tự động.

Nếu cần manual restart:
```bash
# Stop frontend (Ctrl+C)
cd /mnt/chikiet/kataoffical/shoprausach
bun run dev:rausach:frontend
# hoặc
bun run dev:frontend
```

## Kết quả (Result)

✅ **Before**: Edit role modal chỉ có basic info, phải click icon riêng để gán permissions, không thấy menus

✅ **After**: Edit role modal có đầy đủ 3 tabs:
- Info: Basic info với form
- Permissions: Gán permissions với search & radio buttons
- Menus: Xem list menus (read-only)

✅ **Benefits**:
- All-in-one interface
- Better user experience
- Clear visibility của permissions và menus
- Consistent với các CMS/Admin panels khác
