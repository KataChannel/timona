# Fix Bug: GetUserRolePermissions GraphQL Query

## 🐛 Vấn Đề

Query `GetUserRolePermissions` bị lỗi khi cố query các field trực tiếp từ `RolePermission`:
```
Cannot query field "name" on type "RolePermission"
Cannot query field "displayName" on type "RolePermission"
...
```

## 🔧 Nguyên Nhân

Trong query `roleAssignments.role.permissions`, code đang query các field như `name`, `displayName`, `resource` trực tiếp từ array `permissions`. Nhưng theo GraphQL schema mới:
- `role.permissions` là array của `RolePermission` objects
- Các field như `name`, `displayName` nằm trong nested object `permission`

## ✅ Giải Pháp

### Sửa Query Structure

**File**: `/frontend/src/graphql/rbac.queries.ts`

**Trước:**
```graphql
roleAssignments {
  role {
    permissions {
      id
      name              # ❌ Không tồn tại trực tiếp
      displayName       # ❌ Không tồn tại trực tiếp
      resource          # ❌ Không tồn tại trực tiếp
      ...
    }
  }
}
```

**Sau:**
```graphql
roleAssignments {
  role {
    permissions {
      id
      effect            # ✅ Field của RolePermission
      permission {      # ✅ Nested Permission object
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
```

## 📊 Query Structure Đúng

```typescript
query GetUserRolePermissions($userId: String!) {
  getUserRolePermissions(userId: $userId) {
    // Direct permissions
    directPermissions {
      id
      effect
      permission { ... }  # ✅ Nested
    }
    
    // Role assignments
    roleAssignments {
      id
      effect
      role {
        id
        name
        displayName
        permissions {
          id
          effect
          permission { ... }  # ✅ Nested
        }
      }
    }
    
    // Effective permissions (already flattened by backend)
    effectivePermissions {
      id
      name
      displayName
      ...  # ✅ Direct fields OK
    }
  }
}
```

## ✅ Kết Quả

- ✅ Query structure đã đúng với GraphQL schema
- ✅ Frontend code đã sử dụng `.permission` để access nested object
- ✅ No TypeScript errors
- ✅ Ready to test

## 📝 Lưu Ý

Code frontend (`UserRoleAssignment.tsx`, `UserRolePermissionModal.tsx`) đã đúng từ trước vì đã sử dụng `permission.permission?.displayName` để access nested field.
