# Fix Bug: Người dùng với role "Quản lý Blog" không vào được Admin

## Vấn đề (Problem)
User **chikiet88@gmail.com** có role **"Quản lý Blog" (blog_manager)** nhưng bị từ chối truy cập vào khu vực admin với thông báo:
> "Bạn không có quyền truy cập vào khu vực quản trị này"

## Nguyên nhân (Root Cause)
Hàm `hasAdminAccess()` trong file `/frontend/src/lib/rbac-utils.ts` chỉ kiểm tra một danh sách cố định các role names. Role **`blog_manager`** (và một số role khác) không nằm trong danh sách này.

### Code cũ:
```typescript
const adminRoles = [
  'admin',
  'super_admin',
  'content_manager',
  'content_editor',
  'product_manager',
  'order_manager',
  'user_manager'
];
```

Khi user có role `blog_manager` thì không match với bất kỳ role nào trong list → `hasAdminAccess()` trả về `false` → Admin layout redirect user đến `/request-access`.

## Giải pháp (Solution)
Cập nhật danh sách `adminRoles` trong file `/frontend/src/lib/rbac-utils.ts` để bao gồm tất cả các role quản trị có trong hệ thống.

### Code mới:
```typescript
const adminRoles = [
  'admin',
  'super_admin',
  'content_manager',
  'content_editor',
  'product_manager',
  'order_manager',
  'user_manager',
  'blog_manager',           // Quản lý Blog ✅ ADDED
  'blog_editor',            // Biên tập viên Blog ✅ ADDED
  'ecommerce_manager',      // Quản lý E-commerce ✅ ADDED
  'page_builder_manager'    // Quản lý Page Builder ✅ ADDED
];
```

## File thay đổi (Changed Files)
1. `/frontend/src/lib/rbac-utils.ts` - Thêm 4 role vào adminRoles array

## Roles được thêm (Added Roles)
1. **blog_manager** - Quản lý Blog
   - Permissions: 17 permissions bao gồm create/read/update/delete blog posts và categories
   
2. **blog_editor** - Biên tập viên Blog  
   - Permissions: Tạo và chỉnh sửa bài viết của mình

3. **ecommerce_manager** - Quản lý E-commerce
   - Permissions: Quản lý sản phẩm và đơn hàng

4. **page_builder_manager** - Quản lý Page Builder
   - Permissions: Tạo và quản lý các trang website

## Kiểm tra (Verification)

### User Info:
```
Email: chikiet88@gmail.com
Username: chikiet88@gmail.com
Name: Kiet Pham Chi
Role Type: USER
Assigned Role: blog_manager (Quản lý Blog)
Status: Active, Verified
```

### Test Results:
✅ All 7 test cases passed:
- ✅ User with ADMIN roleType → Has Access
- ✅ User with blog_manager role → Has Access  
- ✅ User with blog_editor role → Has Access
- ✅ User with ecommerce_manager role → Has Access
- ✅ User with page_builder_manager role → Has Access
- ✅ User with no roles → No Access
- ✅ User with unknown role → No Access

## Kết quả (Result)
✅ User **chikiet88@gmail.com** giờ đây có thể:
- Truy cập `/admin` area
- Không bị redirect đến `/request-access`
- Sử dụng đầy đủ các tính năng quản lý blog theo permissions của role

## Lưu ý (Notes)
- Thay đổi này chỉ ảnh hưởng đến việc **có thể vào admin area hay không**
- Permissions chi tiết (xem/sửa/xóa specific resources) vẫn được kiểm soát bởi RBAC system thông qua các permissions được assign cho mỗi role
- Frontend sẽ cần rebuild/reload để áp dụng thay đổi

## Hướng dẫn Apply (How to Apply)
1. Thay đổi đã được commit vào file `/frontend/src/lib/rbac-utils.ts`
2. Nếu frontend đang chạy, Next.js sẽ tự động hot-reload
3. Nếu không, restart frontend: `bun run dev:frontend`
4. User chikiet88@gmail.com cần logout và login lại (hoặc clear cache và refresh)

## Test Scripts Created
Các script test được tạo trong `/backend/`:
- `check-user-chikiet.ts` - Kiểm tra chi tiết user và roles
- `test-user-access.ts` - Test admin access cho user cụ thể
- `list-all-roles.ts` - List tất cả roles trong hệ thống
- `test-admin-access-all.ts` - Test comprehensive cho tất cả roles

Run test: `cd backend && bun <script-name>.ts`
