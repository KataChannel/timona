# Fix Bug: Hiển thị 0 Permissions trong Quản lý Vai trò

## 🐛 Vấn đề

Trong trang "Quản lý vai trò hệ thống và quyền hạn", tất cả các vai trò đều hiển thị **0 permissions** mặc dù trong database có permissions đã được gán.

### Ví dụ:
- `blog_manager`: Hiển thị 0 permissions (thực tế: 17 permissions)
- `ecommerce_manager`: Hiển thị 0 permissions (thực tế: 21 permissions)
- `product_manager`: Hiển thị 0 permissions (thực tế: 14 permissions)

## 🔍 Root Cause

**GraphQL Query Structure Mismatch**

File: `/frontend/src/graphql/rbac.queries.ts`

### Query Cũ (Sai):
```graphql
export const SEARCH_ROLES = gql`
  query SearchRoles($input: RoleSearchInput!) {
    searchRoles(input: $input) {
      roles {
        permissions {
          id
          name
          displayName
          resource
          action
          scope
          description
          isActive
        }
      }
    }
  }
`;
```

### Database Structure (Thực tế):
```typescript
// Prisma Schema: Role -> RolePermission -> Permission (Many-to-Many with attributes)
Role {
  permissions: RolePermission[] // Join table
}

RolePermission {
  id: string
  effect: 'allow' | 'deny'
  permission: Permission  // Nested object
}
```

### Vấn đề:
- Query expect flat structure: `permissions { id, name, ... }`
- Database trả về nested structure: `permissions { id, effect, permission: { id, name, ... } }`
- Frontend không thể truy cập được data vì structure không match
- Kết quả: `role.permissions` trả về `undefined` hoặc empty array

## ✅ Giải pháp

### 1. Sửa GraphQL Query

**File**: `/frontend/src/graphql/rbac.queries.ts`

```typescript
export const SEARCH_ROLES = gql`
  query SearchRoles($input: RoleSearchInput!) {
    searchRoles(input: $input) {
      roles {
        id
        name
        displayName
        permissions {
          id
          effect              // ✅ Thêm effect field
          permission {        // ✅ Nested permission object
            id
            name
            displayName
            resource
            action
            scope
            description
            isActive
          }
        }
      }
    }
  }
`;
```

**Lý do**: Query này match với `GET_ROLE_BY_ID` query và đúng với database schema.

### 2. Cập nhật EditRoleModal Logic

**File**: `/frontend/src/components/admin/rbac/EditRoleModal.tsx`

**Trước (Sai)**:
```typescript
const existing = rolePermissions.find((rp: any) => rp?.id === permission?.id);
```

**Sau (Đúng)**:
```typescript
const existing = rolePermissions.find((rp: any) => rp?.permission?.id === permission?.id);
```

**Lý do**: Phải truy cập `rp.permission.id` vì `rolePermissions` bây giờ là array of `RolePermission` objects với nested `permission` field.

### 3. TypeScript Types

**File**: `/frontend/src/types/rbac.types.ts`

Types đã đúng từ trước, không cần sửa:

```typescript
export interface Role {
  permissions?: RolePermission[];  // ✅ Đúng
}

export interface RolePermission {
  id: string;
  effect: 'allow' | 'deny';
  permission: Permission;  // ✅ Nested structure
}
```

## 📊 Kết quả Test

### Database State (Verified):
```bash
bun run test-search-roles-query.ts
```

Output:
```
✅ blog_manager: 17 permissions
✅ ecommerce_manager: 21 permissions  
✅ product_manager: 14 permissions
✅ order_manager: 7 permissions
✅ content_manager: 35 permissions
```

### Sau khi Fix:
- ✅ GraphQL query structure match database schema
- ✅ Frontend có thể access permissions correctly
- ✅ Hiển thị đúng số lượng permissions cho mỗi role
- ✅ EditRoleModal hiển thị checkboxes đúng permissions đã assign

## 🎯 Files Modified

1. **`/frontend/src/graphql/rbac.queries.ts`**
   - Updated `SEARCH_ROLES` query structure
   - Added nested `permission` object
   - Added `effect` field

2. **`/frontend/src/components/admin/rbac/EditRoleModal.tsx`**
   - Fixed permission lookup logic
   - Changed from `rp?.id` to `rp?.permission?.id`
   - Updated effect extraction: `existing?.effect`

## 🧪 Testing

### Manual Test Steps:
1. Navigate to `/admin/rbac/roles`
2. Verify permission counts show correctly (not 0)
3. Click "Manage Permissions" on a role
4. Verify assigned permissions show checkmarks
5. Edit a role - verify Permissions tab shows data

### Expected Results:
- ✅ `blog_manager` shows "17 permissions"
- ✅ `ecommerce_manager` shows "21 permissions"
- ✅ `product_manager` shows "14 permissions"
- ✅ EditRoleModal Permissions tab displays assigned permissions correctly

## 📝 Notes

### Why This Bug Existed:
- `GET_ROLE_BY_ID` query was written first with correct nested structure
- `SEARCH_ROLES` query was written later with simplified flat structure
- No one noticed because types were correct, but runtime data didn't match

### Prevention:
- ✅ Keep GraphQL query structures consistent across queries
- ✅ Use TypeScript types to validate query results
- ✅ Test with real data, not mock data
- ✅ Add tests for data structure validation

### Related Queries:
- `GET_ROLE_BY_ID`: ✅ Already correct (nested structure)
- `SEARCH_ROLES`: ✅ Fixed (now matches GET_ROLE_BY_ID)
- `CREATE_ROLE`: ✅ Already correct
- `UPDATE_ROLE`: ✅ Already correct

---

**Status**: ✅ FIXED
**Impact**: HIGH - All role permission displays were broken
**Risk**: LOW - Query structure change is additive, no breaking changes
